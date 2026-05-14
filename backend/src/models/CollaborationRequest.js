/**
 * Collaboration Request Model
 * File: src/models/CollaborationRequest.js
 */
const mongoose = require('mongoose');

const collaborationRequestSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  requestedRole: {
    type: String,
    default: 'member'
  },
  motivation: {
    type: String,
    trim: true,
    maxlength: [500, 'Motivation cannot exceed 500 characters']
  },
  skills: {
    type: String,
    trim: true,
    maxlength: [300, 'Skills cannot exceed 300 characters']
  },
  interests: {
    type: String,
    trim: true,
    maxlength: [300, 'Interests cannot exceed 300 characters']
  },
  levelOfStudy: {
    type: String,
    trim: true,
    maxlength: [100, 'Level of study cannot exceed 100 characters']
  },
  programmeOfStudy: {
    type: String,
    trim: true,
    maxlength: [200, 'Programme of study cannot exceed 200 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [200, 'Department cannot exceed 200 characters']
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Response message cannot exceed 500 characters']
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
collaborationRequestSchema.index({ project: 1, status: 1 });
collaborationRequestSchema.index({ requester: 1, status: 1 });
collaborationRequestSchema.index({ createdAt: -1 });

// Prevent duplicate pending requests
collaborationRequestSchema.index(
  { project: 1, requester: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('CollaborationRequest', collaborationRequestSchema);