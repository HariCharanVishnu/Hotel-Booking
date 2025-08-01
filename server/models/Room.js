import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Single Bed', 'Double Bed', 'Twin Bed', 'Queen Bed', 'King Bed', 'Suite', 'Deluxe Suite']
  },
  roomNumber: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  size: {
    type: Number, // in square meters
    required: true
  },
  floor: {
    type: Number,
    default: 1
  },
  hasBalcony: {
    type: Boolean,
    default: false
  },
  hasOceanView: {
    type: Boolean,
    default: false
  },
  hasMountainView: {
    type: Boolean,
    default: false
  },
  isSmokingAllowed: {
    type: Boolean,
    default: false
  },
  isPetFriendly: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Room', roomSchema); 