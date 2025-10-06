import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { HomePage } from './HomePage';
import type { RootState, Food } from '../../types/types';
import '@testing-library/jest-dom';

// Mock the components to focus on HomePage logic
jest.mock('../../components/Header/Header', () => {
  return function MockHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
    return (
      <div data-testid="header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    );
  };
});

jest.mock('../../components/Spinner/Spinner', () => {
  return {
    Spinner: function MockSpinner({ message }: { message?: string }) {
      return <div data-testid="spinner">{message}</div>;
    }
  };
});

jest.mock('../../components/Card/CardFoods', () => {
  return {
    CardFoods: function MockCardFoods({ 
      name, 
      onAddToCart 
    }: { 
      name: string; 
      onAddToCart?: () => void;
    }) {
      return (
        <div data-testid="card-food">
          <span>{name}</span>
          <button onClick={onAddToCart} data-testid="add-to-cart">Add to Cart</button>
        </div>
      );
    }
  };
});

jest.mock('../../layout/MainLayout', () => {
  return {
    MainLayout: function MockMainLayout({ 
      top, 
      middle, 
      bottom 
    }: { 
      top: React.ReactNode; 
      middle: React.ReactNode; 
      bottom: React.ReactNode; 
    }) {
      return (
        <div data-testid="main-layout">
          <div data-testid="layout-top">{top}</div>
          <div data-testid="layout-middle">{middle}</div>
          <div data-testid="layout-bottom">{bottom}</div>
        </div>
      );
    }
  };
});

jest.mock('../../components/Footer/Footer', () => {
  return {
    Footer: function MockFooter() {
      return <div data-testid="footer">Footer</div>;
    }
  };
});

const mockStore = configureStore<RootState>([]);

const mockFoods: Food[] = [
  {
    _id: '1',
    name: 'Pizza Margherita',
    category: 'Pizza',
    description: 'Classic pizza with tomato and mozzarella',
    price: 12.99,
    image: 'pizza.jpg',
    ingredients: ['tomato', 'mozzarella', 'basil'],
    calories: 250,
    isAvailable: true,
    rating: 4.5,
    preparationTime: '15 min'
  },
  {
    _id: '2',
    name: 'Cheeseburger',
    category: 'Burgers',
    description: 'Juicy beef burger with cheese',
    price: 8.99,
    image: 'burger.jpg',
    ingredients: ['beef', 'cheese', 'lettuce'],
    calories: 400,
    isAvailable: true,
    rating: 4.2,
    preparationTime: '10 min'
  },
  {
    _id: '3',
    name: 'Caesar Salad',
    category: 'Salads',
    description: 'Fresh salad with Caesar dressing',
    price: 7.99,
    image: 'salad.jpg',
    ingredients: ['lettuce', 'parmesan', 'croutons'],
    calories: 180,
    isAvailable: true,
    rating: 4.0,
    preparationTime: '5 min'
  }
];

const createMockState = (overrides: Partial<RootState> = {}): RootState => ({
  foods: {
    items: mockFoods,
    message: { error: '' }
  },
  carts: {
    carts: null,
    message: { error: '' },
    fetchingCart: false
  },
  orders: {
    orders: null,
    message: { error: '' },
    startPlacingOrder: false
  },
  session: {
    sessionId: 'test-session-id',
    message: { error: '' }
  },
  ...overrides
});

describe('HomePage Component', () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    jest.clearAllMocks();
  });

  const renderWithStore = (state: RootState) => {
    const store = mockStore(state);
    store.dispatch = mockDispatch;
    
    return render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );
  };

  describe('Component Rendering', () => {
    it('should render the main layout with header, content, and footer', () => {
      const state = createMockState();
      renderWithStore(state);

      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByTestId('layout-top')).toBeInTheDocument();
      expect(screen.getByTestId('layout-middle')).toBeInTheDocument();
      expect(screen.getByTestId('layout-bottom')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render the header with correct title and subtitle', () => {
      const state = createMockState();
      renderWithStore(state);

      expect(screen.getByText('Welcome to the Home Page')).toBeInTheDocument();
      expect(screen.getByText('Explore our features')).toBeInTheDocument();
    });

    it('should show spinner when foods are loading', () => {
      const state = createMockState({
        foods: {
          items: [],
          message: { error: '' }
        }
      });
      renderWithStore(state);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading foods...')).toBeInTheDocument();
    });
  });

  describe('Categories', () => {
    it('should generate categories dynamically from food items', () => {
      const state = createMockState();
      renderWithStore(state);

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.getByText('Burgers')).toBeInTheDocument();
      expect(screen.getByText('Salads')).toBeInTheDocument();
    });

    it('should show only "All" category when no foods available', () => {
      const state = createMockState({
        foods: {
          items: [],
          message: { error: '' }
        }
      });
      renderWithStore(state);

      // Should show spinner, not categories when no foods
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should filter foods by selected category', () => {
      const state = createMockState();
      renderWithStore(state);

      // Initially all foods should be shown
      expect(screen.getAllByTestId('card-food')).toHaveLength(3);
      expect(screen.getByText('All Items')).toBeInTheDocument();
      expect(screen.getByText('3 items available')).toBeInTheDocument();

      // Click Pizza category
      fireEvent.click(screen.getByText('Pizza'));
      
      // Should show only pizza items
      expect(screen.getAllByTestId('card-food')).toHaveLength(1);
      expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Pizza' })).toBeInTheDocument(); // Category title
      expect(screen.getByText('1 item available')).toBeInTheDocument();
    });

    it('should show no items message when category has no foods', () => {
      const foodsWithOnlyPizza = [mockFoods[0]]; // Only pizza
      const state = createMockState({
        foods: {
          items: foodsWithOnlyPizza,
          message: { error: '' }
        }
      });
      renderWithStore(state);

      // Should only show "All" and "Pizza" categories since there's only pizza
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.queryByText('Burgers')).not.toBeInTheDocument();
      expect(screen.queryByText('Salads')).not.toBeInTheDocument();
    });

    it('should highlight selected category button', () => {
      const state = createMockState();
      renderWithStore(state);

      const allButton = screen.getByText('All');
      const pizzaButton = screen.getByText('Pizza');

      // Initially "All" should be selected
      expect(allButton).toHaveClass('bg-blue-600', 'text-white');
      expect(pizzaButton).toHaveClass('bg-gray-100', 'text-gray-700');

      // Click Pizza category
      fireEvent.click(pizzaButton);

      // Pizza should now be selected
      expect(pizzaButton).toHaveClass('bg-blue-600', 'text-white');
      expect(allButton).toHaveClass('bg-gray-100', 'text-gray-700');
    });
  });

  describe('Food Cards', () => {
    it('should render all food cards when "All" category is selected', () => {
      const state = createMockState();
      renderWithStore(state);

      const foodCards = screen.getAllByTestId('card-food');
      expect(foodCards).toHaveLength(3);

      expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
      expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    it('should handle add to cart action', () => {
      const state = createMockState();
      renderWithStore(state);

      const addToCartButtons = screen.getAllByTestId('add-to-cart');
      fireEvent.click(addToCartButtons[0]);

      // Check that dispatch was called twice (startFetchingCart + addToCartAction)
      expect(mockDispatch).toHaveBeenCalledTimes(2);
      // Both are async thunk functions
      expect(typeof mockDispatch.mock.calls[0][0]).toBe('function');
      expect(typeof mockDispatch.mock.calls[1][0]).toBe('function');
    });
  });

  describe('Session Management', () => {
    it('should dispatch setSessionIdAction when no session ID exists', () => {
      const state = createMockState({
        session: {
          sessionId: '',
          message: { error: '' }
        }
      });
      renderWithStore(state);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(typeof mockDispatch.mock.calls[0][0]).toBe('function');
    });

    it('should not dispatch setSessionIdAction when session ID exists', () => {
      const state = createMockState();
      renderWithStore(state);

      // Check that setSessionIdAction was not called
      const setSessionCalls = mockDispatch.mock.calls.filter(
        call => call[0].type === 'session/setSessionIdAction'
      );
      expect(setSessionCalls).toHaveLength(0);
    });
  });

  describe('Foods Loading', () => {
    it('should dispatch fetchFoods when foods array is empty', () => {
      const state = createMockState({
        foods: {
          items: [],
          message: { error: '' }
        }
      });
      renderWithStore(state);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(typeof mockDispatch.mock.calls[0][0]).toBe('function');
    });

    it('should not dispatch fetchFoods when foods are already loaded', () => {
      const state = createMockState();
      renderWithStore(state);

      // Check that fetchFoods was not called
      const fetchFoodsCalls = mockDispatch.mock.calls.filter(
        call => call[0].type === 'foods/fetchFoods'
      );
      expect(fetchFoodsCalls).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle foods with empty or invalid categories', () => {
      const foodsWithInvalidCategories: Food[] = [
        { ...mockFoods[0], category: '' },
        { ...mockFoods[1], category: '   ' },
        { ...mockFoods[2] }
      ];

      const state = createMockState({
        foods: {
          items: foodsWithInvalidCategories,
          message: { error: '' }
        }
      });
      renderWithStore(state);

      // Should only show "All" and "Salads" (the only valid category)
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Salads')).toBeInTheDocument();
      expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
      expect(screen.queryByText('Burgers')).not.toBeInTheDocument();
    });

    it('should show singular "item" when count is 1', () => {
      const state = createMockState();
      renderWithStore(state);

      // Click Pizza category (has 1 item)
      fireEvent.click(screen.getByText('Pizza'));
      
      expect(screen.getByText('1 item available')).toBeInTheDocument();
    });

    it('should show plural "items" when count is not 1', () => {
      const state = createMockState();
      renderWithStore(state);

      // "All" category should show 3 items
      expect(screen.getByText('3 items available')).toBeInTheDocument();
    });
  });
});