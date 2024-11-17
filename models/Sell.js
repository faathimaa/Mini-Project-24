//modesl/Sell.js
const mongoose = require('mongoose');
const sellSchema = new mongoose.Schema({
    userId: {
        // type: mongoose.Schema.Types.ObjectId,
        type: Number, // Store as a Number
        required: true,
        // ref: 'User' // Reference to the User model
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    startTime: {
        type: String, 
        required: true
    },
    endTime: {
        type: String, 
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Sell', sellSchema);
