const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    enum: ['online', 'in-person'],
    required: true
  },
  meetingLink: {
    type: String,
    trim: true,
    maxlength: [500, 'Link cannot exceed 500 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  agenda: {
    type: String,
    trim: true,
    maxlength: [1000, 'Agenda cannot exceed 1000 characters']
  },
  attendance: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    present: {
      type: Boolean,
      default: false
    }
  }],
  progressRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  attendanceMarked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

meetingSchema.index({ project: 1, date: -1 });

module.exports = mongoose.model('Meeting', meetingSchema);