const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('projectId')
    .notEmpty().withMessage('Project ID is required'),
];

async function isTeamMemberOrOwner(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return { allowed: false, project: null };
  const isOwner = project.owner.toString() === userId.toString();
  const isMember = project.teamMembers.some(
    m => m.user.toString() === userId.toString()
  );
  return { allowed: isOwner || isMember, isOwner, project };
}

// @route   POST /api/tasks
router.post('/', auth, createTaskValidation, validateRequest, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate } = req.body;

    const { isOwner, project } = await isTeamMemberOrOwner(projectId, req.user._id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Only the project owner can create tasks' });
    }

    // Prevent due dates in the past
    if (dueDate) {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) {
        return res.status(400).json({ success: false, message: 'Due date cannot be in the past' });
      }
    }

    const task = await Task.create({
      project: projectId,
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdBy: req.user._id
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name');

    res.status(201).json({ success: true, message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
  }
});

// @route   GET /api/tasks/project/:projectId
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { allowed, project } = await isTeamMemberOrOwner(req.params.projectId, req.user._id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'You must be a team member to view tasks' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: error.message });
  }
});

// @route   PUT /api/tasks/:id  — Edit task (owner only, even if already assigned)
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { isOwner } = await isTeamMemberOrOwner(task.project, req.user._id);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Only the project owner can edit tasks' });
    }

    const { title, description, assignedTo, dueDate } = req.body;

    // Prevent due dates in the past
    if (dueDate) {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) {
        return res.status(400).json({ success: false, message: 'Due date cannot be in the past' });
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name');

    res.json({ success: true, message: 'Task updated', task });
  } catch (error) {
    console.error('Edit task error:', error);
    res.status(500).json({ success: false, message: 'Failed to edit task', error: error.message });
  }
});

// @route   PUT /api/tasks/:id/toggle
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { allowed } = await isTeamMemberOrOwner(task.project, req.user._id);

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (task.status === 'completed') {
      task.status = 'todo';
      task.completedAt = null;
    } else {
      task.status = 'completed';
      task.completedAt = Date.now();
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name');

    res.json({ success: true, message: 'Task updated', task });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
  }
});

// @route   DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { isOwner } = await isTeamMemberOrOwner(task.project, req.user._id);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Only the project owner can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
  }
});

module.exports = router;
