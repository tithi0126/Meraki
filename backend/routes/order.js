const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { requireAuth } = require('../middleware/auth');

// Get cart summary for order placement
router.get('/cart-summary', requireAuth, (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cart.length === 0) {
        return res.status(400).json({ 
            success: false,
            message: 'Cart is empty'
        });
    }

    res.json({ 
        success: true,
        cart,
        total: total.toFixed(2)
    });
});

// Submit order
router.post('/submit', requireAuth, async (req, res) => {
    try {
        const { delivery_address, contact_number, payment_method, notes } = req.body;
        const cart = req.session.cart || [];

        // Validate required fields
        if (!delivery_address || !delivery_address.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Delivery address is required'
            });
        }

        if (!contact_number || !contact_number.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Contact number is required'
            });
        }

        if (!payment_method || !payment_method.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }

        if (cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validate cart items
        for (const item of cart) {
            if (!item.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid cart item: missing item ID'
                });
            }
            if (!item.name || !item.name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid cart item: missing item name'
                });
            }
            if (!item.price || isNaN(item.price) || item.price <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid cart item: invalid price'
                });
            }
            if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid cart item: invalid quantity'
                });
            }
        }

        const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);

        if (isNaN(total) || total <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order total'
            });
        }

        // Create order (without transaction for standalone MongoDB)
        const order = await Order.create({
            user_id: new mongoose.Types.ObjectId(req.session.user.id),
            total_amount: total,
            status: 'pending',
            delivery_address: delivery_address.trim(),
            contact_number: contact_number.trim(),
            payment_method: payment_method.trim(),
            notes: notes ? notes.trim() : undefined
        });

        const orderId = order._id;

        // Create order items
        const orderItems = cart.map(item => ({
            order_id: orderId,
            menu_item_id: new mongoose.Types.ObjectId(item.id),
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            item_name: item.name.trim()
        }));

        await OrderItem.insertMany(orderItems);

        // Clear cart only after successful order creation
        req.session.cart = [];

        res.status(201).json({ 
            success: true,
            message: 'Order placed successfully!',
            orderId: orderId.toString()
        });
    } catch (error) {
        console.error('Error placing order:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to place order. Please try again.';
        if (error.name === 'ValidationError') {
            errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
        } else if (error.name === 'CastError') {
            errorMessage = 'Invalid data format. Please try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        res.status(500).json({ 
            success: false,
            message: errorMessage
        });
    }
});

// View user's orders
router.get('/my-orders', requireAuth, async (req, res) => {
    try {
        const orders = await Order.find({ user_id: new mongoose.Types.ObjectId(req.session.user.id) })
            .sort({ createdAt: -1 })
            .lean();

        // Get order items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await OrderItem.find({ order_id: order._id })
                    .select('item_name quantity price')
                    .lean();
                return {
                    ...order,
                    id: order._id.toString(),
                    created_at: order.createdAt,
                    items: items.map(item => ({
                        name: item.item_name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };
            })
        );

        res.json({ 
            success: true,
            orders: ordersWithItems
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching orders',
            orders: []
        });
    }
});

// Get single order
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).lean();

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order or is admin
        if (order.user_id.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied'
            });
        }

        const items = await OrderItem.find({ order_id: order._id })
            .select('item_name quantity price')
            .lean();

        const orderData = {
            ...order,
            id: order._id.toString(),
            created_at: order.createdAt,
            items: items.map(item => ({
                name: item.item_name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        res.json({ 
            success: true,
            order: orderData
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching order'
        });
    }
});

module.exports = router;
