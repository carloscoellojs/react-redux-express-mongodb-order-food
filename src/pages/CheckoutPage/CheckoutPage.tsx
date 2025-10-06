import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header/Header";
import {
  placeOrderAction,
  startPlacingOrderAction
} from "../../store/actions/ordersActions/ordersActions";
import type { AppDispatch } from "../../store";
import { Spinner } from "../../components/Spinner/Spinner";
import type { RootState } from "../../types/types";

export const CheckoutPage = () => {
  const carts = useSelector((state: RootState) => state.carts?.carts || null);
  const startPlacingOrder = useSelector((state: RootState) => state.orders?.startPlacingOrder || false);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [totalAmount, setTotalAmount] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    orderType: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    contactNumber: ""
  });

  const [errors, setErrors] = useState({
    fullName: "",
    orderType: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    contactNumber: ""
  });

  const calculateTotalAmountWithTax = () => {
    if (carts?.totalPrice) {
      const tax = 0.08;
      const total = carts.totalPrice + carts.totalPrice * tax;
      setTotalAmount(total);
    }
  };

  useEffect(() => {
    if (carts && carts.items.length > 0) {
      calculateTotalAmountWithTax();
    }
  }, []);

  useEffect(() => {
    if (formData.orderType === "delivery") {
      setTotalAmount((prevTotal) => prevTotal + 2.99);
    }
    if (formData.orderType === "pickup") {
      setTotalAmount((prevTotal) => prevTotal - 2.99);
    }
  }, [formData.orderType]);

  useEffect(() => {
    if (carts?.status === "completed") {
      navigate("/order");
    }
  }, [carts?.status]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limitedPhoneNumber = phoneNumber.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (limitedPhoneNumber.length <= 3) {
      return limitedPhoneNumber;
    } else if (limitedPhoneNumber.length <= 6) {
      return `(${limitedPhoneNumber.slice(0, 3)}) ${limitedPhoneNumber.slice(
        3
      )}`;
    } else {
      return `(${limitedPhoneNumber.slice(0, 3)}) ${limitedPhoneNumber.slice(
        3,
        6
      )}-${limitedPhoneNumber.slice(6)}`;
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Special handling for contact number formatting
    if (name === "contactNumber") {
      processedValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      fullName: "",
      orderType: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      contactNumber: ""
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.orderType) {
      newErrors.orderType = "Please select pickup or delivery";
    }

    // Address validation only required for delivery
    if (formData.orderType === "delivery") {
      if (!formData.streetAddress.trim()) {
        newErrors.streetAddress = "Street address is required for delivery";
      }

      if (!formData.city.trim()) {
        newErrors.city = "City is required for delivery";
      }

      if (!formData.state.trim()) {
        newErrors.state = "State is required for delivery";
      }

      if (!formData.zipCode.trim()) {
        newErrors.zipCode = "ZIP code is required for delivery";
      } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode.trim())) {
        newErrors.zipCode =
          "Please enter a valid ZIP code (12345 or 12345-6789)";
      }
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else {
      // Extract only digits from the formatted number
      const digitsOnly = formData.contactNumber.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        newErrors.contactNumber = "Contact number must be exactly 10 digits";
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Check if form is valid
  const isFormValid =
    formData.fullName.trim() &&
    formData.orderType &&
    (formData.orderType === "pickup" ||
      (formData.orderType === "delivery" &&
        formData.streetAddress.trim() &&
        formData.city.trim() &&
        formData.state.trim() &&
        formData.zipCode.trim() &&
        /^\d{5}(-\d{4})?$/.test(formData.zipCode.trim()))) &&
    formData.contactNumber.trim() &&
    formData.contactNumber.replace(/\D/g, "").length === 10;

  // Handle order placement
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && carts) {
      dispatch(startPlacingOrderAction(true));
      
      const orderRequest = {
        cartId: carts._id,
        totalAmount,
        orderType: formData.orderType as 'pickup' | 'delivery',
        customerName: formData.fullName,
        contactNumber: formData.contactNumber,
        deliveryAddress: formData.orderType === 'delivery' 
          ? `${formData.streetAddress} ${formData.city}, ${formData.state} ${formData.zipCode}`
          : ''
      };
      
      dispatch(placeOrderAction(orderRequest));
    }
  };

  // If no cart, redirect message
  if (!carts || !carts.items || carts.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header
          title="Checkout"
          subtitle="No items to checkout"
          variant="primary"
          size="lg"
          showDivider
        />

        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-400 text-8xl mb-6">📦</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            No items to checkout
          </h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Your cart is empty. Add some items before proceeding to checkout.
          </p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header
        title="Checkout"
        subtitle="Complete your order"
        variant="primary"
        size="lg"
        showDivider
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Order Form Section */}
        <div className="space-y-6">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Customer Information
              </h2>

              {/* Full Name */}
              <div className="mb-4">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Contact Number */}
              <div className="mb-4">
                <label
                  htmlFor="contactNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  maxLength={14}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    errors.contactNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="(123) 456-7890"
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contactNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Order Type Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Type
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like to receive your order?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      formData.orderType === "pickup"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : errors.orderType
                        ? "border-red-500 hover:border-red-300"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="pickup"
                      checked={formData.orderType === "pickup"}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏃</div>
                      <div className="font-medium">Pickup</div>
                      <div className="text-sm text-gray-500">
                        Pick up at store
                      </div>
                    </div>
                  </label>

                  <label
                    className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      formData.orderType === "delivery"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : errors.orderType
                        ? "border-red-500 hover:border-red-300"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="delivery"
                      checked={formData.orderType === "delivery"}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">🚚</div>
                      <div className="font-medium">Delivery</div>
                      <div className="text-sm text-gray-500">
                        Deliver to address
                      </div>
                    </div>
                  </label>
                </div>
                {errors.orderType && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.orderType}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Delivery Information
              </h2>

              {formData.orderType === "" && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📍</div>
                  <p className="text-lg font-medium mb-2">
                    Select Order Type First
                  </p>
                  <p className="text-sm">
                    Please choose pickup or delivery above to continue
                  </p>
                </div>
              )}

              {formData.orderType === "pickup" && (
                <div className="text-center py-8 text-green-600">
                  <div className="text-4xl mb-4">🏪</div>
                  <p className="text-lg font-medium mb-2">Pickup Selected</p>
                  <p className="text-sm text-gray-600">
                    No delivery address needed - you'll pick up at our store
                  </p>
                </div>
              )}

              {formData.orderType === "delivery" && (
                <div>
                  {/* Street Address */}
                  <div className="mb-4">
                    <label
                      htmlFor="streetAddress"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="streetAddress"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.streetAddress
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors.streetAddress && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.streetAddress}
                      </p>
                    )}
                  </div>

                  {/* City and State Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="New York"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        maxLength={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                          errors.state ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="NY"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ZIP Code */}
                  <div className="mb-4">
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      maxLength={10}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.zipCode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="12345 or 12345-6789"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="space-y-4">
                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                    isFormValid
                      ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {!startPlacingOrder ? (
                    "🚀 Place Order"
                  ) : (
                    <Spinner color="white" message="Placing Order..." />
                  )}
                </button>

                {/* Navigation Links */}
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/cart"
                    className="bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
                  >
                    ← Back to Cart
                  </Link>

                  <Link
                    to="/"
                    className="bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
                  >
                    Continue Shopping →
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Order Summary
            </h2>

            {/* Items List */}
            <div className="space-y-3 mb-6">
              {carts.items.map((item: any, index: number) => (
                <div
                  key={`${item.foodId}-${index}`}
                  className="flex justify-between items-center py-2 border-b border-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({carts.items.length} items)</span>
                <span>${carts.totalPrice.toFixed(2)}</span>
              </div>

              {formData.orderType === "delivery" ? (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>$2.99</span>
                </div>
              ) : null}

              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${(carts.totalPrice * 0.08).toFixed(2)}</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-green-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                📋 Order Details
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Items:</strong> {carts.items.length} items
                </p>
                <p>
                  <strong>Estimated Delivery:</strong> 30-45 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
