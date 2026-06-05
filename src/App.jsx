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

// GA pages
import GADashboard    from './pages/admin/ga/Dashboard'
import ManageSession  from './pages/admin/ga/ManageSession'
import CreateAdmin    from './pages/admin/ga/CreateAdmin'
import ManageAdmins   from './pages/admin/ga/ManageAdmins'
import ActivityLogs   from './pages/admin/ga/ActivityLogs'
import ChangePassword from './pages/admin/ga/ChangePassword'

// Registry Admin Pages
import RegistryDashboard  from './pages/admin/registry/Dashboard'
import Faculties          from './pages/admin/registry/Faculties'
import Departments        from './pages/admin/registry/Departments'
import GenerateMatric     from './pages/admin/registry/GenerateMatric'
import RegistryPassword   from './pages/admin/registry/ChangePassword'

//Bursar pages
import BursarDashboard   from './pages/admin/bursar/Dashboard'
import CreateRecord      from './pages/admin/bursar/CreateRecord'
import ManageRecords     from './pages/admin/bursar/ManageRecords'
import BursarChangePw    from './pages/admin/bursar/ChangePassword'

// TAC pages
import TACDashboard       from './pages/admin/tac/Dashboard'
import RegisterStudent  from './pages/admin/tac/RegisterStudent'
import Submissions      from './pages/admin/tac/Submissions'
import ManageStudents   from './pages/admin/tac/ManageStudents'
import TACChangePassword from './pages/admin/tac/ChangePassword'


// Timetable pages
import TimetableDashboard from './pages/admin/timetable/Dashboard'
import ManageCourses      from './pages/admin/timetable/ManageCourses'
import GenerateTimetable  from './pages/admin/timetable/GenerateTimetable'
import ViewTimetable      from './pages/admin/timetable/ViewTimetable'
import TimetableResults   from './pages/admin/timetable/Results'
import TimetableChangePw  from './pages/admin/timetable/ChangePassword'

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

      {/* ── General Admin routes ── */}
      <Route
        path="/admin/ga"
        element={
          <AdminProtectedRoute allowedRoles={['ga']}>
            <GADashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/ga/session"
        element={
          <AdminProtectedRoute allowedRoles={['ga']}>
            <ManageSession />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/ga/create"
        element={
          <AdminProtectedRoute allowedRoles={['ga']}>
            <CreateAdmin />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/ga/admins"
        element={
          <AdminProtectedRoute allowedRoles={['ga']}>
            <ManageAdmins />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/ga/logs"
        element={
          <AdminProtectedRoute allowedRoles={['ga']}>
            <ActivityLogs />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/ga/password"
        element={
          <AdminProtectedRoute allowedRoles={['ga']}>
            <ChangePassword />
          </AdminProtectedRoute>
        }
      />


      {/* Registry Admin Routes */}
      <Route
      path="/admin/registry"
      element={
        <AdminProtectedRoute allowedRoles={['registry']}>
          <RegistryDashboard />
        </AdminProtectedRoute>
      }
    />
      <Route
      path="/admin/registry/faculties"
      element={
        <AdminProtectedRoute allowedRoles={['registry']}>
          <Faculties />
        </AdminProtectedRoute>
      }
    />
      <Route
      path="/admin/registry/departments"
      element={
        <AdminProtectedRoute allowedRoles={['registry']}>
          <Departments />
        </AdminProtectedRoute>
      }
    />
      <Route
      path="/admin/registry/matric"
      element={
        <AdminProtectedRoute allowedRoles={['registry']}>
          <GenerateMatric />
        </AdminProtectedRoute>
      }
    />
      <Route
      path="/admin/registry/password"
      element={
        <AdminProtectedRoute allowedRoles={['registry']}>
          <RegistryPassword />
        </AdminProtectedRoute>
      }
    />
    {/* Bursar Admin Routes */}
      <Route
      path="/admin/bursar"
      element={
        <AdminProtectedRoute allowedRoles={['bursar']}>
          <BursarDashboard />
        </AdminProtectedRoute>
      }
    />
      <Route
      path="/admin/bursar/create"
      element={
        <AdminProtectedRoute allowedRoles={['bursar']}>
          <CreateRecord />
        </AdminProtectedRoute>
      }
    />
      <Route
      path="/admin/bursar/records"
      element={
        <AdminProtectedRoute allowedRoles={['bursar']}>
          <ManageRecords />
        </AdminProtectedRoute>
      }
    />
      <Route
      path="/admin/bursar/change-password"
      element={
        <AdminProtectedRoute allowedRoles={['bursar']}>
          <BursarChangePw />
        </AdminProtectedRoute>
      }
    />
    {/* ── TAC routes ── */}
      <Route
        path="/admin/tac"
        element={<AdminProtectedRoute allowedRoles={['tac']}><TACDashboard /></AdminProtectedRoute>}
      />
      <Route
        path="/admin/tac/register"
        element={<AdminProtectedRoute allowedRoles={['tac']}><RegisterStudent /></AdminProtectedRoute>}
      />
      <Route
        path="/admin/tac/submissions"
        element={<AdminProtectedRoute allowedRoles={['tac']}><Submissions /></AdminProtectedRoute>}
      />
      <Route
        path="/admin/tac/students"
        element={<AdminProtectedRoute allowedRoles={['tac']}><ManageStudents /></AdminProtectedRoute>}
      />
      <Route
        path="/admin/tac/password"
        element={<AdminProtectedRoute allowedRoles={['tac']}><TACChangePassword /></AdminProtectedRoute>}
      />

      {/* timetable routes */}
      <Route
        path="/admin/timetable"
        element={
          <AdminProtectedRoute allowedRoles={['timetable']}>
            <TimetableDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/timetable/courses"
        element={
          <AdminProtectedRoute allowedRoles={['timetable']}>
            <ManageCourses />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/timetable/generate"
        element={
          <AdminProtectedRoute allowedRoles={['timetable']}>
            <GenerateTimetable />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/timetable/view"
        element={
          <AdminProtectedRoute allowedRoles={['timetable']}>
            <ViewTimetable />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/timetable/results"
        element={
          <AdminProtectedRoute allowedRoles={['timetable']}>
            <TimetableResults />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/timetable/password"
        element={
          <AdminProtectedRoute allowedRoles={['timetable']}>
            <TimetableChangePw />
          </AdminProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}