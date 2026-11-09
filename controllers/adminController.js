const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password."
            });
        }

        // Query database for admin user
        const [users] = await db.query(
            `SELECT * FROM users WHERE email = ? AND role = 'admin'`, 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials or unauthorized role."
            });
        }

        const admin = users.find(u => u.email === email);

        // Compare password (supports bcrypt hash or plain text if seeded that way)
        const isMatch = password === admin.password_hash || await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { userId: admin.user_id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1d" }
        );

        // Send token securely via HTTP-only cookie and JSON response
        return res.status(200)
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            })
            .json({
                success: true,
                message: "Admin logged in successfully!",
                token, // optional for frontend state storage if needed
                data: {
                    userId: admin.user_id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            });

    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during admin login."
        });
    }
};

// ==========================================
// 2. DASHBOARD ANALYTICS & STATISTICS
// ==========================================
exports.getAdminDashboardStats = async (req, res) => {
    try {
        const [[{ totalBookings }]] = await db.query(`SELECT COUNT(*) as totalBookings FROM bookings`);
        const [[{ totalRevenue }]] = await db.query(`SELECT SUM(amount) as totalRevenue FROM payments WHERE payment_status = 'paid'`);
        const [[{ totalRooms }]] = await db.query(`SELECT COUNT(*) as totalRooms FROM rooms`);
        const [[{ availableRooms }]] = await db.query(`SELECT COUNT(*) as availableRooms FROM rooms WHERE room_status = 'available'`);

        const [recentBookings] = await db.query(`
            SELECT b.booking_id, b.check_in, b.check_out, b.guests, b.total_amount, b.booking_status, b.created_at
            FROM bookings b
            ORDER BY b.created_at DESC
            LIMIT 5
        `);

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalBookings,
                    totalRevenue: totalRevenue || 0,
                    totalRooms,
                    availableRooms,
                    occupancyRate: totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0
                },
                recentBookings
            },
            message: "Admin dashboard stats fetched successfully!"
        });

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching admin stats."
        });
    }
};

// ==========================================
// 3. RESERVATIONS MANAGEMENT
// ==========================================
exports.getAllBookings = async (req, res) => {
    try {
        const query = `
            SELECT b.booking_id, b.user_id, b.check_in, b.check_out, b.guests, 
                   b.total_amount, b.booking_status, b.created_at,
                   GROUP_CONCAT(rt.type_name SEPARATOR ', ') AS room_types,
                   GROUP_CONCAT(r.room_number SEPARATOR ', ') AS room_numbers
            FROM bookings b
            LEFT JOIN booking_rooms br ON b.booking_id = br.booking_id
            LEFT JOIN rooms r ON br.room_id = r.room_id
            LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
            GROUP BY b.booking_id
            ORDER BY b.created_at DESC
        `;

        const [bookings] = await db.query(query);

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
            message: "All resort bookings fetched successfully!"
        });

    } catch (error) {
        console.error("Error fetching all bookings for admin:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching resort bookings."
        });
    }
};

// ==========================================
// 4. ROOM STATUS MAINTENANCE
// ==========================================
exports.updateRoomStatus = async (req, res) => {
    try {
        const roomId = req.params.id;
        const { roomStatus } = req.body;

        const validStatuses = ['available', 'maintenance', 'inactive'];
        if (!roomStatus || !validStatuses.includes(roomStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing roomStatus. Must be 'available', 'maintenance', or 'inactive'."
            });
        }

        const [rooms] = await db.query(`SELECT * FROM rooms WHERE room_id = ?`, [roomId]);
        if (rooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Room not found."
            });
        }

        await db.query(
            `UPDATE rooms SET room_status = ? WHERE room_id = ?`,
            [roomStatus, roomId]
        );

        return res.status(200).json({
            success: true,
            message: `Room status updated to '${roomStatus}' successfully!`
        });

    } catch (error) {
        console.error("Error updating room status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating room status."
        });
    }
};

// ==========================================
// 5. MONTHLY FINANCIAL & BOOKING REPORTS
// ==========================================
exports.getMonthlyReport = async (req, res) => {
    try {
        const { year, month } = req.query; // e.g., ?year=2026&month=11
        const targetYear = year || new Date().getFullYear();
        const targetMonth = month || (new Date().getMonth() + 1);

        const query = `
            SELECT 
                DATE(b.created_at) AS booking_date,
                COUNT(b.booking_id) AS total_bookings,
                SUM(p.amount) AS daily_revenue
            FROM bookings b
            LEFT JOIN payments p ON b.booking_id = p.booking_id AND p.payment_status = 'paid'
            WHERE YEAR(b.created_at) = ? AND MONTH(b.created_at) = ?
            GROUP BY DATE(b.created_at)
            ORDER BY booking_date ASC
        `;

        const [reportData] = await db.query(query, [targetYear, targetMonth]);

        const totalRevenue = reportData.reduce((acc, curr) => acc + Number(curr.daily_revenue || 0), 0);
        const totalBookings = reportData.reduce((acc, curr) => acc + Number(curr.total_bookings || 0), 0);

        return res.status(200).json({
            success: true,
            data: {
                period: { year: targetYear, month: targetMonth },
                summary: { totalRevenue, totalBookings },
                dailyBreakdown: reportData
            },
            message: "Monthly report generated successfully!"
        });
    } catch (error) {
        console.error("Error generating monthly report:", error);
        return res.status(500).json({ success: false, message: "Error generating monthly report." });
    }
};

// ==========================================
// 6. WEBSITE CONTENT EDITING (Menu, Offers, CRM)
// ==========================================
exports.addMenuItem = async (req, res) => {
    try {
        const { name, category, description, price, imageUrl } = req.body;
        await db.query(
            `INSERT INTO menu_items (name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)`,
            [name, category, description, price, imageUrl]
        );
        return res.status(201).json({ success: true, message: "Menu item added successfully!" });
    } catch (error) {
        console.error("Error adding menu item:", error);
        return res.status(500).json({ success: false, message: "Error adding menu item." });
    }
};

exports.addOffer = async (req, res) => {
    try {
        const { title, description, discountPercentage, validUntil, imageUrl } = req.body;
        await db.query(
            `INSERT INTO offers (title, description, discount_percentage, valid_until, image_url) VALUES (?, ?, ?, ?, ?)`,
            [title, description, discountPercentage, validUntil, imageUrl]
        );
        return res.status(201).json({ success: true, message: "Offer published successfully!" });
    } catch (error) {
        console.error("Error adding offer:", error);
        return res.status(500).json({ success: false, message: "Error publishing offer." });
    }
};

exports.getCustomers = async (req, res) => {
    try {
        const [customers] = await db.query(`SELECT * FROM customers ORDER BY created_at DESC`);
        return res.status(200).json({ success: true, data: customers });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(500).json({ success: false, message: "Error fetching customers." });
    }
};