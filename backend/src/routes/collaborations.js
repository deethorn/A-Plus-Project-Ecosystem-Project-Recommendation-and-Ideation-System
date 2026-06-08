const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CollaborationRequest = require('../models/CollaborationRequest');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const notificationService = require('../services/notificationService');

const createRequestValidation = [
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  body('motivation').optional().isLength({ max: 500 }).withMessage('Motivation cannot exceed 500 characters'),
  body('skills').optional().isLength({ max: 300 }).withMessage('Skills cannot exceed 300 characters'),
  body('interests').optional().isLength({ max: 300 }).withMessage('Interests cannot exceed 300 characters'),
  body('levelOfStudy').optional().isLength({ max: 100 }).withMessage('Level of study cannot exceed 100 characters'),
  body('programmeOfStudy').optional().isLength({ max: 200 }).withMessage('Programme of study cannot exceed 200 characters'),
];

// @route   POST /api/collaboration-requests
router.post('/', auth, createRequestValidation, validateRequest, async (req, res) => {
  try {
    const {
      projectId,
      message,
      motivation,
      skills,
      interests,
      levelOfStudy,
      programmeOfStudy,
      department,
      requestedRole
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.isOwnerOrCoOwner(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You are already an owner or co-owner of this project' });
    }

    const isAlreadyMember = project.teamMembers.some(
      member => member.user.toString() === req.user._id.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this project' });
    }

    if (project.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This project is completed and no longer accepting collaboration requests'
      });
    }

    // Co-owner requests do not count against team size
    if (requestedRole !== 'co-owner' && project.isTeamFull()) {
      return res.status(400).json({ success: false, message: 'Project team is already full' });
    }

    const existingRequest = await CollaborationRequest.findOne({
      project: projectId,
      requester: req.user._id,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this project' });
    }

    const collaborationRequest = await CollaborationRequest.create({
      project:          projectId,
      requester:        req.user._id,
      requestedRole:    requestedRole || 'member',
      message:          message          || null,
      motivation:       motivation       || null,
      skills:           skills           || null,
      interests:        interests        || null,
      levelOfStudy:     levelOfStudy     || null,
      programmeOfStudy: programmeOfStudy || null,
      department:       department       || null,
    });

    await collaborationRequest.populate('requester', 'name email institution profilePicture');
    await collaborationRequest.populate('project', 'title description');

    await notificationService.notifyCollaborationRequest(
      project.owner,
      req.user.name,
      project.title,
      project._id,
      collaborationRequest._id
    );

    res.status(201).json({
      success: true,
      message: 'Collaboration request sent successfully',
      request: collaborationRequest
    });

  } catch (error) {
    console.error('Create collaboration request error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this project' });
    }
    res.status(500).json({ success: false, message: 'Failed to send collaboration request', error: error.message });
  }
});

// @route   DELETE /api/collaboration-requests/:id/revoke
router.delete('/:id/revoke', auth, async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only revoke your own requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot revoke a request that has already been ${request.status}`
      });
    }

    await request.deleteOne();

    res.json({ success: true, message: 'Collaboration request revoked successfully' });

  } catch (error) {
    console.error('Revoke request error:', error);
    res.status(500).json({ success: false, message: 'Failed to revoke request', error: error.message });
  }
});

// @route   GET /api/collaboration-requests/project/:projectId
// @access  Owner or Co-owner
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!project.isOwnerOrCoOwner(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view requests for this project' });
    }

    const requests = await CollaborationRequest.find({ project: req.params.projectId })
      .populate('requester', 'name email institution profilePicture')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });

  } catch (error) {
    console.error('Get project requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch collaboration requests', error: error.message });
  }
});

// @route   GET /api/collaboration-requests/my-requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({ requester: req.user._id })
      .populate('project', 'title description owner category')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });

  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your requests', error: error.message });
  }
});

// @route   PUT /api/collaboration-requests/:id/accept
// @access  Owner or Co-owner
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const { responseMessage } = req.body || {};

    const request = await CollaborationRequest.findById(req.params.id)
      .populate('requester', 'name email')
      .populate('project');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (!request.project.isOwnerOrCoOwner(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request' });
    }

    // Co-owners cannot accept co-owner requests — only the owner can
    if (request.requestedRole === 'co-owner') {
      if (request.project.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Only the project owner can accept co-owner requests' });
      }
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    if (request.requestedRole !== 'co-owner' && request.project.isTeamFull()) {
      return res.status(400).json({ success: false, message: 'Project team is now full' });
    }

    request.status = 'accepted';
    request.responseMessage = responseMessage || '';
    request.respondedBy = req.user._id;
    request.respondedAt = Date.now();
    await request.save();

    if (request.requestedRole === 'co-owner') {
      // Add to coOwners array and teamMembers with co-owner role
      const alreadyCoOwner = request.project.coOwners.some(
        c => c.toString() === request.requester._id.toString()
      );
      if (!alreadyCoOwner) {
        request.project.coOwners.push(request.requester._id);
      }

      const alreadyMember = request.project.teamMembers.some(
        m => m.user.toString() === request.requester._id.toString()
      );
      if (alreadyMember) {
        const entry = request.project.teamMembers.find(
          m => m.user.toString() === request.requester._id.toString()
        );
        entry.role = 'co-owner';
      } else {
        request.project.teamMembers.push({
          user: request.requester._id,
          role: 'co-owner',
          joinedAt: Date.now()
        });
        request.project.currentTeamSize += 1;
      }
    } else {
      const roleMap = {
        student:    'student',
        supervisor: 'supervisor',
        hod:        'hod',
      };

      request.project.teamMembers.push({
        user:     request.requester._id,
        role:     roleMap[request.requestedRole] || 'member',
        joinedAt: Date.now()
      });
      request.project.currentTeamSize += 1;
    }

    await request.project.save();

    await notificationService.notifyRequestAccepted(
      request.requester._id,
      request.project.title,
      request.project._id,
      req.user._id
    );

    res.json({ success: true, message: 'Collaboration request accepted', request });

  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept request', error: error.message });
  }
});

// @route   PUT /api/collaboration-requests/:id/reject
// @access  Owner or Co-owner
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const { responseMessage } = req.body || {};

    const request = await CollaborationRequest.findById(req.params.id)
      .populate('requester', 'name email')
      .populate('project');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (!request.project.isOwnerOrCoOwner(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'rejected';
    request.responseMessage = responseMessage || '';
    request.respondedBy = req.user._id;
    request.respondedAt = Date.now();
    await request.save();

    await notificationService.notifyRequestRejected(
      request.requester._id,
      request.project.title,
      request.project._id,
      req.user._id
    );

    res.json({ success: true, message: 'Collaboration request rejected', request });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject request', error: error.message });
  }
});

module.exports = router;