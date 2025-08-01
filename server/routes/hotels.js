import express from 'express';
import Hotel from '../models/Hotel.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, amenities, rating } = req.query;
    
    let query = { isActive: true };

    // Filter by city
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Filter by rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    const hotels = await Hotel.find(query)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('owner', 'username email');

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create hotel
// @route   POST /api/hotels
// @access  Private (Hotel Owner)
router.post('/', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    const hotel = await Hotel.create({
      ...req.body,
      owner: req.user._id
    });

    res.status(201).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Hotel Owner)
router.put('/:id', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Make sure user is hotel owner
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this hotel' });
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Hotel Owner)
router.delete('/:id', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Make sure user is hotel owner
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this hotel' });
    }

    await hotel.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get hotels by owner
// @route   GET /api/hotels/owner/my-hotels
// @access  Private (Hotel Owner)
router.get('/owner/my-hotels', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user._id });

    res.json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 