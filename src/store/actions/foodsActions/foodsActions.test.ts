import axios from 'axios';
import type { AppDispatch } from '../../../store';
import { fetchFoods } from './foodsActions';
import {
  getFoods,
  getFoodsError
} from '../../reducers/foodsReducer/foodsReducer';
import { delay } from '../../../utils/utils';
import type { Food } from '../../../types/types';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../utils/utils');
jest.mock('../../reducers/foodsReducer/foodsReducer');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedDelay = delay as jest.MockedFunction<typeof delay>;

// Mock action creators
const mockGetFoods = getFoods as jest.MockedFunction<typeof getFoods>;
const mockGetFoodsError = getFoodsError as jest.MockedFunction<typeof getFoodsError>;

// Mock dispatch
const mockDispatch = jest.fn() as jest.MockedFunction<AppDispatch>;

// Mock data
const mockFoods: Food[] = [
  {
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
  },
  {
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
  },
  {
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
  }
];

const mockApiResponse = {
  data: mockFoods
};

describe('Foods Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock returns
    mockedDelay.mockResolvedValue(undefined);
  });

  describe('fetchFoods', () => {
    it('successfully fetches foods and dispatches getFoods action', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue(mockApiResponse);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/foods');
      expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoods(mockFoods));
      expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({
        type: expect.stringContaining('error')
      }));
    });

    it('handles network errors and dispatches getFoodsError action', async () => {
      // Arrange
      const networkError = { message: 'Network Error' };
      mockedAxios.get.mockRejectedValue(networkError);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/foods');
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoodsError('Network Error'));
      expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({
        type: expect.stringContaining('getFoods')
      }));
    });

    it('handles API errors and dispatches getFoodsError action', async () => {
      // Arrange
      const apiError = {
        message: 'Internal Server Error'
      };
      mockedAxios.get.mockRejectedValue(apiError);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/foods');
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoodsError('Internal Server Error'));
    });

    it('handles timeout errors and dispatches getFoodsError action', async () => {
      // Arrange
      const timeoutError = {
        message: 'timeout of 5000ms exceeded'
      };
      mockedAxios.get.mockRejectedValue(timeoutError);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoodsError('timeout of 5000ms exceeded'));
    });

    it('calls dispatch functions in correct order for successful request', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue(mockApiResponse);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert - Verify dispatch is called only once for success case
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoods(mockFoods));
    });

    it('calls dispatch functions in correct order for error case', async () => {
      // Arrange
      const testError = { message: 'Test error' };
      mockedAxios.get.mockRejectedValue(testError);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert - Verify dispatch is called only once for error case
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoodsError('Test error'));
    });

    it('handles errors with message property', async () => {
      // Arrange
      const errorWithMessage = {
        message: 'Bad Request: Invalid parameters'
      };
      mockedAxios.get.mockRejectedValue(errorWithMessage);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoodsError('Bad Request: Invalid parameters'));
    });

    it('handles complex error objects', async () => {
      // Arrange
      const complexError = {
        message: 'Database connection failed',
        error: {
          code: 'DB_ERROR',
          details: 'Connection timeout'
        }
      };
      mockedAxios.get.mockRejectedValue(complexError);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoodsError('Database connection failed'));
    });

    it('applies delay after successful API call', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue(mockApiResponse);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('api/v1/foods');
      expect(mockedDelay).toHaveBeenCalledWith(true, 2000);
      // Verify both axios and delay were called
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedDelay).toHaveBeenCalledTimes(1);
    });

    it('does not apply delay when API call fails', async () => {
      // Arrange
      mockedAxios.get.mockRejectedValue(new Error('API Error'));
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockedDelay).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Integration', () => {
    it('handles empty foods array response', async () => {
      // Arrange
      const emptyResponse = { data: [] };
      mockedAxios.get.mockResolvedValue(emptyResponse);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoods([]));
    });

    it('handles response with single food item', async () => {
      // Arrange
      const singleFoodResponse = { data: [mockFoods[0]] };
      mockedAxios.get.mockResolvedValue(singleFoodResponse);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoods([mockFoods[0]]));
    });

    it('handles response with foods containing all possible properties', async () => {
      // Arrange
      const completeFoodResponse = { data: mockFoods };
      mockedAxios.get.mockResolvedValue(completeFoodResponse);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoods(mockFoods));
      // Verify all food properties are preserved
      const dispatchCall = mockDispatch.mock.calls[0][0];
      expect(dispatchCall).toEqual(mockGetFoods(mockFoods));
    });

    it('handles concurrent fetchFoods calls', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue(mockApiResponse);
      
      // Act - Simulate multiple concurrent calls
      const promise1 = fetchFoods()(mockDispatch);
      const promise2 = fetchFoods()(mockDispatch);
      const promise3 = fetchFoods()(mockDispatch);
      
      await Promise.all([promise1, promise2, promise3]);
      
      // Assert
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(mockedDelay).toHaveBeenCalledTimes(3);
    });

    it('preserves food data structure integrity', async () => {
      // Arrange
      const foodWithAllProperties = {
        _id: 'test-food',
        name: 'Test Food',
        category: 'test',
        description: 'Test description',
        price: 9.99,
        image: 'test.jpg',
        ingredients: ['ingredient1', 'ingredient2'],
        calories: 200,
        isAvailable: true,
        rating: 4.0,
        preparationTime: '10 mins'
      };
      mockedAxios.get.mockResolvedValue({ data: [foodWithAllProperties] });
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockGetFoods([foodWithAllProperties]));
    });
  });

  describe('Action Creator Verification', () => {
    it('verifies getFoods action creator is called with correct data', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue(mockApiResponse);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockGetFoods).toHaveBeenCalledWith(mockFoods);
    });

    it('verifies getFoodsError action creator is called with correct error message', async () => {
      // Arrange
      const errorObj = { message: 'Test error' };
      mockedAxios.get.mockRejectedValue(errorObj);
      
      // Act
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockGetFoodsError).toHaveBeenCalledWith('Test error');
    });
  });

  describe('Performance and Reliability', () => {
    it('completes within reasonable time for successful request', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue(mockApiResponse);
      const startTime = Date.now();
      
      // Act
      await fetchFoods()(mockDispatch);
      const endTime = Date.now();
      
      // Assert - Should complete quickly (delay is mocked)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles rapid successive calls without interference', async () => {
      // Arrange
      mockedAxios.get
        .mockResolvedValueOnce({ data: [mockFoods[0]] })
        .mockResolvedValueOnce({ data: [mockFoods[1]] })
        .mockResolvedValueOnce({ data: [mockFoods[2]] });
      
      // Act
      await fetchFoods()(mockDispatch);
      await fetchFoods()(mockDispatch);
      await fetchFoods()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenNthCalledWith(1, mockGetFoods([mockFoods[0]]));
      expect(mockDispatch).toHaveBeenNthCalledWith(2, mockGetFoods([mockFoods[1]]));
      expect(mockDispatch).toHaveBeenNthCalledWith(3, mockGetFoods([mockFoods[2]]));
    });
  });
});