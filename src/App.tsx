import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { PageNotFound } from "./pages/PageNotFound/PageNotFound";
import { HomePage } from "./pages/HomePage/HomePage";
import { CartPage } from "./pages/CartPage/CartPage";
import { OrderPage } from "./pages/OrderPage/OrderPage";
import Navbar from "./containers/Navbar/Navbar";
import { CheckoutPage } from "./pages/CheckoutPage/CheckoutPage.tsx";
import axios from "axios";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/cart",
        element: <CartPage />
      },
      {
        path: "/order",
        element: <OrderPage />
      },
      {
        path: "/checkout",
        element: <CheckoutPage />
      }
    ]
  },
  {
    path: "/*",
    element: <PageNotFound />
  }
]);

function App() {
  const onBeforeLift = () => {
    const state = store.getState();
    const sessionId = state.session?.sessionId;
    if (sessionId) {
      axios.defaults.headers.common['session-id'] = sessionId;
    }
  };
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} onBeforeLift={onBeforeLift}>
        <RouterProvider router={Router} />
      </PersistGate>
    </Provider>
  );
}

export default App;
