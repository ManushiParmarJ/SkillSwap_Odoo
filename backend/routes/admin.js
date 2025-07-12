const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Swap = require('../models/Swap');
const AdminMessage = require('../models/AdminMessage');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get platform statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ 
      role: 'user',
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalSkills = await Skill.countDocuments();
    const pendingSkills = await Skill.countDocuments({ 
      isApproved: false, 
      isRejected: false 
    });
    const totalSwaps = await Swap.countDocuments();
    const completedSwaps = await Swap.countDocuments({ status: 'completed' });
    const pendingSwaps = await Swap.countDocuments({ status: 'pending' });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers
      },
      skills: {
        total: totalSkills,
        pending: pendingSkills
      },
      swaps: {
        total: totalSwaps,
        completed: completedSwaps,
        pending: pendingSwaps
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin view)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'active') {
      query.isBanned = false;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ban/Unban user
router.put('/users/:userId/ban', adminAuth, [
  body('isBanned').isBoolean().withMessage('isBanned must be a boolean'),
  body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isBanned, reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        isBanned,
        ...(reason && { banReason: reason })
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all swaps (admin view)
router.get('/swaps', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};

    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate([
        { path: 'requester', select: 'name email' },
        { path: 'recipient', select: 'name email' },
        { path: 'requestedSkill', select: 'name description' },
        { path: 'offeredSkill', select: 'name description' }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Swap.countDocuments(query);

    res.json({
      swaps,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get admin swaps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create platform-wide message
router.post('/messages', adminAuth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content is required and must be less than 2000 characters'),
  body('type').isIn(['info', 'warning', 'alert', 'update']).withMessage('Invalid message type'),
  body('expiresAt').optional().isISO8601().withMessage('Valid date format is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, type, expiresAt } = req.body;

    const message = new AdminMessage({
      title,
      content,
      type,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id
    });

    await message.save();

    res.status(201).json({
      message: 'Platform message created successfully',
      adminMessage: message
    });
  } catch (error) {
    console.error('Create admin message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all platform messages
router.get('/messages', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    
    const query = {};

    if (active === 'true') {
      query.isActive = true;
      query.$or = [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ];
    }

    const messages = await AdminMessage.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AdminMessage.countDocuments(query);

    res.json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update platform message
router.put('/messages/:messageId', adminAuth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('content').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be less than 2000 characters'),
  body('type').optional().isIn(['info', 'warning', 'alert', 'update']).withMessage('Invalid message type'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('expiresAt').optional().isISO8601().withMessage('Valid date format is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, type, isActive, expiresAt } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const message = await AdminMessage.findByIdAndUpdate(
      req.params.messageId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Platform message updated successfully',
      adminMessage: message
    });
  } catch (error) {
    console.error('Update admin message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete platform message
router.delete('/messages/:messageId', adminAuth, async (req, res) => {
  try {
    const message = await AdminMessage.findByIdAndDelete(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Platform message deleted successfully' });
  } catch (error) {
    console.error('Delete admin message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get platform messages for users
router.get('/messages/public', async (req, res) => {
  try {
    const messages = await AdminMessage.find({
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({ messages });
  } catch (error) {
    console.error('Get public messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate reports
router.get('/reports/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let reportData = {};

    switch (type) {
      case 'user-activity':
        reportData = await User.aggregate([
          { $match: { ...dateFilter, role: 'user' } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;

      case 'swap-stats':
        reportData = await Swap.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        break;

      case 'skill-categories':
        reportData = await Skill.aggregate([
          { $match: { ...dateFilter, isApproved: true } },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]);
        break;

      case 'user-ratings':
        reportData = await User.aggregate([
          { $match: { ...dateFilter, role: 'user', 'rating.count': { $gt: 0 } } },
          {
            $project: {
              name: 1,
              email: 1,
              rating: 1,
              swapCount: '$rating.count'
            }
          },
          { $sort: { 'rating.average': -1 } },
          { $limit: 20 }
        ]);
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json({
      reportType: type,
      data: reportData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 