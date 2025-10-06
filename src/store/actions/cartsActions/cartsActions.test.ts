import axios from 'axios';
import type { AppDispatch } from '../../../store';
import {
  addToCartAction,
  updateCartStatusAction,
  incrementItemQuantityAction,
  decrementItemQuantityAction,
  removeFromCartAction,
  clearCartAndClearCartErrorAction,
  startFetchingCart
} from './cartsActions';
import {
  addToCart,
  addToCartError,
  updateCartStatus,
  updateCartStatusError,
  incrementItemQuantity,
  incrementItemQuantityError,
  decrementItemQuantity,
  decrementItemQuantityError,
  removeFromCart,
  removeFromCartError,
  clearCart,
  clearCartError,
  setFetchingCart
} from '../../reducers/cartsReducer/cartsReducer';
import { delay } from '../../../utils/utils';
import type { Food, Cart, CartApiResponse, UpdateCartStatusRequest } from '../../../types/types';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../utils/utils');
jest.mock('../../reducers/cartsReducer/cartsReducer');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedDelay = delay as jest.MockedFunction<typeof delay>;

// Mock action creators
const mockAddToCart = addToCart as jest.MockedFunction<typeof addToCart>;
const mockAddToCartError = addToCartError as jest.MockedFunction<typeof addToCartError>;
const mockUpdateCartStatus = updateCartStatus as jest.MockedFunction<typeof updateCartStatus>;
const mockUpdateCartStatusError = updateCartStatusError as jest.MockedFunction<typeof updateCartStatusError>;
const mockIncrementItemQuantity = incrementItemQuantity as jest.MockedFunction<typeof incrementItemQuantity>;
const mockIncrementItemQuantityError = incrementItemQuantityError as jest.MockedFunction<typeof incrementItemQuantityError>;
const mockDecrementItemQuantity = decrementItemQuantity as jest.MockedFunction<typeof decrementItemQuantity>;
const mockDecrementItemQuantityError = decrementItemQuantityError as jest.MockedFunction<typeof decrementItemQuantityError>;
const mockRemoveFromCart = removeFromCart as jest.MockedFunction<typeof removeFromCart>;
const mockRemoveFromCartError = removeFromCartError as jest.MockedFunction<typeof removeFromCartError>;
const mockClearCart = clearCart as jest.MockedFunction<typeof clearCart>;
const mockClearCartError = clearCartError as jest.MockedFunction<typeof clearCartError>;
const mockSetFetchingCart = setFetchingCart as jest.MockedFunction<typeof setFetchingCart>;

// Mock dispatch
const mockDispatch = jest.fn() as jest.MockedFunction<AppDispatch>;

// Mock data
const mockFood: Food = {
  _id: 'food-123',
  name: 'Pizza Margherita',
  category: 'pizza',
  price: 12.99,
  description: 'Classic pizza with tomato and mozzarella',
  image: 'https://example.com/pizza.jpg',
  isAvailable: true,
  ingredients: ['tomato', 'mozzarella'],
  calories: 350,
  rating: 4.5,
  preparationTime: '15-20 mins'
};

const mockCart: Cart = {
  _id: 'cart-123',
  sessionId: 'session-123',
  items: [
    {
      foodId: 'food-123',
      name: 'Pizza Margherita',
      price: 12.99,
      quantity: 2
    }
  ],
  status: 'active' as const,
  totalPrice: 25.98,
  createdAt: '2025-10-06T14:30:00Z',
  updatedAt: '2025-10-06T14:30:00Z'
};

const mockCartApiResponse: CartApiResponse = {
  cart: mockCart,
  message: 'Operation successful'
};

const mockUpdateCartStatusRequest: UpdateCartStatusRequest = {
  _id: 'cart-123',
  status: 'completed'
};

describe('Cart Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock returns
    mockedDelay.mockResolvedValue(undefined);
  });

  describe('addToCartAction', () => {
    it('successfully adds food to cart', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockCartApiResponse });
      
      // Act
      await addToCartAction(mockFood)(mockDispatch);
      
      // Assert
      expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
      expect(mockedAxios.post).toHaveBeenCalledWith('api/v1/carts', mockFood);
      expect(mockDispatch).toHaveBeenCalledWith(mockAddToCart(mockCart));
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // startFetchingCart(false)
    });

    it('handles errors when adding food to cart fails', async () => {
      // Arrange
      const errorMessage = 'Failed to add item to cart';
      mockedAxios.post.mockRejectedValue({ message: errorMessage });
      
      // Act
      await addToCartAction(mockFood)(mockDispatch);
      
      // Assert
      expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
      expect(mockedAxios.post).toHaveBeenCalledWith('api/v1/carts', mockFood);
      expect(mockDispatch).toHaveBeenCalledWith(mockAddToCartError(errorMessage));
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // startFetchingCart(false)
    });

    it('handles network errors gracefully', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValue(networkError);
      
      // Act
      await addToCartAction(mockFood)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockAddToCartError('Network Error'));
    });
  });

  describe('updateCartStatusAction', () => {
    it('successfully updates cart status', async () => {
      // Arrange
      mockedAxios.patch.mockResolvedValue({ data: mockCartApiResponse });
      
      // Act
      await updateCartStatusAction(mockUpdateCartStatusRequest)(mockDispatch);
      
      // Assert
      expect(mockedAxios.patch).toHaveBeenCalledWith('api/v1/carts/status', {
        _id: mockUpdateCartStatusRequest._id,
        status: mockUpdateCartStatusRequest.status
      });
      expect(mockDispatch).toHaveBeenCalledWith(mockUpdateCartStatus(mockCart));
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // clearCartAndClearCartErrorAction
    });

    it('handles errors when updating cart status fails', async () => {
      // Arrange
      const errorMessage = 'Failed to update cart status';
      mockedAxios.patch.mockRejectedValue({ message: errorMessage });
      
      // Act
      await updateCartStatusAction(mockUpdateCartStatusRequest)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockUpdateCartStatusError(errorMessage));
    });
  });

  describe('incrementItemQuantityAction', () => {
    const foodId = 'food-123';

    it('successfully increments item quantity', async () => {
      // Arrange
      mockedAxios.patch.mockResolvedValue({ data: mockCartApiResponse });
      
      // Act
      await incrementItemQuantityAction(foodId)(mockDispatch);
      
      // Assert
      expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
      expect(mockedAxios.patch).toHaveBeenCalledWith(`api/v1/carts/items/${foodId}/increment`);
      expect(mockDispatch).toHaveBeenCalledWith(mockIncrementItemQuantity(mockCart));
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // startFetchingCart(false)
    });

    it('handles errors when incrementing item quantity fails', async () => {
      // Arrange
      const errorMessage = 'Failed to increment item quantity';
      mockedAxios.patch.mockRejectedValue({ message: errorMessage });
      
      // Act
      await incrementItemQuantityAction(foodId)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockIncrementItemQuantityError(errorMessage));
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // startFetchingCart(false)
    });
  });

  describe('decrementItemQuantityAction', () => {
    const foodId = 'food-123';

    it('successfully decrements item quantity', async () => {
      // Arrange
      mockedAxios.patch.mockResolvedValue({ data: mockCartApiResponse });
      
      // Act
      await decrementItemQuantityAction(foodId)(mockDispatch);
      
      // Assert
      expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
      expect(mockedAxios.patch).toHaveBeenCalledWith(`api/v1/carts/items/${foodId}/decrement`);
      expect(mockDispatch).toHaveBeenCalledWith(mockDecrementItemQuantity(mockCart));
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // startFetchingCart(false)
    });

    it('handles errors when decrementing item quantity fails', async () => {
      // Arrange
      const errorMessage = 'Failed to decrement item quantity';
      mockedAxios.patch.mockRejectedValue({ message: errorMessage });
      
      // Act
      await decrementItemQuantityAction(foodId)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockDecrementItemQuantityError(errorMessage));
    });
  });

  describe('removeFromCartAction', () => {
    const foodId = 'food-123';

    it('successfully removes item from cart', async () => {
      // Arrange
      mockedAxios.delete.mockResolvedValue({ data: mockCartApiResponse });
      
      // Act
      await removeFromCartAction(foodId)(mockDispatch);
      
      // Assert
      expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`api/v1/carts/items/${foodId}`);
      expect(mockDispatch).toHaveBeenCalledWith(mockRemoveFromCart(mockCart));
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // startFetchingCart(false)
    });

    it('handles errors when removing item from cart fails', async () => {
      // Arrange
      const errorMessage = 'Failed to remove item from cart';
      mockedAxios.delete.mockRejectedValue({ message: errorMessage });
      
      // Act
      await removeFromCartAction(foodId)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockRemoveFromCartError(errorMessage));
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // startFetchingCart(false)
    });
  });

  describe('Utility Actions', () => {
    describe('clearCartAndClearCartErrorAction', () => {
      it('successfully clears cart and error', async () => {
        // Act
        await clearCartAndClearCartErrorAction()(mockDispatch);
        
        // Assert
        expect(mockedDelay).toHaveBeenCalledWith(true, 1000);
        expect(mockDispatch).toHaveBeenCalledWith(mockClearCart());
        expect(mockDispatch).toHaveBeenCalledWith(mockClearCartError(''));
      });
    });

    describe('startFetchingCart', () => {
      it('sets fetching state to true', async () => {
        // Act
        await startFetchingCart(true)(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockSetFetchingCart(true));
      });

      it('sets fetching state to false', async () => {
        // Act
        await startFetchingCart(false)(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockSetFetchingCart(false));
      });
    });
  });

  describe('Edge Cases and Integration', () => {
    it('handles undefined error messages gracefully', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue({ message: undefined });
      
      // Act
      await addToCartAction(mockFood)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockAddToCartError('undefined'));
    });

    it('handles axios response with missing data', async () => {
      // Arrange
      const responseWithoutCart = { data: { cart: mockCart } };
      mockedAxios.post.mockResolvedValue(responseWithoutCart);
      
      // Act
      await addToCartAction(mockFood)(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockAddToCart(mockCart));
    });

    it('calls multiple dispatch functions in correct order for addToCartAction success', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockCartApiResponse });
      
      // Act
      await addToCartAction(mockFood)(mockDispatch);
      
      // Assert - Check the order of dispatch calls
      expect(mockDispatch).toHaveBeenNthCalledWith(1, mockAddToCart(mockCart));
      expect(mockDispatch).toHaveBeenNthCalledWith(2, expect.any(Function));
    });

    it('calls multiple dispatch functions in correct order for addToCartAction error', async () => {
      // Arrange
      const errorMessage = 'Test error';
      mockedAxios.post.mockRejectedValue({ message: errorMessage });
      
      // Act
      await addToCartAction(mockFood)(mockDispatch);
      
      // Assert - Check the order of dispatch calls
      expect(mockDispatch).toHaveBeenNthCalledWith(1, mockAddToCartError(errorMessage));
      expect(mockDispatch).toHaveBeenNthCalledWith(2, expect.any(Function));
    });
  });

  describe('Action Creators Mock Verification', () => {
    it('verifies success action creator is called with correct parameters', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockCartApiResponse });
      
      // Act
      await addToCartAction(mockFood)(mockDispatch);
      
      // Assert
      expect(mockAddToCart).toHaveBeenCalledWith(mockCart);
    });

    it('verifies error action creator is called with correct parameters', async () => {
      // Arrange
      const errorMessage = 'Test error';
      mockedAxios.post.mockRejectedValue({ message: errorMessage });
      
      // Act
      await addToCartAction(mockFood)(mockDispatch);
      
      // Assert
      expect(mockAddToCartError).toHaveBeenCalledWith(errorMessage);
    });
  });
});