const cron = require('node-cron');
const Auction = require('../models/Auction');
const User = require('../models/User');
const { sendWinningNotification } = require('../controllers/notification');

cron.schedule('* * * * *', async () => {
  console.log('Cron job running...');

  try {
    const auctions = await Auction.find({
      status: { $in: ['pending', 'ongoing'] }
    });

    console.log(`Total auctions found: ${auctions.length}`);
    
    for (let auction of auctions) {
      try {
        console.log(`Processing auction: ${auction.name}`);
      
        const updatedAuction = await auction.updateActiveStatus();
      
        console.log('Updated auction:', {
          id: updatedAuction._id,
          name: updatedAuction.name,
          status: updatedAuction.status,
          highest: updatedAuction.highest
        });
      
        if (updatedAuction.status === 'completed' && updatedAuction.highest && updatedAuction.highest.userid) {
          console.log(`Auction won by user with ID: ${updatedAuction.highest.userid}`);
          try {
            const winningUser = await User.findById(updatedAuction.highest.userid);
            if (winningUser) {
              await sendWinningNotification(winningUser.email, updatedAuction.name);
              console.log(`Notification sent to ${winningUser.email}`);
            } else {
              console.log(`Winning user not found for auction ${updatedAuction.name}`);
            }
          } catch (userError) {
            console.error(`Error processing winning user for auction ${updatedAuction.name}:`, userError);
          }
        }
      } catch (auctionError) {
        console.error(`Error processing auction ${auction.name}:`, auctionError);
      }
    }
    
  } catch (error) {
    console.error('Error updating auction statuses:', error);
  }
});

module.exports = cron;
