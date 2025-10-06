import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header/Header";
import type { AppDispatch } from "../../store";
import { useEffect, useState, useMemo } from "react";
import { fetchFoods } from "../../store/actions/foodsActions/foodsActions";
import { Spinner } from "../../components/Spinner/Spinner";
import { CardFoods } from "../../components/Card/CardFoods";
import { MainLayout } from "../../layout/MainLayout";
import { Footer } from "../../components/Footer/Footer";
import {
  addToCartAction,
  startFetchingCart
} from "../../store/actions/cartsActions/cartsActions";
import { setSessionIdAction } from "../../store/actions/sessionActions/sessionActions";
import type { RootState, Food } from "../../types/types";

export const HomePage = () => {
  const { foods } = useSelector((state: RootState) => state); // Access foods state
  const { session } = useSelector((state: RootState) => state); // Access session state
  const dispatch: AppDispatch = useDispatch(); // Initialize dispatch if needed
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Generate categories dynamically from food items
  const categories = useMemo(() => {
    if (!foods.items || foods.items.length === 0) {
      return ["All"];
    }

    const uniqueCategories = new Set<string>();
    foods.items.forEach((food: Food) => {
      if (
        food.category &&
        typeof food.category === "string" &&
        food.category.trim() !== ""
      ) {
        uniqueCategories.add(food.category);
      }
    });

    return ["All", ...Array.from(uniqueCategories).sort()];
  }, [foods.items]);

  useEffect(() => {
    if(!session.sessionId) {
      // dispatch session init action
      dispatch(setSessionIdAction());
    }
  }, []);

  useEffect(() => {
    if (!foods.items.length) {
      dispatch(fetchFoods());
    }
  }, [foods.items.length]);

  const dispatchOnAddToCart = (food: Food) => {
    dispatch(startFetchingCart(true));
    dispatch(addToCartAction(food));
  };

  // Filter foods based on selected category
  const filteredFoods =
    selectedCategory === "All"
      ? foods.items
      : foods.items.filter((food: Food) => food.category === selectedCategory);

  return (
    <MainLayout
      top={
        <Header
          title="Welcome to the Home Page"
          subtitle="Explore our features"
          variant="primary"
          size="lg"
          centered
          showDivider
        />
      }
      middle={
        <>
          <div className="px-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Categories
            </h2>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 pb-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                  px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer
                  ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }
                `}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="body px-4">
            {foods.items.length > 0 ? (
              <div>
                {/* Selected Category Title */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCategory === "All"
                      ? "All Items"
                      : selectedCategory}
                  </h3>
                  <p className="text-gray-600">
                    {filteredFoods.length} item
                    {filteredFoods.length !== 1 ? "s" : ""} available
                  </p>
                </div>

                {/* Food Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFoods.map((food: Food) => (
                    <CardFoods
                      key={food._id}
                      name={food.name}
                      description={food.description}
                      price={food.price}
                      image={food.image}
                      ingredients={food.ingredients}
                      calories={food.calories}
                      rating={food.rating}
                      onAddToCart={() => dispatchOnAddToCart(food)}
                    />
                  ))}
                </div>

                {/* No items message */}
                {filteredFoods.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No items in {selectedCategory}
                    </h3>
                    <p className="text-gray-500">
                      Try selecting a different category or check back later.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <Spinner message="Loading foods..." />
            )}
          </div>
        </>
      }
      bottom={<Footer />}
    />
  );
};
