const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HotelChain = require('../models/HotelChain');
const Hotel = require('../models/Hotel');
const Staff = require('../models/Staff');
const Inventory = require('../models/Inventory');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-royal-palace-chain', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await HotelChain.deleteMany({});
    await Hotel.deleteMany({});
    await Staff.deleteMany({});
    await Inventory.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create Hotel Chain
    const hotelChain = new HotelChain({
      chainName: 'Hotel Royal Palace Chain',
      headquarters: {
        address: {
          street: '123 Business District',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        contact: {
          phone: '+91-22-1234-5678',
          email: 'headquarters@hotelroyalpalace.com',
          website: 'https://hotelroyalpalace.com'
        }
      },
      establishedYear: 2010,
      description: 'A premium hotel chain offering luxury accommodations across India with world-class amenities and exceptional service.',
      logo: {
        url: '/src/assets/Component/Image/Logo/logo.png',
        alt: 'Hotel Royal Palace Chain Logo'
      },
      socialMedia: {
        facebook: 'https://facebook.com/hotelroyalpalace',
        instagram: 'https://instagram.com/hotelroyalpalace',
        twitter: 'https://twitter.com/hotelroyalpalace',
        linkedin: 'https://linkedin.com/company/hotelroyalpalace'
      },
      settings: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        language: 'en',
        taxRate: 18,
        cancellationPolicy: '24 hours before check-in for full refund',
        checkInTime: '14:00',
        checkOutTime: '11:00'
      }
    });

    await hotelChain.save();
    console.log('🏢 Created hotel chain');

    // Create Hotels
    const hotels = [
      {
        name: 'Hotel Royal Palace Mumbai',
        hotelCode: 'HRP-MUM',
        location: 'Mumbai',
        basePrice: 8000,
        roomTypes: [
          { type: 'Standard', price: 8000, totalRooms: 50, availableRooms: 35, amenities: ['AC', 'WiFi', 'TV'], maxOccupancy: 2 },
          { type: 'Deluxe', price: 12000, totalRooms: 30, availableRooms: 20, amenities: ['AC', 'WiFi', 'TV', 'Mini Bar'], maxOccupancy: 3 },
          { type: 'Suite', price: 20000, totalRooms: 15, availableRooms: 8, amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Balcony'], maxOccupancy: 4 },
          { type: 'Presidential', price: 35000, totalRooms: 5, availableRooms: 2, amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Balcony', 'Butler Service'], maxOccupancy: 6 }
        ],
        description: 'Luxury hotel in the heart of Mumbai with stunning city views',
        amenities: ['Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Business Center', 'Valet Parking'],
        images: [
          { url: '/src/assets/Component/Image/HomePage/Popular Hotel/hotel1.jpg', alt: 'Hotel Royal Palace Mumbai Exterior', category: 'exterior' },
          { url: '/src/assets/Component/Image/HomePage/Gallery/gallery1.jpg', alt: 'Luxury Room', category: 'room' }
        ],
        rating: 4.8,
        contact: {
          phone: '+91-22-2345-6789',
          email: 'mumbai@hotelroyalpalace.com',
          website: 'https://hotelroyalpalace.com/mumbai'
        },
        address: {
          street: '456 Marine Drive',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400020',
          country: 'India',
          coordinates: { latitude: 19.0760, longitude: 72.8777 }
        },
        manager: {
          name: 'Rajesh Kumar',
          phone: '+91-98765-43210',
          email: 'rajesh.kumar@hotelroyalpalace.com',
          employeeId: 'HRP-MUM-001'
        }
      },
      {
        name: 'Hotel Royal Palace Delhi',
        hotelCode: 'HRP-DEL',
        location: 'New Delhi',
        basePrice: 7500,
        roomTypes: [
          { type: 'Standard', price: 7500, totalRooms: 60, availableRooms: 40, amenities: ['AC', 'WiFi', 'TV'], maxOccupancy: 2 },
          { type: 'Deluxe', price: 11000, totalRooms: 35, availableRooms: 25, amenities: ['AC', 'WiFi', 'TV', 'Mini Bar'], maxOccupancy: 3 },
          { type: 'Suite', price: 18000, totalRooms: 20, availableRooms: 12, amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Balcony'], maxOccupancy: 4 }
        ],
        description: 'Premier hotel near India Gate with excellent connectivity',
        amenities: ['Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Conference Hall', 'Airport Shuttle'],
        images: [
          { url: '/src/assets/Component/Image/HomePage/Popular Hotel/hotel2.jpg', alt: 'Hotel Royal Palace Delhi', category: 'exterior' }
        ],
        rating: 4.6,
        contact: {
          phone: '+91-11-2345-6789',
          email: 'delhi@hotelroyalpalace.com'
        },
        address: {
          street: '789 Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
          coordinates: { latitude: 28.6139, longitude: 77.2090 }
        },
        manager: {
          name: 'Priya Sharma',
          phone: '+91-98765-43211',
          email: 'priya.sharma@hotelroyalpalace.com',
          employeeId: 'HRP-DEL-001'
        }
      },
      {
        name: 'Hotel Royal Palace Goa',
        hotelCode: 'HRP-GOA',
        location: 'Goa',
        basePrice: 9000,
        roomTypes: [
          { type: 'Standard', price: 9000, totalRooms: 40, availableRooms: 25, amenities: ['AC', 'WiFi', 'TV', 'Beach View'], maxOccupancy: 2 },
          { type: 'Deluxe', price: 13500, totalRooms: 25, availableRooms: 15, amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Beach View'], maxOccupancy: 3 },
          { type: 'Suite', price: 22000, totalRooms: 15, availableRooms: 8, amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Private Beach Access'], maxOccupancy: 4 }
        ],
        description: 'Beachfront resort with pristine beaches and water sports',
        amenities: ['Private Beach', 'Water Sports', 'Spa', 'Beach Bar', 'Restaurant', 'Pool'],
        images: [
          { url: '/src/assets/Component/Image/HomePage/Popular Hotel/hotel3.jpg', alt: 'Hotel Royal Palace Goa Beach', category: 'exterior' }
        ],
        rating: 4.9,
        contact: {
          phone: '+91-832-234-5678',
          email: 'goa@hotelroyalpalace.com'
        },
        address: {
          street: 'Calangute Beach Road',
          city: 'Calangute',
          state: 'Goa',
          zipCode: '403516',
          country: 'India',
          coordinates: { latitude: 15.5440, longitude: 73.7554 }
        },
        manager: {
          name: 'Carlos D\'Souza',
          phone: '+91-98765-43212',
          email: 'carlos.dsouza@hotelroyalpalace.com',
          employeeId: 'HRP-GOA-001'
        }
      }
    ];

    const createdHotels = [];
    for (const hotelData of hotels) {
      const hotel = new Hotel({
        ...hotelData,
        chainId: hotelChain._id
      });
      await hotel.save();
      createdHotels.push(hotel);
    }

    console.log('🏨 Created hotels');

    // Update hotel chain with totals
    const totalHotels = createdHotels.length;
    const totalRooms = createdHotels.reduce((sum, hotel) => sum + hotel.totalRooms, 0);

    await HotelChain.findByIdAndUpdate(hotelChain._id, {
      totalHotels,
      totalRooms
    });

    // Create Staff Members
    const staffMembers = [
      // Mumbai Staff
      {
        employeeId: 'HRP-MUM-001',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@hotelroyalpalace.com',
        phone: '+91-98765-43210',
        hotelId: createdHotels[0]._id,
        chainId: hotelChain._id,
        department: 'Management',
        position: 'General Manager',
        role: 'Hotel Manager',
        password: 'manager123',
        hireDate: new Date('2020-01-15'),
        salary: 80000,
        permissions: {
          canViewReports: true,
          canManageBookings: true,
          canManageStaff: true,
          canManageInventory: true,
          canAccessFinancials: true,
          canManageRooms: true,
          canProcessPayments: true
        }
      },
      {
        employeeId: 'HRP-MUM-002',
        firstName: 'Anita',
        lastName: 'Patel',
        email: 'anita.patel@hotelroyalpalace.com',
        phone: '+91-98765-43213',
        hotelId: createdHotels[0]._id,
        chainId: hotelChain._id,
        department: 'Front Desk',
        position: 'Front Desk Manager',
        role: 'Supervisor',
        password: 'staff123',
        hireDate: new Date('2021-03-10'),
        salary: 45000,
        permissions: {
          canViewReports: true,
          canManageBookings: true,
          canManageRooms: true,
          canProcessPayments: true
        }
      },
      // Delhi Staff
      {
        employeeId: 'HRP-DEL-001',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@hotelroyalpalace.com',
        phone: '+91-98765-43211',
        hotelId: createdHotels[1]._id,
        chainId: hotelChain._id,
        department: 'Management',
        position: 'General Manager',
        role: 'Hotel Manager',
        password: 'manager123',
        hireDate: new Date('2019-06-20'),
        salary: 85000,
        permissions: {
          canViewReports: true,
          canManageBookings: true,
          canManageStaff: true,
          canManageInventory: true,
          canAccessFinancials: true,
          canManageRooms: true,
          canProcessPayments: true
        }
      },
      // Goa Staff
      {
        employeeId: 'HRP-GOA-001',
        firstName: 'Carlos',
        lastName: 'D\'Souza',
        email: 'carlos.dsouza@hotelroyalpalace.com',
        phone: '+91-98765-43212',
        hotelId: createdHotels[2]._id,
        chainId: hotelChain._id,
        department: 'Management',
        position: 'Resort Manager',
        role: 'Hotel Manager',
        password: 'manager123',
        hireDate: new Date('2020-08-05'),
        salary: 75000,
        permissions: {
          canViewReports: true,
          canManageBookings: true,
          canManageStaff: true,
          canManageInventory: true,
          canAccessFinancials: true,
          canManageRooms: true,
          canProcessPayments: true
        }
      },
      // Chain Admin
      {
        employeeId: 'HRP-ADMIN-001',
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram.singh@hotelroyalpalace.com',
        phone: '+91-98765-43200',
        hotelId: createdHotels[0]._id, // Based in Mumbai
        chainId: hotelChain._id,
        department: 'Management',
        position: 'Chain Administrator',
        role: 'Chain Admin',
        password: 'admin123',
        hireDate: new Date('2018-01-01'),
        salary: 120000,
        permissions: {
          canViewReports: true,
          canManageBookings: true,
          canManageStaff: true,
          canManageInventory: true,
          canAccessFinancials: true,
          canManageRooms: true,
          canProcessPayments: true
        }
      }
    ];

    for (const staffData of staffMembers) {
      const staff = new Staff(staffData);
      await staff.save();
    }

    console.log('👥 Created staff members');

    // Create Sample Inventory Items
    const inventoryItems = [
      // Mumbai Hotel Inventory
      {
        itemCode: 'HRP-MUM-TV001',
        itemName: '55" Smart TV',
        description: 'Samsung 55-inch Smart LED TV for guest rooms',
        hotelId: createdHotels[0]._id,
        chainId: hotelChain._id,
        location: {
          department: 'Guest Rooms',
          floor: 'All Floors',
          building: 'Main Building'
        },
        category: 'Electronics',
        subCategory: 'Television',
        currentStock: 100,
        minimumStock: 10,
        maximumStock: 120,
        unit: 'pieces',
        unitCost: 45000,
        supplier: {
          name: 'Samsung Electronics',
          contact: {
            phone: '+91-22-1234-5678',
            email: 'sales@samsung.com'
          },
          supplierCode: 'SAM001'
        },
        lastPurchaseDate: new Date('2023-01-15'),
        warrantyExpiry: new Date('2025-01-15')
      },
      {
        itemCode: 'HRP-MUM-LIN001',
        itemName: 'Bed Sheets Set',
        description: 'Premium cotton bed sheets set - King size',
        hotelId: createdHotels[0]._id,
        chainId: hotelChain._id,
        location: {
          department: 'Housekeeping',
          room: 'Linen Storage',
          floor: 'Ground Floor'
        },
        category: 'Linens',
        subCategory: 'Bed Linens',
        currentStock: 200,
        minimumStock: 50,
        maximumStock: 300,
        unit: 'sets',
        unitCost: 2500,
        supplier: {
          name: 'Premium Textiles Ltd',
          contact: {
            phone: '+91-22-9876-5432',
            email: 'orders@premiumtextiles.com'
          }
        }
      }
    ];

    for (const inventoryData of inventoryItems) {
      const inventory = new Inventory(inventoryData);
      await inventory.save();
    }

    console.log('📦 Created inventory items');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Hotel Chain: ${hotelChain.chainName}`);
    console.log(`   • Hotels: ${createdHotels.length}`);
    console.log(`   • Staff Members: ${staffMembers.length}`);
    console.log(`   • Inventory Items: ${inventoryItems.length}`);

    console.log('\n🔐 Login Credentials:');
    console.log('   Chain Admin: vikram.singh@hotelroyalpalace.com / admin123');
    console.log('   Mumbai Manager: rajesh.kumar@hotelroyalpalace.com / manager123');
    console.log('   Delhi Manager: priya.sharma@hotelroyalpalace.com / manager123');
    console.log('   Goa Manager: carlos.dsouza@hotelroyalpalace.com / manager123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
