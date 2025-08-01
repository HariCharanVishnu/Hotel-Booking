import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Stripe', 'Pay At Hotel', 'PayPal'],
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentId: {
    type: String
  },
  specialRequests: {
    type: String
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'hotel', 'admin']
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ user: 1, checkInDate: 1 });
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema); 