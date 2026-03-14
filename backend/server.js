require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth');
const projectRoutes = require('./src/routes/projects');
const collaborationRequestRoutes = require('./src/routes/collaborations');
const notificationRoutes = require('./src/routes/notifications');
const userRoutes = require('./src/routes/users');
const recommendationRoutes = require('./src/routes/recommendations');
const taskRoutes = require('./src/routes/tasks');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/collaboration-requests', collaborationRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'APPE Backend is running', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ── Due Date Cron Job — runs every day at 8:00 AM ──
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ Running due date check...');
  try {
    const Task = require('./src/models/Task');
    const { notifyTaskDue } = require('./src/services/notificationService');
    const now = new Date();

    const checkWindows = [
      { label: '1 week', hoursAhead: 7 * 24 },
      { label: '2 days', hoursAhead: 2 * 24 },
      { label: '1 day',  hoursAhead: 1 * 24 },
    ];

    for (const window of checkWindows) {
      const windowStart = new Date(now.getTime() + (window.hoursAhead - 12) * 60 * 60 * 1000);
      const windowEnd   = new Date(now.getTime() + (window.hoursAhead + 12) * 60 * 60 * 1000);

      const tasks = await Task.find({
        assignedTo: { $ne: null },
        status: { $ne: 'completed' },
        dueDate: { $gte: windowStart, $lt: windowEnd }
      }).populate('project', 'title');

      for (const task of tasks) {
        await notifyTaskDue(task.assignedTo, task.title, task.project?.title, task.project?._id, false, window.label);
      }
      console.log(`  ${window.label} window: ${tasks.length} tasks notified`);
    }

    const overdue = await Task.find({
      assignedTo: { $ne: null },
      status: { $ne: 'completed' },
      dueDate: { $lt: now }
    }).populate('project', 'title');

    for (const task of overdue) {
      await notifyTaskDue(task.assignedTo, task.title, task.project?.title, task.project?._id, true, null);
    }

    console.log(`✅ Due date check done. Overdue: ${overdue.length}`);
  } catch (err) {
    console.error('Due date cron error:', err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
