// routes/sell.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Sell = require('../models/Sell'); // Adjust the path if needed
const authenticateJWT = require('../middleware/authenticateJWT'); // Correct path
const mongoose = require('mongoose'); 

const router = express.Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder where images will be saved
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with timestamp
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

// Set up the multer middleware with storage and file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
    fileFilter: fileFilter
});

// Route to handle product listing with image upload
router.post('/uploads', authenticateJWT, upload.single('image'), async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        // Extract userId from JWT payload
        const userId = Number(req.user.id); // Adjust this if needed based on your JWT payload
        console.log('UserId from JWT:', userId);
        
        if (!userId) {
            return res.status(401).send('User not authenticated.');
        }

        // Convert userId to ObjectId
        // const objectIdUserId = mongoose.Types.ObjectId(userId); // Convert to ObjectId

        // Create a new Sell document with form data and image path
        const newSell = new Sell({
            userId: userId,
            name: req.body.name,
            email: req.body.email,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            auctionDate: req.body.auctionDate, 
            startTime: req.body.startTime,     
            endTime: req.body.endTime, 
            image: req.file.filename // Save only the filename
        });

        // Save the product to the database
        await newSell.save();

        res.send('Product listed successfully with the image!');
    } catch (error) {
        console.error('Error listing product:', error);
        res.status(500).send('An error occurred while listing the product.');
    }
});

module.exports = router;

