const express = require('express');
const { body, validationResult } = require('express-validator');
const Skill = require('../models/Skill');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get user's skills
router.get('/my-skills', auth, async (req, res) => {
  try {
    const skills = await Skill.find({
      user: req.user._id,
      isApproved: true,
      isRejected: false
    }).sort({ createdAt: -1 });

    const offeredSkills = skills.filter(skill => skill.type === 'offered');
    const wantedSkills = skills.filter(skill => skill.type === 'wanted');

    res.json({
      offeredSkills,
      wantedSkills
    });
  } catch (error) {
    console.error('Get my skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new skill
router.post('/', auth, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Skill name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must be less than 50 characters'),
  body('type').isIn(['offered', 'wanted']).withMessage('Type must be either offered or wanted'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid skill level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, type, level } = req.body;

    console.log('🔧 Creating skill:', {
      user: req.user._id,
      name,
      type,
      level: level || 'intermediate'
    });

    // Check if skill already exists for this user
    const existingSkill = await Skill.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      type: type
    });

    if (existingSkill) {
      console.log('❌ Skill already exists for user');
      return res.status(400).json({ message: 'You already have this skill listed' });
    }

    const skill = new Skill({
      user: req.user._id,
      name,
      description,
      category,
      type,
      level: level || 'intermediate'
    });

    await skill.save();
    console.log('✅ Skill created successfully:', {
      id: skill._id,
      name: skill.name,
      type: skill.type,
      isApproved: skill.isApproved
    });

    res.status(201).json({
      message: 'Skill added successfully',
      skill
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a skill
router.put('/:skillId', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Skill name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must be less than 50 characters'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid skill level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const skill = await Skill.findById(req.params.skillId);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this skill' });
    }

    const { name, description, category, level } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (level !== undefined) updateData.level = level;

    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.skillId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Skill updated successfully',
      skill: updatedSkill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a skill
router.delete('/:skillId', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.skillId);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this skill' });
    }

    await Skill.findByIdAndDelete(req.params.skillId);

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get pending skills for approval
router.get('/admin/pending', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skills = await Skill.find({
      isApproved: false,
      isRejected: false
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Skill.countDocuments({
      isApproved: false,
      isRejected: false
    });

    res.json({
      skills,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get pending skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Approve skill
router.put('/admin/:skillId/approve', adminAuth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.skillId,
      {
        isApproved: true,
        isRejected: false,
        rejectionReason: null
      },
      { new: true }
    );

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({
      message: 'Skill approved successfully',
      skill
    });
  } catch (error) {
    console.error('Approve skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Reject skill
router.put('/admin/:skillId/reject', adminAuth, [
  body('reason').trim().isLength({ min: 1, max: 200 }).withMessage('Rejection reason is required and must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;

    const skill = await Skill.findByIdAndUpdate(
      req.params.skillId,
      {
        isApproved: false,
        isRejected: true,
        rejectionReason: reason
      },
      { new: true }
    );

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({
      message: 'Skill rejected successfully',
      skill
    });
  } catch (error) {
    console.error('Reject skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search skills
router.get('/search', auth, async (req, res) => {
  try {
    const { q, type, category, level, page = 1, limit = 10 } = req.query;

    const query = {
      isApproved: true,
      isRejected: false
    };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (type) query.type = type;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (level) query.level = level;

    const skills = await Skill.find(query)
      .populate('user', 'name location profilePhoto rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Skill.countDocuments(query);

    res.json({
      skills,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Search skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to check all skills (development only)
router.get('/debug/all-skills', auth, async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Endpoint not available in production' });
  }

  try {
    const allSkills = await Skill.find({}).populate('user', 'name email');
    
    const skillsByUser = {};
    allSkills.forEach(skill => {
      const userId = skill.user._id.toString();
      if (!skillsByUser[userId]) {
        skillsByUser[userId] = {
          user: skill.user,
          skills: []
        };
      }
      skillsByUser[userId].skills.push({
        id: skill._id,
        name: skill.name,
        type: skill.type,
        isApproved: skill.isApproved,
        isRejected: skill.isRejected
      });
    });

    res.json({
      totalSkills: allSkills.length,
      skillsByUser
    });
  } catch (error) {
    console.error('Debug skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 