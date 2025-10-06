const Foods = require('../models/Foods.cjs');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const foods = await Foods.find();
        res.status(200).json(foods);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const food = await Foods.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        res.status(200).json(food);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;
