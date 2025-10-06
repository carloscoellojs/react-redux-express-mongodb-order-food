export type FoodsState = {
  items: Food[];
  message: {
    error: string;
  };
};

export type MainLayoutProps = {
  top: React.ReactNode;
  middle: React.ReactNode;
  bottom: React.ReactNode;
};

export type HeaderProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg" | "xl";
  centered?: boolean;
  showDivider?: boolean;
};

export type SpinnerProps = {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "green" | "white" | "gray";
};

export type CardFoodsProps = {
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  calories: number;
  rating: number;
  onAddToCart?: () => void;
  className?: string;
  currency?: string;
};

export type CartsState = {
  carts: Cart | null;
  message: {
    error: string;
  };
  fetchingCart: boolean;
};

export type SessionState = {
  sessionId: string;
  message: {
    error: string;
  };
};

export type Cart = {
  _id: string;
  sessionId: string;
  items: CartItem[];
  status: 'active' | 'completed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type Food = {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  calories: number;
  isAvailable: boolean;
  rating: number;
  preparationTime: string;
};

export type CartItem = {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

export type CardCartsItemsProps = {
  item: CartItem;
  index: number;
  onClickQuantityDecrement: () => void;
  onClickQuantityIncrement: () => void;
  onRemoveItem: () => void;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
  error?: string;
};

export type CartApiResponse = {
  cart: Cart;
  message?: string;
};

export type UpdateCartStatusRequest = {
  _id: string;
  status: string;
};

export type ApiError = {
  message: string;
  error?: Record<string, unknown>;
};

export type OrdersState = {
  orders: Order | null;
  message: {
    error: string;
  };
  startPlacingOrder: boolean;
};

export type Order = {
  _id: string;
  orderNumber: string;
  items: CartItem[];
  totalAmount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  orderType: 'pickup' | 'delivery';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

export type RootState = {
  foods: FoodsState;
  carts: CartsState;
  orders: OrdersState;
  session: SessionState;
};

export type CreateOrderRequest = {
  cartId: string;
  totalAmount: number;
  orderType: 'pickup' | 'delivery';
  customerName: string;
  contactNumber: string;
  deliveryAddress?: string;
};

export type OrderApiResponse = {
  order: Order;
  message?: string;
};

export type SessionResponse = {
  session: {
    userId: string;
  };
};
