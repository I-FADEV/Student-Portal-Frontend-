import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import { getTimetableStats } from '../../../services/api'
import {
  LayoutDashboard, BookOpen, Calendar, Grid3X3,
  BarChart2, KeyRound, ArrowRight, BookMarked,
  GraduationCap, AlertTriangle, CheckCircle2,
} from 'lucide-react'

export const TIMETABLE_NAV = [
  { label: 'Dashboard',          path: '/admin/timetable',          icon: LayoutDashboard },
  { label: 'Manage Courses',     path: '/admin/timetable/courses',  icon: BookOpen        },
  { label: 'Generate Timetable', path: '/admin/timetable/generate', icon: Calendar        },
  { label: 'View Timetable',     path: '/admin/timetable/view',     icon: Grid3X3         },
  { label: 'Results',            path: '/admin/timetable/results',  icon: BarChart2       },
  { label: 'Change Password',    path: '/admin/timetable/password', icon: KeyRound        },
]

function StatCard({ label, value, icon: Icon, accent, sub, onClick }) {
  return (
    <button onClick={onClick}
      className="group text-left bg-slate-900 border border-slate-800 rounded-2xl p-5
        hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-200 w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon size={18} className="text-white" />
        </div>
        <ArrowRight size={14} className="text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-3xl font-black text-white tabular-nums">{value ?? '—'}</p>
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-1">{label}</p>
      {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
    </button>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800 rounded-2xl ${className}`} />
}

export default function TimetableDashboard() {
  const { adminToken } = useAdminAuth()
  const navigate = useNavigate()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  getTimetableStats(adminToken)
    .then(res => {
      const data = res?.data || res

      setStats({
        totalCourses: data.totalCourses || 0,
        totalSessions: data.totalSessions || 0,
        totalResults: data.totalResults || 0,
        totalStudents: data.totalStudents || 0,
      })
    })
    .catch(() => {})
    .finally(() => setLoading(false))
}, [adminToken])

  const cards = [
    { label: 'Courses Added',       value: stats?.totalCourses    ?? 0, icon: BookOpen,      accent: 'bg-blue-600',    path: '/admin/timetable/courses'  },
    { label: 'Sessions Published',  value: stats?.totalSessions   ?? 0, icon: CheckCircle2,  accent: 'bg-emerald-600', path: '/admin/timetable/view'     },
    { label: 'Results Uploaded',    value: stats?.totalResults    ?? 0, icon: GraduationCap, accent: 'bg-cyan-600',    path: '/admin/timetable/results'  },
    { label: 'Pending Clashes',     value: stats?.pendingClashes  ?? 0, icon: AlertTriangle, accent: 'bg-amber-600',   path: '/admin/timetable/generate' },
  ]

  const quickActions = [
    { label: 'Add Courses',         sub: 'Add courses before generating',   path: '/admin/timetable/courses',  icon: BookMarked, color: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15',       iconColor: 'bg-blue-500/20 text-blue-400'    },
    { label: 'Generate Timetable',  sub: 'Auto-generate clash-free slots',  path: '/admin/timetable/generate', icon: Calendar,   color: 'bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/15',         iconColor: 'bg-cyan-500/20 text-cyan-400'    },
    { label: 'Upload Results',      sub: 'Post student results by course',  path: '/admin/timetable/results',  icon: BarChart2,  color: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15', iconColor: 'bg-emerald-500/20 text-emerald-400' },
  ]

  return (
    <AdminLayout navItems={TIMETABLE_NAV}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Timetable Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Manage course schedules and student results</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading
            ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
            : cards.map(c => <StatCard key={c.label} {...c} onClick={() => navigate(c.path)} />)
          }
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map(({ label, sub, path, icon: Icon, color, iconColor }) => (
              <button key={label} onClick={() => navigate(path)}
                className={`flex items-center gap-4 p-4 border rounded-2xl text-left group transition-colors ${color}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-300 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Workflow guide */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Workflow</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-start gap-0 flex-col sm:flex-row">
              {[
                { step: '1', label: 'Add Courses',    sub: 'Set code, title, targets, lecturer' },
                { step: '2', label: 'Generate',        sub: 'Auto-assign slots, resolve clashes'  },
                { step: '3', label: 'Publish',         sub: 'Students see their timetable'        },
                { step: '4', label: 'Upload Results',  sub: 'By course — Excel or manual entry'   },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-0 flex-1">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 flex-1 py-2 sm:py-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-black">
                      {s.step}
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-white text-sm font-semibold">{s.label}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{s.sub}</p>
                    </div>
                  </div>
                  {i < 3 && <div className="hidden sm:block w-8 h-px bg-slate-700 flex-shrink-0 mt-4" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}