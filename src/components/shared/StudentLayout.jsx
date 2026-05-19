import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  BookOpen, 
  Wallet, 
  CreditCard,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', path: '/student/profile', icon: User },
  { label: 'Timetable', path: '/student/timetable', icon: Calendar },
  { label: 'Courses', path: '/student/courses', icon: BookOpen },
  { label: 'Finance', path: '/student/finance', icon: Wallet },
  { label: 'ID Card', path: '/student/idcard', icon: CreditCard },
]

function LogoFull({ size = 'md' }) {
  const imgClass = size === 'sm' ? 'h-8 w-auto' : 'h-10 w-auto'
  const titleClass = size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <div className="flex items-center gap-3 min-w-0">
      <img
        src="/logo.png"
        alt="IFATOSS logo"
        className={`${imgClass} object-contain flex-shrink-0`}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextSibling.style.display = 'flex'
        }}
      />
      <div
        className="hidden flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 items-center justify-center shadow-lg shadow-blue-500/30"
        aria-hidden="true"
      >
        <span className="text-white font-extrabold text-sm tracking-tight">IF</span>
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <span className={`text-white font-extrabold ${titleClass} tracking-widest truncate`}>
          IFATOSS
        </span>
        <span className="text-slate-400 text-[11px] font-medium tracking-wide truncate">
          Student Portal
        </span>
      </div>
    </div>
  )
}

function StudentLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNavigation = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col w-64
          bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
          shadow-2xl
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/50">
          <LogoFull />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden ml-2 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  group w-full flex items-center gap-3
                  px-3 py-3 rounded-lg
                  font-medium text-sm
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-700/50 p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {user?.name || 'Student'}
              </p>
              <p className="text-slate-400 text-xs">Student Account</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-700/50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 font-medium text-sm transition-all duration-200"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 shadow-lg z-30 flex items-center justify-between px-4 border-b border-slate-700/50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <LogoFull size="sm" />
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'S'}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default StudentLayout