const express = require('express');
const { body, validationResult } = require('express-validator');
const Swap = require('../models/Swap');
const Skill = require('../models/Skill');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create a swap request
router.post('/', auth, [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('requestedSkillId').isMongoId().withMessage('Valid requested skill ID is required'),
  body('offeredSkillId').isMongoId().withMessage('Valid offered skill ID is required'),
  body('message').optional().trim().isLength({ max: 1000 }).withMessage('Message must be less than 1000 characters'),
  body('scheduledDate').optional().isISO8601().withMessage('Valid date format is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, requestedSkillId, offeredSkillId, message, scheduledDate } = req.body;

    // Check if recipient exists and is not banned
    const recipient = await User.findById(recipientId);
    if (!recipient || recipient.isBanned) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if skills exist and belong to correct users
    const requestedSkill = await Skill.findById(requestedSkillId);
    const offeredSkill = await Skill.findById(offeredSkillId);

    if (!requestedSkill || !offeredSkill) {
      return res.status(404).json({ message: 'One or both skills not found' });
    }

    if (requestedSkill.user.toString() !== recipientId) {
      return res.status(400).json({ message: 'Requested skill does not belong to recipient' });
    }

    if (offeredSkill.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Offered skill does not belong to you' });
    }

    // Check if skills are approved (temporarily disabled for testing)
    // if (!requestedSkill.isApproved || !offeredSkill.isApproved) {
    //   return res.status(400).json({ message: 'One or both skills are not approved' });
    // }

    // Check if there's already a pending swap between these users for these skills
    const existingSwap = await Swap.findOne({
      requester: req.user._id,
      recipient: recipientId,
      requestedSkill: requestedSkillId,
      offeredSkill: offeredSkillId,
      status: 'pending'
    });

    if (existingSwap) {
      return res.status(400).json({ message: 'Swap request already exists' });
    }

    const swap = new Swap({
      requester: req.user._id,
      recipient: recipientId,
      requestedSkill: requestedSkillId,
      offeredSkill: offeredSkillId,
      message,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null
    });

    await swap.save();

    // Populate the swap with user and skill details
    await swap.populate([
      { path: 'requester', select: 'name email' },
      { path: 'recipient', select: 'name email' },
      { path: 'requestedSkill', select: 'name description' },
      { path: 'offeredSkill', select: 'name description' }
    ]);

    res.status(201).json({
      message: 'Swap request created successfully',
      swap
    });
  } catch (error) {
    console.error('Create swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's swaps (both as requester and recipient)
router.get('/my-swaps', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    };

    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate([
        { path: 'requester', select: 'name email profilePhoto' },
        { path: 'recipient', select: 'name email profilePhoto' },
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
    console.error('Get my swaps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a swap request
router.put('/:swapId/accept', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this swap' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not in pending status' });
    }

    swap.status = 'accepted';
    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'name email' },
      { path: 'recipient', select: 'name email' },
      { path: 'requestedSkill', select: 'name description' },
      { path: 'offeredSkill', select: 'name description' }
    ]);

    res.json({
      message: 'Swap accepted successfully',
      swap
    });
  } catch (error) {
    console.error('Accept swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a swap request
router.put('/:swapId/reject', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this swap' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not in pending status' });
    }

    swap.status = 'rejected';
    await swap.save();

    res.json({
      message: 'Swap rejected successfully',
      swap
    });
  } catch (error) {
    console.error('Reject swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a swap request (by requester)
router.put('/:swapId/cancel', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this swap' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not in pending status' });
    }

    swap.status = 'cancelled';
    await swap.save();

    res.json({
      message: 'Swap cancelled successfully',
      swap
    });
  } catch (error) {
    console.error('Cancel swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a swap
router.put('/:swapId/complete', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.status !== 'accepted') {
      return res.status(400).json({ message: 'Swap must be accepted before completion' });
    }

    // Only the requester or recipient can complete the swap
    if (swap.requester.toString() !== req.user._id.toString() && 
        swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this swap' });
    }

    swap.status = 'completed';
    swap.completedAt = new Date();
    await swap.save();

    res.json({
      message: 'Swap completed successfully',
      swap
    });
  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate a completed swap
router.post('/:swapId/rate', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const swap = await Swap.findById(req.params.swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed swaps' });
    }

    const { rating, comment } = req.body;
    const isRequester = swap.requester.toString() === req.user._id.toString();

    if (isRequester) {
      swap.rating.fromRequester = { rating, comment };
    } else if (swap.recipient.toString() === req.user._id.toString()) {
      swap.rating.fromRecipient = { rating, comment };
    } else {
      return res.status(403).json({ message: 'Not authorized to rate this swap' });
    }

    await swap.save();

    // Update user ratings if both parties have rated
    if (swap.rating.fromRequester && swap.rating.fromRecipient) {
      const recipient = await User.findById(swap.recipient);
      const requester = await User.findById(swap.requester);

      if (recipient && requester) {
        // Update recipient rating
        const recipientSwaps = await Swap.find({
          $or: [{ requester: recipient._id }, { recipient: recipient._id }],
          status: 'completed',
          'rating.fromRequester': { $exists: true },
          'rating.fromRecipient': { $exists: true }
        });

        const recipientRatings = recipientSwaps.map(s => {
          if (s.requester.toString() === recipient._id.toString()) {
            return s.rating.fromRecipient.rating;
          } else {
            return s.rating.fromRequester.rating;
          }
        });

        if (recipientRatings.length > 0) {
          recipient.rating.average = recipientRatings.reduce((a, b) => a + b, 0) / recipientRatings.length;
          recipient.rating.count = recipientRatings.length;
          await recipient.save();
        }

        // Update requester rating
        const requesterSwaps = await Swap.find({
          $or: [{ requester: requester._id }, { recipient: requester._id }],
          status: 'completed',
          'rating.fromRequester': { $exists: true },
          'rating.fromRecipient': { $exists: true }
        });

        const requesterRatings = requesterSwaps.map(s => {
          if (s.requester.toString() === requester._id.toString()) {
            return s.rating.fromRecipient.rating;
          } else {
            return s.rating.fromRequester.rating;
          }
        });

        if (requesterRatings.length > 0) {
          requester.rating.average = requesterRatings.reduce((a, b) => a + b, 0) / requesterRatings.length;
          requester.rating.count = requesterRatings.length;
          await requester.save();
        }
      }
    }

    res.json({
      message: 'Rating submitted successfully',
      swap
    });
  } catch (error) {
    console.error('Rate swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get swap details
router.get('/:swapId', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.swapId)
      .populate([
        { path: 'requester', select: 'name email profilePhoto' },
        { path: 'recipient', select: 'name email profilePhoto' },
        { path: 'requestedSkill', select: 'name description category level' },
        { path: 'offeredSkill', select: 'name description category level' }
      ]);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user is authorized to view this swap
    if (swap.requester._id.toString() !== req.user._id.toString() && 
        swap.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this swap' });
    }

    res.json({ swap });
  } catch (error) {
    console.error('Get swap details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 