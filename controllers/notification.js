const nodemailer = require('nodemailer');

exports.sendWinningNotification = async (email, auctionTitle) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: winnerEmail,
      subject: 'Auction Won!',
      text: `Congratulations! You have won the auction for ${auctionTitle}.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Notification email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
