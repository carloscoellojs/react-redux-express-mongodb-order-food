import { NavLink, Outlet } from "react-router-dom";
import { NAV_HOME, CART, ORDER, CHECKOUT } from "../../constants/constants";
import { useSelector } from "react-redux";
import type { RootState } from "../../types/types";

export default function Navigation() {
  const cartState = useSelector((state: RootState) => state.carts);
  const cart = cartState?.carts;
  const itemCount = cart?.items?.length || 0;
  
  return (
    <>
      <nav className="bg-gray-10 px-4 py-3 mb-6 shadow w-full">
        <ul className="flex justify-between items-center">
          <div>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-active" : "nav-inactive"
                }
              >
                {NAV_HOME}
              </NavLink>
            </li>
          </div>
          <div className="flex space-x-6">
            <li>
              <NavLink
                to="/order"
                className={({ isActive }) =>
                  isActive ? "nav-active" : "nav-inactive"
                }
              >
                {ORDER}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/checkout"
                className={({ isActive }) =>
                  isActive ? "nav-active" : "nav-inactive"
                }
              >
                {CHECKOUT}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive ? "nav-active" : "nav-inactive"
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    position: "relative"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      style={{
                        width: "20px",
                        height: "20px",
                        flexShrink: 0,
                        display: "block"
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
                      />
                    </svg>
                    {/* Cart Badge */}
                    {itemCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          backgroundColor: "#2563eb", // Blue-600 to match add to cart buttons
                          color: "white",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "bold",
                          minWidth: "18px"
                        }}
                      >
                        {itemCount}
                      </span>
                    )}
                  </div>
                  {CART}
                </div>
              </NavLink>
            </li>
          </div>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}
