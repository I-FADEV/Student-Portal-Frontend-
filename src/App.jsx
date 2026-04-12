import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import AdminLogin from './pages/auth/AdminLogin'
import ProtectedRoute from './routes/ProtectedRoute'
import StudentLayout from './components/shared/StudentLayout'
import Dashboard from './pages/student/Dashboard'
import Profile from './pages/student/Profile'
import Timetable from './pages/student/Timetable'
import Courses from './pages/student/Courses'
import Finance from './pages/student/Finance'
import IDCard from './pages/student/IDCard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <Dashboard />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <Profile />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/timetable"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <Timetable />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <Courses />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/finance"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <Finance />
              </StudentLayout>
            </ProtectedRoute>
          }
         />

        <Route
          path="/student/idcard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <IDCard />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin GA Route */}
        <Route
          path="/admin/ga"
          element={
            <ProtectedRoute allowedRoles={['ga']}>
              <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>
                <h1>Welcome to GA Dashboard! ✅</h1>
                <p>Admin login is working correctly.</p>
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App