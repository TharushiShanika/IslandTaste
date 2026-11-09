const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
    try {
        // Grab the token from cookies or authorization header
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No authentication token provided."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

        // Verify if the user has admin privileges
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access forbidden. Admin privileges required."
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

module.exports = verifyAdmin;