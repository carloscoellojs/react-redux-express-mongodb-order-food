const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 2000;
const cors = require('cors');

const mongodb_password = encodeURIComponent(process.env.MONGODB_PASSWORD);

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${mongodb_password}@${process.env.SERVERLESS_INSTANCE}`
);

app.use(cors({ // IGNORE
    origin: process.env.CORS_ORIGIN,
    credentials: true // Allow cookies to be sent
})); // IGNORE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // In production, use environment variable
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.static(path.join(__dirname, '/dist')));

const FoodsController = require('./controllers/FoodsController.cjs');
app.use('/api/v1/foods', FoodsController);

const CartsController = require('./controllers/CartsController.cjs');
app.use('/api/v1/carts', CartsController);

const OrdersController = require('./controllers/OrdersController.cjs');
app.use('/api/v1/orders', OrdersController);

const SessionController = require('./controllers/SessionController.cjs');
app.use('/api/v1/session', SessionController);

// Catch-all handler for client-side routing
app.use((req, res, next) => {
    // If the request is for an API route that doesn't exist, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    // Otherwise, serve the React app
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

