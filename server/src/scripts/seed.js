import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from '../models/Event.js';

dotenv.config();

const events = [
  {
    title: "Tech Conference 2025",
    description: "A global conference for software developers and engineers.",
    date: "2025-07-15T09:00:00Z",
    location: "Hội trường A - ĐH Bách Khoa",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070",
    price: 200,
    capacity: 300,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Technology",
    status: "published",
    ticketTypes: [
      {
        name: "Standard",
        price: 200,
        quantity: 200,
        description: "Access to all sessions and lunch"
      },
      {
        name: "VIP",
        price: 400,
        quantity: 100,
        description: "Includes premium seating and networking dinner"
      }
    ]
  },
  {
    title: "Music Fest Summer 2025",
    description: "An outdoor music festival featuring top Vietnamese artists.",
    date: "2025-08-20T17:00:00Z",
    location: "Sân vận động Quốc Gia Mỹ Đình",
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070",
    price: 150,
    capacity: 500,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Entertainment",
    status: "published",
    ticketTypes: [
      {
        name: "General Admission",
        price: 150,
        quantity: 400
      },
      {
        name: "Front Row",
        price: 300,
        quantity: 100,
        description: "Standing zone near the stage"
      }
    ]
  },
  {
    title: "Startup Networking Night",
    description: "Connect with fellow entrepreneurs and investors in a casual setting.",
    date: "2025-06-10T18:00:00Z",
    location: "WeWork Saigon Centre",
    img: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074",
    price: 50,
    capacity: 100,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Business",
    status: "published",
    ticketTypes: [
      {
        name: "Early Bird",
        price: 50,
        quantity: 50,
        description: "Includes drinks and appetizers"
      },
      {
        name: "Regular",
        price: 75,
        quantity: 50,
        description: "Includes drinks, appetizers, and networking materials"
      }
    ]
  },
  {
    title: "Food & Wine Festival 2025",
    description: "Experience the finest cuisines and wines from around the world.",
    date: "2025-09-05T11:00:00Z",
    location: "Landmark 81 Skyview",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070",
    price: 180,
    capacity: 200,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Food & Drink",
    status: "published",
    ticketTypes: [
      {
        name: "Tasting Pass",
        price: 180,
        quantity: 150,
        description: "Access to all food and wine tastings"
      },
      {
        name: "Premium Pass",
        price: 350,
        quantity: 50,
        description: "Includes exclusive masterclasses and VIP area access"
      }
    ]
  },
  {
    title: "AI & Machine Learning Workshop",
    description: "Hands-on workshop on implementing AI and ML solutions.",
    date: "2025-07-22T09:00:00Z",
    location: "FPT University",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070",
    price: 250,
    capacity: 50,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Technology",
    status: "published",
    ticketTypes: [
      {
        name: "Workshop Pass",
        price: 250,
        quantity: 40,
        description: "Includes workshop materials and lunch"
      },
      {
        name: "Premium Pass",
        price: 400,
        quantity: 10,
        description: "Includes one-on-one mentoring session"
      }
    ]
  },
  {
    title: "Fashion Week Vietnam 2025",
    description: "Annual fashion event showcasing local and international designers.",
    date: "2025-10-15T10:00:00Z",
    location: "Gem Center",
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071",
    price: 300,
    capacity: 400,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Fashion",
    status: "published",
    ticketTypes: [
      {
        name: "Day Pass",
        price: 300,
        quantity: 300,
        description: "Access to all shows for one day"
      },
      {
        name: "VIP Pass",
        price: 800,
        quantity: 100,
        description: "Access to all shows, backstage tours, and exclusive parties"
      }
    ]
  },
  {
    title: "Marathon HCMC 2025",
    description: "Annual marathon through the heart of Ho Chi Minh City.",
    date: "2025-12-01T05:00:00Z",
    location: "Saigon Opera House",
    img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070",
    price: 100,
    capacity: 1000,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Sports",
    status: "published",
    ticketTypes: [
      {
        name: "5K Run",
        price: 100,
        quantity: 500,
        description: "Includes race kit and finisher medal"
      },
      {
        name: "Full Marathon",
        price: 200,
        quantity: 500,
        description: "Includes race kit, finisher medal, and post-race refreshments"
      }
    ]
  },
  {
    title: "Blockchain Summit 2025",
    description: "International conference on blockchain technology and cryptocurrencies.",
    date: "2025-11-10T09:00:00Z",
    location: "Rex Hotel",
    img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070",
    price: 350,
    capacity: 200,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Technology",
    status: "published",
    ticketTypes: [
      {
        name: "Conference Pass",
        price: 350,
        quantity: 150,
        description: "Access to all sessions and networking events"
      },
      {
        name: "Workshop Pass",
        price: 500,
        quantity: 50,
        description: "Includes hands-on workshops and private networking"
      }
    ]
  },
  {
    title: "Art Exhibition: Modern Vietnam",
    description: "Contemporary art exhibition featuring Vietnamese artists.",
    date: "2025-09-20T10:00:00Z",
    location: "HCMC Museum of Fine Arts",
    img: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2070",
    price: 80,
    capacity: 150,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Arts",
    status: "published",
    ticketTypes: [
      {
        name: "General Admission",
        price: 80,
        quantity: 100,
        description: "Access to all exhibition areas"
      },
      {
        name: "Guided Tour",
        price: 150,
        quantity: 50,
        description: "Includes private guided tour and catalog"
      }
    ]
  },
  {
    title: "Gaming Convention 2025",
    description: "Annual gaming convention featuring latest games and esports tournaments.",
    date: "2025-08-05T10:00:00Z",
    location: "SECC Exhibition Center",
    img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070",
    price: 120,
    capacity: 1000,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Gaming",
    status: "published",
    ticketTypes: [
      {
        name: "Day Pass",
        price: 120,
        quantity: 800,
        description: "Access to all gaming areas and tournaments"
      },
      {
        name: "VIP Pass",
        price: 300,
        quantity: 200,
        description: "Includes exclusive gaming sessions and meet & greet"
      }
    ]
  },
  {
    title: "Photography Workshop",
    description: "Learn professional photography techniques from experts.",
    date: "2025-07-08T09:00:00Z",
    location: "Saigon Photography Center",
    img: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2070",
    price: 150,
    capacity: 30,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Photography",
    status: "published",
    ticketTypes: [
      {
        name: "Basic Workshop",
        price: 150,
        quantity: 20,
        description: "Includes basic equipment and materials"
      },
      {
        name: "Advanced Workshop",
        price: 250,
        quantity: 10,
        description: "Includes professional equipment and one-on-one mentoring"
      }
    ]
  },
  {
    title: "Business Leadership Summit",
    description: "Conference for business leaders and entrepreneurs.",
    date: "2025-10-25T08:00:00Z",
    location: "Grand Hotel Saigon",
    img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2070",
    price: 400,
    capacity: 150,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Business",
    status: "published",
    ticketTypes: [
      {
        name: "Conference Pass",
        price: 400,
        quantity: 100,
        description: "Access to all sessions and networking events"
      },
      {
        name: "Executive Pass",
        price: 800,
        quantity: 50,
        description: "Includes private meetings and exclusive workshops"
      }
    ]
  },
  {
    title: "Cooking Masterclass",
    description: "Learn authentic Vietnamese cuisine from master chefs.",
    date: "2025-09-15T14:00:00Z",
    location: "Saigon Culinary Academy",
    img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070",
    price: 180,
    capacity: 20,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Food & Drink",
    status: "published",
    ticketTypes: [
      {
        name: "Basic Class",
        price: 180,
        quantity: 15,
        description: "Learn 3 traditional dishes"
      },
      {
        name: "Master Class",
        price: 300,
        quantity: 5,
        description: "Learn 5 advanced dishes with wine pairing"
      }
    ]
  },
  {
    title: "Yoga Festival 2025",
    description: "Weekend yoga festival with workshops and meditation sessions.",
    date: "2025-11-15T07:00:00Z",
    location: "Tao Dan Park",
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070",
    price: 120,
    capacity: 200,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Wellness",
    status: "published",
    ticketTypes: [
      {
        name: "Day Pass",
        price: 120,
        quantity: 150,
        description: "Access to all yoga sessions"
      },
      {
        name: "Weekend Pass",
        price: 250,
        quantity: 50,
        description: "Includes all sessions and wellness workshops"
      }
    ]
  },
  {
    title: "Film Festival 2025",
    description: "International film festival showcasing independent cinema.",
    date: "2025-10-01T18:00:00Z",
    location: "BHD Star Cinema",
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070",
    price: 100,
    capacity: 300,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Film",
    status: "published",
    ticketTypes: [
      {
        name: "Film Pass",
        price: 100,
        quantity: 250,
        description: "Access to all film screenings"
      },
      {
        name: "VIP Pass",
        price: 300,
        quantity: 50,
        description: "Includes opening ceremony and meet & greet"
      }
    ]
  },
  {
    title: "Tech Startup Pitch Day",
    description: "Pitch competition for tech startups seeking investment.",
    date: "2025-08-25T13:00:00Z",
    location: "Dreamplex Coworking Space",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070",
    price: 50,
    capacity: 100,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Business",
    status: "published",
    ticketTypes: [
      {
        name: "Audience Pass",
        price: 50,
        quantity: 80,
        description: "Access to pitch sessions and networking"
      },
      {
        name: "Investor Pass",
        price: 200,
        quantity: 20,
        description: "Includes private meetings with startups"
      }
    ]
  },
  {
    title: "Jazz Night",
    description: "Evening of live jazz music featuring local and international artists.",
    date: "2025-09-30T19:00:00Z",
    location: "Saigon Opera House",
    img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2070",
    price: 150,
    capacity: 200,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Music",
    status: "published",
    ticketTypes: [
      {
        name: "Standard",
        price: 150,
        quantity: 150,
        description: "General seating"
      },
      {
        name: "Premium",
        price: 300,
        quantity: 50,
        description: "VIP seating with complimentary drinks"
      }
    ]
  },
  {
    title: "Digital Marketing Conference",
    description: "Conference on latest trends in digital marketing and social media.",
    date: "2025-11-20T09:00:00Z",
    location: "Pullman Saigon Centre",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070",
    price: 250,
    capacity: 150,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Marketing",
    status: "published",
    ticketTypes: [
      {
        name: "Conference Pass",
        price: 250,
        quantity: 100,
        description: "Access to all sessions"
      },
      {
        name: "Workshop Pass",
        price: 400,
        quantity: 50,
        description: "Includes hands-on workshops and case studies"
      }
    ]
  },
  {
    title: "Comic Con Vietnam 2025",
    description: "Annual comic and pop culture convention.",
    date: "2025-12-10T10:00:00Z",
    location: "SECC Exhibition Center",
    img: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?q=80&w=2070",
    price: 100,
    capacity: 1000,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Entertainment",
    status: "published",
    ticketTypes: [
      {
        name: "Day Pass",
        price: 100,
        quantity: 800,
        description: "Access to all areas and activities"
      },
      {
        name: "VIP Pass",
        price: 250,
        quantity: 200,
        description: "Includes exclusive meet & greets and collectibles"
      }
    ]
  },
  {
    title: "Architecture Exhibition",
    description: "Showcase of innovative architectural designs and urban planning.",
    date: "2025-10-10T10:00:00Z",
    location: "HCMC Architecture University",
    img: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070",
    price: 80,
    capacity: 100,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Architecture",
    status: "published",
    ticketTypes: [
      {
        name: "General Admission",
        price: 80,
        quantity: 80,
        description: "Access to all exhibitions"
      },
      {
        name: "Guided Tour",
        price: 150,
        quantity: 20,
        description: "Includes private tour with architects"
      }
    ]
  },
  {
    title: "Cybersecurity Workshop",
    description: "Hands-on workshop on cybersecurity and ethical hacking.",
    date: "2025-09-05T09:00:00Z",
    location: "FPT University",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070",
    price: 200,
    capacity: 40,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Technology",
    status: "published",
    ticketTypes: [
      {
        name: "Basic Workshop",
        price: 200,
        quantity: 30,
        description: "Includes basic security tools and materials"
      },
      {
        name: "Advanced Workshop",
        price: 350,
        quantity: 10,
        description: "Includes advanced tools and certification"
      }
    ]
  },
  {
    title: "Dance Competition 2025",
    description: "Annual dance competition featuring various styles.",
    date: "2025-11-25T14:00:00Z",
    location: "Hoa Binh Theater",
    img: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=2070",
    price: 120,
    capacity: 300,
    organizerId: "663a173c00a7b9a389f3df10",
    category: "Dance",
    status: "published",
    ticketTypes: [
      {
        name: "Audience Pass",
        price: 120,
        quantity: 250,
        description: "Access to all competition rounds"
      },
      {
        name: "VIP Pass",
        price: 250,
        quantity: 50,
        description: "Includes backstage access and meet & greet"
      }
    ]
  }
];

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Insert new events
    await Event.insertMany(events);
    console.log('Successfully seeded events');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedEvents(); 