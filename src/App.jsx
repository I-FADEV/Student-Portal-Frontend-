import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'

import ProtectedRoute from './routes/ProtectedRoute'
import StudentLayout from './components/shared/StudentLayout'
import Dashboard from './pages/student/Dashboard'
import Profile from './pages/student/Profile'
import Timetable from './pages/student/Timetable'
import Courses from './pages/student/Courses'
import Finance from './pages/student/Finance'
import IDCard from './pages/student/IDCard'
import Results from './pages/student/Results'

import AdminLogin from './pages/auth/AdminLogin'
import AdminProtectedRoute from './routes/AdminProtectedRoute'

import GADashboard       from './pages/admin/ga/Dashboard'
import TACDashboard      from './pages/admin/tac/Dashboard'
import BursarDashboard   from './pages/admin/bursar/Dashboard'
import TimetableDashboard from './pages/admin/timetable/Dashboard'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"            element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Student routes ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout><Dashboard /></StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout><Profile /></StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/timetable"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout><Timetable /></StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout><Courses /></StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/finance"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout><Finance /></StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/idcard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout><IDCard /></StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout><Results /></StudentLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Admin routes ── */}
      <Route
        path="/admin/ga"
        element={
          <AdminProtectedRoute allowedRoles={['ga']}>
            <GADashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/tac"
        element={
          <AdminProtectedRoute allowedRoles={['tac']}>
            <TACDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/bursar"
        element={
          <AdminProtectedRoute allowedRoles={['bursar']}>
            <BursarDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/timetable"
        element={
          <AdminProtectedRoute allowedRoles={['timetable']}>
            <TimetableDashboard />
          </AdminProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}