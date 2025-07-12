const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Skill = require('../models/Skill');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all public users (for browsing)
router.get('/browse', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, location } = req.query;
    
    const query = { 
      isPublic: true, 
      isBanned: false,
      _id: { $ne: req.user._id } // Exclude current user
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('name location profilePhoto rating availability createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Browse users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users by skill
router.get('/search-by-skill', auth, async (req, res) => {
  try {
    const { skill, type = 'offered', page = 1, limit = 10 } = req.query;
    
    if (!skill) {
      return res.status(400).json({ message: 'Skill parameter is required' });
    }

    const skills = await Skill.find({
      name: { $regex: skill, $options: 'i' },
      type: type,
      isApproved: true,
      isRejected: false
    }).populate({
      path: 'user',
      match: { isPublic: true, isBanned: false, _id: { $ne: req.user._id } },
      select: 'name location profilePhoto rating availability createdAt'
    });

    const users = skills
      .map(skill => skill.user)
      .filter(user => user) // Remove null users
      .slice((page - 1) * limit, page * limit);

    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex(u => u._id.toString() === user._id.toString())
    );

    res.json({
      users: uniqueUsers,
      currentPage: parseInt(page),
      total: uniqueUsers.length
    });
  } catch (error) {
    console.error('Search by skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isPublic && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Profile is private' });
    }

    if (user.isBanned) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's skills
    const skills = await Skill.find({
      user: user._id,
      isApproved: true,
      isRejected: false
    }).select('name description category type level');

    res.json({
      user: user.toJSON(),
      skills
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile photo
router.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    
    await User.findByIdAndUpdate(req.user._id, {
      profilePhoto: photoUrl
    });

    res.json({ 
      message: 'Profile photo uploaded successfully',
      photoUrl 
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get skill counts
    const offeredSkills = await Skill.countDocuments({
      user: userId,
      type: 'offered',
      isApproved: true,
      isRejected: false
    });

    const wantedSkills = await Skill.countDocuments({
      user: userId,
      type: 'wanted',
      isApproved: true,
      isRejected: false
    });

    // Get swap statistics
    const Swap = require('../models/Swap');
    const completedSwaps = await Swap.countDocuments({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'completed'
    });

    const pendingSwaps = await Swap.countDocuments({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'pending'
    });

    res.json({
      offeredSkills,
      wantedSkills,
      completedSwaps,
      pendingSwaps,
      rating: user.rating
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 