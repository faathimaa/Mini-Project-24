//routes/admin.js
const express = require('express')
const { isLoggedin, loginTest } = require('../middleware/user')
const {  getSells, getSubscriptions, getAdd, addItem,viewAuctionBids,
    getOngoings, getPrevious, changeActive, approveAuction,
    getBidPage, bid, handleContactMessage  } = require('../controllers/admin')
const router = express.Router();
const Contact = require('../models/Contact');
const Auction = require('../models/Auction');

console.log({ 
    getSells, getSubscriptions, getAdd, addItem, getOngoings, 
    getPrevious, viewAuctionBids, changeActive, approveAuction, 
    getBidPage, bid, handleContactMessage 
});

router
    .route('/login')
    .get((req,res)=>{
        res.render('admin/login')
    })

router
    .route('/')
    .get((req,res)=>{
        res.redirect('/admin/ongoing')
    })

router
    .route('/sell-requests')
    .get(isLoggedin,getSells)

router
    .route('/subscriptions')
    .get(isLoggedin,getSubscriptions)

router
    .route('/add')
    .get(isLoggedin,getAdd)
    .post(isLoggedin,addItem)

router
    .route('/ongoing')
    .get(isLoggedin,getOngoings)

router
    .route('/previous')
    .get(async (req, res) => {
        try {
            const completedAuctions = await Auction.find({ status: 'completed' })
                .sort({ endTime: -1 }) // Sort by end time, most recent first
                .limit(20); // Limit to 20 items, adjust as needed

            res.render('admin/previous', { items: completedAuctions });
        } catch (error) {
            console.error('Error fetching completed auctions:', error);
            res.status(500).send('An error occurred while fetching completed auctions');
        }
    })

router
    .route('/view/:id')
    .get(isLoggedin, viewAuctionBids); 

router.all('/delete/:id', async (req, res) => {
    try {
        const auctionId = req.params.id;
        const auction = await Auction.findById(auctionId);
        
        if (!auction) {
            return res.status(404).send('Auction not found');
        }
        
        auction.active = false;
        auction.status = 'completed';
        await auction.save();
        
        res.redirect('/admin/previous'); // or wherever you want to redirect after stopping the auction
    } catch (error) {
        console.error('Error stopping auction:', error);
        res.status(500).send('An error occurred while stopping the auction');
    }
});

router
    .route('/accept/:id')
    .post(isLoggedin,changeActive); // Handles accepting the product

router
    .route('/auctions/approve/:id')
    .post(isLoggedin,approveAuction);  
router
    .route('/bid/:id')
    .get(isLoggedin, loginTest, getBidPage) // GET for displaying the bid page
    .post(isLoggedin, bid); // POST for submitting the bid   

// Route to view contact messages
router
    .route('/contact')
    .get(isLoggedin,async (req, res) => {
         // Fetch contact messages from the database
         try {
            const messages = await Contact.find().sort({ createdAt: -1 }); // Fetching messages
            res.render('admin/contact', { messages, status: req.query.status }); // Render the contact view
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            res.status(500).send('Server Error');
        }
    });    
router
    .route('/contact/submit')
    .post(isLoggedin,handleContactMessage);    
module.exports = router
