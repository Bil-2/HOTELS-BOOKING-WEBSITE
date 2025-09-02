const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const Hotel = require('../models/Hotel');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// @route   POST /api/staff/login
// @desc    Staff login
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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

    const { email, password } = req.body;

    // Find staff member
    const staff = await Staff.findOne({ email, isActive: true })
      .populate('hotelId', 'name location')
      .populate('chainId', 'chainName');

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await staff.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    staff.lastLogin = new Date();
    await staff.save();

    // Generate JWT token
    const payload = {
      staff: {
        id: staff._id,
        role: staff.role,
        hotelId: staff.hotelId._id,
        chainId: staff.chainId._id,
        permissions: staff.permissions
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      staff: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
        department: staff.department,
        hotel: staff.hotelId,
        chain: staff.chainId,
        permissions: staff.permissions
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/staff
// @desc    Get all staff members (filtered by hotel/chain based on role)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, department, role, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = { isActive: true };

    if (req.staff.role === 'Hotel Manager' || req.staff.role === 'Assistant Manager') {
      query.hotelId = req.staff.hotelId;
    } else if (req.staff.role === 'Chain Admin') {
      query.chainId = req.staff.chainId;
    }
    // Super Admin can see all staff

    // Add filters
    if (department) query.department = department;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const staff = await Staff.find(query)
      .populate('hotelId', 'name location')
      .populate('chainId', 'chainName')
      .select('-password')
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Staff.countDocuments(query);

    res.json({
      success: true,
      data: staff,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff'
    });
  }
});

// @route   GET /api/staff/:id
// @desc    Get single staff member
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('hotelId', 'name location')
      .populate('chainId', 'chainName')
      .select('-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check access permissions
    if (req.staff.role === 'Hotel Manager' && staff.hotelId._id.toString() !== req.staff.hotelId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff member'
    });
  }
});

// @route   POST /api/staff
// @desc    Create new staff member
// @access  Private (Manager+ only)
router.post('/', [
  authenticateToken,
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').isIn(['Front Desk', 'Housekeeping', 'Food & Beverage', 'Maintenance', 'Security', 'Management', 'IT', 'HR', 'Finance', 'Marketing']).withMessage('Invalid department'),
  body('role').isIn(['Super Admin', 'Chain Admin', 'Hotel Manager', 'Assistant Manager', 'Supervisor', 'Staff', 'Guest']).withMessage('Invalid role')
], async (req, res) => {
  try {
    // Check permissions
    if (!req.staff.permissions.canManageStaff && req.staff.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create staff'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Generate employee ID
    const hotel = await Hotel.findById(req.body.hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const employeeId = `${hotel.hotelCode}-${Date.now().toString().slice(-6)}`;

    const staffData = {
      ...req.body,
      employeeId,
      chainId: hotel.chainId
    };

    const staff = new Staff(staffData);
    await staff.save();

    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staffResponse
    });
  } catch (error) {
    console.error('Error creating staff member:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating staff member'
    });
  }
});

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Private (Manager+ only)
router.put('/:id', [
  authenticateToken,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    if (!req.staff.permissions.canManageStaff && req.staff.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update staff'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Remove password from update data if present
    const updateData = { ...req.body };
    delete updateData.password;

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating staff member'
    });
  }
});

// @route   DELETE /api/staff/:id
// @desc    Delete staff member (soft delete)
// @access  Private (Manager+ only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.staff.permissions.canManageStaff && req.staff.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete staff'
      });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting staff member'
    });
  }
});

// @route   GET /api/staff/department/:department
// @desc    Get staff by department
// @access  Private
router.get('/department/:department', authenticateToken, async (req, res) => {
  try {
    let query = {
      department: req.params.department,
      isActive: true
    };

    // Filter by hotel/chain based on role
    if (req.staff.role === 'Hotel Manager' || req.staff.role === 'Assistant Manager') {
      query.hotelId = req.staff.hotelId;
    } else if (req.staff.role === 'Chain Admin') {
      query.chainId = req.staff.chainId;
    }

    const staff = await Staff.find(query)
      .populate('hotelId', 'name location')
      .select('-password')
      .sort({ firstName: 1 });

    res.json({
      success: true,
      data: staff,
      count: staff.length
    });
  } catch (error) {
    console.error('Error fetching staff by department:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff by department'
    });
  }
});

module.exports = router;
