const express = require('express');
const router = express.Router();

// API endpoint to get session info
router.get('/', (req, res) => {
    if (req.session.userId) {
        res.json({
            success: true,
            session: {
                userId: req.session.userId,
                createdAt: req.session.createdAt,
                isFirstVisit: req.session.isFirstVisit || false
            }
        });
    } else {
        res.json({
            success: false,
            message: 'No session found'
        });
    }
});

// Initialize session for new users
router.post('/init', (req, res) => {
    // Check if session already exists
    if (!req.session.userId) {
        // Generate a unique session ID for new visitors
        req.session.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        req.session.createdAt = new Date().toISOString();
        req.session.isFirstVisit = true;
        
        console.log('New session created:', req.session.userId);
        
        // Save session and respond
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create session'
                });
            }
            
            res.json({
                success: true,
                message: 'Session created successfully',
                session: {
                    userId: req.session.userId,
                    createdAt: req.session.createdAt,
                    isFirstVisit: true
                }
            });
        });
    } else {
        // Update existing session
        req.session.isFirstVisit = false;
        console.log('Existing session:', req.session.userId);
        
        res.json({
            success: true,
            message: 'Session already exists',
            session: {
                userId: req.session.userId,
                createdAt: req.session.createdAt,
                isFirstVisit: false
            }
        });
    }
});

// Destroy session
router.delete('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to destroy session'
            });
        }
        
        res.json({
            success: true,
            message: 'Session destroyed successfully'
        });
    });
});

module.exports = router;