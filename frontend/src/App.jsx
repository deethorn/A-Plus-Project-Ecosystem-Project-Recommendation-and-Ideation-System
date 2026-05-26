import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/common/Layout'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PostProject from './pages/PostProject'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Recommendations from './pages/Recommendations'
import TaskManager from './pages/TaskManager'
import VerifyEmail from './pages/VerifyEmail'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<PostProject />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/tasks" element={<TaskManager />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/recommendations" element={<Recommendations />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
