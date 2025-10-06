import cartsReducer, {
  addToCart,
  addToCartError,
  updateCartStatus,
  updateCartStatusError,
  removeFromCart,
  removeFromCartError,
  clearCart,
  clearCartError,
  setFetchingCart,
  incrementItemQuantity,
  incrementItemQuantityError,
  decrementItemQuantity,
  decrementItemQuantityError
} from './cartsReducer';
import type { Cart, CartsState, CartItem } from '../../../types/types';

// Mock cart data
const mockCartItem1: CartItem = {
  foodId: 'food-1',
  name: 'Margherita Pizza',
  price: 12.99,
  quantity: 2
};

const mockCartItem2: CartItem = {
  foodId: 'food-2',
  name: 'Caesar Salad',
  price: 8.99,
  quantity: 1
};

const mockCart: Cart = {
  _id: 'cart-123',
  sessionId: 'session-123',
  items: [mockCartItem1, mockCartItem2],
  status: 'active',
  totalPrice: 34.97,
  createdAt: '2025-10-06T14:30:00Z',
  updatedAt: '2025-10-06T14:30:00Z'
};

const mockEmptyCart: Cart = {
  _id: 'cart-456',
  sessionId: 'session-456',
  items: [],
  status: 'active',
  totalPrice: 0,
  createdAt: '2025-10-06T14:30:00Z',
  updatedAt: '2025-10-06T14:30:00Z'
};

const mockCompletedCart: Cart = {
  ...mockCart,
  _id: 'cart-789',
  status: 'completed'
};

describe('Carts Reducer', () => {
  describe('Initial State', () => {
    it('should return the initial state', () => {
      // Act
      const result = cartsReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result).toEqual({
        carts: null,
        message: { error: '' },
        fetchingCart: false
      });
    });

    it('should have correct initial state structure', () => {
      // Act
      const result = cartsReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result).toHaveProperty('carts');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('fetchingCart');
      expect(result.message).toHaveProperty('error');
      expect(result.carts).toBeNull();
      expect(typeof result.message.error).toBe('string');
      expect(typeof result.fetchingCart).toBe('boolean');
    });
  });

  describe('Cart Actions', () => {
    describe('addToCart', () => {
      it('should handle addToCart with cart data', () => {
        // Arrange
        const initialState: CartsState = {
          carts: null,
          message: { error: '' },
          fetchingCart: false
        };

        // Act
        const result = cartsReducer(initialState, addToCart(mockCart));

        // Assert
        expect(result.carts).toEqual(mockCart);
        expect(result.message.error).toBe('');
        expect(result.fetchingCart).toBe(false);
      });

      it('should replace existing cart when addToCart is called', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockEmptyCart,
          message: { error: 'Previous error' },
          fetchingCart: true
        };

        // Act
        const result = cartsReducer(initialState, addToCart(mockCart));

        // Assert
        expect(result.carts).toEqual(mockCart);
        expect(result.message.error).toBe('Previous error');
        expect(result.fetchingCart).toBe(true);
      });
    });

    describe('addToCartError', () => {
      it('should handle addToCartError with error message', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };
        const errorMessage = 'Failed to add item to cart';

        // Act
        const result = cartsReducer(initialState, addToCartError(errorMessage));

        // Assert
        expect(result.message.error).toBe(errorMessage);
        expect(result.carts).toEqual(mockCart);
        expect(result.fetchingCart).toBe(false);
      });
    });

    describe('updateCartStatus', () => {
      it('should handle updateCartStatus with updated cart', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };

        // Act
        const result = cartsReducer(initialState, updateCartStatus(mockCompletedCart));

        // Assert
        expect(result.carts).toEqual(mockCompletedCart);
        expect(result.carts?.status).toBe('completed');
      });
    });

    describe('updateCartStatusError', () => {
      it('should handle updateCartStatusError with error message', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };
        const errorMessage = 'Failed to update cart status';

        // Act
        const result = cartsReducer(initialState, updateCartStatusError(errorMessage));

        // Assert
        expect(result.message.error).toBe(errorMessage);
        expect(result.carts).toEqual(mockCart);
      });
    });

    describe('removeFromCart', () => {
      it('should handle removeFromCart with updated cart', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };
        const updatedCart: Cart = {
          ...mockCart,
          items: [mockCartItem1], // One item removed
          totalPrice: 25.98
        };

        // Act
        const result = cartsReducer(initialState, removeFromCart(updatedCart));

        // Assert
        expect(result.carts).toEqual(updatedCart);
        expect(result.carts?.items).toHaveLength(1);
        expect(result.carts?.totalPrice).toBe(25.98);
      });

      it('should handle removeFromCart resulting in empty cart', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };

        // Act
        const result = cartsReducer(initialState, removeFromCart(mockEmptyCart));

        // Assert
        expect(result.carts).toEqual(mockEmptyCart);
        expect(result.carts?.items).toHaveLength(0);
        expect(result.carts?.totalPrice).toBe(0);
      });
    });

    describe('removeFromCartError', () => {
      it('should handle removeFromCartError with error message', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };
        const errorMessage = 'Failed to remove item from cart';

        // Act
        const result = cartsReducer(initialState, removeFromCartError(errorMessage));

        // Assert
        expect(result.message.error).toBe(errorMessage);
        expect(result.carts).toEqual(mockCart);
      });
    });

    describe('incrementItemQuantity', () => {
      it('should handle incrementItemQuantity with updated cart', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };
        const incrementedCart: Cart = {
          ...mockCart,
          items: [
            { ...mockCartItem1, quantity: 3 }, // Incremented from 2 to 3
            mockCartItem2
          ],
          totalPrice: 47.96
        };

        // Act
        const result = cartsReducer(initialState, incrementItemQuantity(incrementedCart));

        // Assert
        expect(result.carts).toEqual(incrementedCart);
        expect(result.carts?.items[0].quantity).toBe(3);
        expect(result.carts?.totalPrice).toBe(47.96);
      });
    });

    describe('incrementItemQuantityError', () => {
      it('should handle incrementItemQuantityError with error message', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };
        const errorMessage = 'Failed to increment item quantity';

        // Act
        const result = cartsReducer(initialState, incrementItemQuantityError(errorMessage));

        // Assert
        expect(result.message.error).toBe(errorMessage);
        expect(result.carts).toEqual(mockCart);
      });
    });

    describe('decrementItemQuantity', () => {
      it('should handle decrementItemQuantity with updated cart', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };
        const decrementedCart: Cart = {
          ...mockCart,
          items: [
            { ...mockCartItem1, quantity: 1 }, // Decremented from 2 to 1
            mockCartItem2
          ],
          totalPrice: 21.98
        };

        // Act
        const result = cartsReducer(initialState, decrementItemQuantity(decrementedCart));

        // Assert
        expect(result.carts).toEqual(decrementedCart);
        expect(result.carts?.items[0].quantity).toBe(1);
        expect(result.carts?.totalPrice).toBe(21.98);
      });
    });

    describe('decrementItemQuantityError', () => {
      it('should handle decrementItemQuantityError with error message', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };
        const errorMessage = 'Failed to decrement item quantity';

        // Act
        const result = cartsReducer(initialState, decrementItemQuantityError(errorMessage));

        // Assert
        expect(result.message.error).toBe(errorMessage);
        expect(result.carts).toEqual(mockCart);
      });
    });

    describe('clearCart', () => {
      it('should handle clearCart by setting carts to null', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: 'Some error' },
          fetchingCart: true
        };

        // Act
        const result = cartsReducer(initialState, clearCart());

        // Assert
        expect(result.carts).toBeNull();
        expect(result.message.error).toBe('Some error'); // Should preserve other state
        expect(result.fetchingCart).toBe(true);
      });

      it('should handle clearCart when cart is already null', () => {
        // Arrange
        const initialState: CartsState = {
          carts: null,
          message: { error: '' },
          fetchingCart: false
        };

        // Act
        const result = cartsReducer(initialState, clearCart());

        // Assert
        expect(result.carts).toBeNull();
        expect(result.message.error).toBe('');
        expect(result.fetchingCart).toBe(false);
      });
    });

    describe('clearCartError', () => {
      it('should handle clearCartError by setting error message', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: 'Old error' },
          fetchingCart: false
        };
        const errorMessage = 'Cart cleared successfully';

        // Act
        const result = cartsReducer(initialState, clearCartError(errorMessage));

        // Assert
        expect(result.message.error).toBe(errorMessage);
        expect(result.carts).toEqual(mockCart);
        expect(result.fetchingCart).toBe(false);
      });
    });

    describe('setFetchingCart', () => {
      it('should handle setFetchingCart with true', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: false
        };

        // Act
        const result = cartsReducer(initialState, setFetchingCart(true));

        // Assert
        expect(result.fetchingCart).toBe(true);
        expect(result.carts).toEqual(mockCart);
        expect(result.message.error).toBe('');
      });

      it('should handle setFetchingCart with false', () => {
        // Arrange
        const initialState: CartsState = {
          carts: mockCart,
          message: { error: '' },
          fetchingCart: true
        };

        // Act
        const result = cartsReducer(initialState, setFetchingCart(false));

        // Assert
        expect(result.fetchingCart).toBe(false);
        expect(result.carts).toEqual(mockCart);
        expect(result.message.error).toBe('');
      });
    });
  });

  describe('State Immutability', () => {
    it('should maintain immutability when updating cart', () => {
      // Arrange
      const initialState: CartsState = {
        carts: mockCart,
        message: { error: 'test error' },
        fetchingCart: false
      };

      // Act
      const result = cartsReducer(initialState, addToCart(mockEmptyCart));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.carts).not.toBe(initialState.carts);
      expect(result.message).toBe(initialState.message); // Should preserve reference if unchanged
      expect(initialState.carts).toEqual(mockCart); // Original state unchanged
    });

    it('should maintain immutability when updating error message', () => {
      // Arrange
      const initialState: CartsState = {
        carts: mockCart,
        message: { error: 'old error' },
        fetchingCart: false
      };

      // Act
      const result = cartsReducer(initialState, addToCartError('new error'));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.message).not.toBe(initialState.message);
      expect(result.carts).toBe(initialState.carts); // Should preserve reference if unchanged
      expect(initialState.message.error).toBe('old error'); // Original state unchanged
    });

    it('should maintain immutability when updating fetchingCart', () => {
      // Arrange
      const initialState: CartsState = {
        carts: mockCart,
        message: { error: 'test error' },
        fetchingCart: false
      };

      // Act
      const result = cartsReducer(initialState, setFetchingCart(true));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.carts).toBe(initialState.carts); // Should preserve reference if unchanged
      expect(result.message).toBe(initialState.message); // Should preserve reference if unchanged
      expect(initialState.fetchingCart).toBe(false); // Original state unchanged
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle rapid successive actions', () => {
      // Arrange
      let state: CartsState = {
        carts: null,
        message: { error: '' },
        fetchingCart: false
      };

      // Act & Assert - Apply multiple actions in sequence
      state = cartsReducer(state, setFetchingCart(true));
      expect(state.fetchingCart).toBe(true);

      state = cartsReducer(state, addToCart(mockCart));
      expect(state.carts).toEqual(mockCart);
      expect(state.fetchingCart).toBe(true);

      state = cartsReducer(state, addToCartError('Error occurred'));
      expect(state.message.error).toBe('Error occurred');
      expect(state.carts).toEqual(mockCart);

      state = cartsReducer(state, clearCart());
      expect(state.carts).toBeNull();
      expect(state.message.error).toBe('Error occurred');

      state = cartsReducer(state, setFetchingCart(false));
      expect(state.fetchingCart).toBe(false);
    });

    it('should handle cart with complex data', () => {
      // Arrange
      const complexCart: Cart = {
        _id: 'complex-cart-123',
        sessionId: 'complex-session-456',
        items: [
          {
            foodId: 'food-1',
            name: 'Pizza with Special Ingredients & Symbols 🍕',
            price: 15.99,
            quantity: 3
          },
          {
            foodId: 'food-2',
            name: 'Café Salad (Très délicieux)',
            price: 12.50,
            quantity: 2
          },
          {
            foodId: 'food-3',
            name: 'Dessert with "Quotes" and \\Backslashes\\',
            price: 8.75,
            quantity: 1
          }
        ],
        status: 'active',
        totalPrice: 81.22,
        createdAt: '2025-10-06T14:30:00Z',
        updatedAt: '2025-10-06T15:30:00Z'
      };

      const initialState: CartsState = {
        carts: null,
        message: { error: '' },
        fetchingCart: false
      };

      // Act
      const result = cartsReducer(initialState, addToCart(complexCart));

      // Assert
      expect(result.carts).toEqual(complexCart);
      expect(result.carts?.items).toHaveLength(3);
      expect(result.carts?.totalPrice).toBe(81.22);
    });

    it('should handle undefined and null payloads gracefully', () => {
      // Arrange
      const initialState: CartsState = {
        carts: mockCart,
        message: { error: 'previous error' },
        fetchingCart: false
      };

      // Act & Assert
      const result1 = cartsReducer(initialState, addToCart(null as any));
      expect(result1.carts).toBeNull();

      const result2 = cartsReducer(initialState, addToCartError(undefined as any));
      expect(result2.message.error).toBeUndefined();

      const result3 = cartsReducer(initialState, setFetchingCart(undefined as any));
      expect(result3.fetchingCart).toBeUndefined();
    });

    it('should handle large cart with many items', () => {
      // Arrange
      const largeCart: Cart = {
        _id: 'large-cart-123',
        sessionId: 'session-123',
        items: Array.from({ length: 100 }, (_, i) => ({
          foodId: `food-${i}`,
          name: `Food Item ${i}`,
          price: 10 + i * 0.5,
          quantity: Math.floor(Math.random() * 5) + 1
        })),
        status: 'active',
        totalPrice: 5000.00,
        createdAt: '2025-10-06T14:30:00Z',
        updatedAt: '2025-10-06T14:30:00Z'
      };

      const initialState: CartsState = {
        carts: null,
        message: { error: '' },
        fetchingCart: false
      };

      // Act
      const result = cartsReducer(initialState, addToCart(largeCart));

      // Assert
      expect(result.carts).toEqual(largeCart);
      expect(result.carts?.items).toHaveLength(100);
      expect(result.carts?.totalPrice).toBe(5000.00);
    });
  });

  describe('Action Creators', () => {
    it('should create correct action types and payloads', () => {
      // Test all action creators
      expect(addToCart(mockCart)).toEqual({
        type: 'carts/addToCart',
        payload: mockCart
      });

      expect(addToCartError('error')).toEqual({
        type: 'carts/addToCartError',
        payload: 'error'
      });

      expect(updateCartStatus(mockCart)).toEqual({
        type: 'carts/updateCartStatus',
        payload: mockCart
      });

      expect(updateCartStatusError('error')).toEqual({
        type: 'carts/updateCartStatusError',
        payload: 'error'
      });

      expect(removeFromCart(mockCart)).toEqual({
        type: 'carts/removeFromCart',
        payload: mockCart
      });

      expect(removeFromCartError('error')).toEqual({
        type: 'carts/removeFromCartError',
        payload: 'error'
      });

      expect(incrementItemQuantity(mockCart)).toEqual({
        type: 'carts/incrementItemQuantity',
        payload: mockCart
      });

      expect(incrementItemQuantityError('error')).toEqual({
        type: 'carts/incrementItemQuantityError',
        payload: 'error'
      });

      expect(decrementItemQuantity(mockCart)).toEqual({
        type: 'carts/decrementItemQuantity',
        payload: mockCart
      });

      expect(decrementItemQuantityError('error')).toEqual({
        type: 'carts/decrementItemQuantityError',
        payload: 'error'
      });

      expect(clearCart()).toEqual({
        type: 'carts/clearCart'
      });

      expect(clearCartError('error')).toEqual({
        type: 'carts/clearCartError',
        payload: 'error'
      });

      expect(setFetchingCart(true)).toEqual({
        type: 'carts/setFetchingCart',
        payload: true
      });
    });
  });

  describe('State Shape Validation', () => {
    it('should always maintain the correct state shape', () => {
      // Arrange
      const initialState: CartsState = {
        carts: null,
        message: { error: '' },
        fetchingCart: false
      };

      // Act & Assert - Test various operations
      let result = cartsReducer(initialState, addToCart(mockCart));
      expect(result).toMatchObject({
        carts: expect.any(Object),
        message: { error: expect.any(String) },
        fetchingCart: expect.any(Boolean)
      });

      result = cartsReducer(result, addToCartError('Error'));
      expect(result).toMatchObject({
        carts: expect.any(Object),
        message: { error: expect.any(String) },
        fetchingCart: expect.any(Boolean)
      });

      result = cartsReducer(result, clearCart());
      expect(result).toMatchObject({
        carts: null,
        message: { error: expect.any(String) },
        fetchingCart: expect.any(Boolean)
      });
    });

    it('should not add unexpected properties to state', () => {
      // Arrange
      const initialState: CartsState = {
        carts: null,
        message: { error: '' },
        fetchingCart: false
      };

      // Act
      const result = cartsReducer(initialState, addToCart(mockCart));

      // Assert
      const stateKeys = Object.keys(result);
      expect(stateKeys).toEqual(['carts', 'message', 'fetchingCart']);
      expect(Object.keys(result.message)).toEqual(['error']);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle state updates efficiently', () => {
      // Arrange
      const initialState: CartsState = {
        carts: null,
        message: { error: '' },
        fetchingCart: false
      };
      const startTime = performance.now();

      // Act
      for (let i = 0; i < 100; i++) {
        cartsReducer(initialState, addToCart(mockCart));
      }
      const endTime = performance.now();

      // Assert - Should complete quickly
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not cause memory leaks with frequent updates', () => {
      // Arrange
      let state: CartsState = {
        carts: null,
        message: { error: '' },
        fetchingCart: false
      };

      // Act - Simulate many state updates
      for (let i = 0; i < 50; i++) {
        state = cartsReducer(state, addToCart(mockCart));
        state = cartsReducer(state, setFetchingCart(i % 2 === 0));
        state = cartsReducer(state, addToCartError(`Error ${i}`));
      }

      // Assert - Final state should be valid
      expect(state.carts).toEqual(mockCart);
      expect(state.message.error).toBe('Error 49');
      expect(state.fetchingCart).toBe(false);
    });
  });
});