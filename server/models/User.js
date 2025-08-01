import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'hotelOwner', 'admin'],
    default: 'user'
  },
  recentSearchedCities: [{
    type: String
  }],
  phone: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema); 