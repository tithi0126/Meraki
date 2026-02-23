import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { getMenu } from '../services/api';

export default function Menu() {
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        async function fetchMenu() {
            try {
                const data = await getMenu();
                if (data.success) {
                    setCategories(data.menuByCategory);
                    const cats = Object.keys(data.menuByCategory);
                    if (cats.length > 0) setActiveTab(cats[0]);
                }
            } catch (error) {
                console.error("Failed to fetch menu", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMenu();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-serif font-bold text-secondary-900 mb-4"
                >
                    Our Artfully Crafted <span className="text-primary-500 italic">Menu</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600 max-w-2xl mx-auto"
                >
                    Explore our selection of premium coffees, freshly baked pastries, and artisanal treats.
                </motion.p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : (
                <>
                    {/* Category Tabs */}
                    <div className="flex justify-center flex-wrap gap-4 mb-12">
                        {Object.keys(categories).map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeTab === category
                                        ? 'bg-secondary-900 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Menu Items Grid */}
                    <motion.div
                        key={activeTab}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {categories[activeTab]?.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group"
                            >
                                {item.image_url && (
                                    <div className="w-full h-48 rounded-xl overflow-hidden mb-4 relative bg-zinc-100">
                                        <img
                                            src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5007${item.image_url}`}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-serif font-bold text-secondary-900">{item.name}</h3>
                                    <span className="text-primary-600 font-bold bg-primary-500/10 px-3 py-1 rounded-full text-sm">
                                        ${parseFloat(item.price).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm flex-grow mb-6 line-clamp-3">
                                    {item.description || "A masterfully crafted Meraki special."}
                                </p>
                                <button className="w-full flex justify-center items-center gap-2 py-3 bg-zinc-50 hover:bg-primary-500 hover:text-white border border-gray-200 hover:border-transparent rounded-xl transition-all duration-300 font-medium text-secondary-900 group/btn">
                                    <Plus size={18} className="group-hover/btn:rotate-90 transition-transform" />
                                    Add to Cart
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                </>
            )}
        </div>
    );
}
