import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { OrderPage } from './OrderPage';
import type { CartItem } from '../../types/types';

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

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children, className }: any) => (
    <a href={to} className={className} data-testid={`link-${to.replace('/', '')}`}>
      {children}
    </a>
  )
}));

const mockStore = configureStore([]);

// Mock order data
const mockOrderItems: CartItem[] = [
  {
    foodId: '1',
    name: 'Pizza Margherita',
    price: 12.99,
    quantity: 2
  },
  {
    foodId: '2',
    name: 'Caesar Salad',
    price: 8.99,
    quantity: 1
  }
];

// Using 'any' type to bypass TypeScript restrictions for testing
const mockOrder: any = {
  _id: 'order-123',
  orderNumber: 'ORD-2025-001',
  items: mockOrderItems,
  totalAmount: 35.97,
  customerName: 'John Doe',
  contactNumber: '(555) 123-4567',
  deliveryAddress: '123 Main St, City, State 12345',
  orderType: 'delivery',
  status: 'preparing',
  createdAt: '2025-10-06T14:30:00Z',
  updatedAt: '2025-10-06T14:30:00Z'
};

const mockPickupOrder: any = {
  ...mockOrder,
  _id: 'order-124',
  orderNumber: 'ORD-2025-002',
  orderType: 'pickup',
  totalAmount: 32.98
};

// Helper function to create mock state
const createMockState = (overrides: any = {}) => ({
  foods: {
    items: [],
    message: { error: '' }
  },
  carts: {
    carts: null,
    message: { error: '' },
    fetchingCart: false
  },
  orders: {
    order: mockOrder,  // Component expects 'order' property
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
const renderWithProviders = (initialState: any = createMockState()) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <OrderPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('OrderPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order Not Found State', () => {
    it('shows no order found message when order is null', () => {
      const noOrderState = createMockState({
        orders: {
          order: null,
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(noOrderState);

      expect(screen.getByText('Order Status')).toBeInTheDocument();
      expect(screen.getByText('Loading your order information...')).toBeInTheDocument();
      expect(screen.getByText('No Order Found')).toBeInTheDocument();
      expect(screen.getByText('You haven\'t placed an order yet')).toBeInTheDocument();
      expect(screen.getByText('Your session has expired')).toBeInTheDocument();
      expect(screen.getByText('There was an error loading your order')).toBeInTheDocument();
    });

    it('shows no order found when order data is incomplete', () => {
      const incompleteOrderState = createMockState({
        orders: {
          order: { ...mockOrder, totalAmount: undefined } as any,
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(incompleteOrderState);

      expect(screen.getByText('No Order Found')).toBeInTheDocument();
    });

    it('renders action buttons in no order state', () => {
      const noOrderState = createMockState({
        orders: {
          orders: null,
          order: null,
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(noOrderState);

      expect(screen.getByText('Browse Menu & Place Order')).toBeInTheDocument();
      expect(screen.getByText('Check Your Cart')).toBeInTheDocument();
      expect(screen.getByTestId('link-')).toBeInTheDocument(); // Home link
      expect(screen.getByTestId('link-cart')).toBeInTheDocument();
    });

    it('displays support information in no order state', () => {
      const noOrderState = createMockState({
        orders: {
          orders: null,
          order: null,
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(noOrderState);

      expect(screen.getByText('Need help finding your order?')).toBeInTheDocument();
      expect(screen.getByText(/📞 \(555\) 123-FOOD/)).toBeInTheDocument();
      expect(screen.getByText(/📧 support@foodorder\.com/)).toBeInTheDocument();
    });
  });

  describe('Order Confirmation State', () => {
    it('renders order confirmation with complete order data', () => {
      renderWithProviders();

      expect(screen.getByText('Order Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Your order has been successfully placed!')).toBeInTheDocument();
      expect(screen.getByText('Order Placed Successfully!')).toBeInTheDocument();
      expect(screen.getByText('Thank you for your order. We\'re preparing your delicious meal and it will be ready soon.')).toBeInTheDocument();
    });

    it('displays order details correctly', () => {
      renderWithProviders();

      expect(screen.getByText('Order Details')).toBeInTheDocument();
      expect(screen.getByText('ORD-2025-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    });

    it('shows order status badge', () => {
      renderWithProviders();

      const statusBadge = screen.getByText('preparing');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('displays total amount correctly', () => {
      renderWithProviders();

      expect(screen.getByText('Total Amount')).toBeInTheDocument();
      expect(screen.getByText('$35.97')).toBeInTheDocument();
    });

    it('displays order creation time', () => {
      renderWithProviders();

      expect(screen.getByText('Order Placed')).toBeInTheDocument();
      // Check that the date is displayed - look for the formatted date specifically
      expect(screen.getByText('10/6/2025, 8:30:00 AM')).toBeInTheDocument();
    });
  });

  describe('Order Type Handling', () => {
    it('shows delivery information for delivery orders', () => {
      renderWithProviders();

      expect(screen.getByText('🚚 delivery')).toBeInTheDocument();
      expect(screen.getByText('Delivery Address')).toBeInTheDocument();
      expect(screen.getByText('123 Main St, City, State 12345')).toBeInTheDocument();
    });

    it('shows pickup information for pickup orders', () => {
      const pickupOrderState = createMockState({
        orders: {
          orders: null,
          order: mockPickupOrder,
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(pickupOrderState);

      expect(screen.getByText('🏃 pickup')).toBeInTheDocument();
      expect(screen.queryByText('Delivery Address')).not.toBeInTheDocument();
    });

    it('displays correct order type badge colors', () => {
      renderWithProviders();

      const deliveryBadge = screen.getByText('🚚 delivery');
      expect(deliveryBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('shows correct tracking status for pickup orders', () => {
      const pickupOrderState = createMockState({
        orders: {
          orders: null,
          order: mockPickupOrder,
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(pickupOrderState);

      expect(screen.getByText('Ready for pickup')).toBeInTheDocument();
      expect(screen.queryByText('Out for delivery')).not.toBeInTheDocument();
    });
  });

  describe('Order Tracking Section', () => {
    it('displays tracking information', () => {
      renderWithProviders();

      expect(screen.getByText('📱 Track Your Order')).toBeInTheDocument();
      expect(screen.getByText('We\'ll send you updates about your order status. Keep your phone nearby!')).toBeInTheDocument();
    });

    it('shows tracking steps for delivery orders', () => {
      renderWithProviders();

      expect(screen.getByText('Order confirmed and being prepared')).toBeInTheDocument();
      expect(screen.getByText('Out for delivery')).toBeInTheDocument();
      expect(screen.getByText('Order completed')).toBeInTheDocument();
    });

    it('shows correct tracking steps for pickup orders', () => {
      const pickupOrderState = createMockState({
        orders: {
          orders: null,
          order: mockPickupOrder,
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(pickupOrderState);

      expect(screen.getByText('Order confirmed and being prepared')).toBeInTheDocument();
      expect(screen.getByText('Ready for pickup')).toBeInTheDocument();
      expect(screen.getByText('Order completed')).toBeInTheDocument();
    });
  });

  describe('Navigation and Actions', () => {
    it('renders order more food button', () => {
      renderWithProviders();

      expect(screen.getByText('Order More Food')).toBeInTheDocument();
      expect(screen.getByTestId('link-')).toBeInTheDocument(); // Home link
    });

    it('displays contact information', () => {
      renderWithProviders();

      expect(screen.getByText('Need help with your order? Contact us:')).toBeInTheDocument();
      expect(screen.getByText(/📞 \(555\) 123-FOOD/)).toBeInTheDocument();
      expect(screen.getByText(/📧 support@foodorder\.com/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles order with missing customer info gracefully', () => {
      const orderWithMissingInfo = {
        ...mockOrder,
        contactNumber: undefined
      };

      const stateWithMissingInfo = createMockState({
        orders: {
          orders: null,
          order: orderWithMissingInfo as any,
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(stateWithMissingInfo);

      expect(screen.getByText('Order Confirmation')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles order with very small total amount', () => {
      const smallAmountOrderState = createMockState({
        orders: {
          orders: null,
          order: { ...mockOrder, totalAmount: 0.01 },
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(smallAmountOrderState);

      expect(screen.getByText('$0.01')).toBeInTheDocument();
    });

    it('handles order with invalid date gracefully', () => {
      const invalidDateOrderState = createMockState({
        orders: {
          orders: null,
          order: { ...mockOrder, createdAt: 'invalid-date' },
          message: { error: '' },
          startPlacingOrder: false
        }
      });

      renderWithProviders(invalidDateOrderState);

      expect(screen.getByText('Order Placed')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders success icon in confirmation state', () => {
      renderWithProviders();

      // Check for the SVG success icon
      const successIcon = document.querySelector('svg');
      expect(successIcon).toBeInTheDocument();
    });

    it('applies correct CSS classes for order type badges', () => {
      renderWithProviders();

      const deliveryBadge = screen.getByText('🚚 delivery');
      expect(deliveryBadge).toHaveClass('inline-flex', 'px-3', 'py-1', 'rounded-full');
    });

    it('renders responsive grid layout', () => {
      renderWithProviders();

      const orderDetails = screen.getByText('Order Details').closest('div');
      expect(orderDetails).toBeInTheDocument();
    });
  });
});