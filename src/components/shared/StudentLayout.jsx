import styles from './StudentLayout.module.css'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Profile', path: '/student/profile' },
  { label: 'Timetable', path: '/student/timetable' },
  { label: 'Courses', path: '/student/courses' },
  { label: 'Finance', path: '/student/finance' },
  { label: 'ID Card', path: '/student/idcard' },
]

function StudentLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={styles.container}>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>

        {/* Logo Area */}
        <div className={styles.sidebarHeader}>
          <img src="/logo.png" alt="Logo" className={styles.sidebarLogo} />
          {!collapsed && <span className={styles.sidebarTitle}>IFATOSS</span>}
        </div>

        {/* Nav Items */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.navItemActive : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className={styles.sidebarBottom}>
          {!collapsed && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.userRole}>Student</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className={styles.logoutBtn}>
            🚪 {!collapsed && 'Logout'}
          </button>
        </div>

      </div>

      {/* Collapse Toggle */}
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '→' : '←'}
      </button>

      {/* Main Content */}
      <div className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </div>

    </div>
  )
}

export default StudentLayout