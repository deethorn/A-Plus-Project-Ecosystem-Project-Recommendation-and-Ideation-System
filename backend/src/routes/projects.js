const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CollaborationRequest = require('../models/CollaborationRequest');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const duplicateDetection = require('../services/duplicateDetection');

const createProjectValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be 20-2000 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('teamSize').optional().isInt({ min: 1, max: 10 }).withMessage('Team size must be 1-10'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('skillsNeeded').optional().isArray().withMessage('Skills must be an array'),
  body('timeline').optional().isLength({ max: 100 }).withMessage('Timeline cannot exceed 100 characters'),
];

// @route   POST /api/projects
router.post('/', auth, createProjectValidation, validateRequest, async (req, res) => {
  try {
    const { title, description, category, tags, skillsNeeded, teamSize, isAnonymous, timeline, startDate, endDate } = req.body;
    const existingProjects = await Project.find({
      status: 'active',
      visibility: 'public'
    }).select('title description').lean();

    const similarProjects = duplicateDetection.findSimilarProjects(
      { title, description },
      existingProjects
    );
    const duplicateScore = duplicateDetection.calculateDuplicateScore(similarProjects);

    const project = await Project.create({
      title,
      description,
      category,
      tags: tags || [],
      skillsNeeded: skillsNeeded || [],
      teamSize: teamSize || 1,
      timeline: timeline || '',
      startDate: startDate || null,
      endDate: endDate || null,
      isAnonymous: isAnonymous || false,
      owner: req.user._id,
      teamMembers: [{ user: req.user._id, role: 'owner', joinedAt: Date.now() }],
      currentTeamSize: 1,
      duplicateScore,
      similarProjects: similarProjects.map(item => ({
        project: item.project._id,
        similarityScore: item.similarityScore
      }))
    });

    await project.populate('owner', 'name email institution');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: project.toPublicProject()
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Failed to create project', error: error.message });
  }
});

// @route   GET /api/projects/user/my-projects  ← MUST stay before /:id
router.get('/user/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .populate('teamMembers.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your projects', error: error.message });
  }
});

// @route   GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { visibility: 'public' };
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const projects = await Project.find(query)
      .populate('owner', 'name email institution profilePicture')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      projects: projects.map(p => {
        if (p.isAnonymous) {
          p.owner = { name: 'Anonymous', _id: p.owner?._id };
        }
        return p;
      }),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: error.message });
  }
});

// @route   GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email institution profilePicture bio')
      .populate('teamMembers.user', 'name email institution profilePicture')

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    let requestingUserId = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
        requestingUserId = decoded.id?.toString() || decoded._id?.toString()
      } catch (_) {}
    }

    const isOwner = !!(requestingUserId &&
      project.owner._id.toString() === requestingUserId)

    if (requestingUserId && !isOwner) {
      const alreadyViewed = project.viewedBy?.some(
        userId => userId.toString() === requestingUserId
      )

      if (!alreadyViewed) {
        project.views = (project.views || 0) + 1
        project.viewedBy = [...(project.viewedBy || []), requestingUserId]
        await project.save()
      }
  }

    const isAcceptedMember = !!(requestingUserId &&
      project.teamMembers.some(m => m.user?._id?.toString() === requestingUserId))

    const isCommunityMember = isOwner || isAcceptedMember
    const projectData = project.toObject()

    if (project.isAnonymous && !isCommunityMember) {
      projectData.owner = {
        _id: project.owner._id,
        name: 'Anonymous',
        institution: null,
        email: null,
        profilePicture: null
      }
      projectData.teamMembers = projectData.teamMembers.map((m) => ({
        ...m,
        user: { _id: m.user?._id, name: 'Anonymous Member', institution: null, profilePicture: null }
      }))
    }

    res.json({ success: true, project: projectData })
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch project', error: error.message })
  }
});

// @route   PATCH /api/projects/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['active', 'completed', 'archived'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    project.status = status;
    await project.save();

    res.json({ success: true, message: `Project marked as ${status}`, project });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update project status', error: error.message });
  }
});

// @route   DELETE /api/projects/:id/members/:memberId
router.delete('/:id/members/:memberId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project owner can remove members' });
    }

    if (req.params.memberId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Project owner cannot be removed' });
    }

    const memberExists = project.teamMembers.some(
      m => m.user.toString() === req.params.memberId
    );
    if (!memberExists) {
      return res.status(404).json({ success: false, message: 'Member not found in this project' });
    }

    project.teamMembers = project.teamMembers.filter(
      m => m.user.toString() !== req.params.memberId
    );
    project.currentTeamSize = Math.max(1, project.currentTeamSize - 1);
    await project.save();

    await notifyMemberRemoved(req.params.memberId, project.title, project._id);

    res.json({ success: true, message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove member', error: error.message });
  }
});

// @route   DELETE /api/projects/:id/leave
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Project owner cannot leave. You can delete the project instead.'
      });
    }

    const memberExists = project.teamMembers.some(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!memberExists) {
      return res.status(400).json({ success: false, message: 'You are not a member of this project' });
    }

    project.teamMembers = project.teamMembers.filter(
      m => m.user.toString() !== req.user._id.toString()
    );
    project.currentTeamSize = Math.max(1, project.currentTeamSize - 1);
    await project.save();

    res.json({ success: true, message: 'You have left the project successfully' });
  } catch (error) {
    console.error('Leave project error:', error);
    res.status(500).json({ success: false, message: 'Failed to leave project', error: error.message });
  }
});

// @route   DELETE /api/projects/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    await CollaborationRequest.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete project', error: error.message });
  }
});

// Internal helper — notify removed member
async function notifyMemberRemoved(memberId, projectTitle, projectId) {
  try {
    const notificationService = require('../services/notificationService');
    await notificationService.createNotification({
      recipient: memberId,
      type: 'team_member_removed',
      title: 'Removed from Project',
      message: `You have been removed from "${projectTitle}"`,
      relatedProject: projectId,
      actionUrl: `/projects`
    });
  } catch (err) {
    console.error('Notify removed member error:', err);
  }
}

module.exports = router;