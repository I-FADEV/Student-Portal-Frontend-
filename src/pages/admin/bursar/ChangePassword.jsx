import { useState } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import { changeAdminPassword } from '../../../services/api'
import {
  TrendingUp, Plus, FileText, Wallet,
  Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Lock,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',       path: '/admin/finance',                 icon: TrendingUp },
  { label: 'Create Record',   path: '/admin/finance/create',          icon: Plus },
  { label: 'Manage Records',  path: '/admin/finance/records',         icon: FileText },
  { label: 'Change Password', path: '/admin/finance/change-password', icon: Wallet },
]

function strength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)            score++
  if (/[A-Z]/.test(pw))         score++
  if (/[0-9]/.test(pw))         score++
  if (/[^A-Za-z0-9]/.test(pw))  score++
  const map = [
    { label: 'Too short', color: 'bg-red-500' },
    { label: 'Weak',      color: 'bg-red-500' },
    { label: 'Fair',      color: 'bg-amber-500' },
    { label: 'Good',      color: 'bg-blue-500' },
    { label: 'Strong',    color: 'bg-emerald-500' },
  ]
  return { score, ...map[score] }
}

function Field({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-400 mb-1.5">{label}</label>
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus-within:border-amber-500/50 transition-colors">
        <Lock size={15} className="text-slate-500 flex-shrink-0" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
        />
        <button type="button" onClick={onToggle} className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePassword() {
  const { adminToken } = useAdminAuth()

  const [current,    setCurrent]    = useState('')
  const [newPw,      setNewPw]      = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showCur,    setShowCur]    = useState(false)
  const [showNew,    setShowNew]    = useState(false)
  const [showCon,    setShowCon]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState(null)

  const str     = strength(newPw)
  const matches = newPw && confirm && newPw === confirm

  const handleSubmit = async () => {
    setError(null)
    if (!current)          return setError('Please enter your current password.')
    if (newPw.length < 6)  return setError('New password must be at least 6 characters.')
    if (newPw !== confirm)  return setError('Passwords do not match.')

    setSubmitting(true)
    try {
      await changeAdminPassword({ currentPassword: current, newPassword: newPw, confirmPassword: confirm }, adminToken)
      setSuccess(true)
      setCurrent(''); setNewPw(''); setConfirm('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout navItems={NAV_ITEMS}>
      <div className="max-w-md space-y-8">

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Change Password</h1>
          <p className="text-slate-500 text-sm mt-1">Update your account password</p>
        </div>

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            Password changed successfully.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-5">
          <Field
            label="Current Password"
            value={current}
            onChange={setCurrent}
            show={showCur}
            onToggle={() => setShowCur(p => !p)}
            placeholder="Enter current password"
          />

          <Field
            label="New Password"
            value={newPw}
            onChange={setNewPw}
            show={showNew}
            onToggle={() => setShowNew(p => !p)}
            placeholder="Enter new password"
          />

          {/* Strength meter */}
          {newPw && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1,2,3,4].map(n => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-all ${n <= str.score ? str.color : 'bg-slate-700'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500">Strength: <span className="font-semibold text-white">{str.label}</span></p>
            </div>
          )}

          <Field
            label="Confirm New Password"
            value={confirm}
            onChange={setConfirm}
            show={showCon}
            onToggle={() => setShowCon(p => !p)}
            placeholder="Re-enter new password"
          />

          {/* Match indicator */}
          {confirm && (
            <p className={`text-xs font-semibold flex items-center gap-1.5 ${matches ? 'text-emerald-400' : 'text-red-400'}`}>
              {matches ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {matches ? 'Passwords match' : 'Passwords do not match'}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-amber-900/30 mt-2"
          >
            {submitting ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : 'Update Password'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}