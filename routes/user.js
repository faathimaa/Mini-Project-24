///routes/user.js
const express = require('express')
const { getMain, getAuctions, getSell, getLogin, getContact, getSignup, signup, login, logout, subscribe, sell, getBidPage, bid } = require('../controllers/user')
const { isLoggedin, loginTest } = require('../middleware/user')
const router = express.Router()
const upload = require('../middleware/upload'); // Import the Multer middleware
const Auction = require('../models/Auction');


// Home page route
router.get('/', loginTest, async (req, res) => {
    try {
        const items = await Auction.find({})
            .sort({ endTime: -1 })
            .limit(20);

        res.render('main', { 
            items, 
            sub: '',
            isAdmin: req.user && req.user.role === 'admin'
        });
    } catch (error) {
        console.error('Error fetching auctions:', error);
        res.status(500).send('An error occurred while fetching auctions');
    }
});


router.get('/auctions', loginTest, async (req, res) => {
    try {
        const items = await Auction.find({
            status: { $in: ['completed', 'ongoing', 'pending'] }
        }).sort({ endTime: -1 }).limit(20);

        res.render('auctions', { 
            items, 
            sub: '',
            isAdmin: req.user && req.user.role === 'admin'
        });
    } catch (error) {
        console.error('Error fetching auctions:', error);
        res.status(500).send('An error occurred while fetching auctions');
    }
});

router
    .route('/sell')
    .get(isLoggedin,loginTest,getSell)
    .post(isLoggedin,upload.single('image'),sell)

router
    .route('/login')
    .get(loginTest,getLogin)
    .post(login)

router
    .route('/signup')
    .get(loginTest,getSignup)
    .post(signup)

router
    .route('/contact')
    .get(loginTest,getContact)

router
    .route('/logout')
    .get(logout)

router
    .route('/subscribe')
    .post(subscribe)

router
    .route('/bid/:id')
    .get(isLoggedin, getBidPage) // Fetch and render the bid page
    .post(isLoggedin, bid); // Handle the bid placement

module.exports = router
