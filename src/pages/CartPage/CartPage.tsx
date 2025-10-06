import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import CardCartsItems from "../../components/Card/CardCartsItems";
import type { AppDispatch, RootState } from "../../store";
import type { CartItem } from "../../types/types";
import {
  decrementItemQuantityAction,
  incrementItemQuantityAction,
  removeFromCartAction,
  startFetchingCart
} from "../../store/actions/cartsActions/cartsActions";

export const CartPage = () => {
  const carts = useSelector((state: RootState) => state.carts?.carts || null);
  const dispatch: AppDispatch = useDispatch();

  const dispatchRemoveFromCart = (foodId: string) => {
    dispatch(startFetchingCart(true));
    dispatch(removeFromCartAction(foodId));
  };

  const dispatchIncrementItemQuantity = (foodId: string) => {
    dispatch(startFetchingCart(true));
    dispatch(incrementItemQuantityAction(foodId));
  };

  const dispatchDecrementItemQuantity = (foodId: string) => {
    dispatch(startFetchingCart(true));
    dispatch(decrementItemQuantityAction(foodId));
  };

  // Handle empty cart
  if (!carts || !carts.items || carts.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header
          title="Shopping Cart"
          subtitle="Your cart is currently empty"
          variant="primary"
          size="lg"
          showDivider
        />

        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-400 text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Looks like you haven't added any items to your cart yet. Start
            shopping to fill it up!
          </p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header
        title="Shopping Cart"
        subtitle={`${carts.items.length} item${
          carts.items.length !== 1 ? "s" : ""
        } in your cart`}
        variant="primary"
        size="lg"
        showDivider
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {carts.items.map((item: CartItem, index: number) => (
              <CardCartsItems
                key={`${item.foodId}-${index}`}
                item={item}
                index={index}
                onClickQuantityDecrement={() =>
                  dispatchDecrementItemQuantity(item.foodId)
                }
                onClickQuantityIncrement={() =>
                  dispatchIncrementItemQuantity(item.foodId)
                }
                onRemoveItem={() => dispatchRemoveFromCart(item.foodId)}
              />
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({carts.items.length} items)</span>
                <span>${carts.totalPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${(carts.totalPrice * 0.08).toFixed(2)}</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>
                  ${(carts.totalPrice + carts.totalPrice * 0.08).toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 mb-4 block text-center"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium transition-colors duration-200 block text-center"
            >
              Continue Shopping
            </Link>

            {/* Cart Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  <strong>Status:</strong> {carts.status}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(carts.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
