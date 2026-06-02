import { useState } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { REGISTRY_NAV } from './Dashboard'
import { changeAdminPassword } from '../../../services/api'
import {
  Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, Loader2, ShieldCheck,
} from 'lucide-react'

function PasswordInput({ label, value, onChange, placeholder, id }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-400">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-900 border border-slate-600
                     text-slate-200 placeholder:text-slate-600 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                     hover:text-slate-300 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePassword() {
  const { adminToken } = useAdminAuth()

  const [currentPwd,  setCurrentPwd]  = useState('')
  const [newPwd,      setNewPwd]      = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)

  const strength = (() => {
    if (newPwd.length === 0) return null
    if (newPwd.length < 6)  return { label: 'Too short', color: 'bg-red-500',    width: 'w-1/4' }
    if (newPwd.length < 8)  return { label: 'Weak',      color: 'bg-amber-500',  width: 'w-2/4' }
    if (!/[A-Z]/.test(newPwd) || !/[0-9]/.test(newPwd))
                            return { label: 'Fair',       color: 'bg-yellow-400', width: 'w-3/4' }
    return                         { label: 'Strong',     color: 'bg-emerald-500',width: 'w-full' }
  })()

  const handleSubmit = async () => {
    setError('')
    if (!currentPwd) { setError('Current password is required');                  return }
    if (!newPwd)     { setError('New password is required');                       return }
    if (newPwd.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPwd !== confirmPwd) { setError('Passwords do not match');              return }

    setLoading(true)
    try {
      await changeAdminPassword({ currentPassword: currentPwd, newPassword: newPwd, confirmPassword: confirmPwd }, adminToken)
      setSuccess(true)
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout navItems={REGISTRY_NAV} title="Registry Admin">
      <div className="max-w-lg space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Change Password</h1>
          <p className="text-slate-400 text-sm mt-1">Update your Registry Admin account password</p>
        </div>

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl
                          bg-emerald-900/20 border border-emerald-700/40 text-emerald-300 text-sm">
            <CheckCircle2 size={18} className="flex-shrink-0" />
            Password changed successfully. Use your new password next time you log in.
          </div>
        )}

        {/* Form card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-700/40
                            flex items-center justify-center">
              <ShieldCheck size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Security Update</p>
              <p className="text-xs text-slate-500">All current sessions remain active</p>
            </div>
          </div>

          <PasswordInput
            id="current"
            label="Current Password"
            value={currentPwd}
            onChange={setCurrentPwd}
            placeholder="Enter your current password"
          />

          <PasswordInput
            id="new"
            label="New Password"
            value={newPwd}
            onChange={setNewPwd}
            placeholder="Enter new password"
          />

          {/* Strength bar */}
          {strength && (
            <div className="space-y-1 -mt-2">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <p className={`text-xs ${
                strength.label === 'Strong' ? 'text-emerald-400' :
                strength.label === 'Fair'   ? 'text-yellow-400'  :
                strength.label === 'Weak'   ? 'text-amber-400'   : 'text-red-400'}`}>
                {strength.label}
              </p>
            </div>
          )}

          <PasswordInput
            id="confirm"
            label="Confirm New Password"
            value={confirmPwd}
            onChange={setConfirmPwd}
            placeholder="Re-enter new password"
          />

          {/* Match indicator */}
          {confirmPwd && (
            <p className={`text-xs flex items-center gap-1 -mt-2
                           ${newPwd === confirmPwd ? 'text-emerald-400' : 'text-red-400'}`}>
              {newPwd === confirmPwd
                ? <><CheckCircle2 size={12} /> Passwords match</>
                : <><AlertCircle  size={12} /> Passwords do not match</>}
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl
                            bg-red-900/20 border border-red-700/40 text-red-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors shadow-md shadow-blue-900/40 mt-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Updating…</>
              : <><Lock size={16} /> Update Password</>}
          </button>
        </div>

        <p className="text-xs text-slate-600 px-1">
          Use a strong password with uppercase letters, numbers and at least 8 characters.
        </p>
      </div>
    </AdminLayout>
  )
}