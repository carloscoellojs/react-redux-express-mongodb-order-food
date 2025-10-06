import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { CardCartsItemsProps } from "../../types/types";

export const CardCartsItems = ({
  item,
  index,
  onClickQuantityDecrement,
  onClickQuantityIncrement,
  onRemoveItem
}: CardCartsItemsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [wasClicked, setWasClicked] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { fetchingCart } = useSelector((state: any) => state.carts);

  // Track global fetchingCart state and update local isLoading accordingly
  useEffect(() => {
    if (wasClicked) {
      setIsLoading(fetchingCart);

      // Reset wasClicked flag and loading message when loading is complete
      if (!fetchingCart) {
        const timer = setTimeout(() => {
          setWasClicked(false);
          setLoadingMessage("");
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [fetchingCart, wasClicked]);

  // DRY helper function for setting loading state with message
  const handleActionClick = (actionCallback: () => void, message: string) => {
    setWasClicked(true);
    setIsLoading(true);
    setLoadingMessage(message);
    actionCallback();
  };

  return (
    <div
      key={`${item.foodId}-${index}`}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        {/* Item Info */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-2xl">🍽️</span>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {item.name}
            </h3>
            {/* Loading Message */}
            {isLoading && loadingMessage && (
              <p className="text-blue-600 text-sm font-medium animate-pulse mb-1">
                {loadingMessage}
              </p>
            )}
            <p className="text-gray-600 text-sm">Food ID: {item.foodId}</p>
            <p className="text-green-600 font-semibold mt-1">
              ${item.price.toFixed(2)} each
            </p>
          </div>
        </div>

        {/* Quantity & Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                handleActionClick(onClickQuantityDecrement, "Removing one ...")
              }
              disabled={isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-600"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>

            <span className="px-3 py-1 bg-gray-100 rounded-lg font-semibold text-gray-800 min-w-[3rem] text-center">
              {item.quantity}
            </span>

            <button
              onClick={() =>
                handleActionClick(onClickQuantityIncrement, "Adding one ...")
              }
              disabled={isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-600"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>

          {/* Item Total */}
          <div className="text-right min-w-[4rem]">
            <p className="text-lg font-bold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
              isLoading
                ? "text-gray-400 cursor-not-allowed"
                : "text-red-500 hover:text-red-700 hover:bg-red-50"
            }`}
            onClick={() =>
              handleActionClick(onRemoveItem, "Deleting item from cart")
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCartsItems;
