import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { CartPage } from './CartPage';
import type { RootState, Cart, CartItem } from '../../types/types';
import '@testing-library/jest-dom';

// Mock the components to focus on CartPage logic
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

jest.mock('../../components/Card/CardCartsItems', () => {
  return function MockCardCartsItems({ 
    item, 
    onClickQuantityDecrement,
    onClickQuantityIncrement,
    onRemoveItem
  }: { 
    item: CartItem;
    index: number;
    onClickQuantityDecrement?: () => void;
    onClickQuantityIncrement?: () => void;
    onRemoveItem?: () => void;
  }) {
    return (
      <div data-testid="cart-item">
        <span data-testid="item-name">{item.name}</span>
        <span data-testid="item-quantity">{item.quantity}</span>
        <span data-testid="item-price">${item.price}</span>
        <button onClick={onClickQuantityDecrement} data-testid="decrement-btn">-</button>
        <button onClick={onClickQuantityIncrement} data-testid="increment-btn">+</button>
        <button onClick={onRemoveItem} data-testid="remove-btn">Remove</button>
      </div>
    );
  };
});

const mockStore = configureStore<RootState>([]);

const mockCartItems: CartItem[] = [
  {
    foodId: '1',
    name: 'Pizza Margherita',
    price: 12.99,
    quantity: 2
  },
  {
    foodId: '2',
    name: 'Cheeseburger',
    price: 8.99,
    quantity: 1
  }
];

const mockCart: Cart = {
  _id: 'cart123',
  sessionId: 'session123',
  items: mockCartItems,
  status: 'active',
  totalPrice: 34.97,
  createdAt: '2025-10-06T10:00:00Z',
  updatedAt: '2025-10-06T10:30:00Z'
};

const createMockState = (overrides: Partial<RootState> = {}): RootState => ({
  foods: {
    items: [],
    message: { error: '' }
  },
  carts: {
    carts: mockCart,
    message: { error: '' },
    fetchingCart: false
  },
  orders: {
    orders: null,
    message: { error: '' },
    startPlacingOrder: false
  },
  session: {
    sessionId: 'session123',
    message: { error: '' }
  },
  ...overrides
});

describe('CartPage Component', () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    jest.clearAllMocks();
  });

  const renderWithProviders = (state: RootState) => {
    const store = mockStore(state);
    store.dispatch = mockDispatch;
    
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </Provider>
    );
  };

  describe('Empty Cart State', () => {
    it('should render empty cart message when cart is null', () => {
      const state = createMockState({
        carts: {
          carts: null,
          message: { error: '' },
          fetchingCart: false
        }
      });
      renderWithProviders(state);

      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      expect(screen.getByText('Your cart is currently empty')).toBeInTheDocument();
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText(/Looks like you haven't added any items/)).toBeInTheDocument();
      expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    });

    it('should render empty cart message when cart has no items', () => {
      const emptyCart: Cart = { ...mockCart, items: [] };
      const state = createMockState({
        carts: {
          carts: emptyCart,
          message: { error: '' },
          fetchingCart: false
        }
      });
      renderWithProviders(state);

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Continue Shopping' })).toHaveAttribute('href', '/');
    });

    it('should have correct link to home page in empty state', () => {
      const state = createMockState({
        carts: {
          carts: null,
          message: { error: '' },
          fetchingCart: false
        }
      });
      renderWithProviders(state);

      const continueShoppingLink = screen.getByRole('link', { name: 'Continue Shopping' });
      expect(continueShoppingLink).toHaveAttribute('href', '/');
    });
  });

  describe('Cart with Items', () => {
    it('should render cart items when cart has items', () => {
      const state = createMockState();
      renderWithProviders(state);

      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      expect(screen.getByText('2 items in your cart')).toBeInTheDocument();
      
      // Check cart items are rendered
      expect(screen.getAllByTestId('cart-item')).toHaveLength(2);
      expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
      expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
    });

    it('should show singular "item" when cart has 1 item', () => {
      const singleItemCart: Cart = {
        ...mockCart,
        items: [mockCartItems[0]]
      };
      const state = createMockState({
        carts: {
          carts: singleItemCart,
          message: { error: '' },
          fetchingCart: false
        }
      });
      renderWithProviders(state);

      expect(screen.getByText('1 item in your cart')).toBeInTheDocument();
    });

    it('should render order summary with correct calculations', () => {
      const state = createMockState();
      renderWithProviders(state);

      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText('Subtotal (2 items)')).toBeInTheDocument();
      expect(screen.getByText('$34.97')).toBeInTheDocument(); // Total price
      expect(screen.getByText('$2.80')).toBeInTheDocument(); // Tax (8%)
      expect(screen.getByText('$37.77')).toBeInTheDocument(); // Total with tax
    });

    it('should have correct navigation links', () => {
      const state = createMockState();
      renderWithProviders(state);

      const checkoutLink = screen.getByRole('link', { name: 'Proceed to Checkout' });
      expect(checkoutLink).toHaveAttribute('href', '/checkout');

      const continueShoppingLink = screen.getByRole('link', { name: 'Continue Shopping' });
      expect(continueShoppingLink).toHaveAttribute('href', '/');
    });

    it('should display cart information', () => {
      const state = createMockState();
      renderWithProviders(state);

      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('Created:')).toBeInTheDocument();
      expect(screen.getByText('10/6/2025')).toBeInTheDocument(); // Formatted date
    });
  });

  describe('Cart Item Interactions', () => {
    it('should dispatch increment action when increment button is clicked', () => {
      const state = createMockState();
      renderWithProviders(state);

      const incrementButtons = screen.getAllByTestId('increment-btn');
      fireEvent.click(incrementButtons[0]);

      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(typeof mockDispatch.mock.calls[0][0]).toBe('function'); // startFetchingCart
      expect(typeof mockDispatch.mock.calls[1][0]).toBe('function'); // incrementItemQuantityAction
    });

    it('should dispatch decrement action when decrement button is clicked', () => {
      const state = createMockState();
      renderWithProviders(state);

      const decrementButtons = screen.getAllByTestId('decrement-btn');
      fireEvent.click(decrementButtons[0]);

      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(typeof mockDispatch.mock.calls[0][0]).toBe('function'); // startFetchingCart
      expect(typeof mockDispatch.mock.calls[1][0]).toBe('function'); // decrementItemQuantityAction
    });

    it('should dispatch remove action when remove button is clicked', () => {
      const state = createMockState();
      renderWithProviders(state);

      const removeButtons = screen.getAllByTestId('remove-btn');
      fireEvent.click(removeButtons[0]);

      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(typeof mockDispatch.mock.calls[0][0]).toBe('function'); // startFetchingCart
      expect(typeof mockDispatch.mock.calls[1][0]).toBe('function'); // removeFromCartAction
    });

    it('should render correct item details', () => {
      const state = createMockState();
      renderWithProviders(state);

      // Check first item details
      const itemNames = screen.getAllByTestId('item-name');
      const itemQuantities = screen.getAllByTestId('item-quantity');
      const itemPrices = screen.getAllByTestId('item-price');

      expect(itemNames[0]).toHaveTextContent('Pizza Margherita');
      expect(itemQuantities[0]).toHaveTextContent('2');
      expect(itemPrices[0]).toHaveTextContent('$12.99');

      expect(itemNames[1]).toHaveTextContent('Cheeseburger');
      expect(itemQuantities[1]).toHaveTextContent('1');
      expect(itemPrices[1]).toHaveTextContent('$8.99');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined cart items', () => {
      const cartWithUndefinedItems: Cart = { 
        ...mockCart, 
        items: undefined as any 
      };
      const state = createMockState({
        carts: {
          carts: cartWithUndefinedItems,
          message: { error: '' },
          fetchingCart: false
        }
      });
      renderWithProviders(state);

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should handle zero total price', () => {
      const zeroTotalCart: Cart = { ...mockCart, totalPrice: 0 };
      const state = createMockState({
        carts: {
          carts: zeroTotalCart,
          message: { error: '' },
          fetchingCart: false
        }
      });
      renderWithProviders(state);

      // Check that all price fields show $0.00
      const zeroPrice = screen.getAllByText('$0.00');
      expect(zeroPrice).toHaveLength(3); // Subtotal, Tax, and Total should all be $0.00
      
      // Verify the specific sections
      expect(screen.getByText(/Subtotal/)).toBeInTheDocument();
      expect(screen.getByText('Tax')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      const cartWithDifferentDate: Cart = {
        ...mockCart,
        createdAt: '2025-12-25T15:30:00Z'
      };
      const state = createMockState({
        carts: {
          carts: cartWithDifferentDate,
          message: { error: '' },
          fetchingCart: false
        }
      });
      renderWithProviders(state);

      expect(screen.getByText('12/25/2025')).toBeInTheDocument();
    });

    it('should handle different cart statuses', () => {
      const completedCart: Cart = { ...mockCart, status: 'completed' };
      const state = createMockState({
        carts: {
          carts: completedCart,
          message: { error: '' },
          fetchingCart: false
        }
      });
      renderWithProviders(state);

      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render with proper grid layout classes', () => {
      const state = createMockState();
      const { container } = renderWithProviders(state);

      const gridContainer = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render header component with correct props', () => {
      const state = createMockState();
      renderWithProviders(state);

      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      expect(screen.getByText('2 items in your cart')).toBeInTheDocument();
    });

    it('should render all cart items with correct keys', () => {
      const state = createMockState();
      renderWithProviders(state);

      const cartItems = screen.getAllByTestId('cart-item');
      expect(cartItems).toHaveLength(2);
      
      // Items should maintain their order
      expect(cartItems[0]).toHaveTextContent('Pizza Margherita');
      expect(cartItems[1]).toHaveTextContent('Cheeseburger');
    });
  });
});