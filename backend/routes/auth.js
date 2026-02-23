const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Get current user
router.get('/me', (req, res) => {
    if (req.session.user) {
        return res.json({ 
            success: true, 
            user: req.session.user 
        });
    }
    res.json({ success: false, user: null });
});

// Login handler
router.post('/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please enter both email and password'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password'
            });
        }

        req.session.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Set longer session if "Remember Me" is checked
        if (rememberMe === 'on' || rememberMe === true) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }

        res.json({ 
            success: true, 
            message: `Welcome back, ${user.name}!`,
            user: req.session.user,
            redirect: user.role === 'admin' ? '/admin/dashboard' : '/'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'An error occurred. Please try again.'
        });
    }
});

// Register handler
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide valid information',
                errors: errors.array()
            });
        }

        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            role: 'customer'
        });

        res.status(201).json({ 
            success: true,
            message: 'Registration successful! Please login.',
            user: {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'An error occurred. Please try again.'
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                message: 'Error logging out'
            });
        }
        res.json({ 
            success: true,
            message: 'Logged out successfully'
        });
    });
});

module.exports = router;
