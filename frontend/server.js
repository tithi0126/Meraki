const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
// Force restart: Step 492
const PORT = process.env.PORT || 5006;
const API_URL = process.env.API_URL || 'http://localhost:5005/api';

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Make API URL available to all views
app.use((req, res, next) => {
    res.locals.API_URL = API_URL;
    res.locals.path = req.path; // Make current path available to all views
    // Initialize user and cart as null for frontend - will be handled by JavaScript
    res.locals.user = null;
    res.locals.cart = [];
    res.locals.cartCount = 0;
    res.locals.loginMessage = null;
    next();
});

// Helper function to fetch from API with session cookies
async function fetchFromAPI(endpoint, req = null, method = 'GET', body = null) {
    try {
        // Use built-in fetch (Node 18+) or fallback
        let fetchFn = globalThis.fetch;
        if (!fetchFn) {
            const nodeFetch = await import('node-fetch');
            fetchFn = nodeFetch.default;
        }

        const headers = {
            'Content-Type': 'application/json'
        };
        // If we have a request object, include its cookies
        if (req && req.headers.cookie) {
            headers['Cookie'] = req.headers.cookie;
        }

        const fetchOptions = {
            method: method,
            headers: headers,
            credentials: 'include'
        };

        if (body && (method === 'POST' || method === 'PUT')) {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetchFn(`${API_URL}${endpoint}`, fetchOptions);

        if (response.ok) {
            return await response.json();
        }
        console.error(`API request failed: ${response.status} ${response.statusText}`);
        return null;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

// Routes - render EJS views
app.get('/', async (req, res) => {
    try {
        // Fetch featured items and reviews from API
        const [menuData, reviewData] = await Promise.all([
            fetchFromAPI('/menu/featured'),
            fetchFromAPI('/review/featured?limit=3')
        ]);

        // Comprehensive list of default coffee items
        const defaultItems = [
            { id: 'def1', name: 'Espresso', category: 'HOT COFFEE', price: 2.50, description: 'Rich and bold espresso shot', image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&h=500&fit=crop' },
            { id: 'def2', name: 'Cappuccino', category: 'HOT COFFEE', price: 3.50, description: 'Espresso with steamed milk and foam', image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&h=500&fit=crop' },
            { id: 'def3', name: 'Latte', category: 'HOT COFFEE', price: 4.00, description: 'Smooth espresso with steamed milk', image_url: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=500&h=500&fit=crop' },
            { id: 'def4', name: 'Iced Americano', category: 'ICED COFFEE', price: 3.00, description: 'Espresso shots over ice with water', image_url: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&h=500&fit=crop' },
            { id: 'def5', name: 'Iced Latte', category: 'ICED COFFEE', price: 4.50, description: 'Espresso with cold milk over ice', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=500&fit=crop' },
            { id: 'def6', name: 'Caramel Macchiato', category: 'HOUSE SPECIALS', price: 5.00, description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle', image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=500&fit=crop' },
            { id: 'def7', name: 'Mocha', category: 'HOUSE SPECIALS', price: 4.75, description: 'Espresso with chocolate and steamed milk', image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=500&fit=crop&auto=format&q=80' },
            { id: 'def8', name: 'Hot Chocolate', category: 'HOT CHOCOLATE', price: 3.50, description: 'Rich and creamy hot chocolate', image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop' }
        ];

        // Help grouping for Menu page fallback
        const defaultMenuByCategory = {};
        defaultItems.forEach(item => {
            if (!defaultMenuByCategory[item.category]) {
                defaultMenuByCategory[item.category] = [];
            }
            defaultMenuByCategory[item.category].push(item);
        });

        const featuredItems = menuData?.featuredItems && menuData.featuredItems.length > 0 
            ? menuData.featuredItems 
            : defaultItems.slice(0, 6); // Just show first 6 on home page
            
        const reviews = reviewData?.reviews || [];

        res.render('index', {
            featuredItems,
            reviews,
            isMenuComingSoon: !menuData?.featuredItems || menuData.featuredItems.length === 0
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.render('index', {
            featuredItems: [],
            reviews: []
        });
    }
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact', { success: null, error: null });
});

// Handle contact form submission
app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Submit to API
        const response = await fetchFromAPI('/contact', req, 'POST', {
            name,
            email,
            subject,
            message
        });

        if (response && response.success) {
            res.render('contact', {
                success: response.message || 'Thank you for your message! We will get back to you soon.',
                error: null
            });
        } else {
            res.render('contact', {
                success: null,
                error: response?.message || 'Failed to send message. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.render('contact', {
            success: null,
            error: 'Unable to send message. Please try again later.'
        });
    }
});

app.get('/menu', async (req, res) => {
    try {
        const category = req.query.category;
        const endpoint = category ? `/menu?category=${encodeURIComponent(category)}` : '/menu';
        const data = await fetchFromAPI(endpoint);
        
        // Comprehensive list of default coffee items
        const defaultItems = [
            { id: 'def1', name: 'Espresso', category: 'HOT COFFEE', price: 2.50, description: 'Rich and bold espresso shot', image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&h=500&fit=crop' },
            { id: 'def2', name: 'Cappuccino', category: 'HOT COFFEE', price: 3.50, description: 'Espresso with steamed milk and foam', image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&h=500&fit=crop' },
            { id: 'def3', name: 'Latte', category: 'HOT COFFEE', price: 4.00, description: 'Smooth espresso with steamed milk', image_url: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=500&h=500&fit=crop' },
            { id: 'def4', name: 'Iced Americano', category: 'ICED COFFEE', price: 3.00, description: 'Espresso shots over ice with water', image_url: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&h=500&fit=crop' },
            { id: 'def5', name: 'Iced Latte', category: 'ICED COFFEE', price: 4.50, description: 'Espresso with cold milk over ice', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=500&fit=crop' },
            { id: 'def6', name: 'Caramel Macchiato', category: 'HOUSE SPECIALS', price: 5.00, description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle', image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=500&fit=crop' },
            { id: 'def7', name: 'Mocha', category: 'HOUSE SPECIALS', price: 4.75, description: 'Espresso with chocolate and steamed milk', image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=500&fit=crop&auto=format&q=80' },
            { id: 'def8', name: 'Hot Chocolate', category: 'HOT CHOCOLATE', price: 3.50, description: 'Rich and creamy hot chocolate', image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop' }
        ];

        // Help grouping for Menu page fallback
        const defaultMenuByCategory = {};
        defaultItems.forEach(item => {
            if (!defaultMenuByCategory[item.category]) {
                defaultMenuByCategory[item.category] = [];
            }
            defaultMenuByCategory[item.category].push(item);
        });

        const menuByCategory = data?.menuByCategory && Object.keys(data.menuByCategory).length > 0 
            ? data.menuByCategory 
            : defaultMenuByCategory;

        res.render('menu', { 
            menuByCategory,
            isMenuComingSoon: !data?.menuByCategory || Object.keys(data.menuByCategory).length === 0
        });
    } catch (error) {
        console.error('Error loading menu:', error);
        res.render('menu', { menuByCategory: {}, isMenuComingSoon: true });
    }
});

app.get('/cart', async (req, res) => {
    try {
        console.log('Fetching cart data from API...');
        const [cartData, userData] = await Promise.all([
            fetchFromAPI('/menu/cart/items', req),
            fetchFromAPI('/auth/me', req)
        ]);
        console.log('Cart API response:', cartData);
        console.log('User API response:', userData);

        const cart = cartData?.cart || [];
        const total = parseFloat(cartData?.total || 0);
        const user = userData?.success && userData?.user ? userData.user : null;

        console.log('Rendering cart with', cart.length, 'items, total:', total);
        res.render('cart', { cart, total, user });
    } catch (error) {
        console.error('Error loading cart:', error);
        res.render('cart', { cart: [], total: 0, user: null });
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Handle login form submission
app.post('/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.render('login', {
                error: 'Please enter both email and password'
            });
        }

        // Call backend API
        const response = await fetchFromAPI('/auth/login', req, 'POST', {
            email: email.toLowerCase(),
            password,
            rememberMe: rememberMe === 'on'
        });

        if (response && response.success) {
            // Set user session data
            req.session.user = response.user;
            const redirectUrl = response.redirect || req.query.redirect || '/';
            return res.redirect(redirectUrl + '?message=' + encodeURIComponent(response.message));
        } else {
            return res.render('login', {
                error: response?.message || 'Login failed. Please try again.'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.render('login', {
            error: 'An error occurred. Please try again.'
        });
    }
});

app.get('/register', (req, res) => {
    res.render('register', { error: null, success: null });
});

// Handle register form submission
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.render('register', {
                error: 'Please fill in all required fields',
                success: null
            });
        }

        if (password.length < 6) {
            return res.render('register', {
                error: 'Password must be at least 6 characters long',
                success: null
            });
        }

        // Call backend API
        const response = await fetchFromAPI('/auth/register', null, 'POST', {
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            phone: phone ? phone.trim() : ''
        });

        if (response && response.success) {
            return res.render('register', {
                error: null,
                success: response.message || 'Registration successful! Please login.'
            });
        } else {
            return res.render('register', {
                error: response?.message || 'Registration failed. Please try again.',
                success: null
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        return res.render('register', {
            error: 'An error occurred. Please try again.',
            success: null
        });
    }
});

app.get('/place-order', async (req, res) => {
    try {
        // Check if user is authenticated
        const userData = await fetchFromAPI('/auth/me', req);
        if (!userData?.success || !userData?.user) {
            return res.redirect('/login?redirect=/place-order');
        }

        console.log('Fetching cart data for place-order...');
        const data = await fetchFromAPI('/menu/cart/items', req);
        console.log('Place-order cart API response:', data);

        const cart = data?.cart || [];
        const total = parseFloat(data?.total || 0);

        if (cart.length === 0) {
            return res.redirect('/cart');
        }

        console.log('Rendering place-order with', cart.length, 'items, total:', total);
        res.render('place-order', { cart, total, success: null, error: null });
    } catch (error) {
        console.error('Error loading place-order:', error);
        res.redirect('/cart');
    }
});

app.get('/my-orders', async (req, res) => {
    try {
        // Check if user is authenticated
        const userData = await fetchFromAPI('/auth/me', req);
        if (!userData?.success || !userData?.user) {
            return res.redirect('/login?redirect=/my-orders');
        }

        // Fetch user's orders from API
        const ordersData = await fetchFromAPI('/order/my-orders', req);
        const orders = ordersData?.success ? (ordersData.orders || []) : [];

        // Get message from URL parameters if present
        const message = req.query.message ? decodeURIComponent(req.query.message) : null;

        res.render('my-orders', { orders, message });
    } catch (error) {
        console.error('Error loading my-orders:', error);
        res.render('my-orders', { orders: [], message: null });
    }
});

app.get('/review', async (req, res) => {
    try {
        const [reviewData, userData] = await Promise.all([
            fetchFromAPI('/review', req),
            fetchFromAPI('/auth/me', req)
        ]);

        // Handle review data - check both success flag and reviews array
        let reviews = [];
        if (reviewData) {
            if (reviewData.success && Array.isArray(reviewData.reviews)) {
                reviews = reviewData.reviews;
            } else if (Array.isArray(reviewData.reviews)) {
                reviews = reviewData.reviews;
            } else if (Array.isArray(reviewData)) {
                reviews = reviewData;
            }
        }

        const user = userData?.success && userData?.user ? userData.user : null;

        // Log for debugging
        if (reviewData) {
            console.log(`Review API response:`, {
                success: reviewData.success,
                hasReviews: !!reviewData.reviews,
                reviewCount: Array.isArray(reviewData.reviews) ? reviewData.reviews.length : 0
            });
        } else {
            console.log('Review API returned null or undefined');
        }
        console.log(`Rendering review page with ${reviews.length} reviews`);

        res.render('review', {
            reviews,
            user,
            error: null,
            success: null
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        res.render('review', {
            reviews: [],
            user: null,
            error: 'Unable to load reviews. Please try again later.',
            success: null
        });
    }
});

// Admin routes
app.get('/admin/dashboard', async (req, res) => {
    try {
        // Check if user is authenticated and is admin
        const userData = await fetchFromAPI('/auth/me', req);
        if (!userData?.success || !userData?.user) {
            return res.redirect('/login?redirect=/admin/dashboard');
        }

        if (userData.user.role !== 'admin') {
            return res.status(403).send('Access denied. Admin only.');
        }

        // Fetch dashboard data from backend API with session cookies
        const dashboardData = await fetchFromAPI('/admin/dashboard', req);

        if (dashboardData && dashboardData.success) {
            res.render('admin/dashboard', {
                stats: dashboardData.stats,
                recentOrders: dashboardData.recentOrders || []
            });
        } else {
            // Render with empty data if API fails
            console.error('Failed to fetch dashboard data:', dashboardData);
            res.render('admin/dashboard', {
                stats: {
                    totalOrders: '0',
                    pendingOrders: '0',
                    totalRevenue: '0.00',
                    totalCustomers: '0',
                    totalMenuItems: '0',
                    pendingReviews: '0',
                    totalContactMessages: '0'
                },
                recentOrders: []
            });
        }
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        // Render with empty data on error
        res.render('admin/dashboard', {
            stats: {
                totalOrders: '0',
                pendingOrders: '0',
                totalRevenue: '0.00',
                totalCustomers: '0',
                totalMenuItems: '0',
                pendingReviews: '0'
            },
            recentOrders: []
        });
    }
});

app.get('/admin/menu', async (req, res) => {
    try {
        // Check if user is authenticated and is admin
        const userData = await fetchFromAPI('/auth/me', req);
        if (!userData?.success || !userData?.user) {
            return res.redirect('/login?redirect=/admin/menu');
        }

        if (userData.user.role !== 'admin') {
            return res.status(403).send('Access denied. Admin only.');
        }

        const menuData = await fetchFromAPI('/admin/menu', req);
        if (menuData && menuData.success) {
            res.render('admin/menu-management', {
                menuItems: menuData.menuItems || [],
                success: null,
                error: null
            });
        } else {
            res.render('admin/menu-management', {
                menuItems: [],
                success: null,
                error: 'Failed to load menu items'
            });
        }
    } catch (error) {
        console.error('Error fetching admin menu:', error);
        res.render('admin/menu-management', {
            menuItems: [],
            success: null,
            error: 'Error loading menu data'
        });
    }
});

app.get('/admin/orders', async (req, res) => {
    try {
        // Check if user is authenticated and is admin
        const userData = await fetchFromAPI('/auth/me', req);
        if (!userData?.success || !userData?.user) {
            return res.redirect('/login?redirect=/admin/orders');
        }

        if (userData.user.role !== 'admin') {
            return res.status(403).send('Access denied. Admin only.');
        }

        const ordersData = await fetchFromAPI('/admin/orders', req);
        if (ordersData && ordersData.success) {
            res.render('admin/orders', {
                orders: ordersData.orders || []
            });
        } else {
            res.render('admin/orders', {
                orders: []
            });
        }
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        res.render('admin/orders', {
            orders: []
        });
    }
});

app.get('/admin/reviews', async (req, res) => {
    try {
        // Check if user is authenticated and is admin
        const userData = await fetchFromAPI('/auth/me', req);
        if (!userData?.success || !userData?.user) {
            return res.redirect('/login?redirect=/admin/reviews');
        }

        if (userData.user.role !== 'admin') {
            return res.status(403).send('Access denied. Admin only.');
        }

        const reviewsData = await fetchFromAPI('/admin/reviews', req);
        if (reviewsData && reviewsData.success) {
            res.render('admin/reviews', {
                reviews: reviewsData.reviews || []
            });
        } else {
            res.render('admin/reviews', {
                reviews: []
            });
        }
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        res.render('admin/reviews', {
            reviews: []
        });
    }
});

app.get('/admin/contact-messages', async (req, res) => {
    try {
        // Check if user is authenticated and is admin
        const userData = await fetchFromAPI('/auth/me', req);
        if (!userData?.success || !userData?.user) {
            return res.redirect('/login?redirect=/admin/contact-messages');
        }

        if (userData.user.role !== 'admin') {
            return res.status(403).send('Access denied. Admin only.');
        }

        const messagesData = await fetchFromAPI('/admin/contact-messages', req);
        if (messagesData && messagesData.success) {
            res.render('admin/contact-messages', {
                messages: messagesData.messages || [],
                success: null,
                error: null
            });
        } else {
            res.render('admin/contact-messages', {
                messages: [],
                success: null,
                error: 'Failed to load contact messages'
            });
        }
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.render('admin/contact-messages', {
            messages: [],
            success: null,
            error: 'Error loading contact messages'
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { url: req.url });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`<pre>${err.stack}</pre>`);
});

app.listen(PORT, 'localhost', () => {
    console.log(`Frontend server is running on http://localhost:${PORT}`);
    console.log(`API URL: ${API_URL}`);
});
