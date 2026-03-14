/**
 * Notification Model
 * File: src/models/Notification.js
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'collaboration_request',
      'request_accepted',
      'request_rejected',
      'project_update',
      'team_member_joined',
      'team_member_left',
      'project_comment',
      'mention',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollaborationRequest'
  },
  actionUrl: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
