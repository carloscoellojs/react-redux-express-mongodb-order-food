import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { CardFoodsProps, RootState } from "../../types/types";

export const CardFoods = ({
  name,
  description,
  price,
  image,
  ingredients,
  calories,
  rating,
  onAddToCart,
  className = "",
  currency = "$"
}: CardFoodsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [wasClicked, setWasClicked] = useState(false);
  const fetchingCart = useSelector((state: RootState) => state.carts?.fetchingCart || false);

  // Track global fetchingCart state and update local isLoading accordingly
  useEffect(() => {
    if (wasClicked) {
      setIsLoading(fetchingCart);

      // Reset wasClicked flag when loading is complete
      if (!fetchingCart) {
        const timer = setTimeout(() => {
          setWasClicked(false);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [fetchingCart, wasClicked]);

  const handleAddToCart = () => {
    if (onAddToCart) {
      setWasClicked(true);
      setIsLoading(true);
      onAddToCart();
    }
  };
  // Generate star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={i}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-fill)"
            d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
          />
        </svg>
      );
    }

    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-sm mx-auto ${className}`}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={`/images/${image}`}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-md">
          <span className="text-sm font-semibold text-gray-700">
            {calories} cal
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header with name and rating */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {name}
          </h3>
          <div className="flex items-center gap-1 ml-2">
            <div className="flex">{renderStars(rating)}</div>
            <span className="text-sm text-gray-600 ml-1">({rating})</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Ingredients */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Ingredients:
          </h4>
          <div className="flex flex-wrap gap-1">
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-green-600">
              {currency}
              {price.toFixed(2)}
            </span>
          </div>

          {onAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
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
                  Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
