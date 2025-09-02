const express = require('express');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const { generatePDF } = require('../utils/pdfGenerator');
const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, email } = req.query;

    let query = {};

    if (status) {
      query.bookingStatus = status;
    }

    if (email) {
      query.email = email.toLowerCase();
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('hotelId', 'name location rating')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: bookings.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotelId', 'name location rating contact address');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// Create new booking (Main booking endpoint)
router.post('/book-hotel', async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone_number,
      hotelName,
      location,
      checkIn,
      checkOut,
      guests,
      paymentMethod,
      paymentStatus,
      price
    } = req.body;

    // Validate required fields
    if (!customerName || !email || !phone_number || !hotelName || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find hotel by name and location
    const hotel = await Hotel.findOne({
      name: new RegExp(hotelName, 'i'),
      location: new RegExp(location, 'i'),
      isActive: true
    });

    // Calculate nights and total amount
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = price * nights;

    // Create booking
    const bookingData = {
      customerName: customerName.trim(),
      email: email.toLowerCase().trim(),
      phone_number: phone_number.trim(),
      hotelName: hotelName.trim(),
      location: location.trim(),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      price: Number(price),
      totalAmount,
      totalNights: nights,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentStatus || 'Pending',
      hotelId: hotel ? hotel._id : null
    };

    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();

    // Update hotel availability if hotel found
    if (hotel && hotel.availableRooms > 0) {
      hotel.availableRooms -= 1;
      await hotel.save();
    }

    // Generate PDF receipt
    let pdfDownloadLink = null;
    try {
      const pdfPath = await generatePDF(savedBooking, hotel);
      pdfDownloadLink = `${req.protocol}://${req.get('host')}/receipts/${savedBooking.bookingId}.pdf`;

      // Update booking with receipt URL
      savedBooking.receiptUrl = pdfDownloadLink;
      await savedBooking.save();
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: savedBooking,
      pdfDownloadLink
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Confirmed', 'Cancelled', 'Completed', 'No-Show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // If booking is cancelled, update hotel availability
    if (status === 'Cancelled' && booking.hotelId) {
      const hotel = await Hotel.findById(booking.hotelId);
      if (hotel) {
        hotel.availableRooms += booking.rooms || 1;
        await hotel.save();
      }
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
});

// Cancel booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status
    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    // Update hotel availability
    if (booking.hotelId) {
      const hotel = await Hotel.findById(booking.hotelId);
      if (hotel) {
        hotel.availableRooms += booking.rooms || 1;
        await hotel.save();
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// Get bookings by email
router.get('/customer/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();

    const bookings = await Booking.find({ email })
      .populate('hotelId', 'name location rating')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer bookings',
      error: error.message
    });
  }
});

// Get booking statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'Confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'Cancelled' });
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'Completed' });

    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking statistics',
      error: error.message
    });
  }
});

module.exports = router;
