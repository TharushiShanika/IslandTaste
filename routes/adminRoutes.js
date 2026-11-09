const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Ensure every controller property below is defined and not undefined
router.get("/dashboard", adminController.getAdminDashboardStats);
router.get("/bookings", adminController.getAllBookings);
router.put("/rooms/:id/status", adminController.updateRoomStatus);
router.get("/reports/monthly", adminController.getMonthlyReport);
router.post("/menu", adminController.addMenuItem);
router.post("/offers", adminController.addOffer);
router.get("/customers", adminController.getCustomers);

module.exports = router;