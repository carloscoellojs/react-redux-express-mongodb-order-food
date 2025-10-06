const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrdersSchema = new Schema({
    sessionId: { type: String },
    orderNumber: { type: String, required: true, unique: true },
    cartId: { type: Schema.Types.ObjectId, ref: 'Carts', required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    orderType: { type: String, enum: ['pickup', 'delivery'], required: true },
    customerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    deliveryAddress: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Orders', OrdersSchema);