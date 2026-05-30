import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import { getTACStats, getAllIdCards } from '../../../services/api'
import {
  LayoutDashboard, UserPlus, CreditCard,
  Users, KeyRound, Clock, CheckCircle2,
  XCircle, AlertCircle, ArrowRight, RefreshCw,
} from 'lucide-react'

export const TAC_NAV = [
  { label: 'Dashboard',        path: '/admin/tac',              icon: LayoutDashboard },
  { label: 'Register Student', path: '/admin/tac/register',     icon: UserPlus },
  { label: 'ID Card Submissions', path: '/admin/tac/submissions', icon: CreditCard },
  { label: 'Manage Students',  path: '/admin/tac/students',     icon: Users },
  { label: 'Change Password',  path: '/admin/tac/password',     icon: KeyRound },
]

const STATUS_META = {
  pending:   { label: 'Pending',   icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10  border-amber-500/25' },
  collected: { label: 'Collected', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  rejected:  { label: 'Rejected',  icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10    border-red-500/25' },
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function StatCard({ label, value, icon: Icon, colorClass, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon size={19} className="text-white" />
        </div>
        <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
      <p className="text-2xl font-black text-white mb-1">{value ?? '—'}</p>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
    </button>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />
}

export default function TACDashboard() {
  const { adminToken } = useAdminAuth()
  const navigate = useNavigate()
  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getTACStats(adminToken),
      getAllIdCards(adminToken, { status: 'pending' }),
    ]).then(([s, r]) => {
      if (s.status === 'fulfilled') setStats(s.value?.data || s.value)
      if (r.status === 'fulfilled') {
        const list = r.value?.data || r.value || []
        setRecent(Array.isArray(list) ? list.slice(0, 5) : [])
      }
    }).finally(() => setLoading(false))
  }, [adminToken])

  const cards = [
    { label: 'Total Students',  value: stats?.totalStudents, icon: Users,        colorClass: 'bg-blue-600',    path: '/admin/tac/students' },
    { label: 'Pending Cards',   value: stats?.pending,       icon: Clock,        colorClass: 'bg-amber-500',   path: '/admin/tac/submissions' },
    { label: 'Collected',       value: stats?.collected,     icon: CheckCircle2, colorClass: 'bg-emerald-600', path: '/admin/tac/submissions' },
    { label: 'Rejected',        value: stats?.rejected,      icon: XCircle,      colorClass: 'bg-red-600',     path: '/admin/tac/submissions' },
  ]

  return (
    <AdminLayout navItems={TAC_NAV}>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">TAC Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Student registration and ID card management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading
            ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
            : cards.map(c => <StatCard key={c.label} {...c} onClick={() => navigate(c.path)} />)
          }
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/admin/tac/register')}
              className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl hover:bg-amber-500/15 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <UserPlus size={19} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Register New Student</p>
                <p className="text-slate-500 text-xs mt-0.5">Create a student account</p>
              </div>
              <ArrowRight size={15} className="text-slate-600 ml-auto group-hover:text-amber-400 transition-colors" />
            </button>
            <button
              onClick={() => navigate('/admin/tac/submissions')}
              className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800/60 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                <CreditCard size={19} className="text-slate-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Review Submissions</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {stats?.pending ? `${stats.pending} pending review` : 'View all ID card submissions'}
                </p>
              </div>
              <ArrowRight size={15} className="text-slate-600 ml-auto group-hover:text-slate-300 transition-colors" />
            </button>
          </div>
        </div>

        {/* Recent pending submissions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Pending Submissions</h2>
            <button onClick={() => navigate('/admin/tac/submissions')} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
              View all →
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : recent.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-sm">No pending submissions.</div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {recent.map((card, i) => (
                  <div key={card._id || i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/20 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate">
                        {card.fullName || card.matricNumber || 'Unknown student'}
                      </p>
                      <p className="text-slate-500 text-xs">{card.department} · {timeAgo(card.submittedAt || card.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => navigate('/admin/tac/submissions')}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0"
                    >
                      Review →
                    </button>
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