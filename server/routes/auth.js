import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { clerkId, username, email, image, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      clerkId,
      username,
      email,
      image,
      role: role || 'user'
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          clerkId: user.clerkId,
          username: user.username,
          email: user.email,
          image: user.image,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (user) {
      user.username = username || user.username;
      user.phone = phone || user.phone;
      user.address = address || user.address;

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
          address: updatedUser.address
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 