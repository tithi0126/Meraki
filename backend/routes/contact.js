const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

// Handle contact form submission
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required'
            });
        }

        const contactMessage = await ContactMessage.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({ 
            success: true,
            message: 'Thank you for your message! We will get back to you soon.'
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to send message. Please try again.'
        });
    }
});

module.exports = router;
