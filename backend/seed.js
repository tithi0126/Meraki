require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const https = require('https');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');

// Connect to MongoDB
// Function to validate image URLs
const validateImageUrl = (url) => {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
            resolve(false);
        });
    });
};

// Create admin user
const createAdminUser = async () => {
    try {
        const adminEmail = 'admin@meraki.com';
        const adminPassword = 'admin123';
        const adminName = 'Admin User';

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin user
        const adminUser = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   Name: ${adminName}`);
        console.log('');
        console.log('🔐 Use these credentials to access the admin panel:');
        console.log(`   Visit: http://localhost:5006/admin/dashboard (after logging in)`);

    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meraki');
        console.log('MongoDB Connected for seeding');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sample menu items data with online images
const menuItems = [
    {
        name: 'Espresso',
        category: 'HOT COFFEE',
        price: 2.50,
        description: 'Rich and bold espresso shot',
        image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Cappuccino',
        category: 'HOT COFFEE',
        price: 3.50,
        description: 'Espresso with steamed milk and foam',
        image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Latte',
        category: 'HOT COFFEE',
        price: 4.00,
        description: 'Smooth espresso with steamed milk',
        image_url: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Iced Americano',
        category: 'ICED COFFEE',
        price: 3.00,
        description: 'Espresso shots over ice with water',
        image_url: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Iced Latte',
        category: 'ICED COFFEE',
        price: 4.50,
        description: 'Espresso with cold milk over ice',
        image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Caramel Macchiato',
        category: 'HOUSE SPECIALS',
        price: 5.00,
        description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle',
        image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Mocha',
        category: 'HOUSE SPECIALS',
        price: 4.75,
        description: 'Espresso with chocolate and steamed milk',
        image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=500&fit=crop&auto=format&q=80',
        is_available: true
    },
    {
        name: 'Pour Over',
        category: 'MANUAL BREW',
        price: 4.50,
        description: 'Handcrafted pour over coffee',
        image_url: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'French Press',
        category: 'MANUAL BREW',
        price: 4.00,
        description: 'Rich and full-bodied French press coffee',
        image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Chocolate Shake',
        category: 'SHAKES',
        price: 5.50,
        description: 'Creamy chocolate milkshake',
        image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Vanilla Shake',
        category: 'SHAKES',
        price: 5.50,
        description: 'Smooth vanilla milkshake',
        image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Hot Chocolate',
        category: 'HOT CHOCOLATE',
        price: 3.50,
        description: 'Rich and creamy hot chocolate',
        image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Green Tea',
        category: 'TEA',
        price: 2.50,
        description: 'Refreshing green tea',
        image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop',
        is_available: true
    },
    {
        name: 'Chai Latte',
        category: 'TEA',
        price: 4.00,
        description: 'Spiced tea with steamed milk',
        image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&h=500&fit=crop',
        is_available: true
    }
];

// Seed function
const seedMenu = async () => {
    try {
        await connectDB();

        // Create admin user first
        console.log('👤 Creating admin user...\n');
        await createAdminUser();

        console.log('🔍 Validating image URLs...\n');

        // Validate all image URLs
        for (const item of menuItems) {
            if (item.image_url) {
                const isValid = await validateImageUrl(item.image_url);
                const status = isValid ? '✅' : '❌';
                console.log(`${status} ${item.name}: ${isValid ? 'Image accessible' : 'Image not accessible'}`);
            }
        }

        console.log('\n');

        // Check if menu items already exist
        const existingCount = await MenuItem.countDocuments();

        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing menu items.`);
            console.log('Updating existing items with new data and images...\n');

            // Update or insert each menu item
            for (const item of menuItems) {
                await MenuItem.findOneAndUpdate(
                    { name: item.name },
                    {
                        name: item.name,
                        category: item.category,
                        price: item.price,
                        description: item.description,
                        image_url: item.image_url,
                        is_available: item.is_available
                    },
                    { upsert: true, new: true }
                );
            }

            console.log(`✅ Successfully updated ${menuItems.length} menu items with images!`);
        } else {
            // Insert menu items if none exist
            await MenuItem.insertMany(menuItems);
            console.log(`✅ Successfully seeded ${menuItems.length} menu items!`);
        }

        // Display all items
        const allItems = await MenuItem.find().sort({ category: 1, name: 1 });
        console.log('\n📋 Menu Items:');
        allItems.forEach(item => {
            const imageStatus = item.image_url ? '🖼️' : '❌';
            console.log(`  ${imageStatus} ${item.name} (${item.category}) - $${item.price}`);
        });

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n🔑 Admin Access:');
        console.log('   Email: admin@meraki.com');
        console.log('   Password: admin123');
        console.log('   Login URL: http://localhost:5006/login');
        console.log('   Admin Dashboard: http://localhost:5006/admin/dashboard');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding menu:', error);
        process.exit(1);
    }
};

// Test image URLs only (run without MongoDB)
const testImagesOnly = async () => {
    console.log('🖼️  Testing image URLs for Mocha...\n');

    const mochaImages = [
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&h=500&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1571928160095-325497436977?w=500&h=500&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=500&fit=crop&auto=format&q=80'
    ];

    for (const url of mochaImages) {
        const isValid = await validateImageUrl(url);
        const status = isValid ? '✅ WORKING' : '❌ FAILED';
        console.log(`${status}: ${url}`);
    }

    console.log('\n💡 Recommendation: Use the first working URL above for Mocha in seed.js');
};

// Run seed or test images only
if (process.argv[2] === '--test-images') {
    testImagesOnly();
} else {
    seedMenu();
}
