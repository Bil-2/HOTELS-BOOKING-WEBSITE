const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  // Personal Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },

  // Work Information
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel assignment is required']
  },
  chainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelChain',
    required: [true, 'Chain assignment is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Front Desk', 'Housekeeping', 'Food & Beverage', 'Maintenance', 'Security', 'Management', 'IT', 'HR', 'Finance', 'Marketing']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Super Admin', 'Chain Admin', 'Hotel Manager', 'Assistant Manager', 'Supervisor', 'Staff', 'Guest']
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Employment Details
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  workSchedule: {
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Rotating'],
      default: 'Morning'
    },
    workDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    hoursPerWeek: {
      type: Number,
      default: 40
    }
  },

  // Permissions and Access
  permissions: {
    canViewReports: { type: Boolean, default: false },
    canManageBookings: { type: Boolean, default: false },
    canManageStaff: { type: Boolean, default: false },
    canAccessFinancials: { type: Boolean, default: false },
    canManageRooms: { type: Boolean, default: false },
    canProcessPayments: { type: Boolean, default: false }
  },

  // Status and Activity
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    url: String,
    alt: String
  },

  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },

  // Performance Tracking
  performance: {
    rating: {
      type: Number,
      min: [1, 'Rating cannot be less than 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 3
    },
    lastReview: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes
staffSchema.index({ employeeId: 1 });
staffSchema.index({ email: 1 });
staffSchema.index({ hotelId: 1 });
staffSchema.index({ chainId: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ role: 1 });

// Virtual for full name
staffSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
staffSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
staffSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if staff has permission
staffSchema.methods.hasPermission = function (permission) {
  return this.permissions[permission] || false;
};

// Method to get role hierarchy level
staffSchema.methods.getRoleLevel = function () {
  const roleLevels = {
    'Super Admin': 6,
    'Chain Admin': 5,
    'Hotel Manager': 4,
    'Assistant Manager': 3,
    'Supervisor': 2,
    'Staff': 1,
    'Guest': 0
  };
  return roleLevels[this.role] || 0;
};

// Static method to find staff by hotel
staffSchema.statics.findByHotel = function (hotelId) {
  return this.find({
    hotelId: hotelId,
    isActive: true
  });
};

// Static method to find staff by department
staffSchema.statics.findByDepartment = function (department, hotelId) {
  return this.find({
    department: department,
    hotelId: hotelId,
    isActive: true
  });
};

module.exports = mongoose.model('Staff', staffSchema);
