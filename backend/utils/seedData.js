const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');

const sampleHotels = [
  {
    name: "Hotel Novotel",
    location: "kolkata",
    price: 5000,
    description: "A luxurious business hotel in the heart of Kolkata with modern amenities and excellent service.",
    amenities: ["WiFi", "Swimming Pool", "Gym", "Restaurant", "Room Service", "Parking"],
    rating: 4.5,
    totalRooms: 150,
    availableRooms: 120,
    contact: {
      phone: "+91-33-2288-3939",
      email: "reservations@novotelkolkata.com"
    },
    address: {
      street: "JA-1, Sector III, Salt Lake City",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700098",
      country: "India"
    }
  },
  {
    name: "Hotel Apex International",
    location: "Mumbai",
    price: 9000,
    description: "Premium hotel in Mumbai offering world-class hospitality and stunning city views.",
    amenities: ["WiFi", "Spa", "Business Center", "Restaurant", "Bar", "Concierge"],
    rating: 4.3,
    totalRooms: 200,
    availableRooms: 180,
    contact: {
      phone: "+91-22-6789-1234",
      email: "info@apexmumbai.com"
    },
    address: {
      street: "Linking Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    }
  },
  {
    name: "Hotel St Laurn",
    location: "Pune",
    price: 5000,
    description: "Elegant hotel in Pune with contemporary design and excellent dining options.",
    amenities: ["WiFi", "Restaurant", "Conference Hall", "Parking", "Laundry"],
    rating: 4.2,
    totalRooms: 80,
    availableRooms: 65,
    contact: {
      phone: "+91-20-2567-8900",
      email: "bookings@stlaurpune.com"
    },
    address: {
      street: "Koregaon Park",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001",
      country: "India"
    }
  },
  {
    name: "Hotel Anjata",
    location: "Delhi",
    price: 6000,
    description: "Comfortable accommodation in Delhi with easy access to major attractions.",
    amenities: ["WiFi", "Restaurant", "Room Service", "Airport Transfer", "Travel Desk"],
    rating: 4.0,
    totalRooms: 100,
    availableRooms: 85,
    contact: {
      phone: "+91-11-4567-8901",
      email: "reservations@anjatadelhi.com"
    },
    address: {
      street: "Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    }
  },
  {
    name: "Hotel Phoneix International",
    location: "Mumbai",
    price: 8000,
    description: "International standard hotel in Mumbai with premium facilities and services.",
    amenities: ["WiFi", "Swimming Pool", "Gym", "Spa", "Multiple Restaurants", "Valet Parking"],
    rating: 4.4,
    totalRooms: 250,
    availableRooms: 200,
    contact: {
      phone: "+91-22-3456-7890",
      email: "info@phoneixmumbai.com"
    },
    address: {
      street: "Juhu Beach Road",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400049",
      country: "India"
    }
  },
  {
    name: "Hotel Grand Choice",
    location: "Beed",
    price: 8000,
    description: "Grand hotel in Beed offering comfortable stay with traditional hospitality.",
    amenities: ["WiFi", "Restaurant", "Banquet Hall", "Parking", "Room Service"],
    rating: 3.8,
    totalRooms: 60,
    availableRooms: 45,
    contact: {
      phone: "+91-2442-234567",
      email: "info@grandchoicebeed.com"
    },
    address: {
      street: "Station Road",
      city: "Beed",
      state: "Maharashtra",
      zipCode: "431122",
      country: "India"
    }
  },
  {
    name: "Hotel Grand Yashoda",
    location: "Beed",
    price: 9000,
    description: "Luxury hotel in Beed with modern amenities and excellent service standards.",
    amenities: ["WiFi", "Restaurant", "Conference Room", "Gym", "Parking", "Laundry"],
    rating: 4.1,
    totalRooms: 75,
    availableRooms: 60,
    contact: {
      phone: "+91-2442-345678",
      email: "reservations@grandyashodabeed.com"
    },
    address: {
      street: "Main Market Road",
      city: "Beed",
      state: "Maharashtra",
      zipCode: "431122",
      country: "India"
    }
  },
  {
    name: "Hotel Sai International",
    location: "Latur",
    price: 2000,
    description: "Budget-friendly hotel in Latur with clean rooms and basic amenities.",
    amenities: ["WiFi", "Restaurant", "Parking", "Room Service"],
    rating: 3.5,
    totalRooms: 40,
    availableRooms: 30,
    contact: {
      phone: "+91-2382-123456",
      email: "info@saiinternationallatur.com"
    },
    address: {
      street: "Barshi Road",
      city: "Latur",
      state: "Maharashtra",
      zipCode: "413512",
      country: "India"
    }
  },
  {
    name: "Hotel Anjani",
    location: "Latur",
    price: 9000,
    description: "Premium hotel in Latur offering luxury accommodation and fine dining.",
    amenities: ["WiFi", "Swimming Pool", "Restaurant", "Bar", "Spa", "Business Center"],
    rating: 4.3,
    totalRooms: 90,
    availableRooms: 75,
    contact: {
      phone: "+91-2382-234567",
      email: "bookings@anjanilatur.com"
    },
    address: {
      street: "MIDC Road",
      city: "Latur",
      state: "Maharashtra",
      zipCode: "413531",
      country: "India"
    }
  },
  {
    name: "Hotel Ranjeet",
    location: "Akola",
    price: 7000,
    description: "Comfortable hotel in Akola with good facilities and friendly service.",
    amenities: ["WiFi", "Restaurant", "Conference Hall", "Parking", "Travel Desk"],
    rating: 3.9,
    totalRooms: 70,
    availableRooms: 55,
    contact: {
      phone: "+91-724-234567",
      email: "info@ranjeetakola.com"
    },
    address: {
      street: "Civil Lines",
      city: "Akola",
      state: "Maharashtra",
      zipCode: "444001",
      country: "India"
    }
  },
  {
    name: "Hotel Taj Palace",
    location: "New Delhi",
    price: 5000,
    description: "Heritage hotel in New Delhi combining traditional charm with modern comfort.",
    amenities: ["WiFi", "Multiple Restaurants", "Spa", "Pool", "Business Center", "Concierge"],
    rating: 4.6,
    totalRooms: 300,
    availableRooms: 250,
    contact: {
      phone: "+91-11-6611-2233",
      email: "reservations@tajpalacedelhi.com"
    },
    address: {
      street: "Sardar Patel Marg",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110021",
      country: "India"
    }
  }
];

const seedHotels = async () => {
  try {
    console.log('🌱 Starting hotel data seeding...');

    // Clear existing hotels
    await Hotel.deleteMany({});
    console.log('🗑️ Cleared existing hotel data');

    // Insert sample hotels
    const insertedHotels = await Hotel.insertMany(sampleHotels);
    console.log(`✅ Successfully seeded ${insertedHotels.length} hotels`);

    return insertedHotels;
  } catch (error) {
    console.error('❌ Error seeding hotels:', error);
    throw error;
  }
};

module.exports = { seedHotels, sampleHotels };
