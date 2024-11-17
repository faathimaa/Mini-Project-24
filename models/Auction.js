const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Ensure the auction name is required
    },
    photo: {
        type: String,
        required: true // Ensure the auction photo is required
    },
    text: {
        type: String,
        required: true // Ensure the auction description is required
    },
    active: {
        type: Boolean,
        default: false // Default to false, will be updated based on time
    },
    startTime: {
        type: Date,
        required: true // Ensure the auction start time is required
    },
    endTime: {
        type: Date,
        required: true // Ensure the auction end time is required
    },
    startingPrice: {
        type: Number,
        required: true // Ensure starting price is required
    },
    bids: [
        {
            amount: {
                type: Number,
                required: true // Ensure bid amount is required
            },
            userid: {
                type: String,
                required: true // Ensure userid is required
            },
            username: {
                type: String,
                required: true // Ensure username is required
            }
        }
    ],
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // reference to the seller

    highest: {
        amount: {
            type: Number,
            default: 0 // Default to 0 for the highest bid amount
        },
        userid: { // Change this to String
            type: String,
            required: true // Optional: make it required
        },
        username: String
    },
    status: {
        type: String,
        enum: ['pending', 'ongoing', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

// // Method to update auction status based on current time
// auctionSchema.methods.updateActiveStatus = async function () {
//     const now = new Date();
//     if (now < this.startTime) {
//         this.active = false;
//     } else if (now > this.endTime) {
//         this.active = false;
//         this.status = 'completed'; // Update status to completed
//     } else {
//         this.active = true;
//     }
//     await this.save(); // Save the updated auction
// };

// module.exports = mongoose.model('Auction', auctionSchema);
auctionSchema.methods.updateActiveStatus = async function () {
    const now = new Date();
    
    console.log(`Updating status for auction: ${this.name} (ID: ${this._id})`);
    console.log(`Current Time: ${now}`);
    console.log(`Auction Start Time: ${this.startTime}`);
    console.log(`Auction End Time: ${this.endTime}`);
    console.log(`Current status: ${this.status}`);

    if (now < this.startTime) {
        this.active = false;
        this.status = 'pending';
        console.log(`Auction ${this.name} is pending.`);
    } else if (now >= this.startTime && now <= this.endTime) {
        this.active = true;
        this.status = 'ongoing';
        console.log(`Auction ${this.name} is currently active.`);
    } else if (now > this.endTime) {
        this.active = false;
        this.status = 'completed';
        console.log(`Auction ${this.name} has ended. Updating status to completed.`);
        
        // Check if there were any bids placed
        if (this.bids.length > 0) {
            const highestBid = this.bids.reduce((prev, current) => 
                (prev.amount > current.amount) ? prev : current
            );
            this.highest = {
                amount: highestBid.amount,
                userid: highestBid.userid,
                username: highestBid.username
            };
            console.log(`Highest bid set to: ${JSON.stringify(this.highest)}`);
        } else {
            console.log(`No bids placed for auction ${this.name}`);
        }
    }
    
    const updatedAuction = await this.save();
    console.log(`Updated auction status: ${updatedAuction.status}`);
    return updatedAuction;
};


module.exports = mongoose.model('Auction', auctionSchema);
