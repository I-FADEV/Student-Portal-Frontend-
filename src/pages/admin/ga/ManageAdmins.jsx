import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { GA_NAV } from './Dashboard'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { getAllAdmins, deleteAdmin } from '../../../services/api'
import {
  Users, ShieldCheck, Trash2, AlertCircle,
  Loader2, UserX, RefreshCw,
} from 'lucide-react'

// Label map for display
const TYPE_META = {
  registry_admin:  { label: 'Registry Admin',  color: 'text-violet-400  bg-violet-500/10  border-violet-500/20' },
  timetable_admin: { label: 'Timetable Admin', color: 'text-blue-400    bg-blue-500/10    border-blue-500/20'   },
  finance_admin:   { label: 'Finance Admin',    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'},
  idcard_admin:    { label: 'Idcard Admin',        color: 'text-amber-400   bg-amber-500/10   border-amber-500/20'  },
}

export default function ManageAdmins() {
  const { adminToken } = useAdminAuth()

  const [admins, setAdmins]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [deleting, setDeleting]   = useState(null)   // id being deleted
  const [confirmId, setConfirmId] = useState(null)   // id awaiting confirmation

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllAdmins(adminToken)
      setAdmins(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [adminToken])

  const handleDelete = async (id) => {
    setDeleting(id)
    setConfirmId(null)
    try {
      await deleteAdmin(id, adminToken)
      setAdmins(prev => prev.filter(a => a._id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout navItems={GA_NAV}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Manage Admins</h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading…' : `${admins.length} of 5 admin slots filled`}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700
              text-slate-400 hover:text-white text-sm transition disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && admins.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
              <UserX size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No admins created yet</p>
            <p className="text-slate-600 text-sm">Go to Create Admin to add the first administrator.</p>
          </div>
        )}

        {/* Admin list */}
        {!loading && admins.length > 0 && (
          <div className="space-y-3">
            {admins.map((admin) => {
              const meta      = TYPE_META[admin.adminType] || { label: admin.adminType, color: 'text-slate-400 bg-slate-800 border-slate-700' }
              const isDeleting= deleting === admin._id
              const isConfirm = confirmId === admin._id

              return (
                <div
                  key={admin._id}
                  className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={18} className="text-amber-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{admin.username}</p>
                    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1 ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Delete controls */}
                  {isConfirm ? (
                    // Confirmation row
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400">Delete?</span>
                      <button
                        onClick={() => handleDelete(admin._id)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold
                          hover:bg-red-400 disabled:opacity-50 transition"
                      >
                        {isDeleting
                          ? <Loader2 size={12} className="animate-spin" />
                          : 'Yes, delete'
                        }
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-bold
                          hover:bg-slate-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // Normal delete button
                    <button
                      onClick={() => setConfirmId(admin._id)}
                      className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center
                        text-slate-500 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10
                        transition-all flex-shrink-0"
                      title="Delete admin"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Slot availability summary */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const exists = admins.some(a => a.adminType === type)
              return (
                <div
                  key={type}
                  className={`px-3 py-3 rounded-xl border text-center
                    ${exists
                      ? 'bg-slate-900 border-slate-700'
                      : 'bg-slate-900/50 border-slate-800 opacity-50'
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${exists ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <p className="text-xs font-semibold text-slate-400">{meta.label}</p>
                  <p className={`text-[10px] mt-0.5 ${exists ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {exists ? 'Active' : 'Empty'}
                  </p>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  )
}