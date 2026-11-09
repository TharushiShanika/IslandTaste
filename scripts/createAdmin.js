
const readlineSync = require("readline-sync");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function createAdmin() {
    try {
        console.log("\n===== ISLAND TASTE ADMIN SETUP =====\n");

        const fullName = readlineSync.question("Admin Full Name: ").trim();
        const email = readlineSync.question("Admin Email: ").trim().toLowerCase();

        const password = readlineSync.question(
            "Admin Password: ",
            { hideEchoBack: true }
        );

        const confirmPassword = readlineSync.question(
            "Confirm Password: ",
            { hideEchoBack: true }
        );

        if (!fullName || !email || !password) {
            throw new Error("All fields are required.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Please enter a valid email address.");
        }

        if (password.length < 12) {
            throw new Error("Admin password must contain at least 12 characters.");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        // Get administrator role
        const [roles] = await pool.execute(
            "SELECT role_id FROM roles WHERE role_name = 'admin'"
        );

        if (roles.length === 0) {
            throw new Error("Admin role not found in the database.");
        }

        // Check whether email already exists
        const [existing] = await pool.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            throw new Error("This email address is already registered.");
        }

        // Hash administrator password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create administrator account
        const [result] = await pool.execute(
            `INSERT INTO users
            (role_id, full_name, email, password)
            VALUES (?, ?, ?, ?)`,
            [
                roles[0].role_id,
                fullName,
                email,
                hashedPassword
            ]
        );

        console.log("\nAdministrator created successfully!");
        console.log("Admin ID:", result.insertId);
        console.log("Admin Email:", email);
        console.log("Role: admin");

    } catch (error) {
        console.error("\nAdmin Setup Error:", error.message);

    } finally {
        await pool.end();
    }
}

createAdmin();
