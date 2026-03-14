const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  relatedProject = null,
  relatedRequest = null,
  actionUrl = null
}) => {
  try {
    const notification = await Notification.create({
      recipient, sender, type, title, message,
      relatedProject, relatedRequest, actionUrl
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

const notifyCollaborationRequest = async (projectOwnerId, requesterName, projectTitle, projectId, requestId) => {
  return createNotification({
    recipient: projectOwnerId,
    type: 'collaboration_request',
    title: 'New Collaboration Request',
    message: `${requesterName} wants to join your project "${projectTitle}"`,
    relatedProject: projectId,
    relatedRequest: requestId,
    actionUrl: `/projects/${projectId}/requests`
  });
};

const notifyRequestAccepted = async (requesterId, projectTitle, projectId, projectOwnerId) => {
  return createNotification({
    recipient: requesterId,
    sender: projectOwnerId,
    type: 'request_accepted',
    title: 'Request Accepted!',
    message: `Your request to join "${projectTitle}" has been accepted`,
    relatedProject: projectId,
    actionUrl: `/projects/${projectId}`
  });
};

const notifyRequestRejected = async (requesterId, projectTitle, projectId, projectOwnerId) => {
  return createNotification({
    recipient: requesterId,
    sender: projectOwnerId,
    type: 'request_rejected',
    title: 'Request Rejected',
    message: `Your request to join "${projectTitle}" was not accepted`,
    relatedProject: projectId,
    actionUrl: `/projects`
  });
};

const notifyTeamMemberJoined = async (teamMemberIds, newMemberName, projectTitle, projectId) => {
  const notifications = teamMemberIds.map(memberId =>
    createNotification({
      recipient: memberId,
      type: 'team_member_joined',
      title: 'New Team Member',
      message: `${newMemberName} joined "${projectTitle}"`,
      relatedProject: projectId,
      actionUrl: `/projects/${projectId}`
    })
  );
  return Promise.all(notifications);
};

const notifyTaskDue = async (assignedUserId, taskTitle, projectTitle, projectId, isOverdue, timeWindow) => {
  const titleMap = {
    '1 week': '📅 Task Due in 1 Week',
    '2 days': '⚠️ Task Due in 2 Days',
    '1 day':  '🔔 Task Due Tomorrow',
  };

  return createNotification({
    recipient: assignedUserId,
    type: 'task_due',
    title: isOverdue ? '🚨 Task Overdue' : (titleMap[timeWindow] || '⏰ Task Due Soon'),
    message: isOverdue
      ? `Your task "${taskTitle}" in "${projectTitle}" is overdue`
      : `Your task "${taskTitle}" in "${projectTitle}" is due in ${timeWindow}`,
    relatedProject: projectId,
    actionUrl: `/projects/${projectId}/tasks`
  });
};

module.exports = {
  createNotification,
  notifyCollaborationRequest,
  notifyRequestAccepted,
  notifyRequestRejected,
  notifyTeamMemberJoined,
  notifyTaskDue
};
