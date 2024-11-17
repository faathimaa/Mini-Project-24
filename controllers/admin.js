///controllers/admin.js
let Sub = require('../models/Subscription');
let Sell = require('../models/Sell');
let Auction = require('../models/Auction'); 
const Contact = require('../models/Contact'); // Ensure this path is correct
const mongoose = require('mongoose');


// Display all sell requests
exports.getSells = async (req, res) => {
    let sells = await Sell.find().sort({ _id: -1 });
    console.log(sells);
    return res.render('admin/sell', { sells });
};

// Display all subscriptions
exports.getSubscriptions = async (req, res) => {
    let subs = await Sub.find().sort({ _id: -1 });
    return res.render('admin/subscription', { subs });
};

// Render add auction page
exports.getAdd = (req, res) => {
    return res.render('admin/add');
};

// Add a new auction item
exports.addItem = async (req, res) => {
    console.log(req.body);

    await Auction.create({
        id: `${Date.now()}`,
        name: req.body.name,
        photo: req.body.photo,
        text: req.body.text,
        active: true,
        highest: {
            amount: 0,
            userid: 'admin',
            username: 'admin'
        }
    });

    return res.redirect('/admin/ongoing');
};

// Display ongoing auctions
exports.getOngoings = async (req, res) => {
    let auctions = await Auction.find({ active: true }).sort({ _id: -1 });
    return res.render('admin/ongoing', { auctions });
};

// Display previous auctions
exports.getPrevious = async (req, res) => {
    let auctions = await Auction.find({ active: false }).sort({ _id: -1 });
    return res.render('admin/previous', { auctions });
};

// Approve auction item
exports.approveAuction = async (req, res) => {
    try {
        let auction = await Auction.findById(req.params.id);
        if (!auction) {
            return res.status(404).send('Auction item not found.');
        }

        auction.active = true;
        await auction.save();

        return res.redirect('/admin/ongoing');
    } catch (error) {
        console.error('Error approving auction item:', error);
        res.status(500).send('An error occurred while approving the auction item.');
    }
};

// Accept sell request and change its status
exports.changeActive = async (req, res) => {
    try {
        // Find the sell request by ID
        let sellRequest = await Sell.findById(req.params.id);
        console.log('Sell request found:', sellRequest);

        if (!sellRequest) {
            return res.status(404).send('Sell request not found.');
        }

        const auctionStart = new Date(sellRequest.startTime); // Already a datetime-local from frontend
        const auctionEnd = new Date(sellRequest.endTime);

        // Move the sell request to the Auction collection
        const newAuction = await Auction.create({
            name: sellRequest.name,
            photo: sellRequest.image,
            text: sellRequest.description,
            startingPrice: sellRequest.price,
            category: sellRequest.category,
            startTime: auctionStart,
            endTime: auctionEnd,
            active: true,
            highest: {
                amount: 0,
                userid: 'adminUserId',
                username: 'adminUsername'
            }
        });

        console.log(`Auction ${newAuction.name} created with ID ${newAuction._id}.`);
        
        // Delete the sell request from the Sell collection
        await Sell.findByIdAndDelete(req.params.id);
        console.log(`Sell request with ID ${req.params.id} deleted.`);

        return res.redirect('/admin/sell-requests');
    } catch (error) {
        console.error('Error accepting sell request:', error);
        res.status(500).send('An error occurred while accepting the sell request.');
    }
};

// Handle contact message
exports.handleContactMessage = async (req, res) => {  // Declare as async
    const { name, email, message } = req.body;

    try {
        // Save the message to the database
        const newContact = new Contact({ name, email, message });
        await newContact.save();  // This will now work because the function is async

        // Redirect to a confirmation page or the contact page with status
        res.redirect('/contact?status=success'); // Adjust based on your success handling
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).send('An error occurred while saving the contact message.');
    }
};

exports.getBidPage = async (req, res) => {
    console.log('getBidPage called with ID:', req.params.id);

    try {
        // Fetch the auction/bid data based on req.params.id
        const auctionId = req.params.id;

        // Check if the auctionId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(auctionId)) {
            return res.status(400).send('Invalid Auction ID');
        }

        // Find the auction by ID
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).send('Auction not found');
        }

        // Render the bid page for admin with auction details
        res.render('admin/bid', { auction });
    } catch (error) {
        console.error('Error fetching the bid page:', error);
        res.status(500).send('Server Error');
    }
};

// Admin view auction bids function
exports.viewAuctionBids = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id).populate('bids.userid'); // Populate user details if necessary

        if (!auction) {
            return res.status(404).send('Auction not found');
        }

        res.render('admin/view', { item: auction });
    } catch (error) {
        console.error('Error fetching auction bids:', error);
        res.status(500).send('Server error');
    }
};

// Admin bid submission function in views page
exports.bid = async (req, res) => {
    try {
        const { id } = req.params;  // Get auction ID from the URL params
        const { bidAmount } = req.body;  // Get the bid amount from the form input
        const userId = req.user._id; // Get user ID from the logged-in user

        // Fetch the auction from the database
        const auction = await Auction.findById(id);

        if (!auction) {
            return res.status(404).send('Auction not found');
        }

        // Add the new bid to the auction's bid array (assuming the auction model has a 'bids' field)
        auction.bids.push({ amount: bidAmount, userid: req.user._id });  // Assuming req.user._id holds the logged-in user's ID

        // Save the auction with the updated bids
        await auction.save();

        // Redirect back to the bid page
        res.redirect(`/bid/${id}`);
    } catch (error) {
        console.error('Error submitting bid:', error);
        res.status(500).send('Server error');
    }
};



