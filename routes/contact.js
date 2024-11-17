const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Import the Contact model

// POST route to handle form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Create a new contact entry in the database
    const newContact = new Contact({
      name,
      email,
      message,
    });

    await newContact.save();

    // Redirect to a thank-you page or send a success response
    res.redirect('/contact-success'); // Or simply send a success message
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
