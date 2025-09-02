const { generatePDF } = require('./pdfGenerator');

// Test PDF generation with sample booking data
const testPDFGeneration = async () => {
  const sampleBooking = {
    bookingId: 'HRP-TEST-12345',
    customerName: 'John Doe',
    email: 'john@example.com',
    phone_number: '+91-9876543210',
    hotelName: 'Hotel Novotel',
    location: 'kolkata',
    checkIn: new Date('2025-01-15'),
    checkOut: new Date('2025-01-17'),
    guests: 2,
    price: 5000,
    totalNights: 2,
    rooms: 1,
    paymentMethod: 'Google Pay',
    paymentStatus: 'Completed',
    createdAt: new Date()
  };

  const sampleHotel = {
    name: 'Hotel Novotel',
    location: 'kolkata',
    contact: {
      phone: '+91-33-2288-3939',
      email: 'reservations@novotelkolkata.com'
    }
  };

  try {
    console.log('🧪 Testing PDF generation...');
    const pdfPath = await generatePDF(sampleBooking, sampleHotel);
    console.log('✅ PDF generated successfully:', pdfPath);
    return true;
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    return false;
  }
};

// Run test if called directly
if (require.main === module) {
  testPDFGeneration().then(() => process.exit(0));
}

module.exports = { testPDFGeneration };
