import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { TAC_NAV } from './Dashboard'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { getFaculties, getDepartments, registerStudentByAdmin } from '../../../services/api'
import {
  UserPlus, User, Hash, Lock, Eye, EyeOff,
  GraduationCap, Building2, CheckCircle2,
  AlertCircle, Loader2, RefreshCw,
} from 'lucide-react'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition disabled:opacity-40 disabled:cursor-not-allowed`}
      />
    </div>
  )
}

export default function RegisterStudent() {
  const { adminToken } = useAdminAuth()

  const [form, setForm] = useState({
    name: '', matricNumber: '', password: '', confirmPassword: '',
    faculty: '', department: '', level: '',
  })
  const [showPass,    setShowPass]    = useState(false)
  const [faculties,   setFaculties]   = useState([])
  const [departments, setDepartments] = useState([])
  const [loadingReg,  setLoadingReg]  = useState(true)
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState(null)
  const [error,       setError]       = useState(null)

  // Load faculties + departments on mount
  useEffect(() => {
    Promise.allSettled([
      getFaculties(adminToken),
      getDepartments(adminToken),
    ]).then(([f, d]) => {
      if (f.status === 'fulfilled') {
        const list = f.value?.data || f.value?.faculties || f.value || []
        setFaculties(Array.isArray(list) ? list : [])
      }
      if (d.status === 'fulfilled') {
        const list = d.value?.data || d.value?.departments || d.value || []
        setDepartments(Array.isArray(list) ? list : [])
      }
    }).finally(() => setLoadingReg(false))
  }, [adminToken])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Departments filtered by selected faculty
  const filteredDepts = form.faculty
    ? departments.filter(d => (d.faculty?.name || d.faculty || d.facultyName) === form.faculty)
    : departments

  // Levels for selected department
  const selectedDept = departments.find(d =>
    (d.name || d.departmentName) === form.department
  )
  const levels = (() => {
    if (!selectedDept) return []
    const min = selectedDept.minLevel || 100
    const max = selectedDept.maxLevel || 400
    const result = []
    for (let l = min; l <= max; l += 100) result.push(l)
    return result
  })()

  const handleFacultyChange = (v) => {
    set('faculty', v)
    set('department', '')
    set('level', '')
  }

  const handleDeptChange = (v) => {
    set('department', v)
    set('level', '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())          { setError('Full name is required.'); return }
    if (!form.matricNumber.trim())  { setError('Matric number is required.'); return }
    if (!form.password)             { setError('Password is required.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 6)   { setError('Password must be at least 6 characters.'); return }
    if (!form.faculty)              { setError('Please select a faculty.'); return }
    if (!form.department)           { setError('Please select a department.'); return }
    if (!form.level)                { setError('Please select a level.'); return }

    setLoading(true)
    setError(null)
    try {
      await registerStudentByAdmin({
        name:         form.name.trim(),
        matricNumber: form.matricNumber.trim(),
        password:     form.password,
        faculty:      form.faculty,
        department:   form.department,
        level:        Number(form.level),
      }, adminToken)

      setSuccess({
        name: form.name.trim(),
        matric: form.matricNumber.trim(),
        department: form.department,
        level: form.level,
      })
      setForm({ name: '', matricNumber: '', password: '', confirmPassword: '', faculty: '', department: '', level: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout navItems={TAC_NAV}>
      <div className="space-y-6 max-w-lg">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Register Student</h1>
          <p className="text-slate-500 text-sm mt-1">Create a new student account using their matric number</p>
        </div>

        {/* Registry load warning */}
        {!loadingReg && faculties.length === 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm">
            <AlertCircle size={17} className="flex-shrink-0 mt-0.5" />
            <p>No faculties found. Make sure the Registry Admin has added faculties and departments, and that this role has read access to those endpoints.</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-emerald-300 font-bold text-sm">Student registered successfully!</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  <span className="text-white font-semibold">{success.name}</span>
                  {' — '}<span className="font-mono">{success.matric}</span>
                  {' — '}{success.department}, {success.level} Level
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 pl-8">
              The student can now log in with their matric number and the password you set.
            </p>
            <button
              onClick={() => setSuccess(null)}
              className="ml-8 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Register another student →
            </button>
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

          <Field label="Full Name" required>
            <Input icon={User} type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Abubakar Shuaibu" />
          </Field>

          <Field label="Matric Number" required>
            <Input icon={Hash} type="text" value={form.matricNumber} onChange={e => set('matricNumber', e.target.value)} placeholder="e.g. I-FAT/24/CSC/0187" />
          </Field>

          {/* Password row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Password" required>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min. 6 chars"
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password" required>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition"
                />
              </div>
              {form.confirmPassword && (
                <p className={`text-xs mt-1 ${form.password === form.confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                  {form.password === form.confirmPassword ? '✓ Match' : '✗ No match'}
                </p>
              )}
            </Field>
          </div>

          {/* Faculty */}
          <Field label="Faculty" required>
            {loadingReg ? (
              <div className="flex items-center gap-2 py-2.5 text-slate-500 text-sm">
                <Loader2 size={14} className="animate-spin" /> Loading faculties…
              </div>
            ) : (
              <div className="relative">
                <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={form.faculty}
                  onChange={e => handleFacultyChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition appearance-none"
                >
                  <option value="">Select faculty</option>
                  {faculties.map(f => (
                    <option key={f._id || f.name} value={f.name || f.facultyName}>
                      {f.name || f.facultyName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Field>

          {/* Department */}
          <Field label="Department" required>
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={form.department}
                onChange={e => handleDeptChange(e.target.value)}
                disabled={!form.faculty || loadingReg}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">{form.faculty ? 'Select department' : 'Select faculty first'}</option>
                {filteredDepts.map(d => (
                  <option key={d._id || d.name} value={d.name || d.departmentName}>
                    {d.name || d.departmentName}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          {/* Level */}
          <Field label="Level" required>
            <select
              value={form.level}
              onChange={e => set('level', e.target.value)}
              disabled={!form.department || levels.length === 0}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">{form.department ? 'Select level' : 'Select department first'}</option>
              {levels.map(l => <option key={l} value={l}>{l} Level</option>)}
            </select>
          </Field>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/30"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Registering…</>
              : <><UserPlus size={16} /> Register Student</>
            }
          </button>
        </form>

      </div>
    </AdminLayout>
  )
}