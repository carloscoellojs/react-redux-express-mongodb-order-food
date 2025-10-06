const mongoose = require('mongoose');
const { Schema } = mongoose;

const FoodsSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    ingredients: { type: [String], required: true },
    calories: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5 },
    preparationTime: { type: String, required: true },
});

module.exports = mongoose.model('Foods', FoodsSchema);
