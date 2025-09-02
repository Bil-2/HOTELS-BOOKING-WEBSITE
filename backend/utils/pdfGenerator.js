const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure receipts directory exists
const receiptsDir = path.join(__dirname, '../receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

const generatePDF = async (booking, hotel = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `${booking.bookingId}.pdf`;
      const filepath = path.join(receiptsDir, filename);

      // Pipe the PDF to a file
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(20)
        .fillColor('#d32f2f')
        .text('Hotel Royal Palace', 50, 50)
        .fontSize(14)
        .fillColor('#666666')
        .text('Booking Confirmation Receipt', 50, 80);

      // Booking ID and Date
      doc.fontSize(12)
        .fillColor('#000000')
        .text(`Booking ID: ${booking.bookingId}`, 50, 120)
        .text(`Date: ${new Date(booking.createdAt).toLocaleDateString('en-IN')}`, 50, 140);

      // Customer Information Section
      doc.fontSize(16)
        .fillColor('#d32f2f')
        .text('Customer Information', 50, 180);

      doc.fontSize(12)
        .fillColor('#000000')
        .text(`Name: ${booking.customerName}`, 50, 210)
        .text(`Email: ${booking.email}`, 50, 230)
        .text(`Phone: ${booking.phone_number}`, 50, 250)
        .text(`Guests: ${booking.guests}`, 50, 270);

      // Hotel Information Section
      doc.fontSize(16)
        .fillColor('#d32f2f')
        .text('Hotel Information', 50, 310);

      doc.fontSize(12)
        .fillColor('#000000')
        .text(`Hotel: ${booking.hotelName}`, 50, 340)
        .text(`Location: ${booking.location}`, 50, 360);

      if (hotel && hotel.contact) {
        if (hotel.contact.phone) {
          doc.text(`Hotel Phone: ${hotel.contact.phone}`, 50, 380);
        }
        if (hotel.contact.email) {
          doc.text(`Hotel Email: ${hotel.contact.email}`, 50, 400);
        }
      }

      // Booking Details Section
      doc.fontSize(16)
        .fillColor('#d32f2f')
        .text('Booking Details', 50, 440);

      const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN');
      const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN');

      doc.fontSize(12)
        .fillColor('#000000')
        .text(`Check-in: ${checkInDate}`, 50, 470)
        .text(`Check-out: ${checkOutDate}`, 50, 490)
        .text(`Total Nights: ${booking.totalNights || 1}`, 50, 510)
        .text(`Rooms: ${booking.rooms || 1}`, 50, 530);

      // Payment Information Section
      doc.fontSize(16)
        .fillColor('#d32f2f')
        .text('Payment Information', 50, 570);

      doc.fontSize(12)
        .fillColor('#000000')
        .text(`Payment Method: ${booking.paymentMethod}`, 50, 600)
        .text(`Payment Status: ${booking.paymentStatus}`, 50, 620);

      // Price Breakdown
      doc.fontSize(14)
        .fillColor('#d32f2f')
        .text('Price Breakdown', 50, 660);

      const pricePerNight = booking.price || 0;
      const nights = booking.totalNights || 1;
      const rooms = booking.rooms || 1;
      const subtotal = pricePerNight * nights * rooms;
      const tax = subtotal * 0.12; // 12% GST
      const total = subtotal + tax;

      doc.fontSize(12)
        .fillColor('#000000')
        .text(`Price per night: Rs.${pricePerNight.toLocaleString('en-IN')}`, 50, 690)
        .text(`Nights: ${nights}`, 50, 710)
        .text(`Rooms: ${rooms}`, 50, 730)
        .text(`Subtotal: Rs.${subtotal.toLocaleString('en-IN')}`, 50, 750)
        .text(`GST (12%): Rs.${tax.toLocaleString('en-IN')}`, 50, 770);

      // Total Amount (highlighted)
      doc.fontSize(14)
        .fillColor('#d32f2f')
        .text(`Total Amount: Rs.${total.toLocaleString('en-IN')}`, 50, 800);

      // Footer
      doc.fontSize(10)
        .fillColor('#666666')
        .text('Thank you for choosing Hotel Royal Palace!', 50, 850)
        .text('For any queries, please contact us at RoyalHotel@info.com', 50, 870)
        .text('This is a computer-generated receipt.', 50, 890);

      // Terms and Conditions
      doc.fontSize(8)
        .fillColor('#999999')
        .text('Terms & Conditions:', 50, 920)
        .text('• Check-in time: 2:00 PM | Check-out time: 12:00 PM', 50, 935)
        .text('• Cancellation policy applies as per hotel terms', 50, 950)
        .text('• Valid ID proof required at check-in', 50, 965);

      // Finalize the PDF
      doc.end();

      doc.on('end', () => {
        console.log(`✅ PDF generated: ${filepath}`);
        resolve(filepath);
      });

      doc.on('error', (error) => {
        console.error('❌ PDF generation error:', error);
        reject(error);
      });

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      reject(error);
    }
  });
};

module.exports = { generatePDF };
