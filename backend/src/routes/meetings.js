const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

async function isOwnerOfProject(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return { allowed: false, project: null };
  const isOwner = project.owner.toString() === userId.toString();
  return { allowed: isOwner, isOwner, project };
}

// @route   POST /api/meetings/project/:projectId
router.post('/project/:projectId', auth, async (req, res) => {
  try {
    const { isOwner, project } = await isOwnerOfProject(req.params.projectId, req.user._id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Only the project owner can schedule meetings' });
    }

    const { title, date, venue, meetingLink, location, agenda } = req.body;

    const attendance = project.teamMembers.map(m => ({
      member: m.user,
      name: '',
      present: false
    }));

    const meeting = await Meeting.create({
      project: project._id,
      createdBy: req.user._id,
      title, date, venue, meetingLink, location, agenda,
      attendance
    });

    await meeting.populate('attendance.member', 'name email');

    res.status(201).json({ success: true, message: 'Meeting scheduled successfully', meeting });
  } catch (error) {
    console.error('Schedule meeting error:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule meeting', error: error.message });
  }
});

// @route   GET /api/meetings/project/:projectId
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.teamMembers.some(m => m.user.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ success: false, message: 'You must be a team member to view meetings' });
    }

    const meetings = await Meeting.find({ project: req.params.projectId })
      .sort({ date: -1 })
      .populate('attendance.member', 'name email');

    res.json({ success: true, meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch meetings', error: error.message });
  }
});

// @route   PATCH /api/meetings/:meetingId/attendance
router.patch('/:meetingId/attendance', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId).populate('project');
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    if (meeting.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project owner can mark attendance' });
    }

    const { attendance, progressRating } = req.body;

    meeting.attendance = attendance;
    meeting.progressRating = progressRating;
    meeting.attendanceMarked = true;
    await meeting.save();
    await meeting.populate('attendance.member', 'name email');

    res.json({ success: true, message: 'Attendance saved', meeting });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to save attendance', error: error.message });
  }
});

// @route   DELETE /api/meetings/:meetingId
router.delete('/:meetingId', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId).populate('project');
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    if (meeting.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete meetings' });
    }

    await meeting.deleteOne();
    res.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete meeting', error: error.message });
  }
});

module.exports = router;