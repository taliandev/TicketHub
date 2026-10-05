import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from './src/models/Event.js';

dotenv.config();

async function checkTicketPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all published, upcoming events
    const events = await Event.find({
      status: 'published',
      date: { $gte: new Date() }
    }).select('title ticketTypes');

    console.log(`📊 Found ${events.length} published upcoming events\n`);

    // Check ticket types for each event
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   ID: ${event._id}`);
      
      if (!event.ticketTypes || event.ticketTypes.length === 0) {
        console.log('   ❌ No ticket types');
      } else {
        console.log(`   Tickets (${event.ticketTypes.length}):`);
        event.ticketTypes.forEach(ticket => {
          console.log(`      - ${ticket.name}: ${ticket.price}đ (${ticket.available} available)`);
        });
        
        // Check price range
        const prices = event.ticketTypes.map(t => t.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        console.log(`   💰 Price range: ${minPrice}đ - ${maxPrice}đ`);
      }
      console.log('');
    });

    // Test price filter logic
    console.log('\n🧪 Testing price filter: 0đ - 2,000,000đ\n');
    const testMin = 0;
    const testMax = 2000000;
    
    const matchingEvents = events.filter(event => {
      if (!event.ticketTypes || event.ticketTypes.length === 0) return false;
      
      return event.ticketTypes.some(ticket => {
        const price = ticket.price || 0;
        const available = ticket.available || 0;
        return price >= testMin && price <= testMax && available > 0;
      });
    });

    console.log(`✅ ${matchingEvents.length} events match the filter:`);
    matchingEvents.forEach(event => {
      console.log(`   - ${event.title}`);
      const matchingTickets = event.ticketTypes.filter(t => 
        t.price >= testMin && t.price <= testMax && t.available > 0
      );
      matchingTickets.forEach(ticket => {
        console.log(`     → ${ticket.name}: ${ticket.price}đ (${ticket.available} available)`);
      });
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTicketPrices();
