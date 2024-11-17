require('dotenv').config();

const express = require('express')
const session = require('express-session');
const flash = require('connect-flash');

const app =express()
const cookieParser = require('cookie-parser')
const path = require('path');
const mongoose = require('mongoose');
const contactRoute = require('./routes/contact'); // Import the contact route
const auctionCron = require('./cron/auctionCron'); // Adjust path as necessary
const Auction = require('./models/Auction'); // Make sure to import the Auction model


app.set('view engine','ejs')
app.use(cookieParser())
app.use(express.static('public'))
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({extended:true}))
app.use(express.json())

// Setup session middleware (required for flash)
app.use(session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
}));
// Initialize flash middleware
app.use(flash());
// Global middleware to set flash messages in response locals
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

const connectWithDb = require('./config/database')
connectWithDb()

app.use('/contact', contactRoute);

// Middleware to check login status
app.use((req, res, next) => {
    req.islogin = req.cookies.user ? true : false; // Adjust based on how you determine login status
    next();
});

const sellRoutes = require('./routes/sell');
app.use('/sell', sellRoutes); // Mount under /sell
// Route to handle form submission and file upload

let userRoute = require('./routes/user')
let adminRoute = require('./routes/admin')
app.use('/',userRoute)
app.use('/admin',adminRoute)

// Route to handle bid page rendering
app.get('/bid/:id', async (req, res) => {
    console.log('Bid page requested for ID:', req.params.id); // Debugging line

    const islogin = req.islogin; // Get islogin value
    // Here you might want to fetch the auction data based on ID
    // Assuming you have a function like getAuctionById defined somewhere
    try {
        const auction = await Auction.findById(req.params.id); // Fetch auction details
        if (!auction) {
            return res.status(404).send('Auction not found');
        }
        res.render('bid', { auction, islogin }); // Pass auction and islogin to the view
    } catch (error) {
        console.error('Error fetching auction:', error);
        res.status(500).send('An error occurred while fetching the auction');
    }
});

// Test route to set cookie
app.get('/test-set-cookie', (req, res) => {
    res.cookie('user', 'testtoken', { httpOnly: true });
    res.send('Cookie has been set');
});

// Test route to check cookie
app.get('/test-check-cookie', (req, res) => {
    console.log('Cookie:', req.cookies.user);
    res.send('Check console for cookie');
});

// Simple error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

let port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log('app running on port ',port)
})
