/**
 * Recommendations Route
 * File: src/routes/recommendations.js
 */
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const User = require('../models/User');

/**
 * Content-based match score calculator
 * Compares user skills/interests against project skillsNeeded/tags/category
 * Returns a score from 0–100
 */
function calculateMatchScore(user, project) {
  const userSkills = (user.skills || []).map(s => s.toLowerCase())
  const userInterests = (user.interests || []).map(i => i.toLowerCase())
  const projectSkills = (project.skillsNeeded || []).map(s => s.toLowerCase())
  const projectTopics = [
    ...(project.tags || []).map(t => t.toLowerCase()),
    project.category.toLowerCase()
  ]

  // Skills score — how many of the project's required skills the user has
  let skillScore = 0
  if (projectSkills.length > 0 && userSkills.length > 0) {
    const matchingSkills = projectSkills.filter(ps =>
      userSkills.some(us => us.includes(ps) || ps.includes(us))
    )
    skillScore = (matchingSkills.length / projectSkills.length) * 100
  }

  // Interest score — how many of the user's interests match the project topics
  let interestScore = 0
  if (userInterests.length > 0 && projectTopics.length > 0) {
    const matchingInterests = userInterests.filter(ui =>
      projectTopics.some(pt => pt.includes(ui) || ui.includes(pt))
    )
    interestScore = (matchingInterests.length / userInterests.length) * 100
  }

  // If user has no profile data at all
  if (userSkills.length === 0 && userInterests.length === 0) return 0

  // Weighted: 60% skills match, 40% interest match
  if (projectSkills.length === 0) return Math.round(interestScore)
  if (userInterests.length === 0) return Math.round(skillScore)

  return Math.round(skillScore * 0.6 + interestScore * 0.4)
}

/**
 * Get matching skill/interest labels for UI explanation
 */
function getMatchReasons(user, project) {
  const userSkills = (user.skills || []).map(s => s.toLowerCase())
  const userInterests = (user.interests || []).map(i => i.toLowerCase())
  const projectSkills = (project.skillsNeeded || []).map(s => s.toLowerCase())
  const projectTopics = [
    ...(project.tags || []).map(t => t.toLowerCase()),
    project.category.toLowerCase()
  ]

  const matchedSkills = projectSkills.filter(ps =>
    userSkills.some(us => us.includes(ps) || ps.includes(us))
  )
  const matchedInterests = userInterests.filter(ui =>
    projectTopics.some(pt => pt.includes(ui) || ui.includes(pt))
  )

  return { matchedSkills, matchedInterests }
}

// @route   GET /api/recommendations
// @desc    Get personalized project recommendations for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    // Get all public active projects excluding ones user owns or is a member of
    const projects = await Project.find({
      visibility: 'public',
      status: 'active',
      owner: { $ne: req.user._id },
      'teamMembers.user': { $ne: req.user._id }
    })
      .populate('owner', 'name institution')
      .lean()

    // If user has no skills or interests, return empty with a flag
    if (!user.skills?.length && !user.interests?.length) {
      return res.json({
        success: true,
        recommendations: [],
        profileIncomplete: true,
        message: 'Add skills and interests to your profile to get recommendations'
      })
    }

    // Score each project
    const scored = projects
      .map(project => {
        const matchScore = calculateMatchScore(user, project)
        const { matchedSkills, matchedInterests } = getMatchReasons(user, project)
        return { ...project, matchScore, matchedSkills, matchedInterests }
      })
      .filter(p => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20) // Return top 20

    res.json({
      success: true,
      recommendations: scored,
      profileIncomplete: false,
      total: scored.length
    })

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    })
  }
})

module.exports = router;
