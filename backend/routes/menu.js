const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all menu items
router.get('/', async (req, res) => {
    try {
        const filter = { is_available: true };
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const menuItems = await MenuItem.find(filter)
            .sort({ category: 1, name: 1 })
            .lean();

        // Group by category and convert _id to id
        const menuByCategory = {};
        menuItems.forEach(item => {
            if (!menuByCategory[item.category]) {
                menuByCategory[item.category] = [];
            }
            const itemObj = { ...item };
            itemObj.id = itemObj._id.toString();
            delete itemObj._id;
            menuByCategory[item.category].push(itemObj);
        });

        res.json({ 
            success: true, 
            menuByCategory 
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching menu',
            menuByCategory: {}
        });
    }
});

// Get featured menu items
router.get('/featured', async (req, res) => {
    try {
        const allItems = await MenuItem.find({ is_available: true }).lean();
        const featuredItems = allItems
            .sort(() => 0.5 - Math.random())
            .slice(0, 6)
            .map(item => ({
                ...item,
                id: item._id.toString()
            }));

        res.json({ 
            success: true, 
            featuredItems 
        });
    } catch (error) {
        console.error('Error fetching featured items:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching featured items',
            featuredItems: []
        });
    }
});

// Get single menu item
router.get('/:id', async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id).lean();
        
        if (!item) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found' 
            });
        }

        const itemObj = { ...item };
        itemObj.id = itemObj._id.toString();
        delete itemObj._id;

        res.json({ 
            success: true, 
            item: itemObj 
        });
    } catch (error) {
        console.error('Error fetching menu item:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching menu item' 
        });
    }
});

// Add to cart
router.post('/add-to-cart', async (req, res) => {
    try {
        console.log('Add to cart request:', req.body);
        const { itemId, quantity } = req.body;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: 'Item ID is required'
            });
        }

        if (!quantity || parseInt(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }

        const item = await MenuItem.findById(itemId);

        if (!item) {
            console.log('Item not found:', itemId);
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        if (!item.is_available) {
            return res.status(400).json({
                success: false,
                message: 'Item is not available'
            });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Check if item already in cart
        const existingItemIndex = req.session.cart.findIndex(cartItem => cartItem.id == itemId);

        if (existingItemIndex > -1) {
            req.session.cart[existingItemIndex].quantity += parseInt(quantity);
        } else {
            req.session.cart.push({
                id: item._id.toString(),
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(quantity),
                category: item.category
            });
        }

        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);

        console.log('Cart updated successfully. Cart count:', cartCount);
        res.json({
            success: true,
            message: 'Added to cart',
            cartCount: cartCount,
            cart: req.session.cart
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to cart: ' + error.message
        });
    }
});

// Get cart
router.get('/cart/items', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({ 
        success: true,
        cart,
        total: total.toFixed(2),
        cartCount
    });
});

// Update cart item
router.post('/update-cart', (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        if (!req.session.cart) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cart is empty' 
            });
        }

        const itemIndex = req.session.cart.findIndex(item => item.id == itemId);

        if (itemIndex > -1) {
            if (parseInt(quantity) <= 0) {
                req.session.cart.splice(itemIndex, 1);
            } else {
                req.session.cart[itemIndex].quantity = parseInt(quantity);
            }
        }

        const total = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);

        res.json({ 
            success: true,
            total: total.toFixed(2),
            cartCount: cartCount,
            cart: req.session.cart
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating cart' 
        });
    }
});

// Remove from cart
router.post('/remove-from-cart', (req, res) => {
    try {
        const { itemId } = req.body;

        if (!req.session.cart) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cart is empty' 
            });
        }

        req.session.cart = req.session.cart.filter(item => item.id != itemId);

        const total = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);

        res.json({ 
            success: true,
            total: total.toFixed(2),
            cartCount: cartCount,
            cart: req.session.cart
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error removing from cart' 
        });
    }
});

// Clear cart
router.post('/clear-cart', (req, res) => {
    req.session.cart = [];
    res.json({ 
        success: true,
        message: 'Cart cleared'
    });
});

module.exports = router;
