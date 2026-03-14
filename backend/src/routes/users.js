/**
 * User Routes
 * File: src/routes/users.js
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

// Validation rules for profile update
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('institution')
    .optional()
    .trim(),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
];

// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toPublicProfile()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// @route   PUT /api/users/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', auth, updateProfileValidation, validateRequest, async (req, res) => {
  try {
    const { name, bio, institution, skills, interests } = req.body;

    // Build update object with only provided fields
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (institution !== undefined) updates.institution = institution;
    if (skills !== undefined) updates.skills = skills;
    if (interests !== undefined) updates.interests = interests;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;
