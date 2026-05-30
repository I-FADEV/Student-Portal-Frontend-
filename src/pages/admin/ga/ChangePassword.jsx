import { useState } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { GA_NAV } from './Dashboard'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { changeAdminPassword } from '../../../services/api'
import {
  KeyRound, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, ShieldCheck,
} from 'lucide-react'

// This component is used by GA — other admins import with their own navItems
// See bottom of file for how to reuse

function PasswordField({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{label}</label>
      <div className="relative">
        <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}

export function ChangePasswordContent({ navItems }) {
  const { adminToken, adminUser } = useAdminAuth()

  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState(null)

  const set   = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const toggle = (k)  => setShow(p => ({ ...p, [k]: !p[k] }))

  // Password strength
  const strength = (() => {
    const p = form.next
    if (!p) return null
    let score = 0
    if (p.length >= 8)      score++
    if (/[A-Z]/.test(p))    score++
    if (/[0-9]/.test(p))    score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    if (score <= 1) return { label: 'Weak',   color: 'bg-red-500',    width: 'w-1/4' }
    if (score === 2) return { label: 'Fair',   color: 'bg-amber-500',  width: 'w-2/4' }
    if (score === 3) return { label: 'Good',   color: 'bg-blue-500',   width: 'w-3/4' }
    return               { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' }
  })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.current || !form.next || !form.confirm) { setError('All fields are required.'); return }
    if (form.next !== form.confirm) { setError('New passwords do not match.'); return }
    if (form.next.length < 8) { setError('New password must be at least 8 characters.'); return }

    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await changeAdminPassword({ currentPassword: form.current, newPassword: form.next }, adminToken)
      setSuccess(true)
      setForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout navItems={navItems}>
      <div className="space-y-6 max-w-md">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Change Password</h1>
          <p className="text-slate-500 text-sm mt-1">Update your admin account password</p>
        </div>

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <CheckCircle2 size={17} className="flex-shrink-0" />
            Password changed successfully!
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={17} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">

          {/* Security notice */}
          <div className="flex items-center gap-2.5 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <ShieldCheck size={15} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-slate-500">
              Logged in as <span className="text-slate-300 font-semibold">{adminUser?.username || 'Admin'}</span>
            </p>
          </div>

          <PasswordField
            label="Current Password"
            value={form.current}
            onChange={v => set('current', v)}
            show={show.current}
            onToggle={() => toggle('current')}
            placeholder="Enter current password"
          />

          <PasswordField
            label="New Password"
            value={form.next}
            onChange={v => set('next', v)}
            show={show.next}
            onToggle={() => toggle('next')}
            placeholder="Min. 8 characters"
          />

          {/* Strength indicator */}
          {form.next && strength && (
            <div className="space-y-1 -mt-2">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <p className="text-xs text-slate-500">Strength: <span className="font-semibold text-slate-300">{strength.label}</span></p>
            </div>
          )}

          <PasswordField
            label="Confirm New Password"
            value={form.confirm}
            onChange={v => set('confirm', v)}
            show={show.confirm}
            onToggle={() => toggle('confirm')}
            placeholder="Repeat new password"
          />

          {/* Match indicator */}
          {form.confirm && (
            <p className={`text-xs -mt-2 ${form.next === form.confirm ? 'text-emerald-400' : 'text-red-400'}`}>
              {form.next === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/30"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>

      </div>
    </AdminLayout>
  )
}

// GA entry point
export default function ChangePassword() {
  return <ChangePasswordContent navItems={GA_NAV} />
}