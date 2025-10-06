import ordersReducer, {
  placeOrder,
  placeOrderError,
  startPlacingOrder
} from './ordersReducer';

// Define the OrdersState type based on the reducer's initial state
type OrdersState = {
  order: any;
  message: { error: string };
  startPlacingOrder: boolean;
};

// Mock order data
const mockOrderApiResponse = {
  order: {
    _id: 'order-123',
    orderNumber: 'ORD-2025-001',
    items: [
      {
        foodId: 'food-1',
        name: 'Margherita Pizza',
        price: 12.99,
        quantity: 2
      },
      {
        foodId: 'food-2',
        name: 'Caesar Salad',
        price: 8.99,
        quantity: 1
      }
    ],
    totalAmount: 34.97,
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St, City, State 12345'
    },
    orderType: 'delivery',
    status: 'pending',
    createdAt: '2025-10-06T14:30:00Z',
    updatedAt: '2025-10-06T14:30:00Z'
  },
  message: 'Order placed successfully'
};

const mockPickupOrderApiResponse = {
  order: {
    _id: 'order-456',
    orderNumber: 'ORD-2025-002',
    items: [
      {
        foodId: 'food-3',
        name: 'Chocolate Brownie',
        price: 6.99,
        quantity: 2
      }
    ],
    totalAmount: 13.98,
    customerInfo: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '(555) 987-6543'
    },
    orderType: 'pickup',
    status: 'confirmed',
    createdAt: '2025-10-06T15:00:00Z',
    updatedAt: '2025-10-06T15:00:00Z'
  },
  message: 'Pickup order confirmed'
};

const mockEmptyOrder = {
  order: {
    _id: 'order-789',
    orderNumber: 'ORD-2025-003',
    items: [],
    totalAmount: 0,
    customerInfo: {
      name: 'Empty Order',
      email: 'empty@example.com',
      phone: '(555) 000-0000'
    },
    orderType: 'pickup',
    status: 'cancelled',
    createdAt: '2025-10-06T16:00:00Z',
    updatedAt: '2025-10-06T16:00:00Z'
  },
  message: 'Empty order created'
};

describe('Orders Reducer', () => {
  describe('Initial State', () => {
    it('should return the initial state', () => {
      // Act
      const result = ordersReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result).toEqual({
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      });
    });

    it('should have correct initial state structure', () => {
      // Act
      const result = ordersReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('startPlacingOrder');
      expect(result.message).toHaveProperty('error');
      expect(typeof result.order).toBe('object');
      expect(typeof result.message.error).toBe('string');
      expect(typeof result.startPlacingOrder).toBe('boolean');
    });
  });

  describe('placeOrder Action', () => {
    it('should handle placeOrder with order API response', () => {
      // Arrange
      const initialState: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act
      const result = ordersReducer(initialState, placeOrder(mockOrderApiResponse));

      // Assert
      expect(result.order).toEqual(mockOrderApiResponse);
      expect(result.message.error).toBe('');
      expect(result.startPlacingOrder).toBe(false);
    });

    it('should handle placeOrder with delivery order', () => {
      // Arrange
      const initialState: OrdersState = {
        order: {},
        message: { error: 'Previous error' },
        startPlacingOrder: true
      };

      // Act
      const result = ordersReducer(initialState, placeOrder(mockOrderApiResponse));

      // Assert
      expect(result.order).toEqual(mockOrderApiResponse);
      expect(result.order.order.orderType).toBe('delivery');
      expect(result.order.order.customerInfo.address).toBe('123 Main St, City, State 12345');
      expect(result.message.error).toBe('Previous error'); // Should preserve other state
      expect(result.startPlacingOrder).toBe(true);
    });

    it('should handle placeOrder with pickup order', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act
      const result = ordersReducer(initialState, placeOrder(mockPickupOrderApiResponse));

      // Assert
      expect(result.order).toEqual(mockPickupOrderApiResponse);
      expect(result.order.order.orderType).toBe('pickup');
      expect(result.order.order.customerInfo.address).toBeUndefined();
    });

    it('should replace existing order when placeOrder is called', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act
      const result = ordersReducer(initialState, placeOrder(mockPickupOrderApiResponse));

      // Assert
      expect(result.order).toEqual(mockPickupOrderApiResponse);
      expect(result.order).not.toEqual(mockOrderApiResponse);
      expect(result.order.order._id).toBe('order-456');
      expect(result.order.order.orderNumber).toBe('ORD-2025-002');
    });

    it('should handle placeOrder with empty order', () => {
      // Arrange
      const initialState: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act
      const result = ordersReducer(initialState, placeOrder(mockEmptyOrder));

      // Assert
      expect(result.order).toEqual(mockEmptyOrder);
      expect(result.order.order.items).toHaveLength(0);
      expect(result.order.order.totalAmount).toBe(0);
      expect(result.order.order.status).toBe('cancelled');
    });

    it('should handle placeOrder with complex order data', () => {
      // Arrange
      const complexOrderResponse = {
        order: {
          _id: 'complex-order-123',
          orderNumber: 'ORD-2025-COMPLEX-001',
          items: [
            {
              foodId: 'food-special-1',
              name: 'Gourmet Pizza with Special Toppings 🍕',
              price: 24.99,
              quantity: 1
            },
            {
              foodId: 'food-special-2',
              name: 'Organic Salad (Très délicieux)',
              price: 16.50,
              quantity: 2
            },
            {
              foodId: 'food-special-3',
              name: 'Dessert with "Special" Ingredients',
              price: 12.75,
              quantity: 1
            }
          ],
          totalAmount: 70.74,
          customerInfo: {
            name: 'Jean-François O\'Connor',
            email: 'jean.francois+test@domain.co.uk',
            phone: '+1 (555) 123-4567 ext. 890',
            address: '123 Rue de la Paix, Apt. 4B\nParis, France 75001'
          },
          orderType: 'delivery',
          status: 'preparing',
          specialInstructions: 'Extra spicy, no onions, gluten-free bread',
          estimatedDeliveryTime: '2025-10-06T18:30:00Z',
          createdAt: '2025-10-06T17:00:00Z',
          updatedAt: '2025-10-06T17:15:00Z'
        },
        message: 'Complex order processed successfully'
      };

      const initialState: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act
      const result = ordersReducer(initialState, placeOrder(complexOrderResponse));

      // Assert
      expect(result.order).toEqual(complexOrderResponse);
      expect(result.order.order.items).toHaveLength(3);
      expect(result.order.order.totalAmount).toBe(70.74);
      expect(result.order.order.customerInfo.name).toBe('Jean-François O\'Connor');
      expect(result.order.order.specialInstructions).toBe('Extra spicy, no onions, gluten-free bread');
    });

    it('should maintain immutability when updating order', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: 'test error' },
        startPlacingOrder: true
      };

      // Act
      const result = ordersReducer(initialState, placeOrder(mockPickupOrderApiResponse));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.order).not.toBe(initialState.order);
      expect(result.message).toBe(initialState.message); // Should preserve reference if unchanged
      expect(initialState.order).toEqual(mockOrderApiResponse); // Original state unchanged
    });
  });

  describe('placeOrderError Action', () => {
    it('should handle placeOrderError with error message', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: '' },
        startPlacingOrder: false
      };
      const errorMessage = 'Failed to place order';

      // Act
      const result = ordersReducer(initialState, placeOrderError(errorMessage));

      // Assert
      expect(result.message.error).toBe(errorMessage);
      expect(result.order).toEqual(mockOrderApiResponse);
      expect(result.startPlacingOrder).toBe(false);
    });

    it('should handle placeOrderError with empty string', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: 'Previous error' },
        startPlacingOrder: true
      };

      // Act
      const result = ordersReducer(initialState, placeOrderError(''));

      // Assert
      expect(result.message.error).toBe('');
      expect(result.order).toEqual(mockOrderApiResponse);
      expect(result.startPlacingOrder).toBe(true);
    });

    it('should handle placeOrderError with long error message', () => {
      // Arrange
      const initialState: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };
      const longErrorMessage = 'A very long error message that might occur when placing an order fails due to various reasons such as payment processing issues, inventory problems, validation errors, network connectivity problems, or server-side errors that need to be communicated to the user in detail.';

      // Act
      const result = ordersReducer(initialState, placeOrderError(longErrorMessage));

      // Assert
      expect(result.message.error).toBe(longErrorMessage);
      expect(result.order).toEqual({});
      expect(result.startPlacingOrder).toBe(false);
    });

    it('should replace existing error message', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: 'Old error message' },
        startPlacingOrder: false
      };
      const newErrorMessage = 'New error message';

      // Act
      const result = ordersReducer(initialState, placeOrderError(newErrorMessage));

      // Assert
      expect(result.message.error).toBe(newErrorMessage);
      expect(result.order).toEqual(mockOrderApiResponse);
    });

    it('should handle placeOrderError with special characters', () => {
      // Arrange
      const initialState: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };
      const specialErrorMessage = 'Error: 订单失败 - Échec de la commande (500) @#$%^&*()';

      // Act
      const result = ordersReducer(initialState, placeOrderError(specialErrorMessage));

      // Assert
      expect(result.message.error).toBe(specialErrorMessage);
    });

    it('should maintain immutability when updating error message', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: 'old error' },
        startPlacingOrder: false
      };
      const errorMessage = 'new error';

      // Act
      const result = ordersReducer(initialState, placeOrderError(errorMessage));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.message).not.toBe(initialState.message);
      expect(result.order).toBe(initialState.order); // Should preserve reference if unchanged
      expect(initialState.message.error).toBe('old error'); // Original state unchanged
    });
  });

  describe('startPlacingOrder Action', () => {
    it('should handle startPlacingOrder with true', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act
      const result = ordersReducer(initialState, startPlacingOrder(true));

      // Assert
      expect(result.startPlacingOrder).toBe(true);
      expect(result.order).toEqual(mockOrderApiResponse);
      expect(result.message.error).toBe('');
    });

    it('should handle startPlacingOrder with false', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: 'Some error' },
        startPlacingOrder: true
      };

      // Act
      const result = ordersReducer(initialState, startPlacingOrder(false));

      // Assert
      expect(result.startPlacingOrder).toBe(false);
      expect(result.order).toEqual(mockOrderApiResponse);
      expect(result.message.error).toBe('Some error');
    });

    it('should handle rapid startPlacingOrder state changes', () => {
      // Arrange
      let state: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act & Assert - Multiple rapid changes
      state = ordersReducer(state, startPlacingOrder(true));
      expect(state.startPlacingOrder).toBe(true);

      state = ordersReducer(state, startPlacingOrder(false));
      expect(state.startPlacingOrder).toBe(false);

      state = ordersReducer(state, startPlacingOrder(true));
      expect(state.startPlacingOrder).toBe(true);

      state = ordersReducer(state, startPlacingOrder(false));
      expect(state.startPlacingOrder).toBe(false);
    });

    it('should maintain immutability when updating startPlacingOrder', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: 'test error' },
        startPlacingOrder: false
      };

      // Act
      const result = ordersReducer(initialState, startPlacingOrder(true));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.order).toBe(initialState.order); // Should preserve reference if unchanged
      expect(result.message).toBe(initialState.message); // Should preserve reference if unchanged
      expect(initialState.startPlacingOrder).toBe(false); // Original state unchanged
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle rapid successive actions', () => {
      // Arrange
      let state: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act & Assert - Apply multiple actions in sequence
      state = ordersReducer(state, startPlacingOrder(true));
      expect(state.startPlacingOrder).toBe(true);

      state = ordersReducer(state, placeOrder(mockOrderApiResponse));
      expect(state.order).toEqual(mockOrderApiResponse);
      expect(state.startPlacingOrder).toBe(true);

      state = ordersReducer(state, placeOrderError('Error occurred'));
      expect(state.message.error).toBe('Error occurred');
      expect(state.order).toEqual(mockOrderApiResponse);

      state = ordersReducer(state, startPlacingOrder(false));
      expect(state.startPlacingOrder).toBe(false);
      expect(state.message.error).toBe('Error occurred');

      state = ordersReducer(state, placeOrder(mockPickupOrderApiResponse));
      expect(state.order).toEqual(mockPickupOrderApiResponse);
    });

    it('should handle undefined and null payloads gracefully', () => {
      // Arrange
      const initialState: OrdersState = {
        order: mockOrderApiResponse,
        message: { error: 'previous error' },
        startPlacingOrder: false
      };

      // Act & Assert
      const result1 = ordersReducer(initialState, placeOrder(null as any));
      expect(result1.order).toBeNull();

      const result2 = ordersReducer(initialState, placeOrderError(undefined as any));
      expect(result2.message.error).toBeUndefined();

      const result3 = ordersReducer(initialState, startPlacingOrder(undefined as any));
      expect(result3.startPlacingOrder).toBeUndefined();
    });

    it('should handle order with maximum complexity', () => {
      // Arrange
      const maxComplexOrder = {
        order: {
          _id: 'max-complex-order-999',
          orderNumber: 'ORD-2025-MAX-COMPLEX-999',
          items: Array.from({ length: 50 }, (_, i) => ({
            foodId: `food-complex-${i}`,
            name: `Complex Food Item ${i} with Special Characters ñáéíóú & Symbols 🍕🥗🍰`,
            price: 10 + i * 0.25,
            quantity: Math.floor(Math.random() * 5) + 1,
            customizations: [`Extra ${i}`, `No ${i}`, `Side ${i}`],
            allergens: ['gluten', 'dairy', 'nuts'].filter(() => Math.random() > 0.5)
          })),
          totalAmount: 1250.75,
          customerInfo: {
            name: 'Maximum Complexity Customer with Very Long Name That Tests String Limits',
            email: 'max.complexity.customer.with.very.long.email@very-long-domain-name-for-testing.co.uk',
            phone: '+1 (555) 123-4567 ext. 12345',
            address: `123 Very Long Street Name That Tests Address Limits
                     Apartment Complex Building 999, Unit 12345
                     Very Long City Name, Very Long State Name 12345-6789
                     Additional Address Line For Complex Addresses`
          },
          orderType: 'delivery',
          status: 'preparing',
          specialInstructions: 'This is a very long special instruction field that tests the limit of what can be stored in the special instructions. It includes multiple sentences, special characters like ñáéíóú, emojis 🍕🥗🍰, and various punctuation marks!@#$%^&*().',
          deliveryNotes: 'Complex delivery notes with multiple requirements',
          estimatedDeliveryTime: '2025-10-06T20:30:00Z',
          actualDeliveryTime: null,
          paymentMethod: 'credit_card',
          paymentStatus: 'pending',
          discounts: [
            { code: 'COMPLEX10', amount: 12.50 },
            { code: 'LOYALTY', amount: 25.00 }
          ],
          taxes: {
            subtotal: 1213.25,
            tax: 37.50,
            total: 1250.75
          },
          createdAt: '2025-10-06T18:00:00Z',
          updatedAt: '2025-10-06T18:30:00Z'
        },
        message: 'Maximum complexity order processed successfully with all features enabled'
      };

      const initialState: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act
      const result = ordersReducer(initialState, placeOrder(maxComplexOrder));

      // Assert
      expect(result.order).toEqual(maxComplexOrder);
      expect(result.order.order.items).toHaveLength(50);
      expect(result.order.order.totalAmount).toBe(1250.75);
      expect(result.order.order.customerInfo.name).toContain('Maximum Complexity');
      expect(result.order.message).toContain('Maximum complexity order processed');
    });
  });

  describe('Action Creators', () => {
    it('should create correct action types and payloads', () => {
      // Test all action creators
      expect(placeOrder(mockOrderApiResponse)).toEqual({
        type: 'orders/placeOrder',
        payload: mockOrderApiResponse
      });

      expect(placeOrderError('error message')).toEqual({
        type: 'orders/placeOrderError',
        payload: 'error message'
      });

      expect(startPlacingOrder(true)).toEqual({
        type: 'orders/startPlacingOrder',
        payload: true
      });

      expect(startPlacingOrder(false)).toEqual({
        type: 'orders/startPlacingOrder',
        payload: false
      });
    });
  });

  describe('State Shape Validation', () => {
    it('should always maintain the correct state shape', () => {
      // Arrange
      const initialState: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act & Assert - Test various operations
      let result = ordersReducer(initialState, placeOrder(mockOrderApiResponse));
      expect(result).toMatchObject({
        order: expect.any(Object),
        message: { error: expect.any(String) },
        startPlacingOrder: expect.any(Boolean)
      });

      result = ordersReducer(result, placeOrderError('Error'));
      expect(result).toMatchObject({
        order: expect.any(Object),
        message: { error: expect.any(String) },
        startPlacingOrder: expect.any(Boolean)
      });

      result = ordersReducer(result, startPlacingOrder(true));
      expect(result).toMatchObject({
        order: expect.any(Object),
        message: { error: expect.any(String) },
        startPlacingOrder: expect.any(Boolean)
      });
    });

    it('should not add unexpected properties to state', () => {
      // Arrange
      const initialState: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act
      const result = ordersReducer(initialState, placeOrder(mockOrderApiResponse));

      // Assert
      const stateKeys = Object.keys(result);
      expect(stateKeys).toEqual(['order', 'message', 'startPlacingOrder']);
      expect(Object.keys(result.message)).toEqual(['error']);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle state updates efficiently', () => {
      // Arrange
      const initialState: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };
      const startTime = performance.now();

      // Act
      for (let i = 0; i < 100; i++) {
        ordersReducer(initialState, placeOrder(mockOrderApiResponse));
      }
      const endTime = performance.now();

      // Assert - Should complete quickly
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not cause memory leaks with frequent updates', () => {
      // Arrange
      let state: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act - Simulate many state updates
      for (let i = 0; i < 50; i++) {
        state = ordersReducer(state, placeOrder(mockOrderApiResponse));
        state = ordersReducer(state, startPlacingOrder(i % 2 === 0));
        state = ordersReducer(state, placeOrderError(`Error ${i}`));
      }

      // Assert - Final state should be valid
      expect(state.order).toEqual(mockOrderApiResponse);
      expect(state.message.error).toBe('Error 49');
      expect(state.startPlacingOrder).toBe(false);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle complete order placement workflow', () => {
      // Arrange
      let state: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act & Assert - Simulate real order placement workflow
      
      // 1. Start placing order
      state = ordersReducer(state, startPlacingOrder(true));
      expect(state.startPlacingOrder).toBe(true);
      expect(state.order).toEqual({});
      expect(state.message.error).toBe('');

      // 2. Order placement succeeds
      state = ordersReducer(state, placeOrder(mockOrderApiResponse));
      expect(state.order).toEqual(mockOrderApiResponse);
      expect(state.startPlacingOrder).toBe(true);

      // 3. Stop placing order
      state = ordersReducer(state, startPlacingOrder(false));
      expect(state.startPlacingOrder).toBe(false);
      expect(state.order).toEqual(mockOrderApiResponse);
    });

    it('should handle failed order placement workflow', () => {
      // Arrange
      let state: OrdersState = {
        order: {},
        message: { error: '' },
        startPlacingOrder: false
      };

      // Act & Assert - Simulate failed order placement workflow
      
      // 1. Start placing order
      state = ordersReducer(state, startPlacingOrder(true));
      expect(state.startPlacingOrder).toBe(true);

      // 2. Order placement fails
      state = ordersReducer(state, placeOrderError('Payment processing failed'));
      expect(state.message.error).toBe('Payment processing failed');
      expect(state.startPlacingOrder).toBe(true);

      // 3. Stop placing order
      state = ordersReducer(state, startPlacingOrder(false));
      expect(state.startPlacingOrder).toBe(false);
      expect(state.message.error).toBe('Payment processing failed');
    });
  });
});