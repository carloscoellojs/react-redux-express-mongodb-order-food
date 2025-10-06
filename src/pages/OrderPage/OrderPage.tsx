import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import { useSelector } from "react-redux";

export const OrderPage = () => {
  const orderState = useSelector((state: any) => state.orders);
  const order = orderState?.order;

  // Check if order data is available
  if (
    !order ||
    !order.totalAmount ||
    !order.orderType ||
    !order.customerName
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header
          title="Order Status"
          subtitle="Loading your order information..."
          variant="secondary"
          size="lg"
          showDivider
        />

        <div className="max-w-2xl mx-auto mt-8">
          {/* No Order Found Message */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              No Order Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any order information. This might be because:
            </p>
            <ul className="text-left text-gray-600 mb-8 space-y-2 max-w-md mx-auto">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You haven't placed an order yet</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Your session has expired</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>There was an error loading your order</span>
              </li>
            </ul>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Browse Menu & Place Order
              </Link>
              <Link
                to="/cart"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Check Your Cart
              </Link>
            </div>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center text-gray-600">
            <p className="mb-2">Need help finding your order?</p>
            <p className="font-semibold text-gray-900">
              📞 (555) 123-FOOD | 📧 support@foodorder.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Extract order data safely
  const {
    totalAmount,
    orderType,
    customerName,
    contactNumber,
    deliveryAddress,
    status,
    createdAt,
    orderNumber
  } = order;

  return (
    <div className="container mx-auto px-4 py-8">
      <Header
        title="Order Confirmation"
        subtitle="Your order has been successfully placed!"
        variant="primary"
        size="lg"
        showDivider
      />

      {/* Success Message */}
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-800 text-center mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-green-700 text-center">
            Thank you for your order. We're preparing your delicious meal and it
            will be ready soon.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Order Details
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {/* Order Number & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Order Number
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {orderNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status
                </label>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 capitalize">
                  {status}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Customer Name
                </label>
                <p className="text-gray-900">{customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Contact Number
                </label>
                <p className="text-gray-900">{contactNumber}</p>
              </div>
            </div>

            {/* Order Type & Address */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Order Type
              </label>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    orderType === "delivery"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {orderType === "delivery" ? "🚚" : "🏃"} {orderType}
                </span>
              </div>
            </div>

            {/* Delivery Address (only show if delivery) */}
            {orderType === "delivery" && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Delivery Address
                </label>
                <p className="text-gray-900">{deliveryAddress}</p>
              </div>
            )}

            {/* Order Time */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Order Placed
              </label>
              <p className="text-gray-900">
                {new Date(createdAt).toLocaleString()}
              </p>
            </div>

            {/* Total Amount */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📱 Track Your Order
          </h3>
          <p className="text-blue-800 mb-4">
            We'll send you updates about your order status. Keep your phone
            nearby!
          </p>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Order confirmed and being prepared</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>
                {orderType === "delivery"
                  ? "Out for delivery"
                  : "Ready for pickup"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>Order completed</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-center transition-colors duration-200"
          >
            Order More Food
          </Link>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">Need help with your order? Contact us:</p>
          <p className="font-semibold text-gray-900">
            📞 (555) 123-FOOD | 📧 support@foodorder.com
          </p>
        </div>
      </div>
    </div>
  );
};
