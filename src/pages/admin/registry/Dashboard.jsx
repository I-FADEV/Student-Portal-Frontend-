import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/shared/AdminLayout'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { getRegistryStats, getMatricStats } from '../../../services/api'
import {
  Building2, GraduationCap, Hash, ChevronRight,
  Layers, BookOpen, AlertCircle, TrendingUp,
} from 'lucide-react'

export const REGISTRY_NAV = [
  { label: 'Dashboard',       path: '/admin/registry',              icon: 'LayoutDashboard' },
  { label: 'Faculties',       path: '/admin/registry/faculties',    icon: 'Building2'       },
  { label: 'Departments',     path: '/admin/registry/departments',  icon: 'BookOpen'        },
  { label: 'Generate Matric', path: '/admin/registry/matric',       icon: 'Hash'            },
  { label: 'Change Password', path: '/admin/registry/password',     icon: 'Lock'            },
]

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left group rounded-2xl border p-5 transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-lg ${color}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4
                         bg-white/10`}>
          <Icon size={22} />
        </div>
        {onClick && (
          <ChevronRight size={16} className="opacity-50 group-hover:opacity-100
                                              group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
      <p className="text-3xl font-extrabold tracking-tight">
        {value ?? <span className="opacity-40 text-xl">—</span>}
      </p>
      <p className="text-sm font-semibold mt-1 opacity-80">{label}</p>
      {sub && <p className="text-xs opacity-50 mt-0.5">{sub}</p>}
    </button>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-700/40 rounded-xl ${className}`} />
}

export default function RegistryDashboard() {
  const { adminToken }  = useAdminAuth()
  const navigate   = useNavigate()
  const [stats,    setStats]   = useState(null)
  const [matricStats, setMatricStats] = useState(null)
  const [loading,  setLoading] = useState(true)
  const [error,    setError]   = useState(null)

  useEffect(() => {
    Promise.allSettled([
      getRegistryStats(adminToken),
      getMatricStats(adminToken),
    ]).then(([registryResult, matricResult]) => {
      if (registryResult.status === 'fulfilled') {
        setStats(registryResult.value?.data)
      }
      if (matricResult.status === 'fulfilled') {
        setMatricStats(matricResult.value?.data)
      }
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [adminToken])

  return (
    <AdminLayout navItems={REGISTRY_NAV} title="Registry Admin">
      <div className="space-y-8">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Registry Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage faculties, departments and matric number generation
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl
                          bg-blue-900/30 border border-blue-700/40">
            <TrendingUp size={15} className="text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Registry Control</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl
                          bg-red-900/20 border border-red-700/40 text-red-400 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Building2}
              label="Total Faculties"
              value={stats?.totalFaculties ?? 0}
              sub="Registered faculties"
              color="bg-indigo-900/40 border-indigo-700/40 text-indigo-100"
              onClick={() => navigate('/admin/registry/faculties')}
            />
            <StatCard
              icon={BookOpen}
              label="Total Departments"
              value={stats?.totalDepartments ?? 0}
              sub="Across all faculties"
              color="bg-blue-900/40 border-blue-700/40 text-blue-100"
              onClick={() => navigate('/admin/registry/departments')}
            />
            <StatCard
              icon={Hash}
              label="Matric Generated Today"
              value={matricStats?.today ?? 0}
              sub="Numbers issued today"
              color="bg-cyan-900/40 border-cyan-700/40 text-cyan-100"
              onClick={() => navigate('/admin/registry/matric')}
            />
            <StatCard
              icon={GraduationCap}
              label="Total Matric Generated"
              value={matricStats?.total ?? 0}
              sub="All time"
              color="bg-violet-900/40 border-violet-700/40 text-violet-100"
              onClick={() => navigate('/admin/registry/matric')}
            />
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: 'Add New Faculty',
                desc:  'Register a new faculty',
                icon:  Building2,
                path:  '/admin/registry/faculties',
                color: 'hover:border-indigo-500/60',
              },
              {
                label: 'Add New Department',
                desc:  'Register a department under a faculty',
                icon:  Layers,
                path:  '/admin/registry/departments',
                color: 'hover:border-blue-500/60',
              },
              {
                label: 'Generate Matric No.',
                desc:  'Issue a matric number to a new student',
                icon:  Hash,
                path:  '/admin/registry/matric',
                color: 'hover:border-cyan-500/60',
              },
            ].map(({ label, desc, icon: Icon, path, color }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`group flex items-center gap-4 p-4 rounded-xl bg-slate-800
                             border border-slate-700 text-left transition-all duration-200
                             hover:-translate-y-0.5 hover:shadow-md ${color}`}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center
                                justify-center flex-shrink-0 group-hover:bg-slate-600
                                transition-colors">
                  <Icon size={18} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                <ChevronRight size={15} className="ml-auto text-slate-600
                                                    group-hover:text-slate-400
                                                    group-hover:translate-x-0.5
                                                    transition-all" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}