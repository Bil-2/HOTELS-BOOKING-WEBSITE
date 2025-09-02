const express = require('express');
const router = express.Router();
const HotelChain = require('../models/HotelChain');
const Hotel = require('../models/Hotel');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/chain
// @desc    Get all hotel chains
// @access  Public
router.get('/', async (req, res) => {
  try {
    const chains = await HotelChain.find({ isActive: true })
      .select('-__v')
      .sort({ chainName: 1 });

    res.json({
      success: true,
      count: chains.length,
      data: chains
    });
  } catch (error) {
    console.error('Error fetching hotel chains:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotel chains'
    });
  }
});

// @route   GET /api/chain/:id
// @desc    Get single hotel chain with hotels
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const chain = await HotelChain.findById(req.params.id);

    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Hotel chain not found'
      });
    }

    // Get hotels belonging to this chain
    const hotels = await Hotel.find({ chainId: req.params.id, isActive: true })
      .select('name location basePrice rating totalRooms totalAvailableRooms status')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        chain,
        hotels,
        hotelCount: hotels.length
      }
    });
  } catch (error) {
    console.error('Error fetching hotel chain:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hotel chain'
    });
  }
});

// @route   POST /api/chain
// @desc    Create new hotel chain
// @access  Private (Admin only)
router.post('/', [
  authenticateToken,
  body('chainName').trim().isLength({ min: 2, max: 100 }).withMessage('Chain name must be 2-100 characters'),
  body('headquarters.contact.email').optional().isEmail().withMessage('Invalid email format'),
  body('establishedYear').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid establishment year')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const chainData = {
      chainName: req.body.chainName,
      headquarters: req.body.headquarters || {},
      establishedYear: req.body.establishedYear,
      description: req.body.description,
      logo: req.body.logo,
      socialMedia: req.body.socialMedia || {},
      settings: {
        ...req.body.settings,
        currency: req.body.settings?.currency || 'INR',
        timezone: req.body.settings?.timezone || 'Asia/Kolkata',
        language: req.body.settings?.language || 'en',
        taxRate: req.body.settings?.taxRate || 18
      }
    };

    const chain = new HotelChain(chainData);
    await chain.save();

    res.status(201).json({
      success: true,
      message: 'Hotel chain created successfully',
      data: chain
    });
  } catch (error) {
    console.error('Error creating hotel chain:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Hotel chain with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating hotel chain'
    });
  }
});

// @route   PUT /api/chain/:id
// @desc    Update hotel chain
// @access  Private (Admin only)
router.put('/:id', [
  authenticateToken,
  body('chainName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Chain name must be 2-100 characters'),
  body('headquarters.contact.email').optional().isEmail().withMessage('Invalid email format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const chain = await HotelChain.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Hotel chain not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel chain updated successfully',
      data: chain
    });
  } catch (error) {
    console.error('Error updating hotel chain:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating hotel chain'
    });
  }
});

// @route   DELETE /api/chain/:id
// @desc    Delete hotel chain (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const chain = await HotelChain.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Hotel chain not found'
      });
    }

    // Also deactivate all hotels in this chain
    await Hotel.updateMany(
      { chainId: req.params.id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Hotel chain deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hotel chain:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting hotel chain'
    });
  }
});

// @route   GET /api/chain/:id/analytics
// @desc    Get hotel chain analytics
// @access  Private (Admin only)
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const chain = await HotelChain.findById(req.params.id);

    if (!chain) {
      return res.status(404).json({
        success: false,
        message: 'Hotel chain not found'
      });
    }

    // Get hotels analytics
    const hotels = await Hotel.find({ chainId: req.params.id, isActive: true });

    const analytics = {
      totalHotels: hotels.length,
      totalRooms: hotels.reduce((sum, hotel) => sum + hotel.totalRooms, 0),
      totalAvailableRooms: hotels.reduce((sum, hotel) => sum + hotel.totalAvailableRooms, 0),
      averageRating: hotels.length > 0 ?
        (hotels.reduce((sum, hotel) => sum + hotel.rating, 0) / hotels.length).toFixed(2) : 0,
      occupancyRate: 0,
      hotelsByStatus: {
        Active: hotels.filter(h => h.status === 'Active').length,
        Maintenance: hotels.filter(h => h.status === 'Maintenance').length,
        Closed: hotels.filter(h => h.status === 'Closed').length,
        'Under Construction': hotels.filter(h => h.status === 'Under Construction').length
      },
      hotelsByState: {}
    };

    // Calculate occupancy rate
    if (analytics.totalRooms > 0) {
      analytics.occupancyRate = (
        ((analytics.totalRooms - analytics.totalAvailableRooms) / analytics.totalRooms) * 100
      ).toFixed(2);
    }

    // Group hotels by state
    hotels.forEach(hotel => {
      const state = hotel.address?.state || 'Unknown';
      analytics.hotelsByState[state] = (analytics.hotelsByState[state] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        chain: {
          id: chain._id,
          name: chain.chainName,
          totalHotels: chain.totalHotels,
          totalRooms: chain.totalRooms
        },
        analytics
      }
    });
  } catch (error) {
    console.error('Error fetching chain analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

module.exports = router;
