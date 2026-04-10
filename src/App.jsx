import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import AdminLogin from './pages/auth/AdminLogin'
import ProtectedRoute from './routes/ProtectedRoute'
import StudentLayout from './components/shared/StudentLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Temporary dashboard to test */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <div>
                  <h1>Welcome to Student Dashboard!</h1>
                  <p>Login is working correctly.</p>
                </div>
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
                <h1>Welcome to Admin Dashboard!</h1>
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