
const readlineSync = require("readline-sync");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function resetAdminPassword() {
    try {
        console.log("\n===== ADMIN PASSWORD RESET =====\n");

        const email = readlineSync
            .question("Admin Email: ")
            .trim()
            .toLowerCase();

        const password = readlineSync.question(
            "New Admin Password: ",
            { hideEchoBack: true }
        );

        const confirmPassword = readlineSync.question(
            "Confirm New Password: ",
            { hideEchoBack: true }
        );

        if (!email || !password || !confirmPassword) {
            throw new Error("All fields are required.");
        }

        if (password.length < 12) {
            throw new Error("Password must contain at least 12 characters.");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        const [users] = await pool.execute(
            `SELECT u.user_id
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.email = ?
             AND r.role_name = 'admin'`,
            [email]
        );

        if (users.length === 0) {
            throw new Error("Administrator not found.");
        }

        const adminId = users[0].user_id;

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            "UPDATE users SET password = ? WHERE user_id = ?",
            [hashedPassword, adminId]
        );

        console.log("Updated rows:", result.affectedRows);

        // Read the password hash back from MySQL
        const [updatedUsers] = await pool.execute(
            "SELECT password FROM users WHERE user_id = ?",
            [adminId]
        );

        const savedHash = updatedUsers[0].password;

        // Verify the password against the saved database hash
        const verified = await bcrypt.compare(
            password,
            savedHash
        );

        console.log("Admin ID:", adminId);
        console.log("Database password verification:", verified);

        if (!verified) {
            throw new Error("Password verification failed.");
        }

        console.log("\nAdmin password reset successfully!");

    } catch (error) {
        console.error("\nPassword Reset Error:", error.message);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

resetAdminPassword();
