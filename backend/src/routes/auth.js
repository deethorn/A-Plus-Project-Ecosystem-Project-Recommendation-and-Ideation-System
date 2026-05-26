
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validateRequest = require('../middleware/validateRequest');
const crypto = require('crypto');  // built-in, no install needed
const { sendVerificationEmail } = require('../services/emailService');

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'mentor']).withMessage('Role must be student or mentor')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
];

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', registerValidation, validateRequest, async (req, res) => {
  try {
    const { name, email, password, role, institution } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user — NOT verified yet
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      institution,
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 30)
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      await User.deleteOne({ _id: user._id });
      throw emailError;
    }

    // ✅ No token returned yet — user must verify first
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    // Block unverified users
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});
// Import auth middleware at the top of the file (add this line after other imports)
const auth = require('../middleware/auth');

// @route   GET /api/auth/verify-email
// @desc    Verify user email via token link
// @access  Public
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is missing'
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired. Please register again.'
      });
    }

    // Activate the account
    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Redirect to frontend login page
    return res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private (requires token)
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toPublicProfile()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});


module.exports = router;
