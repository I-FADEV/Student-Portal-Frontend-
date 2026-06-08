import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import { getAllAdmins, getActivityLogs, getActiveSession } from '../../../services/api'
import {
  LayoutDashboard, Users, PlusCircle,
  ScrollText, KeyRound, ShieldCheck,
  Clock, ArrowRight, CalendarClock,
  CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react'

// ── Sidebar nav items for GA ──────────────────────────────────────────────────
export const GA_NAV = [
  { label: 'Dashboard',       path: '/admin/ga',              icon: LayoutDashboard },
  { label: 'Session Control', path: '/admin/ga/session',      icon: CalendarClock },
  { label: 'Create Admin',    path: '/admin/ga/create',       icon: PlusCircle },
  { label: 'Manage Admins',   path: '/admin/ga/admins',       icon: Users },
  { label: 'Activity Logs',   path: '/admin/ga/logs',         icon: ScrollText },
  { label: 'Change Password', path: '/admin/ga/password',     icon: KeyRound },
]

const ADMIN_TYPE_LABELS = {
  registry_admin:  'Registry',
  timetable_admin: 'Timetable',
  finance_admin:   'Finance',
  idcard_admin:    'Idcard',
  general_admin:   'General',
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

function StatCard({ label, value, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={19} className="text-white" />
        </div>
        <ArrowRight size={15} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-2xl font-black text-white mb-1">{value ?? '—'}</p>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
    </button>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />
}

export default function GADashboard() {
  const { adminToken } = useAdminAuth()
  const navigate = useNavigate()
  const [admins,  setAdmins]  = useState([])
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      getAllAdmins(adminToken),
      getActivityLogs(adminToken, { limit: 5 }),
      getActiveSession(adminToken),
    ]).then(([a, l, s]) => {
    if (a.status === 'fulfilled') {
      const aVal = a.value
      setAdmins(
        Array.isArray(aVal) ? aVal :
        Array.isArray(aVal?.data) ? aVal.data :
        Array.isArray(aVal?.admins) ? aVal.admins :
        []
      )
    }
    if (l.status === 'fulfilled') {
      const lVal = l.value
      setLogs(
        Array.isArray(lVal?.data?.logs) ? lVal.data.logs :
        Array.isArray(lVal) ? lVal :
        Array.isArray(lVal?.data) ? lVal.data :
        Array.isArray(lVal?.logs) ? lVal.logs :
        []
      )
    }
    if (s.status === 'fulfilled') {
      setActiveSession(s.value?.data || null)
    }
  }).finally(() => setLoading(false))
}, [adminToken])

  // Count by type
  const counts = admins.reduce((acc, a) => {
    acc[a.adminType] = (acc[a.adminType] || 0) + 1
    return acc
  }, {})

  const stats = [
    { label: 'Total Admins',    value: admins.length,                    icon: ShieldCheck, color: 'bg-amber-500',  path: '/admin/ga/admins' },
    { label: 'Registry Admins', value: counts['registry_admin']  || 0,  icon: Users,       color: 'bg-blue-600',   path: '/admin/ga/admins' },
    { label: 'Timetable Admins',value: counts['timetable_admin'] || 0,  icon: Users,       color: 'bg-violet-600', path: '/admin/ga/admins' },
    { label: 'Finance Admins',   value: counts['finance_admin']   || 0,  icon: Users,       color: 'bg-emerald-600',path: '/admin/ga/admins' },
    { label: 'Idcard Admins',      value: counts['idcard_admin']    || 0,  icon: Users,       color: 'bg-cyan-600',   path: '/admin/ga/admins' },
  ]

  return (
    <AdminLayout navItems={GA_NAV}>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">General Admin</h1>
          <p className="text-slate-500 text-sm mt-1">System overview and admin management</p>
        </div>

        {/* Active Session Widget */}
        {!loading && (
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeSession ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                  {activeSession ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} className="text-slate-500" />}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    {activeSession ? activeSession.session : 'No Active Session'}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {activeSession
                      ? `${activeSession.phase === 'summer' ? 'Summer (Remedial)' : activeSession.phase} Semester · Started ${new Date(activeSession.startedAt).toLocaleDateString()}`
                      : 'Create a session to begin the academic year'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/ga/session')}
                className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-700 hover:text-white transition-colors"
              >
                {activeSession ? 'Manage' : 'Create Session'}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {loading
            ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
            : stats.map((s) => (
                <StatCard key={s.label} {...s} onClick={() => navigate(s.path)} />
              ))
          }
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/admin/ga/create')}
              className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl hover:bg-amber-500/15 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
                <PlusCircle size={19} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Create New Admin</p>
                <p className="text-slate-500 text-xs mt-0.5">Register a new admin account</p>
              </div>
              <ArrowRight size={15} className="text-slate-600 ml-auto group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/admin/ga/logs')}
              className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800/60 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                <ScrollText size={19} className="text-slate-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">View Activity Logs</p>
                <p className="text-slate-500 text-xs mt-0.5">See all admin actions</p>
              </div>
              <ArrowRight size={15} className="text-slate-600 ml-auto group-hover:text-slate-300 transition-colors" />
            </button>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h2>
            <button onClick={() => navigate('/admin/ga/logs')} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
              View all →
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-sm">No activity recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {logs.slice(0, 5).map((log, i) => (
                  <div key={log._id || i} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock size={13} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">
                          {ADMIN_TYPE_LABELS[log.adminType] || log.adminType} Admin
                        </span>
                        {log.adminUsername && (
                          <span className="text-slate-500 text-xs ml-1">({log.adminUsername})</span>
                        )}
                        {' — '}
                        <span>{log.description}</span>
                      </p>
                      <p className="text-slate-600 text-xs mt-0.5">{timeAgo(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}