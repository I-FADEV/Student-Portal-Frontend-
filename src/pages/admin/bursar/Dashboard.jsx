import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import { getFinanceStats, getFinanceRecentRecords } from '../../../services/api'
import {
  Wallet,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  FileText,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',       path: '/admin/Finance',                icon: TrendingUp },
  { label: 'Create Record',   path: '/admin/Finance/create',         icon: Plus },
  { label: 'Manage Records',  path: '/admin/Finance/records',        icon: FileText },
  { label: 'Change Password', path: '/admin/Finance/change-password',icon: Wallet },
]

function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <div className="relative overflow-hidden bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 ${color}`} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-20`}>
        <Icon size={18} className="text-white" />
      </div>
      {loading ? (
        <div className="h-7 w-20 bg-slate-800 animate-pulse rounded-lg mb-1" />
      ) : (
        <p className="text-2xl font-black text-white mb-1">{value ?? '—'}</p>
      )}
      <p className="text-slate-500 text-xs font-medium">{label}</p>
    </div>
  )
}

function statusMeta(status) {
  switch ((status || '').toLowerCase()) {
    case 'paid':    return { label: 'Paid',    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 }
    case 'partial': return { label: 'Partial', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',     icon: Clock }
    default:        return { label: 'Unpaid',  color: 'text-red-400 bg-red-500/10 border-red-500/20',           icon: XCircle }
  }
}

export default function FinanceDashboard() {
  const { adminToken } = useAdminAuth()
  const navigate = useNavigate()

  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getFinanceStats(adminToken),
      getFinanceRecentRecords(adminToken),
    ]).then(([s, r]) => {
      if (s.status === 'fulfilled') setStats(s.value)
      if (r.status === 'fulfilled') setRecent(r.value?.data || [])
    }).finally(() => setLoading(false))
  }, [adminToken])

  const cards = [
    { label: 'Total Students',     value: stats?.totalStudents,     icon: Users,          color: 'bg-blue-500' },
    { label: 'Total Fees Created', value: stats?.totalFeesCreated != null ? `₦${Number(stats.totalFeesCreated).toLocaleString()}` : null, icon: Wallet, color: 'bg-amber-500' },
    { label: 'Total Collected',    value: stats?.totalCollected    != null ? `₦${Number(stats.totalCollected).toLocaleString()}` : null,   icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Total Outstanding',  value: stats?.totalOutstanding  != null ? `₦${Number(stats.totalOutstanding).toLocaleString()}` : null,  icon: AlertTriangle, color: 'bg-red-500' },
  ]

  return (
    <AdminLayout navItems={NAV_ITEMS}>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Finance Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Finance overview and recent activity</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <StatCard key={c.label} {...c} loading={loading} />
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin/Finance/create')}
            className="group flex items-center gap-4 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl hover:bg-amber-500/20 transition-all duration-200 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
              <Plus size={20} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Create Finance Record</p>
              <p className="text-slate-500 text-xs mt-0.5">Assign fees to a student for a session</p>
            </div>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
          </button>

          <button
            onClick={() => navigate('/admin/Finance/records')}
            className="group flex items-center gap-4 p-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all duration-200 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-700 transition-colors">
              <FileText size={20} className="text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Manage Records</p>
              <p className="text-slate-500 text-xs mt-0.5">View, filter and record payments</p>
            </div>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-300 transition-colors flex-shrink-0" />
          </button>
        </div>

        {/* Recent records */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Recent Records</h2>
            <button
              onClick={() => navigate('/admin/Finance/records')}
              className="text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors"
            >
              View all →
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 size={20} className="text-slate-600 animate-spin" />
              </div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center text-slate-600 text-sm">No finance records yet.</div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {recent.slice(0, 6).map((rec) => {
                  const meta = statusMeta(rec.paymentStatus)
                  const Icon = meta.icon
                  return (
                    <div key={rec._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {rec.student?.name || rec.student?.matricNumber || 'Unknown Student'}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {rec.student?.matricNumber && `${rec.student.matricNumber} · `}{rec.session} · {rec.semester} Semester
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white text-sm font-bold">₦{Number(rec.totalAmount).toLocaleString()}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1 ${meta.color}`}>
                          <Icon size={9} />
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}