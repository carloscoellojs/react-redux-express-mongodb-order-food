import foodsReducer, { getFoods, getFoodsError } from './foodsReducer';
import type { FoodsState, Food } from '../../../types/types';

// Mock food data
const mockFood1: Food = {
  _id: 'food-1',
  name: 'Margherita Pizza',
  category: 'pizza',
  description: 'Classic pizza with tomato sauce and mozzarella',
  price: 12.99,
  image: 'https://example.com/margherita.jpg',
  ingredients: ['tomato sauce', 'mozzarella', 'basil'],
  calories: 280,
  isAvailable: true,
  rating: 4.5,
  preparationTime: '15-20 mins'
};

const mockFood2: Food = {
  _id: 'food-2',
  name: 'Caesar Salad',
  category: 'salad',
  description: 'Fresh romaine lettuce with Caesar dressing',
  price: 8.99,
  image: 'https://example.com/caesar.jpg',
  ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'caesar dressing'],
  calories: 180,
  isAvailable: true,
  rating: 4.2,
  preparationTime: '5-10 mins'
};

const mockFood3: Food = {
  _id: 'food-3',
  name: 'Chocolate Brownie',
  category: 'dessert',
  description: 'Rich chocolate brownie with vanilla ice cream',
  price: 6.99,
  image: 'https://example.com/brownie.jpg',
  ingredients: ['chocolate', 'flour', 'butter', 'eggs', 'vanilla ice cream'],
  calories: 420,
  isAvailable: false,
  rating: 4.8,
  preparationTime: '10-15 mins'
};

const mockFoods: Food[] = [mockFood1, mockFood2, mockFood3];

describe('Foods Reducer', () => {
  describe('Initial State', () => {
    it('should return the initial state', () => {
      // Act
      const result = foodsReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result).toEqual({
        items: [],
        message: { error: '' }
      });
    });

    it('should have correct initial state structure', () => {
      // Act
      const result = foodsReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('message');
      expect(result.message).toHaveProperty('error');
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.message.error).toBe('string');
    });
  });

  describe('getFoods Action', () => {
    it('should handle getFoods with array of foods', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };

      // Act
      const result = foodsReducer(initialState, getFoods(mockFoods));

      // Assert
      expect(result.items).toEqual(mockFoods);
      expect(result.items).toHaveLength(3);
      expect(result.message.error).toBe('');
    });

    it('should handle getFoods with single food item', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };

      // Act
      const result = foodsReducer(initialState, getFoods([mockFood1]));

      // Assert
      expect(result.items).toEqual([mockFood1]);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockFood1);
    });

    it('should handle getFoods with empty array', () => {
      // Arrange
      const initialState: FoodsState = {
        items: mockFoods,
        message: { error: 'Previous error' }
      };

      // Act
      const result = foodsReducer(initialState, getFoods([]));

      // Assert
      expect(result.items).toEqual([]);
      expect(result.items).toHaveLength(0);
      expect(result.message.error).toBe('Previous error');
    });

    it('should replace existing foods when getFoods is called', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [mockFood1, mockFood2],
        message: { error: '' }
      };
      const newFoods = [mockFood3];

      // Act
      const result = foodsReducer(initialState, getFoods(newFoods));

      // Assert
      expect(result.items).toEqual(newFoods);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockFood3);
    });

    it('should preserve message state when getFoods is called', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: 'Existing error message' }
      };

      // Act
      const result = foodsReducer(initialState, getFoods(mockFoods));

      // Assert
      expect(result.items).toEqual(mockFoods);
      expect(result.message.error).toBe('Existing error message');
    });

    it('should handle getFoods with foods containing all possible properties', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };
      const complexFood: Food = {
        _id: 'complex-food-1',
        name: 'Gourmet Pasta with Special Ingredients',
        category: 'pasta',
        description: 'A complex pasta dish with multiple ingredients and special preparation',
        price: 24.99,
        image: 'https://example.com/complex-pasta.jpg',
        ingredients: ['pasta', 'truffle oil', 'parmesan', 'mushrooms', 'herbs', 'garlic'],
        calories: 650,
        isAvailable: true,
        rating: 4.9,
        preparationTime: '25-30 mins'
      };

      // Act
      const result = foodsReducer(initialState, getFoods([complexFood]));

      // Assert
      expect(result.items[0]).toEqual(complexFood);
      expect(result.items[0]).toHaveProperty('_id');
      expect(result.items[0]).toHaveProperty('name');
      expect(result.items[0]).toHaveProperty('category');
      expect(result.items[0]).toHaveProperty('description');
      expect(result.items[0]).toHaveProperty('price');
      expect(result.items[0]).toHaveProperty('image');
      expect(result.items[0]).toHaveProperty('ingredients');
      expect(result.items[0]).toHaveProperty('calories');
      expect(result.items[0]).toHaveProperty('isAvailable');
      expect(result.items[0]).toHaveProperty('rating');
      expect(result.items[0]).toHaveProperty('preparationTime');
    });

    it('should maintain immutability when updating items', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [mockFood1],
        message: { error: '' }
      };

      // Act
      const result = foodsReducer(initialState, getFoods([mockFood2]));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.items).not.toBe(initialState.items);
      expect(initialState.items).toEqual([mockFood1]); // Original state unchanged
      expect(result.items).toEqual([mockFood2]);
    });
  });

  describe('getFoodsError Action', () => {
    it('should handle getFoodsError with error message', () => {
      // Arrange
      const initialState: FoodsState = {
        items: mockFoods,
        message: { error: '' }
      };
      const errorMessage = 'Failed to fetch foods';

      // Act
      const result = foodsReducer(initialState, getFoodsError(errorMessage));

      // Assert
      expect(result.message.error).toBe(errorMessage);
      expect(result.items).toEqual(mockFoods); // Items should remain unchanged
    });

    it('should handle getFoodsError with empty string', () => {
      // Arrange
      const initialState: FoodsState = {
        items: mockFoods,
        message: { error: 'Previous error' }
      };

      // Act
      const result = foodsReducer(initialState, getFoodsError(''));

      // Assert
      expect(result.message.error).toBe('');
      expect(result.items).toEqual(mockFoods);
    });

    it('should handle getFoodsError with long error message', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };
      const longErrorMessage = 'A very long error message that might occur when the server returns detailed error information about what went wrong during the foods fetching process, including network issues, authentication problems, or server-side errors.';

      // Act
      const result = foodsReducer(initialState, getFoodsError(longErrorMessage));

      // Assert
      expect(result.message.error).toBe(longErrorMessage);
    });

    it('should replace existing error message', () => {
      // Arrange
      const initialState: FoodsState = {
        items: mockFoods,
        message: { error: 'Old error message' }
      };
      const newErrorMessage = 'New error message';

      // Act
      const result = foodsReducer(initialState, getFoodsError(newErrorMessage));

      // Assert
      expect(result.message.error).toBe(newErrorMessage);
      expect(result.items).toEqual(mockFoods);
    });

    it('should handle getFoodsError with special characters', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };
      const specialErrorMessage = 'Error: 网络错误 - Échec de la connexion (500) @#$%^&*()';

      // Act
      const result = foodsReducer(initialState, getFoodsError(specialErrorMessage));

      // Assert
      expect(result.message.error).toBe(specialErrorMessage);
    });

    it('should maintain immutability when updating error message', () => {
      // Arrange
      const initialState: FoodsState = {
        items: mockFoods,
        message: { error: 'Old error' }
      };
      const errorMessage = 'New error';

      // Act
      const result = foodsReducer(initialState, getFoodsError(errorMessage));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.message).not.toBe(initialState.message);
      expect(initialState.message.error).toBe('Old error'); // Original state unchanged
      expect(result.message.error).toBe('New error');
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle undefined payload in getFoods gracefully', () => {
      // Arrange
      const initialState: FoodsState = {
        items: mockFoods,
        message: { error: '' }
      };

      // Act
      const result = foodsReducer(initialState, getFoods(undefined as any));

      // Assert
      expect(result.items).toBeUndefined();
    });

    it('should handle null payload in getFoods gracefully', () => {
      // Arrange
      const initialState: FoodsState = {
        items: mockFoods,
        message: { error: '' }
      };

      // Act
      const result = foodsReducer(initialState, getFoods(null as any));

      // Assert
      expect(result.items).toBeNull();
    });

    it('should handle undefined error message in getFoodsError gracefully', () => {
      // Arrange
      const initialState: FoodsState = {
        items: mockFoods,
        message: { error: 'Previous error' }
      };

      // Act
      const result = foodsReducer(initialState, getFoodsError(undefined as any));

      // Assert
      expect(result.message.error).toBeUndefined();
    });

    it('should handle large datasets efficiently', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };
      const largeFoodsArray = Array.from({ length: 1000 }, (_, i) => ({
        ...mockFood1,
        _id: `food-${i}`,
        name: `Food Item ${i}`
      }));

      // Act
      const result = foodsReducer(initialState, getFoods(largeFoodsArray));

      // Assert
      expect(result.items).toHaveLength(1000);
      expect(result.items[0]._id).toBe('food-0');
      expect(result.items[999]._id).toBe('food-999');
    });

    it('should handle rapid successive actions', () => {
      // Arrange
      let state: FoodsState = {
        items: [],
        message: { error: '' }
      };

      // Act & Assert - Apply multiple actions in sequence
      state = foodsReducer(state, getFoods([mockFood1]));
      expect(state.items).toHaveLength(1);

      state = foodsReducer(state, getFoodsError('Error 1'));
      expect(state.message.error).toBe('Error 1');
      expect(state.items).toHaveLength(1);

      state = foodsReducer(state, getFoods([mockFood1, mockFood2]));
      expect(state.items).toHaveLength(2);
      expect(state.message.error).toBe('Error 1');

      state = foodsReducer(state, getFoodsError(''));
      expect(state.message.error).toBe('');
      expect(state.items).toHaveLength(2);
    });

    it('should preserve referential equality for unchanged parts of state', () => {
      // Arrange
      const initialState: FoodsState = {
        items: mockFoods,
        message: { error: 'Test error' }
      };

      // Act
      const result1 = foodsReducer(initialState, getFoodsError('New error'));
      const result2 = foodsReducer(initialState, getFoods([mockFood1]));

      // Assert
      // When only error changes, items reference should be preserved
      expect(result1.items).toBe(initialState.items);
      // When only items change, message reference should be preserved
      expect(result2.message).toBe(initialState.message);
    });
  });

  describe('Action Creators', () => {
    it('should create getFoods action with correct type and payload', () => {
      // Act
      const action = getFoods(mockFoods);

      // Assert
      expect(action.type).toBe('foods/getFoods');
      expect(action.payload).toEqual(mockFoods);
    });

    it('should create getFoodsError action with correct type and payload', () => {
      // Arrange
      const errorMessage = 'Test error message';

      // Act
      const action = getFoodsError(errorMessage);

      // Assert
      expect(action.type).toBe('foods/getFoodsError');
      expect(action.payload).toBe(errorMessage);
    });
  });

  describe('State Shape Validation', () => {
    it('should always maintain the correct state shape', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };

      // Act & Assert - Test various operations
      let result = foodsReducer(initialState, getFoods(mockFoods));
      expect(result).toMatchObject({
        items: expect.any(Array),
        message: { error: expect.any(String) }
      });

      result = foodsReducer(result, getFoodsError('Error'));
      expect(result).toMatchObject({
        items: expect.any(Array),
        message: { error: expect.any(String) }
      });
    });

    it('should not add unexpected properties to state', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };

      // Act
      const result = foodsReducer(initialState, getFoods(mockFoods));

      // Assert
      const stateKeys = Object.keys(result);
      expect(stateKeys).toEqual(['items', 'message']);
      expect(Object.keys(result.message)).toEqual(['error']);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle state updates efficiently', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };
      const startTime = performance.now();

      // Act
      for (let i = 0; i < 100; i++) {
        foodsReducer(initialState, getFoods(mockFoods));
      }
      const endTime = performance.now();

      // Assert - Should complete quickly
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not cause memory leaks with large datasets', () => {
      // Arrange
      const initialState: FoodsState = {
        items: [],
        message: { error: '' }
      };

      // Act - Simulate many state updates
      let state = initialState;
      for (let i = 0; i < 50; i++) {
        const largeArray = Array.from({ length: 100 }, (_, j) => ({
          ...mockFood1,
          _id: `food-${i}-${j}`
        }));
        state = foodsReducer(state, getFoods(largeArray));
      }

      // Assert - Final state should be valid
      expect(state.items).toHaveLength(100);
      expect(state.items[0]._id).toMatch(/^food-49-/);
    });
  });
});