import api from './api';

export const getMeetings      = (projectId)              => api.get(`/meetings/project/${projectId}`).then(r => r.data);
export const scheduleMeeting  = (projectId, data)        => api.post(`/meetings/project/${projectId}`, data).then(r => r.data);
export const updateMeeting = (meetingId, data)           => api.put(`/meetings/${meetingId}`, data).then(r => r.data);
export const markAttendance   = (meetingId, data)        => api.patch(`/meetings/${meetingId}/attendance`, data).then(r => r.data);
export const deleteMeeting    = (meetingId)              => api.delete(`/meetings/${meetingId}`).then(r => r.data);