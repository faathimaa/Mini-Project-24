const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
    const token = req.cookies.user; // Get token from the 'user' cookie

    if (token == null) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Verify the JWT token using the secret key from the .env file
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }
        req.user = user; // Attach decoded user to request object
        next(); // Proceed to next middleware or route
    });
}

module.exports = authenticateJWT;
