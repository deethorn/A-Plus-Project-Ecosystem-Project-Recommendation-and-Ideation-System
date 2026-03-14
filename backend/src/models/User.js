
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student'
  },
  institution: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  profilePicture: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function() {
  // Only hash if password is modified
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (no sensitive data)
userSchema.methods.toPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    institution: this.institution,
    bio: this.bio,
    skills: this.skills,
    interests: this.interests,
    profilePicture: this.profilePicture,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
