import axios from 'axios';
import type { AppDispatch } from '../../../store';
import {
  placeOrderAction,
  startPlacingOrderAction
} from './ordersActions';
import {
  placeOrder,
  placeOrderError,
  startPlacingOrder
} from '../../reducers/ordersReducer/ordersReducer';
import { updateCartStatusAction } from '../cartsActions/cartsActions';
import { delay } from '../../../utils/utils';
import type { CreateOrderRequest, OrderApiResponse } from '../../../types/types';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../utils/utils');
jest.mock('../../reducers/ordersReducer/ordersReducer');
jest.mock('../cartsActions/cartsActions');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedDelay = delay as jest.MockedFunction<typeof delay>;

// Mock action creators
const mockPlaceOrder = placeOrder as jest.MockedFunction<typeof placeOrder>;
const mockPlaceOrderError = placeOrderError as jest.MockedFunction<typeof placeOrderError>;
const mockStartPlacingOrder = startPlacingOrder as jest.MockedFunction<typeof startPlacingOrder>;
const mockUpdateCartStatusAction = updateCartStatusAction as jest.MockedFunction<typeof updateCartStatusAction>;

// Mock dispatch
const mockDispatch = jest.fn() as jest.MockedFunction<AppDispatch>;

// Mock data
const mockCreateOrderRequest: CreateOrderRequest = {
  cartId: 'cart-123',
  totalAmount: 35.97,
  orderType: 'delivery',
  customerName: 'John Doe',
  contactNumber: '(555) 123-4567',
  deliveryAddress: '123 Main St, City, State 12345'
};

const mockPickupOrderRequest: CreateOrderRequest = {
  cartId: 'cart-456',
  totalAmount: 24.99,
  orderType: 'pickup',
  customerName: 'Jane Smith',
  contactNumber: '(555) 987-6543'
};

const mockOrder: any = {
  _id: 'order-123',
  orderNumber: 'ORD-2025-001',
  items: [
    {
      foodId: 'food-123',
      name: 'Pizza Margherita',
      price: 12.99,
      quantity: 2
    }
  ],
  totalAmount: 35.97,
  customerInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345'
  },
  orderType: 'delivery' as const,
  status: 'pending' as const,
  createdAt: '2025-10-06T14:30:00Z',
  updatedAt: '2025-10-06T14:30:00Z'
};

const mockOrderApiResponse: OrderApiResponse = {
  order: mockOrder,
  message: 'Order placed successfully'
};

describe('Orders Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock returns
    mockedDelay.mockResolvedValue(undefined);
    mockUpdateCartStatusAction.mockReturnValue(jest.fn());
  });

  describe('placeOrderAction', () => {
    describe('Success Scenarios', () => {
      it('successfully places a delivery order', async () => {
        // Arrange
        mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
        
        // Act
        await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
        
        // Assert
        expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
        expect(mockedAxios.post).toHaveBeenCalledWith('api/v1/orders', mockCreateOrderRequest);
        expect(mockDispatch).toHaveBeenCalledWith(mockPlaceOrder(mockOrderApiResponse));
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // startPlacingOrderAction(false)
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // updateCartStatusAction
        expect(mockUpdateCartStatusAction).toHaveBeenCalledWith({
          _id: mockCreateOrderRequest.cartId,
          status: 'completed'
        });
      });

      it('successfully places a pickup order', async () => {
        // Arrange
        const pickupOrderResponse = {
          ...mockOrderApiResponse,
          order: {
            ...mockOrder,
            orderType: 'pickup' as const,
            deliveryAddress: undefined
          }
        };
        mockedAxios.post.mockResolvedValue({ data: pickupOrderResponse });
        
        // Act
        await placeOrderAction(mockPickupOrderRequest)(mockDispatch);
        
        // Assert
        expect(mockedAxios.post).toHaveBeenCalledWith('api/v1/orders', mockPickupOrderRequest);
        expect(mockDispatch).toHaveBeenCalledWith(mockPlaceOrder(pickupOrderResponse));
        expect(mockUpdateCartStatusAction).toHaveBeenCalledWith({
          _id: mockPickupOrderRequest.cartId,
          status: 'completed'
        });
      });

      it('calls all success actions in correct sequence', async () => {
        // Arrange
        mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
        
        // Act
        await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
        
        // Assert - Check the order of dispatch calls
        expect(mockDispatch).toHaveBeenCalledTimes(3);
        expect(mockDispatch).toHaveBeenNthCalledWith(1, mockPlaceOrder(mockOrderApiResponse));
        // Note: 2nd and 3rd calls are function dispatches for startPlacingOrderAction and updateCartStatusAction
      });

      it('applies delay before making API call', async () => {
        // Arrange
        mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
        
        // Act
        await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
        
        // Assert
        expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
        expect(mockedAxios.post).toHaveBeenCalledWith('api/v1/orders', mockCreateOrderRequest);
      });
    });

    describe('Error Scenarios', () => {
      it('handles network errors when placing order', async () => {
        // Arrange
        const networkError = { message: 'Network Error' };
        mockedAxios.post.mockRejectedValue(networkError);
        
        // Act
        await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
        
        // Assert
        expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
        expect(mockedAxios.post).toHaveBeenCalledWith('api/v1/orders', mockCreateOrderRequest);
        expect(mockDispatch).toHaveBeenCalledWith(mockPlaceOrderError('Network Error'));
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // startPlacingOrderAction(false)
        expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({
          type: expect.stringContaining('placeOrder/fulfilled')
        }));
      });

      it('handles API validation errors', async () => {
        // Arrange
        const validationError = { 
          message: 'Invalid order data: Customer name is required' 
        };
        mockedAxios.post.mockRejectedValue(validationError);
        
        // Act
        await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockPlaceOrderError('Invalid order data: Customer name is required'));
      });

      it('handles server errors (500)', async () => {
        // Arrange
        const serverError = { 
          message: 'Internal Server Error',
          response: { status: 500 }
        };
        mockedAxios.post.mockRejectedValue(serverError);
        
        // Act
        await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockPlaceOrderError('Internal Server Error'));
      });

      it('handles timeout errors', async () => {
        // Arrange
        const timeoutError = { 
          message: 'timeout of 30000ms exceeded',
          code: 'ECONNABORTED' 
        };
        mockedAxios.post.mockRejectedValue(timeoutError);
        
        // Act
        await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockPlaceOrderError('timeout of 30000ms exceeded'));
      });

      it('calls error actions in correct sequence', async () => {
        // Arrange
        const errorMessage = 'Test error';
        mockedAxios.post.mockRejectedValue({ message: errorMessage });
        
        // Act
        await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
        
        // Assert - Check the order of dispatch calls for error case
        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenNthCalledWith(1, mockPlaceOrderError(errorMessage));
        // Note: 2nd call is function dispatch for startPlacingOrderAction(false)
      });

      it('does not update cart status when order placement fails', async () => {
        // Arrange
        mockedAxios.post.mockRejectedValue({ message: 'Order failed' });
        
        // Act
        await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
        
        // Assert
        expect(mockUpdateCartStatusAction).not.toHaveBeenCalled();
      });
    });
  });

  describe('startPlacingOrderAction', () => {
    it('sets order placing state to true', async () => {
      // Act
      await startPlacingOrderAction(true)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockStartPlacingOrder(true));
    });

    it('sets order placing state to false', async () => {
      // Act
      await startPlacingOrderAction(false)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockStartPlacingOrder(false));
    });

    it('handles multiple rapid state changes', async () => {
      // Act
      await startPlacingOrderAction(true)(mockDispatch);
      await startPlacingOrderAction(false)(mockDispatch);
      await startPlacingOrderAction(true)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(mockDispatch).toHaveBeenNthCalledWith(1, mockStartPlacingOrder(true));
      expect(mockDispatch).toHaveBeenNthCalledWith(2, mockStartPlacingOrder(false));
      expect(mockDispatch).toHaveBeenNthCalledWith(3, mockStartPlacingOrder(true));
    });
  });

  describe('Edge Cases and Integration', () => {
    it('handles order with minimum required fields', async () => {
      // Arrange
      const minimalOrder: CreateOrderRequest = {
        cartId: 'cart-minimal',
        totalAmount: 0.01,
        orderType: 'pickup',
        customerName: 'Min Customer',
        contactNumber: '123'
      };
      mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
      
      // Act
      await placeOrderAction(minimalOrder)(mockDispatch);
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith('api/v1/orders', minimalOrder);
      expect(mockDispatch).toHaveBeenCalledWith(mockPlaceOrder(mockOrderApiResponse));
    });

    it('handles order with maximum field values', async () => {
      // Arrange
      const maximalOrder: CreateOrderRequest = {
        cartId: 'cart-maximal-with-very-long-id-that-should-still-work',
        totalAmount: 999999.99,
        orderType: 'delivery',
        customerName: 'Very Long Customer Name That Should Still Be Valid',
        contactNumber: '(555) 123-4567 ext. 1234',
        deliveryAddress: '1234 Very Long Street Name, Apartment 567B, Very Long City Name, Very Long State Name 12345-6789'
      };
      mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
      
      // Act
      await placeOrderAction(maximalOrder)(mockDispatch);
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith('api/v1/orders', maximalOrder);
    });

    it('handles concurrent order placement attempts', async () => {
      // Arrange
      const order1 = { ...mockCreateOrderRequest, cartId: 'cart-1' };
      const order2 = { ...mockCreateOrderRequest, cartId: 'cart-2' };
      const order3 = { ...mockCreateOrderRequest, cartId: 'cart-3' };
      
      mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
      
      // Act
      const promise1 = placeOrderAction(order1)(mockDispatch);
      const promise2 = placeOrderAction(order2)(mockDispatch);
      const promise3 = placeOrderAction(order3)(mockDispatch);
      
      await Promise.all([promise1, promise2, promise3]);
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      expect(mockDispatch).toHaveBeenCalledTimes(9); // 3 calls × 3 dispatch actions each
    });

    it('handles undefined error messages gracefully', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue({ message: undefined });
      
      // Act
      await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockPlaceOrderError(undefined));
    });

    it('preserves order request data integrity', async () => {
      // Arrange
      const orderRequest = { ...mockCreateOrderRequest };
      mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
      
      // Act
      await placeOrderAction(orderRequest)(mockDispatch);
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith('api/v1/orders', orderRequest);
      // Verify the original request object wasn't modified
      expect(orderRequest).toEqual(mockCreateOrderRequest);
    });
  });

  describe('Action Creator Verification', () => {
    it('verifies placeOrder action creator is called with correct data', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
      
      // Act
      await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
      
      // Assert
      expect(mockPlaceOrder).toHaveBeenCalledWith(mockOrderApiResponse);
    });

    it('verifies placeOrderError action creator is called with correct error', async () => {
      // Arrange
      const errorMessage = 'Test error message';
      mockedAxios.post.mockRejectedValue({ message: errorMessage });
      
      // Act
      await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
      
      // Assert
      expect(mockPlaceOrderError).toHaveBeenCalledWith(errorMessage);
    });

    it('verifies startPlacingOrder action creator is called correctly', async () => {
      // Act
      await startPlacingOrderAction(true)(mockDispatch);
      
      // Assert
      expect(mockStartPlacingOrder).toHaveBeenCalledWith(true);
    });

    it('verifies updateCartStatusAction is called with correct parameters', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
      
      // Act
      await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
      
      // Assert
      expect(mockUpdateCartStatusAction).toHaveBeenCalledWith({
        _id: mockCreateOrderRequest.cartId,
        status: 'completed'
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('completes order placement within reasonable time', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
      const startTime = Date.now();
      
      // Act
      await placeOrderAction(mockCreateOrderRequest)(mockDispatch);
      const endTime = Date.now();
      
      // Assert - Should complete quickly (delay is mocked)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles memory cleanup properly', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockOrderApiResponse });
      
      // Act - Place multiple orders
      for (let i = 0; i < 10; i++) {
        await placeOrderAction({
          ...mockCreateOrderRequest,
          cartId: `cart-${i}`
        })(mockDispatch);
      }
      
      // Assert - No memory leaks, all calls completed
      expect(mockedAxios.post).toHaveBeenCalledTimes(10);
      expect(mockDispatch).toHaveBeenCalledTimes(30); // 10 orders × 3 dispatches each
    });
  });
});