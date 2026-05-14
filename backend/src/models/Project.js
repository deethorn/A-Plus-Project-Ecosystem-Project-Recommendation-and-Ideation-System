/**
 * Project Model
 * File: src/models/Project.js
 */
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Accounting', 'Banking & Finance', 'Entrepreneurship', 'Human Resource Management', 'Marketing', 'Advertising & Public Relations', 
  'Mass Communication & Journalism', 'Artificial Intelligence', 'Computer Science', 'Information Technology', 'Biomedical Engineering', 
  'Computer Engineering', 'Electrical & Electronics Engineering', 'Electronics & Computer Engineering', 'Unmanned Aerial Systems (UAS) Engineering', 
  'Industrial & Systems Engineering', 'Mechanical Engineering', 'Nuclear Engineering', 'Robotics Engineering', 'Other',
  ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  skillsNeeded: [{
    type: String,
    trim: true
  }],
  teamSize: {
    type: Number,
    min: [1, 'Team size must be at least 1'],
    max: [10, 'Team size cannot exceed 10'],
    default: 1
  },

  // ── Timeline (kept for backward compatibility with old records) ──
  timeline: {
    type: String,
    trim: true,
    maxlength: [100, 'Timeline cannot exceed 100 characters']
  },

  // ── New split date fields ──
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },

  currentTeamSize: {
    type: Number,
    default: 1,
    min: 1
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'hod', 'supervisor', 'student', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  duplicateScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  similarProjects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    similarityScore: {
        type: Number,
        min: 0,
        max: 100
      }
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  collaborationRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollaborationRequest'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update 'updatedAt' on save
projectSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// Method to check if team is full
projectSchema.methods.isTeamFull = function () {
  return this.currentTeamSize >= this.teamSize;
};

// Method to get public project info
projectSchema.methods.toPublicProject = function () {
  const project = this.toObject();

  if (this.isAnonymous) {
    const ownerId = project.owner?._id || project.owner;
    project.owner = {
      _id: ownerId,
      name: 'Anonymous',
      institution: null,
      email: null,
      profilePicture: null
    };
  }

  return project;
};

// Index for text search
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Index for filtering
projectSchema.index({ category: 1, status: 1, visibility: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Project', projectSchema);