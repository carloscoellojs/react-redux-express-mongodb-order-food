const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartsSchema = new Schema({
    sessionId: { type: String },
    items: [
        {
            foodId: { type: Schema.Types.ObjectId, ref: 'foods', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
        },
    ],
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    totalPrice: { type: Number, required: true, min: 0, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Carts', CartsSchema);
