import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { GA_NAV } from './Dashboard'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { createAdmin, getAllAdmins } from '../../../services/api'
import {
  PlusCircle, User, Lock, CheckCircle2,
  AlertCircle, Eye, EyeOff, Copy, Check,
  ShieldOff, Loader2,
} from 'lucide-react'

const ADMIN_TYPES = [
  { value: 'registry_admin',  label: 'Registry Admin',   desc: 'Generates matric numbers, manages departments & faculties' },
  { value: 'timetable_admin', label: 'Timetable Admin',  desc: 'Uploads timetables and results via Excel' },
  { value: 'finance_admin',   label: 'Finance Admin',     desc: 'Creates finance records, marks fees paid' },
  { value: 'idcard_admin',    label: 'Idcard Admin',        desc: 'Registers students, Reviews ID cards, marks collected or rejected' },
]

const DEFAULT_PASSWORD = 'Ifatoss@2026'

export default function CreateAdmin() {
  const { adminToken } = useAdminAuth()

  const [form, setForm]             = useState({ username: '', adminType: '' })
  const [loading, setLoading]       = useState(false)
  const [fetching, setFetching]     = useState(true)   // loading existing admins
  const [existingTypes, setExisting]= useState([])     // array of taken adminType strings
  const [success, setSuccess]       = useState(null)
  const [error, setError]           = useState(null)
  const [showPass, setShowPass]     = useState(false)
  const [copied, setCopied]         = useState(false)

  // ── Fetch existing admins on mount ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const admins = await getAllAdmins(adminToken)
        // admins is an array; extract the adminType strings that are already taken
        setExisting(admins.map(a => a.adminType))
      } catch {
        // non-critical — if fetch fails, don't block the form; just show no restrictions
        setExisting([])
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [adminToken])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleCopy = () => {
    navigator.clipboard.writeText(DEFAULT_PASSWORD)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.adminType) {
      setError('Please fill in all fields.')
      return
    }
    // Double-check on submit (race condition guard)
    if (existingTypes.includes(form.adminType)) {
      setError('An admin of this type already exists. Delete the existing one first.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await createAdmin(
        { username: form.username.trim(), adminType: form.adminType, password: DEFAULT_PASSWORD },
        adminToken
      )
      setSuccess({ username: form.username.trim(), adminType: form.adminType })
      setForm({ username: '', adminType: '' })
      // Mark new type as taken immediately in local state
      setExisting(prev => [...prev, form.adminType])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // How many of the 4 types are still available?
  const availableCount = ADMIN_TYPES.filter(t => !existingTypes.includes(t.value)).length
  const allFilled = availableCount === 0

  return (
    <AdminLayout navItems={GA_NAV}>
      <div className="space-y-6 max-w-lg">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Register a new administrator account</p>
        </div>

        {/* Slot summary */}
        {!fetching && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
            ${allFilled
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <ShieldOff size={15} className="flex-shrink-0" />
            {allFilled
              ? 'All 5 admin slots are filled. Delete an admin to create a new one.'
              : `${existingTypes.length} of 5 admin slots filled — ${availableCount} available`
            }
          </div>
        )}

        {/* Success card */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-emerald-300 font-bold text-sm">Admin created successfully!</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  <span className="text-white font-mono">{success.username}</span>
                  {' — '}
                  {ADMIN_TYPES.find(t => t.value === success.adminType)?.label}
                </p>
              </div>
            </div>
            {/* Default password reveal */}
            <div className="bg-slate-900 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Default Password — share with admin
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-amber-400 font-mono text-sm bg-slate-800 px-3 py-2 rounded-lg">
                  {showPass ? DEFAULT_PASSWORD : '•'.repeat(DEFAULT_PASSWORD.length)}
                </code>
                <button
                  onClick={() => setShowPass(p => !p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={handleCopy}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-slate-600">The admin must change this password after first login.</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={17} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Username
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={form.username}
                onChange={e => set('username', e.target.value)}
                placeholder="e.g. financeadmin"
                disabled={allFilled || fetching}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600
                  focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50
                  disabled:opacity-40 disabled:cursor-not-allowed transition"
              />
            </div>
          </div>

          {/* Admin type selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Admin Type
            </label>

            {fetching ? (
              // Loading state while checking existing admins
              <div className="flex items-center gap-3 py-6 justify-center text-slate-500 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Checking existing admins…
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {ADMIN_TYPES.map((t) => {
                  const taken    = existingTypes.includes(t.value)
                  const selected = form.adminType === t.value

                  return (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => !taken && set('adminType', t.value)}
                      disabled={taken}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150
                        ${taken
                          ? 'bg-slate-800/30 border-slate-700/30 opacity-50 cursor-not-allowed'
                          : selected
                            ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20'
                            : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600 cursor-pointer'
                        }`}
                    >
                      {/* Radio dot or taken indicator */}
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors
                        ${taken
                          ? 'border-slate-600 bg-slate-600'
                          : selected
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-slate-600'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold
                            ${taken ? 'text-slate-500' : selected ? 'text-amber-300' : 'text-slate-300'}`}
                          >
                            {t.label}
                          </p>
                          {/* "Already created" badge */}
                          {taken && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5
                              rounded-full bg-slate-700 text-slate-400 uppercase tracking-wider">
                              <CheckCircle2 size={9} /> Already created
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Default password info */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <Lock size={14} className="text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-500">
              Default password:{' '}
              <span className="text-slate-300 font-mono">Ifatoss@2026</span>
              {' '}— admin must change after first login
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.username || !form.adminType || allFilled || fetching}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-slate-950
              font-bold text-sm hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed
              transition-all shadow-lg shadow-amber-900/30"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              : <PlusCircle size={17} />
            }
            {loading ? 'Creating…' : 'Create Admin Account'}
          </button>
        </form>

      </div>
    </AdminLayout>
  )
}