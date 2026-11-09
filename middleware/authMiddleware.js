
const jwt = require("jsonwebtoken");

// VERIFY CUSTOMER OR ADMIN LOGIN
exports.protect = (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please log in to access this resource."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired login session."
        });
    }
};


// CUSTOMER-ONLY ACCESS
exports.customerOnly = (req, res, next) => {
    if (req.user.role !== "customer") {
        return res.status(403).json({
            success: false,
            message: "Customer access only."
        });
    }

    next();
};


// ADMIN-ONLY ACCESS
exports.adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Administrator access only."
        });
    }

    next();
};
