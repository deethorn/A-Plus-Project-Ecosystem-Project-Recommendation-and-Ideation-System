/**
 * Notification Routes
 * File: src/routes/notifications.js
 */
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get current user's notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // Build query
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get notifications
    const notifications = await Notification.find(query)
      .populate('sender', 'name profilePicture')
      .populate('relatedProject', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    // Get total count
    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = Date.now();
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: Date.now() } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

module.exports = router;
