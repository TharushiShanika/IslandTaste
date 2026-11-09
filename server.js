const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
// Import other public routes here (e.g., roomRoutes, bookingRoutes, etc.)

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Use your live frontend URL or localhost for dev
    credentials: true
}));

// API Routes
app.use("/api/admin", adminRoutes);
// app.use("/api/rooms", roomRoutes);
// app.use("/api/bookings", bookingRoutes);

// ==========================================================
// SERVE FRONTEND STATIC FILES IN PRODUCTION (Single Server Setup)
// ==========================================================
if (process.env.NODE_ENV === "production") {
    // Points to the built React frontend folder relative to backend root
    const frontendPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(frontendPath));

    // Catch-all route to support React Router (prevents 404 errors on page refresh)
    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running smoothly on http://localhost:${PORT}`);
});