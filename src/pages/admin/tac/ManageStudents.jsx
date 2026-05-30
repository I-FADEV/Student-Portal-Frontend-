import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { TAC_NAV } from './Dashboard'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { getAllStudents, resetStudentPassword } from '../../../services/api'
import {
  Users, Search, KeyRound, AlertCircle,
  RefreshCw, X, Eye, EyeOff, CheckCircle2, Loader2,
} from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />
}

// ── Reset password modal ──────────────────────────────────────────────────────
function ResetModal({ student, onClose }) {
  const { adminToken } = useAdminAuth()
  const [newPass,  setNewPass]  = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleReset = async () => {
    if (!newPass || newPass.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (newPass !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    setError(null)
    try {
      await resetStudentPassword({ studentId: student._id, newPassword: newPass }, adminToken)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Reset Password</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <p className="text-slate-400 text-sm">
          Resetting password for <span className="text-white font-semibold">{student.name || student.matricNumber}</span>
        </p>

        {success ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <CheckCircle2 size={17} className="flex-shrink-0" />
            Password reset successfully. Share the new password with the student.
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle size={14} className="flex-shrink-0" />{error}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-4 pr-9 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Confirm Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition"
                />
                {confirm && (
                  <p className={`text-xs mt-1 ${newPass === confirm ? 'text-emerald-400' : 'text-red-400'}`}>
                    {newPass === confirm ? '✓ Match' : '✗ No match'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={loading || !newPass || !confirm}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ManageStudents() {
  const { adminToken } = useAdminAuth()
  const [students,  setStudents]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [resetTarget, setResetTarget] = useState(null)

  const fetchStudents = useCallback((q = '') => {
    setLoading(true)
    setError(null)
    getAllStudents(adminToken, q)
      .then(data => setStudents(data?.data || data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [adminToken])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchStudents(search), 400)
    return () => clearTimeout(t)
  }, [search])

  return (
    <>
      {resetTarget && <ResetModal student={resetTarget} onClose={() => setResetTarget(null)} />}

      <AdminLayout navItems={TAC_NAV}>
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Manage Students</h1>
              <p className="text-slate-500 text-sm mt-1">
                {!loading && `${students.length} student${students.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <button onClick={() => fetchStudents(search)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or matric number…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={17} className="flex-shrink-0" />{error}
            </div>
          )}

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : students.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Users size={22} className="text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm">
                  {search ? `No students match "${search}"` : 'No students registered yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/50">
                      {['#', 'Name', 'Matric No.', 'Faculty', 'Department', 'Level', ''].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s._id || i} className="border-t border-slate-800/60 hover:bg-slate-800/20 transition-colors">
                        <td className="px-5 py-3.5 text-slate-600 text-xs font-mono">{i + 1}</td>
                        <td className="px-5 py-3.5 text-white font-semibold text-sm">{s.name || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{s.matricNumber || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{s.faculty || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{s.department || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{s.level ? `${s.level} Level` : '—'}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setResetTarget(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 text-xs font-semibold transition-all"
                          >
                            <KeyRound size={12} />
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </AdminLayout>
    </>
  )
}