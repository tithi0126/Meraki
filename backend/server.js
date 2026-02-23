const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize database connection
require('./config/db');

const app = express();
const PORT = process.env.PORT || 5005;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5006';

// CORS configuration
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'meraki-coffee-house-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for development (localhost)
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax' // Use 'lax' for development
    }
}));

// Make user and cart available to request object
app.use((req, res, next) => {
    // Helper to get user info
    req.user = req.session.user || null;
    req.cart = req.session.cart || [];
    next();
});

// Import routes
const authRoutes = require('./routes/auth.js');
const menuRoutes = require('./routes/menu.js');
const orderRoutes = require('./routes/order.js');
const reviewRoutes = require('./routes/review.js');
const adminRoutes = require('./routes/admin.js');
const contactRoutes = require('./routes/contact.js');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend API server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
});
