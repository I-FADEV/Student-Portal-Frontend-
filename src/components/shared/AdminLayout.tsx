import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { Menu, X, LogOut, ChevronRight } from 'lucide-react'

function LogoMark() {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-900/40">
        <span className="text-slate-950 font-black text-xs tracking-tight">IF</span>
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-white font-black text-sm tracking-widest truncate">IFATOSS</span>
        <span className="text-slate-500 text-[10px] font-medium tracking-wide truncate">Admin Portal</span>
      </div>
    </div>
  )
}

export default function AdminLayout({ children, navItems }) {
  const [open, setOpen] = useState(false)
  const { adminUser, logout } = useAdminAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleLogout = () => { logout(); navigate('/admin/login') }
  const go = (path) => { navigate(path); setOpen(false) }

  const initial = (adminUser?.title || 'A').charAt(0).toUpperCase()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col w-64 flex-shrink-0
        bg-slate-950 border-r border-slate-800/60
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/60">
          <LogoMark />
          <button onClick={() => setOpen(false)} className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-2">
          <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest truncate">
              {adminUser?.title || 'Admin'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`
                  group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }
                `}
              >
                <Icon size={18} className="flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-amber-500/60" />}
              </button>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-slate-800/60 p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-slate-950 text-xs flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-xs truncate">{adminUser?.username || 'Admin'}</p>
              <p className="text-slate-500 text-[10px]">{adminUser?.title || 'Administrator'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all duration-150"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-950 border-b border-slate-800/60 z-30 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        <LogoMark />
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-slate-950 text-xs">
          {initial}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}