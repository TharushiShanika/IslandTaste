const db = require("../config/db"); // Adjust path to your DB configuration

// 1. Check room availability
exports.checkAvailability = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, roomTypeId } = req.query;

        // Validate required query parameters
        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide both checkInDate and checkOutDate as query parameters."
            });
        }

        // SQL Query to find rooms that are NOT booked during the requested window
        let query = `
            SELECT r.room_id, r.room_number, rt.room_type_id, rt.type_name, 
                   rt.price_per_night, rt.capacity, rt.image_url, rt.description
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.room_type_id
            WHERE r.room_status = 'available'
            AND rt.is_active = 1
            AND r.room_id NOT IN (
                SELECT br.room_id
                FROM booking_rooms br
                JOIN bookings b ON br.booking_id = b.booking_id
                WHERE b.booking_status IN ('pending', 'confirmed')
                AND NOT (b.check_out <= ? OR b.check_in >= ?)
            )
        `;

        const queryParams = [checkInDate, checkOutDate];

        if (roomTypeId) {
            query += ` AND rt.room_type_id = ?`;
            queryParams.push(roomTypeId);
        }

        const [availableRooms] = await db.query(query, queryParams);

        return res.status(200).json({
            success: true,
            count: availableRooms.length,
            data: availableRooms,
            message: "Available rooms fetched successfully!"
        });

    } catch (error) {
        console.error("Error checking room availability:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while checking availability."
        });
    }
};

// 2. Create a booking
exports.createBooking = async (req, res) => {
    let connection;
    try {
        // Get user ID from authenticated middleware (e.g., req.user.id) and request body
        const userId = req.user ? req.user.id : req.body.userId; 
        const { checkInDate, checkOutDate, guests, roomIds } = req.body;

        // Validate required fields
        if (!userId || !checkInDate || !checkOutDate || !guests || !roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide userId, checkInDate, checkOutDate, guests, and an array of roomIds."
            });
        }

        // Get a dedicated connection from the pool for the transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Double-check that the requested rooms are still available for these dates
        const placeholders = roomIds.map(() => '?').join(',');
        const availabilityQuery = `
            SELECT DISTINCT r.room_id
            FROM rooms r
            WHERE r.room_id IN (${placeholders})
            AND r.room_status = 'available'
            AND r.room_id NOT IN (
                SELECT br.room_id
                FROM booking_rooms br
                JOIN bookings b ON br.booking_id = b.booking_id
                WHERE b.booking_status IN ('pending', 'confirmed')
                AND NOT (b.check_out <= ? OR b.check_in >= ?)
            )
        `;

        const [availableRooms] = await connection.query(
            availabilityQuery, 
            [...roomIds, checkInDate, checkOutDate]
        );

        if (availableRooms.length !== roomIds.length) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({
                success: false,
                message: "One or more selected rooms are no longer available for the chosen dates."
            });
        }

        // Fetch pricing for the selected rooms from room_types
        const pricingQuery = `
            SELECT r.room_id, rt.price_per_night
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.room_type_id
            WHERE r.room_id IN (${placeholders})
        `;
        const [roomPrices] = await connection.query(pricingQuery, roomIds);

        // Calculate total nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (nights <= 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date."
            });
        }

        // Calculate total amount
        let totalAmount = 0;
        const roomPriceMap = {};
        roomPrices.forEach(rp => {
            roomPriceMap[rp.room_id] = rp.price_per_night;
            totalAmount += Number(rp.price_per_night) * nights;
        });

        // Insert into `bookings` table
        const insertBookingQuery = `
            INSERT INTO bookings (user_id, check_in, check_out, guests, total_amount, booking_status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        `;
        const [bookingResult] = await connection.query(insertBookingQuery, [
            userId, checkInDate, checkOutDate, guests, totalAmount
        ]);
        const bookingId = bookingResult.insertId;

        // Insert records into `booking_rooms` table
        const bookingRoomsData = roomIds.map(roomId => [
            bookingId,
            roomId,
            roomPriceMap[roomId]
        ]);

        const insertBookingRoomsQuery = `
            INSERT INTO booking_rooms (booking_id, room_id, price_per_night)
            VALUES ?
        `;
        await connection.query(insertBookingRoomsQuery, [bookingRoomsData]);

        // Commit transaction
        await connection.commit();
        connection.release();

        return res.status(201).json({
            success: true,
            message: "Booking created successfully!",
            data: {
                bookingId,
                totalAmount,
                nights,
                guests,
                checkInDate,
                checkOutDate,
                roomIds
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Error creating booking:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while processing the booking."
        });
    }
};

// 3. Get all bookings for a specific user
exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required."
            });
        }

        const query = `
            SELECT b.booking_id, b.check_in, b.check_out, b.guests, 
                   b.total_amount, b.booking_status, b.created_at,
                   GROUP_CONCAT(rt.type_name SEPARATOR ', ') AS room_types,
                   GROUP_CONCAT(r.room_number SEPARATOR ', ') AS room_numbers
            FROM bookings b
            LEFT JOIN booking_rooms br ON b.booking_id = br.booking_id
            LEFT JOIN rooms r ON br.room_id = r.room_id
            LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
            WHERE b.user_id = ?
            GROUP BY b.booking_id
            ORDER BY b.created_at DESC
        `;

        const [bookings] = await db.query(query, [userId]);

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
            message: "User bookings fetched successfully!"
        });

    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching user bookings."
        });
    }
};

// 4. Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required."
            });
        }

        // Check if booking exists
        const [bookings] = await db.query(
            `SELECT * FROM bookings WHERE booking_id = ?`, 
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        const booking = bookings[0];

        // Validate current status
        if (booking.booking_status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "This booking is already cancelled."
            });
        }

        if (booking.booking_status === 'completed') {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel a booking that has already been completed."
            });
        }

        // Update status to 'cancelled'
        await db.query(
            `UPDATE bookings SET booking_status = 'cancelled' WHERE booking_id = ?`,
            [bookingId]
        );

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully. The rooms are now released back to available inventory."
        });
    

    } catch (error) {
        console.error("Error cancelling booking:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while cancelling the booking."
        });
    }
};
const handleCreateBooking = async (bookingData) => {
    try {
        // bookingData should contain: userId, roomId, checkIn, checkOut, guests, totalAmount
        const response = await API.post("/bookings", bookingData);
        console.log("Booking created successfully:", response.data);
        
        // Return bookingId to proceed to payment
        return response.data.bookingId; 
    } catch (error) {
        console.error("Booking failed:", error.response?.data || error.message);
    }
};