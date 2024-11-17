///controllers/user.js
let User = require('../models/User');
let Sub = require('../models/Subscription');
let Sell = require('../models/Sell');
const Auction = require('../models/Auction');
const userCookie = require('../utils/userCookie');
const mongoose = require('mongoose'); // Import mongoose
const jwt = require('jsonwebtoken'); // JWT package for authentication

// Function to get JWT from cookies
const getTokenFromHeader = (req) => {
    return req.cookies.user; // Get token from cookies instead of headers
};

exports.getMain = async(req, res) => {
    let items = await Auction.find({ active: true }).limit(4);
    res.render('main', { islogin: req.islogin, sub: '', items });
};

exports.getAuctions = async (req, res) => {
    const items = await Auction.find({ active: true }).sort({ _id: -1 });
    return res.render('auctions', {
        items,
        islogin: req.islogin, // Pass islogin to the view
        isAdmin: req.user ? req.user.isAdmin : false // Pass isAdmin to the view
    });
};

exports.getSell = (req, res) => {
    res.render('sell', { islogin: req.islogin });
};

exports.getContact = (req, res) => {
    res.render('contact', { islogin: req.islogin });
};

exports.getLogin = (req, res) => {
    res.render('login', { islogin: req.islogin, msg: '' });
};

exports.getSignup = (req, res) => {
    res.render('signup', { islogin: req.islogin });
};

exports.signup = async (req, res) => {
    req.body.id = `${Date.now()}`;
    await User.create(req.body);
    res.redirect('/login');
};

exports.login = async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { msg: "Enter Email and Password", islogin: req.islogin });
    }
    email = email.toLowerCase();
    const user = await User.findOne({ email: email }).select("+password");

    if (!user) {
        return res.render('login', { msg: "Incorrect Email or Password", islogin: req.islogin });
    }
    const isPasswordCorrect = await user.isValidatedPassword(password);
    if (!isPasswordCorrect) {
        return res.render('login', { msg: "Incorrect Email or Password", islogin: req.islogin });
    }

    await userCookie(user, res); // Set cookie for user authentication
    if (user.isAdmin === true) {
        return res.redirect('/admin');
    }

    res.redirect('/');
};

exports.logout = (req, res) => {
    res.cookie('user', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    return res.redirect('/login');
};

exports.subscribe = async(req, res) => {
    await Sub.create({
        email: req.body.email
    });
    return res.render('main', { islogin: req.islogin, sub: "Subscribed Successfully" });
};

// Updated sell function with JWT validation
exports.sell = async (req, res) => {
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).render('login', { msg: 'Unauthorized: No token provided', islogin: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded JWT payload to req.user

        // Validate form fields
        if (!req.body.name || !req.file || !req.body.description || !req.body.price || !req.body.category || !req.body.condition) {
            return res.status(400).send('All fields are required.');
        }
        
        const userId = Number(req.user.id); // Ensure userId is treated as a Number

        // Convert startTime and endTime from the request to Date objects
        const startTime = new Date(req.body.startTime);
        const endTime = new Date(req.body.endTime);

        // Save the data
        await Sell.create({
            userId: userId, // Store as a Number
            name: req.body.name,
            email: req.body.email, // Ensure the email is sent and handled correctly
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            condition: req.body.condition,
            imagePath: req.file.path,
            startTime: startTime,     // Save auction start time
            endTime: endTime, 
            startingPrice: req.body.price
        });

        return res.redirect('/'); // Redirect after successful creation
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error or unauthorized.');
    }
};

exports.getBidPage = async (req, res) => {
    console.log('getBidPage called with ID:', req.params.id);
    
    try {
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

        // Render the bid page with auction details for user
        res.render('bid', { auction });
    } catch (error) {
        console.error('Error fetching the bid page:', error);
        res.status(500).send('Server Error');
    }
};

//for placing bid
exports.bid = async (req, res) => {
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).render('login', { msg: 'Unauthorized: No token provided', islogin: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded JWT payload to req.user
        console.log('placeBid function called'); // This should print to the console

        // Find the auction by ID
        let auction = await Auction.findById(req.body.id); // Use findById to get auction

        if (!auction) {
            return res.status(404).send('Auction not found');
        }

        const currentTime = new Date();
        const startTime = new Date(auction.startTime);
        const endTime = new Date(auction.endTime);

        // Check if the current time is within the auction period
        if (currentTime < startTime) {
            return res.status(400).send('Bidding has not started yet.');
        }
        if (currentTime > endTime) {
            return res.status(400).send('The auction has already ended.');
        }

        let prevHighest = auction.highest ? auction.highest.amount : 0; // Get previous highest bid
        let amount = Number(req.body.amount); // Ensure the bid amount is a Number

        // Validate the bid amount
        if (amount <= prevHighest) {
            return res.status(400).send('Bid must be higher than the current highest bid.');
        }

        // Push the new bid to the auction's bids array
        auction.bids.push({
            amount: amount,
            userid: Number(req.user.id), // Store user ID as a Number
            username: req.user.name
        });

        // Update the highest bid if the new amount is greater
        auction.highest = {
            amount: amount,
            userid: Number(req.user.id), // Store user ID as a Number
            username: req.user.name
        };

        await auction.save(); // Save the auction with updated bids
        req.flash('success_msg', 'Bidding done! Your bid has been placed successfully.');
        return res.redirect(`/bid/${auction._id}`); // Redirect to the auction page after bidding
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error or unauthorized.');
    }
};
