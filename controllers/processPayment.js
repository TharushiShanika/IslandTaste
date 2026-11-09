const db = require("../config/db"); // Adjust path to your DB configuration

exports.processPayment = async (req, res) => {
    let connection;
    try {
        const { bookingId, amount, paymentMethod, transactionReference } = req.body;

        // 1. Validate required fields
        if (!bookingId || !amount || !paymentMethod || !transactionReference) {
            return res.status(400).json({
                success: false,
                message: "Please provide bookingId, amount, paymentMethod, and transactionReference."
            });
        }

        // Get a dedicated database connection for transaction safety
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 2. Check if the booking exists and is currently pending
        const [bookings] = await connection.query(
            `SELECT * FROM bookings WHERE booking_id = ?`, 
            [bookingId]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        const booking = bookings[0];

        if (booking.booking_status !== 'pending') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: `Payment cannot be processed because this booking is already '${booking.booking_status}'.`
            });
        }

        // 3. Insert record into the `payments` table
        const insertPaymentQuery = `
            INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_reference, paid_at)
            VALUES (?, ?, ?, 'paid', ?, NOW())
        `;
        await connection.query(insertPaymentQuery, [
            bookingId, 
            amount, 
            paymentMethod, 
            transactionReference
        ]);

        // 4. Update the `bookings` status to 'confirmed'[cite: 13]
        const updateBookingQuery = `
            UPDATE bookings 
            SET booking_status = 'confirmed' 
            WHERE booking_id = ?
        `;
        await connection.query(updateBookingQuery, [bookingId]);

        // 5. Commit the transaction
        await connection.commit();
        connection.release();

        return res.status(200).json({
            success: true,
            message: "Payment processed successfully and booking is now confirmed!",
            data: {
                bookingId,
                amount,
                paymentMethod,
                transactionReference,
                bookingStatus: "confirmed"
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Payment Processing Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while processing the payment."
        });
    }
};