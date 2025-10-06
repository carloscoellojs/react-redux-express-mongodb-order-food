const Orders = require('../models/Orders.cjs');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const sessionId = req.headers["session-id"];
        // Generate unique order number
        const currentYear = new Date().getFullYear();
        const timestamp = Date.now();
        const uuid = uuidv4().split('-')[0].toUpperCase(); // Use first segment of UUID
        const orderNumber = `ORD-${currentYear}-${timestamp}-${uuid}`;
        
        const newOrder = new Orders({ 
            sessionId,
            orderNumber,
            ...req.body 
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;