import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { getReviews } from '../services/api';

export default function Review() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const data = await getReviews();
                if (data.success) {
                    setReviews(data.reviews);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
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
                    Words from our <span className="text-primary-500 italic">Community</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600 max-w-2xl mx-auto"
                >
                    See what our beloved patrons have to say about their experiences at Meraki Coffee House.
                </motion.p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-medium">
                    No reviews available at the moment.
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20"
                >
                    {reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            variants={itemVariants}
                            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative group hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full"
                        >
                            <Quote className="absolute top-6 right-6 text-primary-500/10 group-hover:text-primary-500/20 transition-colors w-12 h-12" />

                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={i < review.rating ? "fill-accent-gold text-accent-gold" : "text-gray-200 fill-gray-200"}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-600 italic leading-relaxed flex-grow mb-8 relative z-10">
                                "{review.comment}"
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600 font-serif font-bold">
                                    {review.user_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-medium text-secondary-900">{review.user_name}</h4>
                                    <span className="text-xs text-gray-400">
                                        {new Date(review.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Review Submission CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 bg-secondary-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent" />
                <h2 className="text-3xl font-serif font-bold mb-4 relative z-10">Share Your Meraki Experience</h2>
                <p className="text-gray-300 max-w-xl mx-auto mb-8 relative z-10">Your feedback helps us perfect our craft and serve you better every day.</p>
                <button className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-medium transition-colors relative z-10 shadow-lg shadow-primary-500/20">
                    Leave a Review
                </button>
            </motion.div>
        </div>
    );
}
