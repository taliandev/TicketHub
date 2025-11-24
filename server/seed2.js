import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ticket from './src/models/Ticket.js';
import { Event } from './src/models/Event.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tickhub';

async function seedTickets() {
  await mongoose.connect(MONGODB_URI);
  const events = await Event.find();
  if (!events.length) {
    console.log('No events found. Please seed events first.');
    process.exit(0);
  }
  let tickets = [];
  for (const event of events) {
    for (const ticketType of event.ticketTypes) {
      for (let i = 0; i < ticketType.quantity; i++) {
        tickets.push({
          eventId: event._id,
          type: ticketType.name,
          price: ticketType.price,
          status: 'available',
          ticketCode: 'TKT-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          qrCode: 'QR-' + Math.random().toString(36).substring(2, 12),
        });
      }
    }
  }
  await Ticket.insertMany(tickets);
  console.log(`Seeded ${tickets.length} tickets for all events.`);
  process.exit(0);
}

seedTickets().catch(err => {
  console.error('Error seeding tickets:', err);
  process.exit(1);
}); 