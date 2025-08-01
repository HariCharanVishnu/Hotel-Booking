import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is requesting their own profile or is admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view this user' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { username, phone, address, recentSearchedCities } = req.body;

    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this user' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    if (recentSearchedCities) {
      user.recentSearchedCities = recentSearchedCities;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        clerkId: updatedUser.clerkId,
        username: updatedUser.username,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        recentSearchedCities: updatedUser.recentSearchedCities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Add recent searched city
// @route   POST /api/users/recent-searches
// @access  Private
router.post('/recent-searches', protect, async (req, res) => {
  try {
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user.recentSearchedCities.includes(city)) {
      user.recentSearchedCities.unshift(city);
      
      // Keep only last 5 searches
      if (user.recentSearchedCities.length > 5) {
        user.recentSearchedCities = user.recentSearchedCities.slice(0, 5);
      }

      await user.save();
    }

    res.json({
      success: true,
      data: user.recentSearchedCities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 