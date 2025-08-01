import express from 'express';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { hotel, roomType, minPrice, maxPrice, isAvailable } = req.query;
    
    let query = {};

    // Filter by hotel
    if (hotel) {
      query.hotel = hotel;
    }

    // Filter by room type
    if (roomType) {
      query.roomType = roomType;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerNight.$lte = parseFloat(maxPrice);
    }

    // Filter by availability
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const rooms = await Room.find(query)
      .populate('hotel', 'name address city')
      .sort({ pricePerNight: 1 });

    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hotel', 'name address city contact');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create room
// @route   POST /api/rooms
// @access  Private (Hotel Owner)
router.post('/', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    const { hotelId } = req.body;

    // Check if hotel exists and user owns it
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to add rooms to this hotel' });
    }

    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Hotel Owner)
router.put('/:id', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    let room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Make sure user owns the hotel
    if (room.hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this room' });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Hotel Owner)
router.delete('/:id', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Make sure user owns the hotel
    if (room.hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this room' });
    }

    await room.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get rooms by hotel
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const rooms = await Room.find({ hotel: req.params.hotelId, isAvailable: true })
      .populate('hotel', 'name address city');

    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 