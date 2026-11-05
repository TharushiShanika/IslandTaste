
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

require("dotenv").config();

// Import database connection
const pool = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");

const app = express();

// ===================================
// MIDDLEWARE
// ===================================

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===================================
// API ROUTES
// ===================================

app.use("/api/auth", authRoutes);

// ===================================
// HOME / SERVER TEST ROUTE
// ===================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Island Taste Hotel Backend API is running!"
    });
});

// ===================================
// 404 HANDLER
// ===================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// ===================================
// START SERVER
// ===================================

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        const connection = await pool.getConnection();

        console.log("MySQL Database Connected Successfully!");

        connection.release();

        app.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error(
            "Database Connection Failed:",
            error.message
        );

        process.exit(1);
    }
}

startServer();
