const express = require('express');
const Hotel = require('../models/Hotel');
const router = express.Router();

// Get all hotels
router.get('/', async (req, res) => {
  try {
    const { location, minPrice, maxPrice, rating, page = 1, limit = 10 } = req.query;

    let query = { isActive: true };

    // Filter by location
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    const skip = (page - 1) * limit;

    const hotels = await Hotel.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1, price: 1 });

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      data: hotels,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: hotels.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hotels',
      error: error.message
    });
  }
});

// Search hotels by location
router.get('/search', async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required'
      });
    }

    const hotels = await Hotel.findByLocation(location);

    res.json({
      success: true,
      data: hotels,
      count: hotels.length
    });
  } catch (error) {
    console.error('Error searching hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching hotels',
      error: error.message
    });
  }
});

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hotel',
      error: error.message
    });
  }
});

// Create new hotel (Admin only)
router.post('/', async (req, res) => {
  try {
    const hotelData = req.body;

    // Set available rooms equal to total rooms for new hotel
    if (hotelData.totalRooms && !hotelData.availableRooms) {
      hotelData.availableRooms = hotelData.totalRooms;
    }

    const hotel = new Hotel(hotelData);
    const savedHotel = await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: savedHotel
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating hotel',
      error: error.message
    });
  }
});

// Update hotel (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating hotel',
      error: error.message
    });
  }
});

// Delete hotel (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting hotel',
      error: error.message
    });
  }
});

// Check hotel availability
router.get('/:id/availability', async (req, res) => {
  try {
    const { checkIn, checkOut, rooms = 1 } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const isAvailable = hotel.checkAvailability(Number(rooms));

    res.json({
      success: true,
      data: {
        hotelId: hotel._id,
        hotelName: hotel.name,
        available: isAvailable,
        availableRooms: hotel.availableRooms,
        requestedRooms: Number(rooms)
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    });
  }
});

module.exports = router;
