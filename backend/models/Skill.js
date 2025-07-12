const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50
  },
  type: {
    type: String,
    enum: ['offered', 'wanted'],
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isRejected: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
skillSchema.index({ user: 1, type: 1 });
skillSchema.index({ name: 'text', description: 'text' });
skillSchema.index({ isApproved: 1, isRejected: 1 });

module.exports = mongoose.model('Skill', skillSchema); 