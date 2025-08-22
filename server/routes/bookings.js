import express from 'express';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create booking with real-time updates
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests, paymentMethod, specialRequests } = req.body;

    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (!room.isAvailable) {
      return res.status(400).json({ success: false, message: 'Room is not available' });
    }

    // Check for date conflicts
    const conflictingBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ success: false, message: 'Room is not available for selected dates' });
    }

    // Calculate total price
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * nights;

    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      hotel: room.hotel,
      checkInDate,
      checkOutDate,
      totalPrice,
      guests,
      paymentMethod,
      specialRequests
    });

    // Populate the booking with related data
    const populatedBooking = await Booking.findById(booking._id)
      .populate('room', 'roomType pricePerNight images')
      .populate('hotel', 'name address city')
      .populate('user', 'username email');

    // Get Socket.IO instance for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Notify hotel owner about new booking
      io.to(`hotel-${room.hotel}`).emit('new-booking', {
        bookingId: booking._id,
        hotelId: room.hotel,
        userId: req.user._id,
        roomType: room.roomType,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      // Notify user about booking confirmation
      io.to(`user-${req.user._id}`).emit('booking-created', {
        bookingId: booking._id,
        status: 'pending',
        message: 'Your booking has been created successfully!',
        timestamp: new Date().toISOString()
      });

      // Emit general booking update
      io.emit('booking-update', {
        type: 'created',
        bookingId: booking._id,
        hotelId: room.hotel,
        userId: req.user._id,
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room', 'roomType pricePerNight images')
      .populate('hotel', 'name address city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room', 'roomType pricePerNight images')
      .populate('hotel', 'name address city contact')
      .populate('user', 'username email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user owns the booking or is hotel owner
    if (booking.user._id.toString() !== req.user._id.toString() && 
        booking.hotel.owner.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Hotel Owner/Admin)
router.put('/:id/status', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('hotel');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user owns the hotel
    if (booking.hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancelledBy = req.user.role === 'admin' ? 'admin' : 'hotel';
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room', 'roomType pricePerNight images')
      .populate('hotel', 'name address city')
      .populate('user', 'username email');

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Booking cannot be cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'user';

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room', 'roomType pricePerNight images')
      .populate('hotel', 'name address city')
      .populate('user', 'username email');

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get hotel bookings (for hotel owners)
// @route   GET /api/bookings/hotel/:hotelId
// @access  Private (Hotel Owner)
router.get('/hotel/:hotelId', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    const bookings = await Booking.find({ hotel: req.params.hotelId })
      .populate('room', 'roomType pricePerNight')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get real-time booking statistics
// @route   GET /api/bookings/stats/real-time
// @access  Private
router.get('/stats/real-time', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'hotelOwner') {
      // Get hotel owner stats
      const hotels = await Hotel.find({ owner: userId });
      const hotelIds = hotels.map(hotel => hotel._id);

      const totalBookings = await Booking.countDocuments({ hotel: { $in: hotelIds } });
      const pendingBookings = await Booking.countDocuments({ 
        hotel: { $in: hotelIds }, 
        status: 'pending' 
      });
      const confirmedBookings = await Booking.countDocuments({ 
        hotel: { $in: hotelIds }, 
        status: 'confirmed' 
      });
      const completedBookings = await Booking.countDocuments({ 
        hotel: { $in: hotelIds }, 
        status: 'completed' 
      });

      stats = {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalHotels: hotels.length
      };
    } else {
      // Get regular user stats
      const totalBookings = await Booking.countDocuments({ user: userId });
      const upcomingBookings = await Booking.countDocuments({ 
        user: userId, 
        status: 'confirmed',
        checkInDate: { $gte: new Date() }
      });
      const completedBookings = await Booking.countDocuments({ 
        user: userId, 
        status: 'completed' 
      });
      const cancelledBookings = await Booking.countDocuments({ 
        user: userId, 
        status: 'cancelled' 
      });

      stats = {
        totalBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 