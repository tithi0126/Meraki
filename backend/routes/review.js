const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');

// Get all approved reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find({ is_approved: true })
            .populate('user_id', 'name')
            .sort({ createdAt: -1 })
            .lean();

        const formattedReviews = reviews.map(review => ({
            ...review,
            id: review._id.toString(),
            user_name: review.user_id?.name || 'Anonymous',
            created_at: review.createdAt
        }));

        res.json({ 
            success: true,
            reviews: formattedReviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching reviews',
            reviews: []
        });
    }
});

// Get featured reviews (for homepage)
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const reviews = await Review.find({ is_approved: true })
            .populate('user_id', 'name')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const formattedReviews = reviews.map(review => ({
            ...review,
            id: review._id.toString(),
            user_name: review.user_id?.name || 'Anonymous',
            created_at: review.createdAt
        }));

        res.json({ 
            success: true,
            reviews: formattedReviews
        });
    } catch (error) {
        console.error('Error fetching featured reviews:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching featured reviews',
            reviews: []
        });
    }
});

// Submit review
router.post('/submit', requireAuth, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ 
                success: false,
                message: 'Rating and comment are required'
            });
        }

        // Check if user already submitted a review
        const existing = await Review.findOne({ user_id: req.session.user.id });

        if (existing) {
            return res.status(400).json({ 
                success: false,
                message: 'You have already submitted a review'
            });
        }

        const review = await Review.create({
            user_id: req.session.user.id,
            rating: parseInt(rating),
            comment
        });

        res.status(201).json({ 
            success: true,
            message: 'Thank you for your review! It will be visible after admin approval.',
            review: {
                id: review._id.toString(),
                rating: review.rating,
                comment: review.comment
            }
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to submit review. Please try again.'
        });
    }
});

module.exports = router;
