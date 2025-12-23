import mongoose from 'mongoose';
import Ticket from './src/models/Ticket.js';
import dotenv from 'dotenv';

dotenv.config();

const checkTickets = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const eventId = '694a734c4074c5d6336cd3e3';
    
    const tickets = await Ticket.find({ 
      eventId: new mongoose.Types.ObjectId(eventId),
      status: { $in: ['paid', 'used'] }
    }).select('type price quantity_total status createdAt');

    console.log('\n=== Tickets for Tech Future Conference 2026 ===');
    console.log(`Total tickets found: ${tickets.length}\n`);

    let totalRevenue = 0;
    let totalQuantity = 0;

    tickets.forEach((ticket, index) => {
      console.log(`Ticket ${index + 1}:`);
      console.log(`  Type: ${ticket.type}`);
      console.log(`  Quantity: ${ticket.quantity_total}`);
      console.log(`  Price: ${ticket.price.toLocaleString()} VNĐ`);
      console.log(`  Status: ${ticket.status}`);
      console.log(`  Created: ${ticket.createdAt}`);
      console.log('');

      totalRevenue += ticket.price;
      totalQuantity += ticket.quantity_total;
    });

    console.log('=== Summary ===');
    console.log(`Total tickets purchased: ${totalQuantity}`);
    console.log(`Total revenue: ${totalRevenue.toLocaleString()} VNĐ`);
    console.log(`Expected (20,000 × ${totalQuantity}): ${(20000 * totalQuantity).toLocaleString()} VNĐ`);

    if (totalRevenue !== 20000 * totalQuantity) {
      console.log('\n⚠️  WARNING: Revenue mismatch!');
      console.log(`Difference: ${(totalRevenue - 20000 * totalQuantity).toLocaleString()} VNĐ`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkTickets();
