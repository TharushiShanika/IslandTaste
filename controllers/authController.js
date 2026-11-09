const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// CUSTOMER REGISTRATION
exports.register = async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, email and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const [existingUsers] = await pool.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This email address is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const [result] = await pool.execute(
            `INSERT INTO users
            (role_id, full_name, email, phone, password)
            VALUES (2, ?, ?, ?, ?)`,
            [
                full_name.trim(),
                normalizedEmail,
                phone || null,
                hashedPassword
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully.",
            user: {
                user_id: result.insertId,
                full_name: full_name.trim(),
                email: normalizedEmail,
                phone: phone || null,
                role: "customer"
            }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
};

// CUSTOMER LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await pool.execute(
            `SELECT u.user_id, u.full_name, u.email,
                    u.password, u.is_active, r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.email = ?`,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role_name
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
};

// LOGOUT
exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT u.user_id, u.full_name, u.email,
                    u.phone, r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ? AND u.is_active = TRUE`,
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = users[0];
        return res.status(200).json({
            success: true,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role_name
            }
        });
    } catch (error) {
        console.error("Get User Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve user."
        });
    }
};
