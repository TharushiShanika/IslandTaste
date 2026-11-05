
const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout,
    getMe
} = require("../controllers/authController");

const {
    protect,
    customerOnly
} = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// Customer-only route
router.get("/customer", protect, customerOnly, (req, res) => {
    res.json({
        success: true,
        message: "Welcome to the customer area."
    });
});

module.exports = router;
