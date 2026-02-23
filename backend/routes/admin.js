const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Review = require('../models/Review');
const ContactMessage = require('../models/ContactMessage');
const { requireAdmin } = require('../middleware/auth');

// All admin routes require admin authentication
router.use(requireAdmin);

// Admin Dashboard - Get statistics
router.get('/dashboard', async (req, res) => {
    try {
        // Get statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const revenueResult = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalMenuItems = await MenuItem.countDocuments();
        const pendingReviews = await Review.countDocuments({ is_approved: false });
        const totalContactMessages = await ContactMessage.countDocuments();

        // Recent orders
        const recentOrders = await Order.find()
            .populate('user_id', 'name')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const formattedRecentOrders = recentOrders.map(order => ({
            ...order,
            id: order._id.toString(),
            customer_name: order.user_id?.name || 'Unknown',
            created_at: order.createdAt
        }));

        const stats = {
            totalOrders: totalOrders.toString(),
            pendingOrders: pendingOrders.toString(),
            totalRevenue: totalRevenue.toFixed(2),
            totalCustomers: totalCustomers.toString(),
            totalMenuItems: totalMenuItems.toString(),
            pendingReviews: pendingReviews.toString(),
            totalContactMessages: totalContactMessages.toString()
        };

        res.json({ 
            success: true,
            stats,
            recentOrders: formattedRecentOrders
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error loading dashboard'
        });
    }
});

// Menu Management - Get all menu items
router.get('/menu', async (req, res) => {
    try {
        const menuItems = await MenuItem.find()
            .sort({ category: 1, name: 1 })
            .lean();

        const formattedMenuItems = menuItems.map(item => ({
            ...item,
            id: item._id.toString()
        }));

        res.json({ 
            success: true,
            menuItems: formattedMenuItems
        });
    } catch (error) {
        console.error('Error loading menu:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error loading menu',
            menuItems: []
        });
    }
});

// Add menu item
router.post('/menu/add', async (req, res) => {
    try {
        const { name, category, price, description, image_url, is_available } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({ 
                success: false,
                message: 'Name, category, and price are required'
            });
        }

        const menuItem = await MenuItem.create({
            name,
            category,
            price: parseFloat(price),
            description,
            image_url: image_url || null,
            is_available: is_available !== undefined ? is_available : true
        });

        res.status(201).json({ 
            success: true,
            message: 'Menu item added successfully',
            menuItem: {
                ...menuItem.toObject(),
                id: menuItem._id.toString()
            }
        });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error adding menu item'
        });
    }
});

// Update menu item
router.put('/menu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, description, is_available, image_url } = req.body;

        const menuItem = await MenuItem.findByIdAndUpdate(id, {
            name,
            category,
            price: parseFloat(price),
            description,
            is_available: is_available !== undefined ? is_available : true,
            image_url: image_url || null
        }, { new: true });

        if (!menuItem) {
            return res.status(404).json({ 
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({ 
            success: true, 
            message: 'Menu item updated',
            menuItem: {
                ...menuItem.toObject(),
                id: menuItem._id.toString()
            }
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating menu item'
        });
    }
});

// Delete menu item
router.delete('/menu/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findByIdAndDelete(id);

        if (!menuItem) {
            return res.status(404).json({ 
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({ 
            success: true, 
            message: 'Menu item deleted'
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting menu item'
        });
    }
});

// Order Management - Get all orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user_id', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await OrderItem.find({ order_id: order._id })
                    .select('item_name quantity price')
                    .lean();
                return {
                    ...order,
                    id: order._id.toString(),
                    customer_name: order.user_id?.name || 'Unknown',
                    customer_email: order.user_id?.email || '',
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
        console.error('Error loading orders:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error loading orders',
            orders: []
        });
    }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ 
                success: false,
                message: 'Status is required'
            });
        }

        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found'
            });
        }

        res.json({ 
            success: true, 
            message: 'Order status updated',
            order: {
                ...order.toObject(),
                id: order._id.toString()
            }
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating order status'
        });
    }
});

// Review Management - Get all reviews
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user_id', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const formattedReviews = reviews.map(review => ({
            ...review,
            id: review._id.toString(),
            user_name: review.user_id?.name || 'Unknown',
            user_email: review.user_id?.email || '',
            created_at: review.createdAt
        }));

        res.json({ 
            success: true,
            reviews: formattedReviews
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error loading reviews',
            reviews: []
        });
    }
});

// Approve review
router.put('/reviews/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndUpdate(id, { is_approved: true }, { new: true });

        if (!review) {
            return res.status(404).json({ 
                success: false,
                message: 'Review not found'
            });
        }

        res.json({ 
            success: true, 
            message: 'Review approved',
            review: {
                ...review.toObject(),
                id: review._id.toString()
            }
        });
    } catch (error) {
        console.error('Error approving review:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error approving review'
        });
    }
});

// Delete review
router.delete('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return res.status(404).json({ 
                success: false,
                message: 'Review not found'
            });
        }

        res.json({ 
            success: true, 
            message: 'Review deleted'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting review'
        });
    }
});

// Get contact messages
router.get('/contact-messages', async (req, res) => {
    try {
        const messages = await ContactMessage.find()
            .sort({ createdAt: -1 })
            .lean();

        const formattedMessages = messages.map(msg => ({
            ...msg,
            id: msg._id.toString(),
            created_at: msg.createdAt
        }));

        res.json({ 
            success: true,
            messages: formattedMessages
        });
    } catch (error) {
        console.error('Error loading contact messages:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error loading contact messages',
            messages: []
        });
    }
});

// Reply to contact message
router.post('/contact-messages/:id/reply', requireAdmin, async (req, res) => {
    try {
        const messageId = req.params.id;
        const { to, subject, message } = req.body;

        // Find the original message
        const originalMessage = await ContactMessage.findById(messageId);

        if (!originalMessage) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        // For now, we'll prepare the email data for the frontend
        // In production, you would integrate with an email service like SendGrid, Mailgun, etc.

        const emailData = {
            to: to,
            subject: subject,
            body: message,
            originalMessage: {
                id: originalMessage._id.toString(),
                name: originalMessage.name,
                email: originalMessage.email,
                subject: originalMessage.subject,
                message: originalMessage.message
            }
        };

        // Log the reply attempt (in production, this would actually send the email)
        console.log('Reply prepared for message:', messageId);
        console.log('Email data:', emailData);

        res.json({
            success: true,
            message: 'Reply prepared successfully. Opening email client...',
            emailData: emailData,
            mailtoUrl: `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
        });
    } catch (error) {
        console.error('Error preparing reply:', error);
        res.status(500).json({
            success: false,
            message: 'Error preparing reply'
        });
    }
});

// Delete contact message
router.delete('/contact-messages/:id', requireAdmin, async (req, res) => {
    try {
        const messageId = req.params.id;

        const deletedMessage = await ContactMessage.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting contact message'
        });
    }
});

module.exports = router;
