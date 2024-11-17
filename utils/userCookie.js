const userCookie = async (user, res) => {
    try {
        // Generate the token
        const token = await user.getJwtToken();

        // Define cookie options
        const options = {
            expires: new Date(Date.now() + 55 * 60 * 1000), // Cookie expiration time (55 minutes)
            httpOnly: true, // Prevents client-side access to the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict' // Restrict cookie to same-site requests
        };

        // Set the cookie and redirect
        res.cookie('user', token, options);
        // res.redirect('/'); // Redirect to home page or another appropriate route
    } catch (error) {
        // Handle potential errors
        console.error('Error setting cookie:', error);

        // Optionally, send an error response or render an error page
        if (!res.headersSent) {
            return res.status(500).send('Internal Server Error'); // Ensures headers aren't already sent
        }
    }
};

module.exports = userCookie;
