const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  // Basic Information
  itemCode: {
    type: String,
    required: [true, 'Item code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Hotel and Location
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
  location: {
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['Front Desk', 'Housekeeping', 'Food & Beverage', 'Maintenance', 'Security', 'Kitchen', 'Laundry', 'Storage', 'Guest Rooms']
    },
    room: String,
    floor: String,
    building: String
  },

  // Category and Type
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Furniture', 'Electronics', 'Linens', 'Cleaning Supplies', 'Food & Beverage', 'Maintenance Tools', 'Office Supplies', 'Safety Equipment', 'Amenities']
  },
  subCategory: {
    type: String,
    trim: true
  },

  // Quantity and Stock
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative']
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock cannot be negative']
  },
  maximumStock: {
    type: Number,
    required: [true, 'Maximum stock level is required'],
    min: [1, 'Maximum stock must be at least 1']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pieces', 'kg', 'liters', 'meters', 'boxes', 'sets', 'pairs', 'bottles', 'packets']
  },

  // Financial Information
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: [0, 'Unit cost cannot be negative']
  },
  totalValue: {
    type: Number,
    default: 0
  },

  // Supplier Information
  supplier: {
    name: String,
    contact: {
      phone: String,
      email: String,
      address: String
    },
    supplierCode: String
  },

  // Purchase and Maintenance
  lastPurchaseDate: Date,
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  warrantyExpiry: Date,

  // Status and Condition
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Under Maintenance', 'Damaged', 'Disposed', 'Out of Stock'],
    default: 'Available'
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Replacement'],
    default: 'Good'
  },

  // Tracking and History
  movements: [{
    type: {
      type: String,
      enum: ['Purchase', 'Usage', 'Return', 'Transfer', 'Maintenance', 'Disposal'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    notes: String,
    fromLocation: String,
    toLocation: String
  }],

  // Alerts and Notifications
  alerts: {
    lowStock: { type: Boolean, default: false },
    maintenanceDue: { type: Boolean, default: false },
    warrantyExpiring: { type: Boolean, default: false }
  },

  // Additional Information
  barcode: String,
  serialNumber: String,
  model: String,
  brand: String,
  image: {
    url: String,
    alt: String
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
inventorySchema.index({ itemCode: 1 });
inventorySchema.index({ hotelId: 1 });
inventorySchema.index({ chainId: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ 'location.department': 1 });
inventorySchema.index({ status: 1 });

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function () {
  if (this.currentStock <= 0) return 'Out of Stock';
  if (this.currentStock <= this.minimumStock) return 'Low Stock';
  if (this.currentStock >= this.maximumStock) return 'Overstock';
  return 'Normal';
});

// Virtual for stock percentage
inventorySchema.virtual('stockPercentage').get(function () {
  return this.maximumStock > 0 ? ((this.currentStock / this.maximumStock) * 100).toFixed(2) : 0;
});

// Pre-save middleware to calculate total value
inventorySchema.pre('save', function (next) {
  this.totalValue = this.currentStock * this.unitCost;

  // Update alerts
  this.alerts.lowStock = this.currentStock <= this.minimumStock;
  this.alerts.maintenanceDue = this.nextMaintenanceDate && this.nextMaintenanceDate <= new Date();
  this.alerts.warrantyExpiring = this.warrantyExpiry &&
    this.warrantyExpiry <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  next();
});

// Method to add stock movement
inventorySchema.methods.addMovement = function (type, quantity, staffId, notes = '', fromLocation = '', toLocation = '') {
  this.movements.push({
    type,
    quantity,
    staffId,
    notes,
    fromLocation,
    toLocation
  });

  // Update current stock based on movement type
  if (type === 'Purchase' || type === 'Return') {
    this.currentStock += quantity;
  } else if (type === 'Usage' || type === 'Transfer' || type === 'Disposal') {
    this.currentStock = Math.max(0, this.currentStock - quantity);
  }

  return this.save();
};

// Method to check if reorder is needed
inventorySchema.methods.needsReorder = function () {
  return this.currentStock <= this.minimumStock;
};

// Static method to find low stock items
inventorySchema.statics.findLowStock = function (hotelId) {
  return this.find({
    hotelId: hotelId,
    $expr: { $lte: ['$currentStock', '$minimumStock'] },
    isActive: true
  });
};

// Static method to find items by category
inventorySchema.statics.findByCategory = function (category, hotelId) {
  return this.find({
    category: category,
    hotelId: hotelId,
    isActive: true
  });
};

// Static method to get inventory value by hotel
inventorySchema.statics.getTotalValue = function (hotelId) {
  return this.aggregate([
    { $match: { hotelId: mongoose.Types.ObjectId(hotelId), isActive: true } },
    { $group: { _id: null, totalValue: { $sum: '$totalValue' } } }
  ]);
};

module.exports = mongoose.model('Inventory', inventorySchema);
