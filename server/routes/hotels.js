import express from 'express';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all hotels with real-time availability
// @route   GET /api/hotels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, amenities, rating, checkIn, checkOut, guests } = req.query;
    
    let query = { isActive: true };

    // Filter by city
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Filter by rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Filter by amenities
    if (amenities) {
      const amenityArray = amenities.split(',').map(a => a.trim());
      query.amenities = { $all: amenityArray };
    }

    let hotels = await Hotel.find(query)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });

    // If check-in/check-out dates are provided, filter by availability
    if (checkIn && checkOut && guests) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      // Get available rooms for each hotel
      for (let hotel of hotels) {
        const availableRooms = await Room.find({
          hotel: hotel._id,
          isAvailable: true,
          capacity: { $gte: parseInt(guests) }
        });

        // Check if rooms are available for the specified dates
        const conflictingBookings = await Room.aggregate([
          {
            $match: { hotel: hotel._id }
          },
          {
            $lookup: {
              from: 'bookings',
              localField: '_id',
              foreignField: 'room',
              as: 'bookings'
            }
          },
          {
            $match: {
              'bookings': {
                $elemMatch: {
                  status: { $in: ['confirmed', 'pending'] },
                  $or: [
                    {
                      checkInDate: { $lt: checkOutDate },
                      checkOutDate: { $gt: checkInDate }
                    }
                  ]
                }
              }
            }
          }
        ]);

        // Calculate available rooms
        const totalRooms = availableRooms.length;
        const bookedRooms = conflictingBookings.length;
        hotel.availableRooms = Math.max(0, totalRooms - bookedRooms);
        hotel.isAvailable = hotel.availableRooms > 0;
      }

      // Filter hotels that have available rooms
      hotels = hotels.filter(hotel => hotel.isAvailable);
    }

    // Get Socket.IO instance for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Emit hotel availability update
      io.emit('hotels-loaded', {
        count: hotels.length,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      count: hotels.length,
      data: hotels,
      filters: {
        city: city || null,
        rating: rating || null,
        amenities: amenities ? amenities.split(',').map(a => a.trim()) : null,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        guests: guests || null
      }
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single hotel with real-time availability
// @route   GET /api/hotels/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('owner', 'username email');

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Get real-time room availability
    const rooms = await Room.find({ hotel: hotel._id });
    const availableRooms = rooms.filter(room => room.isAvailable);
    
    hotel.roomCount = rooms.length;
    hotel.availableRoomCount = availableRooms.length;
    hotel.availabilityPercentage = Math.round((availableRooms.length / rooms.length) * 100);

    // Get Socket.IO instance
    const io = req.app.get('io');
    if (io) {
      // Join hotel room for real-time updates
      io.to(`hotel-${hotel._id}`).emit('hotel-viewed', {
        hotelId: hotel._id,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create hotel with real-time notification
// @route   POST /api/hotels
// @access  Private (Hotel Owner)
router.post('/', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    const hotel = await Hotel.create({
      ...req.body,
      owner: req.user._id
    });

    // Get Socket.IO instance
    const io = req.app.get('io');
    if (io) {
      // Notify all users about new hotel
      io.emit('new-hotel-added', {
        hotel: {
          _id: hotel._id,
          name: hotel.name,
          city: hotel.city,
          country: hotel.country,
          rating: hotel.rating
        },
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update hotel with real-time notification
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

    // Get Socket.IO instance
    const io = req.app.get('io');
    if (io) {
      // Notify all users about hotel update
      io.emit('hotel-updated', {
        hotelId: hotel._id,
        updates: req.body,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete hotel with real-time notification
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

    // Get Socket.IO instance
    const io = req.app.get('io');
    if (io) {
      // Notify all users about hotel deletion
      io.emit('hotel-deleted', {
        hotelId: hotel._id,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get hotels by owner with real-time stats
// @route   GET /api/hotels/owner/my-hotels
// @access  Private (Hotel Owner)
router.get('/owner/my-hotels', protect, authorize('hotelOwner', 'admin'), async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user._id });

    // Get real-time statistics for each hotel
    for (let hotel of hotels) {
      const rooms = await Room.find({ hotel: hotel._id });
      const availableRooms = rooms.filter(room => room.isAvailable);
      
      hotel.roomCount = rooms.length;
      hotel.availableRoomCount = availableRooms.length;
      hotel.occupancyRate = Math.round(((rooms.length - availableRooms.length) / rooms.length) * 100);
    }

    res.json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    console.error('Error fetching owner hotels:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get hotel availability for specific dates
// @route   GET /api/hotels/:id/availability
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { checkIn, checkOut, guests } = req.query;
    
    if (!checkIn || !checkOut || !guests) {
      return res.status(400).json({ 
        success: false, 
        message: 'Check-in, check-out dates and guest count are required' 
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const guestCount = parseInt(guests);

    // Get all rooms for the hotel
    const rooms = await Room.find({ 
      hotel: req.params.id,
      capacity: { $gte: guestCount }
    });

    // Check availability for each room
    const availableRooms = [];
    for (let room of rooms) {
      // Check if room has conflicting bookings
      const conflictingBookings = await Room.aggregate([
        {
          $match: { _id: room._id }
        },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'room',
            as: 'bookings'
          }
        },
        {
          $match: {
            'bookings': {
              $elemMatch: {
                status: { $in: ['confirmed', 'pending'] },
                $or: [
                  {
                    checkInDate: { $lt: checkOutDate },
                    checkOutDate: { $gt: checkInDate }
                  }
                ]
              }
            }
          }
        }
      ]);

      if (conflictingBookings.length === 0) {
        availableRooms.push(room);
      }
    }

    res.json({
      success: true,
      data: {
        hotelId: req.params.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestCount,
        totalRooms: rooms.length,
        availableRooms: availableRooms.length,
        rooms: availableRooms
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get rooms for a specific hotel
// @route   GET /api/hotels/:id/rooms
// @access  Public
router.get('/:id/rooms', async (req, res) => {
  try {
    const hotelId = req.params.id;
    
    // Verify hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hotel not found' 
      });
    }

    // Get all rooms for the hotel
    const rooms = await Room.find({ 
      hotel: hotelId,
      isActive: true
    }).populate('amenities');

    // Calculate availability for each room
    const roomsWithAvailability = await Promise.all(rooms.map(async (room) => {
      // Check if room has conflicting bookings
      const conflictingBookings = await Room.aggregate([
        {
          $match: { _id: room._id }
        },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'room',
            as: 'bookings'
          }
        },
        {
          $match: {
            'bookings': {
              $elemMatch: {
                status: { $in: ['confirmed', 'pending'] }
              }
            }
          }
        }
      ]);

      const isAvailable = conflictingBookings.length === 0;
      
      return {
        ...room.toObject(),
        isAvailable,
        conflictingBookings: conflictingBookings.length
      };
    }));

    res.json({
      success: true,
      data: {
        hotelId,
        hotelName: hotel.name,
        totalRooms: rooms.length,
        availableRooms: roomsWithAvailability.filter(room => room.isAvailable).length,
        rooms: roomsWithAvailability
      }
    });
  } catch (error) {
    console.error('Error fetching hotel rooms:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 