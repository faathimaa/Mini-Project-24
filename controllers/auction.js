//controllers/auction.js
const Auction = require('../models/Auction'); // Import the Auction model
const User = require('../models/User'); // Import User model for notifying highest bidder (if required)

// Place bid function
exports.placeBid = async (req, res) => {
    const auctionId = req.params.id; // Get the auction ID from request parameters

    try {
        const auction = await Auction.findById(auctionId);

        if (!auction) {
            return res.status(404).send('Auction not found.');
        }

        const now = new Date(); // Get the current time

        // Ensure the auction is active and the current time is within the auction period
        if (!auction.active) {
            return res.status(403).send('The auction is not active yet.');
        }
        if (now < auction.startTime) {
            return res.status(403).send('The auction has not started yet.');
        }
        if (now > auction.endTime) {
            return res.status(403).send('The auction has already ended.');
        } 
        // Check if the current user is the seller
        if (req.user._id.toString() === auction.sellerId.toString()) {
            return res.status(403).send('Sellers cannot bid on their own auctions.');
        }
        
        const bidAmount = parseFloat(req.body.amount); // Get bid amount from form input
        if (bidAmount <= auction.highest.amount) {
            return res.status(400).send('Bid amount must be higher than the current highest bid.');
        }

        // Update the auction with the new highest bid
        auction.highest = {
            amount: bidAmount,
            userid: req.user._id.toString(), // Convert ObjectId to string
            username: req.user.username // Add username
        };

        // Add the new bid to the bids array
        auction.bids.push({
            amount: bidAmount,
            userid: req.user._id.toString(), // Convert ObjectId to string
            username: req.user.username // Add username
        });

        await auction.save(); // Save the updated auction with the new highest bid
        return res.redirect(`/auction/${auctionId}`); // Redirect to the auction page
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error.');
    }
};
