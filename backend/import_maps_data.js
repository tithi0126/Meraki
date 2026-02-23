require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');
const Review = require('./models/Review');

const mapsData = {
    "menu": [
        {
            "category": "Bagels",
            "items": [
                { "name": "Classic Cream Cheese", "price": 250, "description": "Classic bagel with cream cheese" },
                { "name": "Onion-Garlic Cream Cheese", "price": 250, "description": "Bagel with onion and garlic flavored cream cheese" },
                { "name": "Cream Cheese L + T", "price": 250, "description": "Bagel with cream cheese, lettuce, and tomato" },
                { "name": "Pesto Cream Cheese L + T", "price": 280, "description": "Bagel with pesto cream cheese, lettuce, and tomato" }
            ]
        },
        {
            "category": "Croissants",
            "items": [
                { "name": "Butter Croissant", "price": 200, "description": "Flaky butter croissant" },
                { "name": "Almond Croissant", "price": 200, "description": "Croissant topped with almonds" },
                { "name": "Chocolate Croissant", "price": 260, "description": "Croissant filled with chocolate" }
            ]
        },
        {
            "category": "Cheesecake",
            "items": [
                { "name": "New York Cheesecake", "price": 240, "description": "Classic New York style cheesecake" },
                { "name": "Blueberry Cheesecake", "price": 260, "description": "Cheesecake with blueberry topping" },
                { "name": "Nutella Cheesecake", "price": 280, "description": "Cheesecake with Nutella" },
                { "name": "Biscoff Cheesecake", "price": 300, "description": "Cheesecake with Biscoff spread" }
            ]
        },
        {
            "category": "Espresso (Hot Coffee)",
            "items": [
                { "name": "Espresso Shot", "price": 160, "description": "Pure espresso shot" },
                { "name": "Long / Short Black", "price": 170, "description": "Black coffee" },
                { "name": "Macchiato", "price": 170, "description": "Espresso with a dollop of foam" },
                { "name": "Cappuccino", "price": 190, "description": "Classic cappuccino" },
                { "name": "Latte", "price": 190, "description": "Classic latte" },
                { "name": "Flat White", "price": 190, "description": "Smooth flat white" },
                { "name": "Cortado", "price": 190, "description": "Equal parts espresso and warm milk" },
                { "name": "Mocha", "price": 210, "description": "Espresso with chocolate and milk" }
            ]
        },
        {
            "category": "Iced Coffee",
            "items": [
                { "name": "Iced Espresso", "price": 170, "description": "Espresso over ice" },
                { "name": "Café Bombon", "price": 180, "description": "Espresso with sweetened condensed milk" },
                { "name": "Iced Latte", "price": 200, "description": "Chilled latte" },
                { "name": "Iced Cappuccino", "price": 200, "description": "Chilled cappuccino" },
                { "name": "Cold Brew", "price": 200, "description": "Slow-steeped cold coffee" },
                { "name": "Vietnamese Coffee", "price": 210, "description": "Vietnamese style iced coffee" },
                { "name": "Espresso Tonic", "price": 230, "description": "Espresso with tonic water" },
                { "name": "Cold Brew Tonic", "price": 230, "description": "Cold brew with tonic water" },
                { "name": "Iced Mocha Cortado", "price": 250, "description": "Iced mocha cortado" },
                { "name": "Barrel Aged Cold Brew", "price": 260, "description": "Special barrel aged cold brew" },
                { "name": "Barrel Aged Cold Brew Tonic", "price": 260, "description": "Barrel aged cold brew with tonic" }
            ]
        },
        {
            "category": "Food & Toasts",
            "items": [
                { "name": "Tomato Basil Mozzarella S/W", "price": 160, "description": "Tomato, basil, and mozzarella sandwich" },
                { "name": "Greek Pita S/W", "price": 210, "description": "Greek style pita sandwich" },
                { "name": "Forest Mushroom Melt S/W", "price": 210, "description": "Mushroom melt sandwich" },
                { "name": "Tandoori Paneer S/W", "price": 240, "description": "Tandoori paneer sandwich" },
                { "name": "Spicy Cream Cheese Sub", "price": 250, "description": "Sub with spicy cream cheese" },
                { "name": "Grinch Sourdough Open Toast", "price": 250, "description": "Open sourdough toast" },
                { "name": "Caesar Salad", "price": 270, "description": "Fresh Caesar salad" },
                { "name": "Farm Fresh Sourdough S/W", "price": 280, "description": "Sourdough sandwich" },
                { "name": "Red Alert Sourdough S/W", "price": 300, "description": "Spicy sourdough sandwich" },
                { "name": "Teriyaki Paneer S/W", "price": 300, "description": "Teriyaki paneer sandwich" },
                { "name": "Truffled Mushroom Open Toast", "price": 300, "description": "Premium truffle mushroom toast" }
            ]
        }
    ],
    "reviews": [
        {
            "user": "Shirish Parekh",
            "rating": 5,
            "comment": "One of the best coffee cafe in Surat"
        },
        {
            "user": "Milan Choksey",
            "rating": 5,
            "comment": "Everything is good but they haven't wifi. Seating is low and very comfortable. Atmosphere is good and beautiful location."
        },
        {
            "user": "Milan Choksey",
            "rating": 5,
            "comment": "Nice place for coffee. The interior is very minimalist and aesthetically pleasing. Recommended for quiet evenings."
        },
        {
            "user": "Pratik K. Bhatu",
            "rating": 5,
            "comment": "Excellent place for coffee lovers."
        },
        {
            "user": "Karishma Nishant Tibarewal",
            "rating": 5,
            "comment": "Best coffee in Surat yes, we can definitely say that. The coffee here is amazing, and the food is equally good. They serve consistently lovely coffee and very good food."
        },
        {
            "user": "nadeem qureshi",
            "rating": 5,
            "comment": "Nice!"
        }
    ]
};

async function importData() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meraki';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // 1. Import Menu Items
        console.log('Importing Menu Items...');
        for (const category of mapsData.menu) {
            for (const item of category.items) {
                await MenuItem.findOneAndUpdate(
                    { name: item.name },
                    {
                        name: item.name,
                        category: category.category,
                        price: item.price,
                        description: item.description,
                        is_available: true
                    },
                    { upsert: true, new: true }
                );
            }
        }
        console.log('✅ Menu Items imported successfully.');

        // 2. Import Reviews
        console.log('Importing Reviews...');
        const hashedPassword = await bcrypt.hash('reviewer123', 10);

        for (const reviewData of mapsData.reviews) {
            // Find or create user
            let user = await User.findOne({ email: reviewData.user.toLowerCase().replace(/\s/g, '.') + '@maps.reviewer' });

            if (!user) {
                user = await User.create({
                    name: reviewData.user,
                    email: reviewData.user.toLowerCase().replace(/\s/g, '.') + '@maps.reviewer',
                    password: hashedPassword,
                    role: 'customer'
                });
            }

            // Create review if not already exists (basic check on comment)
            const existingReview = await Review.findOne({ user_id: user._id, comment: reviewData.comment });

            if (!existingReview) {
                await Review.create({
                    user_id: user._id,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    is_approved: true // Auto-approved for imported data
                });
            }
        }
        console.log('✅ Reviews imported successfully.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing data:', error);
        process.exit(1);
    }
}

importData();
