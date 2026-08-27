import mongoose from 'mongoose';
import Ticket from './src/models/Ticket.js';
import dotenv from 'dotenv';

dotenv.config();

const checkTickets = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const eventId = '694a734c4074c5d6336cd3e3';
    
    const tickets = await Ticket.find({ 
      eventId: new mongoose.Types.ObjectId(eventId),
      status: { $in: ['paid', 'used'] }
    }).select('type price quantity_total status createdAt');


    let totalRevenue = 0;
    let totalQuantity = 0;

    tickets.forEach((ticket, index) => {

      totalRevenue += ticket.price;
      totalQuantity += ticket.quantity_total;
    });


    if (totalRevenue !== 20000 * totalQuantity) {
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkTickets();
