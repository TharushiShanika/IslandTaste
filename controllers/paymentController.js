const db = require("../config/db");

// Process payment for a booking
exports.processPayment = async (req, res) => {
    let connection;
    try {
        const { bookingId, amount, paymentMethod, transactionReference } = req.body;

        if (!bookingId || !amount || !paymentMethod || !transactionReference) {
            return res.status(400).json({
                success: false,
                message: "Please provide bookingId, amount, paymentMethod, and transactionReference."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

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

        const updateBookingQuery = `
            UPDATE bookings 
            SET booking_status = 'confirmed' 
            WHERE booking_id = ?
        `;
        await connection.query(updateBookingQuery, [bookingId]);

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
const handleProcessPayment = async (paymentData) => {
    try {
        // paymentData: { bookingId, amount, paymentMethod, transactionReference }
        const response = await API.post("/payments", paymentData);
        console.log("Payment successful, booking confirmed!", response.data);
    } catch (error) {
        console.error("Payment failed:", error.response?.data || error.message);
    }
};