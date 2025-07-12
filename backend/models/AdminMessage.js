const mongoose = require('mongoose');

const adminMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'alert', 'update'],
    default: 'info'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
adminMessageSchema.index({ isActive: 1, expiresAt: 1 });
adminMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminMessage', adminMessageSchema); 