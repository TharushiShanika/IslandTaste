const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get("/ping", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Booking API is connected to the server!"
    });
});

// Room availability routes
router.get("/availability", bookingController.checkAvailability);
router.post("/availability", bookingController.checkAvailability);

// Booking creation route
router.post("/", bookingController.createBooking);

// Customer booking management routes
router.get("/user/:userId", bookingController.getUserBookings);
router.put("/:id/cancel", bookingController.cancelBooking);
router.get("/availability", bookingController.checkAvailability);

module.exports = router;