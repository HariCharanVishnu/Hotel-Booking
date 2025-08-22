import mongoose from 'mongoose';
import Hotel from './models/Hotel.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleHotels = [
  {
    name: "Luxury Resort & Spa",
    description: "Experience ultimate luxury with stunning ocean views, world-class amenities, and exceptional service.",
    address: "123 Beach Boulevard",
    city: "Miami",
    state: "Florida",
    country: "USA",
    zipCode: "33139",
    contact: "+1-305-555-0123",
    email: "info@luxuryresort.com",
    website: "https://luxuryresort.com",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
    ],
    amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym", "Beach Access"],
    rating: 4.8,
    totalReviews: 1247,
    priceRange: { min: 299, max: 899 },
    location: {
      type: "Point",
      coordinates: [-80.1918, 25.7617]
    }
  },
  {
    name: "Mountain View Lodge",
    description: "Nestled in the heart of the mountains, offering breathtaking views and outdoor adventures.",
    address: "456 Mountain Road",
    city: "Aspen",
    state: "Colorado",
    country: "USA",
    zipCode: "81611",
    contact: "+1-970-555-0456",
    email: "info@mountainlodge.com",
    website: "https://mountainlodge.com",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
    ],
    amenities: ["Free WiFi", "Skiing", "Restaurant", "Bar", "Room Service", "Free Breakfast"],
    rating: 4.6,
    totalReviews: 892,
    priceRange: { min: 199, max: 599 },
    location: {
      type: "Point",
      coordinates: [-106.8235, 39.1911]
    }
  },
  {
    name: "Urban Boutique Hotel",
    description: "Modern boutique hotel in the heart of the city, perfect for business and leisure travelers.",
    address: "789 Downtown Street",
    city: "New York",
    state: "New York",
    country: "USA",
    zipCode: "10001",
    contact: "+1-212-555-0789",
    email: "info@urbanboutique.com",
    website: "https://urbanboutique.com",
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
    ],
    amenities: ["Free WiFi", "Restaurant", "Bar", "Business Center", "Valet Parking", "Concierge"],
    rating: 4.4,
    totalReviews: 1563,
    priceRange: { min: 399, max: 1299 },
    location: {
      type: "Point",
      coordinates: [-74.0060, 40.7128]
    }
  },
  {
    name: "Tropical Paradise Resort",
    description: "Escape to paradise with pristine beaches, crystal clear waters, and tropical gardens.",
    address: "321 Island Way",
    city: "Honolulu",
    state: "Hawaii",
    country: "USA",
    zipCode: "96815",
    contact: "+1-808-555-0321",
    email: "info@tropicalparadise.com",
    website: "https://tropicalparadise.com",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"
    ],
    amenities: ["Free WiFi", "Pool", "Beach Access", "Water Sports", "Restaurant", "Spa"],
    rating: 4.9,
    totalReviews: 2103,
    priceRange: { min: 499, max: 1499 },
    location: {
      type: "Point",
      coordinates: [-157.8583, 21.3099]
    }
  },
  {
    name: "Historic Grand Hotel",
    description: "Step back in time at this beautifully restored historic hotel with modern luxury amenities.",
    address: "654 Heritage Avenue",
    city: "Charleston",
    state: "South Carolina",
    country: "USA",
    zipCode: "29401",
    contact: "+1-843-555-0654",
    email: "info@historicgrand.com",
    website: "https://historicgrand.com",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
    ],
    amenities: ["Free WiFi", "Restaurant", "Bar", "Concierge", "Valet Parking", "Historic Tours"],
    rating: 4.7,
    totalReviews: 1347,
    priceRange: { min: 299, max: 899 },
    location: {
      type: "Point",
      coordinates: [-79.9311, 32.7765]
    }
  }
];

const seedHotels = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking');
    console.log('✅ Connected to MongoDB');

    // Create a default owner user if it doesn't exist
    let owner = await User.findOne({ email: 'admin@hotelbooking.com' });
    if (!owner) {
      owner = await User.create({
        username: 'admin',
        email: 'admin@hotelbooking.com',
        clerkId: 'admin_clerk_id_123',
        role: 'hotelOwner'
      });
      console.log('✅ Created default owner user');
    }

    // Clear existing hotels
    await Hotel.deleteMany({});
    console.log('✅ Cleared existing hotels');

    // Add owner ID to sample hotels
    const hotelsWithOwner = sampleHotels.map(hotel => ({
      ...hotel,
      owner: owner._id
    }));

    // Insert sample hotels
    const createdHotels = await Hotel.insertMany(hotelsWithOwner);
    console.log(`✅ Created ${createdHotels.length} sample hotels`);

    // Display created hotels
    createdHotels.forEach(hotel => {
      console.log(`🏨 ${hotel.name} - ${hotel.city}, ${hotel.country}`);
    });

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedHotels();
