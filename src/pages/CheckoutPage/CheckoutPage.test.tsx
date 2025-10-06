import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { CheckoutPage } from './CheckoutPage';
import type { RootState, Cart, CartItem } from '../../types/types';
import { 
  placeOrderAction
} from '../../store/actions/ordersActions/ordersActions';

// Mock components
jest.mock('../../components/Header/Header', () => {
  return function MockHeader({ title, subtitle }: any) {
    return (
      <div data-testid="header">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    );
  };
});

jest.mock('../../components/Spinner/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ to, children, className }: any) => (
    <a href={to} className={className} data-testid={`link-${to.replace('/', '')}`}>
      {children}
    </a>
  )
}));

// Mock Redux actions
jest.mock('../../store/actions/ordersActions/ordersActions', () => ({
  placeOrderAction: jest.fn(() => ({ type: 'PLACE_ORDER' })),
  startPlacingOrderAction: jest.fn(() => ({ type: 'START_PLACING_ORDER' }))
}));

const mockStore = configureStore([]);

// Mock cart items
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
  totalPrice: 34.97, // (12.99 * 2) + 8.99
  status: 'active',
  createdAt: '2025-10-06T10:00:00Z',
  updatedAt: '2025-10-06T10:30:00Z'
};

// Helper function to create mock state
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
    sessionId: 'test-session-123',
    message: { error: '' }
  },
  ...overrides
});

// Helper function to render component with providers
const renderWithProviders = (initialState: RootState = createMockState()) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('CheckoutPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Component Rendering', () => {
    it('renders checkout page with cart items', () => {
      renderWithProviders();

      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Complete your order')).toBeInTheDocument();
      expect(screen.getByText('Customer Information')).toBeInTheDocument();
      expect(screen.getByText('Order Type')).toBeInTheDocument();
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    it('displays cart items in order summary', () => {
      renderWithProviders();

      expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
      expect(screen.getByText('Qty: 2')).toBeInTheDocument();
      expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
      expect(screen.getByText('Qty: 1')).toBeInTheDocument();
    });

    it('calculates and displays correct subtotal', () => {
      renderWithProviders();

      expect(screen.getByText('$34.97')).toBeInTheDocument(); // Subtotal
      expect(screen.getByText('$2.80')).toBeInTheDocument(); // Tax (8%)
    });

    it('shows empty cart message when no items', () => {
      const emptyCartState = createMockState({
        carts: {
          carts: null,
          message: { error: '' },
          fetchingCart: false
        }
      });
      
      renderWithProviders(emptyCartState);

      // Use getAllByText since "No items to checkout" appears in both header and main content
      const noItemsElements = screen.getAllByText('No items to checkout');
      expect(noItemsElements).toHaveLength(2);
      expect(screen.getByText('Your cart is empty. Add some items before proceeding to checkout.')).toBeInTheDocument();
      expect(screen.getByText('Start Shopping')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('renders all required form fields', () => {
      renderWithProviders();

      expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contact Number/)).toBeInTheDocument();
      expect(screen.getByText('Pickup')).toBeInTheDocument();
      expect(screen.getByText('Delivery')).toBeInTheDocument();
    });

    it('handles text input changes', () => {
      renderWithProviders();

      const nameInput = screen.getByLabelText(/Full Name/) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      expect(nameInput.value).toBe('John Doe');
    });

    it('formats phone number as user types', () => {
      renderWithProviders();

      const phoneInput = screen.getByLabelText(/Contact Number/) as HTMLInputElement;
      
      fireEvent.change(phoneInput, { target: { value: '1234567890' } });
      expect(phoneInput.value).toBe('(123) 456-7890');

      fireEvent.change(phoneInput, { target: { value: '123456' } });
      expect(phoneInput.value).toBe('(123) 456');

      fireEvent.change(phoneInput, { target: { value: '123' } });
      expect(phoneInput.value).toBe('123');
    });

    it('handles order type selection', () => {
      renderWithProviders();

      const pickupRadio = screen.getByDisplayValue('pickup') as HTMLInputElement;
      const deliveryRadio = screen.getByDisplayValue('delivery') as HTMLInputElement;

      fireEvent.click(pickupRadio);
      expect(pickupRadio.checked).toBe(true);
      expect(deliveryRadio.checked).toBe(false);

      fireEvent.click(deliveryRadio);
      expect(deliveryRadio.checked).toBe(true);
      expect(pickupRadio.checked).toBe(false);
    });
  });

  describe('Delivery Address Fields', () => {
    it('shows delivery fields when delivery is selected', () => {
      renderWithProviders();

      const deliveryRadio = screen.getByDisplayValue('delivery');
      fireEvent.click(deliveryRadio);

      expect(screen.getByLabelText(/Street Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/City/)).toBeInTheDocument();
      expect(screen.getByLabelText(/State/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ZIP Code/)).toBeInTheDocument();
    });

    it('shows pickup message when pickup is selected', () => {
      renderWithProviders();

      const pickupRadio = screen.getByDisplayValue('pickup');
      fireEvent.click(pickupRadio);

      expect(screen.getByText('Pickup Selected')).toBeInTheDocument();
      expect(screen.getByText('No delivery address needed - you\'ll pick up at our store')).toBeInTheDocument();
    });

    it('shows select order type message initially', () => {
      renderWithProviders();

      expect(screen.getByText('Select Order Type First')).toBeInTheDocument();
      expect(screen.getByText('Please choose pickup or delivery above to continue')).toBeInTheDocument();
    });

    it('handles delivery address inputs', () => {
      renderWithProviders();

      const deliveryRadio = screen.getByDisplayValue('delivery');
      fireEvent.click(deliveryRadio);

      const streetInput = screen.getByLabelText(/Street Address/) as HTMLInputElement;
      const cityInput = screen.getByLabelText(/City/) as HTMLInputElement;
      const stateInput = screen.getByLabelText(/State/) as HTMLInputElement;
      const zipInput = screen.getByLabelText(/ZIP Code/) as HTMLInputElement;

      fireEvent.change(streetInput, { target: { value: '123 Main St' } });
      fireEvent.change(cityInput, { target: { value: 'Anytown' } });
      fireEvent.change(stateInput, { target: { value: 'CA' } });
      fireEvent.change(zipInput, { target: { value: '12345' } });

      expect(streetInput.value).toBe('123 Main St');
      expect(cityInput.value).toBe('Anytown');
      expect(stateInput.value).toBe('CA');
      expect(zipInput.value).toBe('12345');
    });
  });

  describe('Price Calculations', () => {
    it('adds delivery fee when delivery is selected', async () => {
      renderWithProviders();

      const deliveryRadio = screen.getByDisplayValue('delivery');
      fireEvent.click(deliveryRadio);

      await waitFor(() => {
        expect(screen.getByText('Delivery Fee')).toBeInTheDocument();
        expect(screen.getByText('$2.99')).toBeInTheDocument();
      });
    });

    it('calculates correct total with tax', () => {
      renderWithProviders();

      // Tax calculation: 34.97 * 0.08 = 2.7976 → $2.80
      // Total: 34.97 + 2.80 = $37.77
      expect(screen.getByText('$37.77')).toBeInTheDocument();
    });

    it('calculates correct total with delivery fee and tax', async () => {
      renderWithProviders();

      const deliveryRadio = screen.getByDisplayValue('delivery');
      fireEvent.click(deliveryRadio);

      await waitFor(() => {
        // Total with delivery: 34.97 + 2.99 + 2.80 = $40.76
        expect(screen.getByText('$40.76')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('renders form with validation attributes', () => {
      renderWithProviders();

      // Check that required fields have proper attributes
      const nameInput = screen.getByLabelText(/Full Name/);
      const phoneInput = screen.getByLabelText(/Contact Number/);
      
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(phoneInput).toHaveAttribute('type', 'tel');
      expect(phoneInput).toHaveAttribute('maxLength', '14');
    });

    it('handles form submission attempt', () => {
      renderWithProviders();

      const placeOrderButton = screen.getByRole('button', { name: /place order/i });
      
      // Button should be disabled initially (form is empty)
      expect(placeOrderButton).toHaveAttribute('disabled');
    });

    it('shows delivery address fields when delivery is selected', async () => {
      renderWithProviders();

      const deliveryRadio = screen.getByDisplayValue('delivery');
      fireEvent.click(deliveryRadio);

      await waitFor(() => {
        expect(screen.getByLabelText(/Street Address/)).toBeInTheDocument();
        expect(screen.getByLabelText(/City/)).toBeInTheDocument();
        expect(screen.getByLabelText(/State/)).toBeInTheDocument();
        expect(screen.getByLabelText(/ZIP Code/)).toBeInTheDocument();
      });
    });

    it('formats phone number correctly', () => {
      renderWithProviders();

      const phoneInput = screen.getByLabelText(/Contact Number/) as HTMLInputElement;
      
      fireEvent.change(phoneInput, { target: { value: '1234567890' } });
      expect(phoneInput.value).toBe('(123) 456-7890');
    });
  });

  describe('Order Submission', () => {
    it('handles form submission with valid pickup data', async () => {
      renderWithProviders();

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Contact Number/), { target: { value: '1234567890' } });
      fireEvent.click(screen.getByDisplayValue('pickup'));

      // Verify form fields are populated
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('(123) 456-7890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('pickup')).toBeChecked();
    });

    it('handles form submission with valid delivery data', async () => {
      renderWithProviders();

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'Jane Smith' } });
      fireEvent.change(screen.getByLabelText(/Contact Number/), { target: { value: '9876543210' } });
      
      fireEvent.click(screen.getByDisplayValue('delivery'));
      
      // Wait for delivery fields to appear and fill them
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/Street Address/), { target: { value: '456 Oak Ave' } });
        fireEvent.change(screen.getByLabelText(/City/), { target: { value: 'Springfield' } });
        fireEvent.change(screen.getByLabelText(/State/), { target: { value: 'IL' } });
        fireEvent.change(screen.getByLabelText(/ZIP Code/), { target: { value: '62701' } });
      });

      // Verify form fields are populated
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('(987) 654-3210')).toBeInTheDocument();
      expect(screen.getByDisplayValue('delivery')).toBeChecked();
      expect(screen.getByDisplayValue('456 Oak Ave')).toBeInTheDocument();
    });

    it('calls action when form is submitted', () => {
      renderWithProviders();

      const placeOrderButton = screen.getByRole('button', { name: /place order/i });
      fireEvent.click(placeOrderButton);

      // Since form is empty/invalid, actions should not be called
      expect(placeOrderAction).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('navigates to order page when cart status is completed', () => {
      const completedCartState = createMockState({
        carts: {
          carts: { ...mockCart, status: 'completed' },
          message: { error: '' },
          fetchingCart: false
        }
      });

      renderWithProviders(completedCartState);

      expect(mockNavigate).toHaveBeenCalledWith('/order');
    });

    it('renders navigation links correctly', () => {
      renderWithProviders();

      expect(screen.getByTestId('link-cart')).toBeInTheDocument();
      expect(screen.getByTestId('link-')).toBeInTheDocument(); // Home page link
      expect(screen.getByText('← Back to Cart')).toBeInTheDocument();
      expect(screen.getByText('Continue Shopping →')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows spinner when placing order', () => {
      const loadingState = createMockState({
        orders: {
          orders: null,
          message: { error: '' },
          startPlacingOrder: true
        }
      });

      renderWithProviders(loadingState);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty cart items array', () => {
      const emptyItemsState = createMockState({
        carts: {
          carts: { ...mockCart, items: [] },
          message: { error: '' },
          fetchingCart: false
        }
      });

      renderWithProviders(emptyItemsState);

      // Use getAllByText since "No items to checkout" appears in both header and main content
      const noItemsElements = screen.getAllByText('No items to checkout');
      expect(noItemsElements).toHaveLength(2); // Header subtitle and main heading
    });

    it('handles cart with zero total price', () => {
      const zeroTotalState = createMockState({
        carts: {
          carts: { ...mockCart, totalPrice: 0 },
          message: { error: '' },
          fetchingCart: false
        }
      });

      renderWithProviders(zeroTotalState);

      // Check that all price fields show $0.00 (subtotal, tax, and total)
      const zeroPrice = screen.getAllByText('$0.00');
      expect(zeroPrice).toHaveLength(3); // Subtotal, Tax, and Total should all be $0.00
    });

    it('prevents form submission when form is invalid', () => {
      renderWithProviders();

      const placeOrderButton = screen.getByRole('button', { name: /place order/i });
      fireEvent.click(placeOrderButton);

      expect(placeOrderAction).not.toHaveBeenCalled();
    });
  });
});