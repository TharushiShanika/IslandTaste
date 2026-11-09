
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const {
    protect
} = require("../middleware/authMiddleware");

// Customer registration
router.post("/register", authController.register);

// Customer and admin login
router.post("/login", authController.login);

// Logout
router.post("/logout", authController.logout);

// Get logged-in user details
router.get("/me", protect, authController.getMe);

module.exports = router;
