import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import {
  searchStudents,
  getStudentsByFilter,
  createFinanceRecord,
  createFinanceBulk,
  getFaculties,
  getDepartments,
} from '../../../services/api'
import {
  TrendingUp, Plus, FileText, Wallet,
  Search, X, ChevronDown, Loader2,
  CheckCircle2, AlertCircle, Trash2,
  UserCheck, Users, Building2, GraduationCap,
  Globe,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',       path: '/admin/bursar',                 icon: TrendingUp },
  { label: 'Create Record',   path: '/admin/bursar/create',          icon: Plus },
  { label: 'Manage Records',  path: '/admin/bursar/records',         icon: FileText },
  { label: 'Change Password', path: '/admin/bursar/change-password', icon: Wallet },
]

const PRESET_LABELS = [
  'Tuition', 'ID Card', 'Library Fee', 'Lab Fee',
  'Exam Fee', 'Sports Fee', 'Medical Fee', 'Development Levy',
]

const SESSIONS  = ['2025/2026', '2024/2025', '2023/2024', '2022/2023']
const SEMESTERS = ['First', 'Second']

// Generate level options from a department's minLevel → maxLevel in steps of 100
function getLevelsForDept(dept) {
  if (!dept) return []
  const min = dept.minLevel || 100
  const max = dept.maxLevel || 400
  const levels = []
  for (let l = min; l <= max; l += 100) levels.push(l)
  return levels
}

// ─── Mode tab ─────────────────────────────────────────────────────────────────
function ModeTab({ icon: Icon, label, desc, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-150 ${
        active
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
          : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800/70'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      <p className="text-xs font-bold leading-tight">{label}</p>
      <p className="text-[10px] leading-tight opacity-70">{desc}</p>
    </button>
  )
}

// ─── Fee item row ─────────────────────────────────────────────────────────────
function ItemRow({ item, index, onChange, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl group">
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={item.label}
          onChange={e => onChange(index, 'label', e.target.value)}
          placeholder="Fee label (e.g. Tuition)"
          list="preset-labels"
          className="w-full bg-transparent text-white text-sm placeholder-slate-600 outline-none border-b border-slate-700 focus:border-amber-500 pb-0.5 transition-colors"
        />
        <datalist id="preset-labels">
          {PRESET_LABELS.map(l => <option key={l} value={l} />)}
        </datalist>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-slate-500 text-sm">₦</span>
        <input
          type="number"
          value={item.amount}
          onChange={e => onChange(index, 'amount', e.target.value)}
          placeholder="0"
          min="0"
          className="w-28 bg-transparent text-white text-sm placeholder-slate-600 outline-none border-b border-slate-700 focus:border-amber-500 pb-0.5 transition-colors text-right"
        />
      </div>
      {canRemove && (
        <button
          onClick={() => onRemove(index)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Select with chevron ──────────────────────────────────────────────────────
function SelectField({ value, onChange, children, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CreateRecord() {
  const { adminToken } = useAdminAuth()
  const navigate = useNavigate()

  // ── Registry data ──
  const [faculties,    setFaculties]    = useState([])
  const [departments,  setDepartments]  = useState([])
  const [loadingData,  setLoadingData]  = useState(true)
  const [dataError,    setDataError]    = useState(null)

  // ── Mode ──
  const [mode, setMode] = useState('single')

  // ── Single student ──
  const [query,        setQuery]        = useState('')
  const [searching,    setSearching]    = useState(false)
  const [results,      setResults]      = useState([])
  const [selected,     setSelected]     = useState(null)
  const [showResults,  setShowResults]  = useState(false)
  const searchTimer = useRef(null)

  // ── Bulk: department mode ──
  const [targetDeptId,  setTargetDeptId]  = useState('')   // _id of selected dept
  const [targetLevel,   setTargetLevel]   = useState('')

  // ── Bulk: faculty mode ──
  const [targetFacId,   setTargetFacId]   = useState('')   // _id of selected faculty

  // ── Bulk preview ──
  const [previewing,    setPreviewing]    = useState(false)
  const [previewCount,  setPreviewCount]  = useState(null)

  // ── Session / semester ──
  const [session,  setSession]  = useState('')
  const [semester, setSemester] = useState('')

  // ── Items ──
  const [items, setItems] = useState([{ label: '', amount: '' }])

  // ── Submit ──
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(null)
  const [error,      setError]      = useState(null)

  // ── Fetch faculties + departments on mount ──
  useEffect(() => {
    setLoadingData(true)
    setDataError(null)
    Promise.all([getFaculties(adminToken), getDepartments(adminToken)])
      .then(([facRes, deptRes]) => {
        setFaculties(Array.isArray(facRes) ? facRes : facRes?.faculties || facRes?.data || [])
        setDepartments(Array.isArray(deptRes) ? deptRes : deptRes?.departments || deptRes?.data || [])
      })
      .catch(err => setDataError(err.message))
      .finally(() => setLoadingData(false))
  }, [adminToken])

  // Derive the selected department object for level range
  const selectedDeptObj = departments.find(d => d._id === targetDeptId) || null
  const levelOptions    = getLevelsForDept(selectedDeptObj)

  // Reset level when department changes
  const handleDeptChange = (id) => {
    setTargetDeptId(id)
    setTargetLevel('')
    setPreviewCount(null)
  }

  // Reset preview when faculty changes
  const handleFacChange = (id) => {
    setTargetFacId(id)
    setPreviewCount(null)
  }

  // ── Student search ──
  const handleSearch = useCallback((val) => {
    setQuery(val)
    setSelected(null)
    clearTimeout(searchTimer.current)
    if (!val.trim()) { setResults([]); setShowResults(false); return }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchStudents(val, adminToken)
        setResults(res?.data || [])
        setShowResults(true)
      } catch { setResults([]) }
      finally   { setSearching(false) }
    }, 400)
  }, [adminToken])

  const selectStudent = (s) => {
    setSelected(s)
    setQuery(s.name || s.matricNumber)
    setShowResults(false)
    setResults([])
  }

  const clearStudent = () => {
    setSelected(null); setQuery(''); setResults([]); setShowResults(false)
  }

  // ── Bulk preview ──
  const handlePreview = async () => {
    setPreviewing(true)
    setPreviewCount(null)
    try {
      const params = {}
      if (mode === 'department') {
        if (selectedDeptObj) params.department = selectedDeptObj.name
        if (targetLevel)     params.level      = targetLevel
      }
      if (mode === 'faculty') {
        const fac = faculties.find(f => f._id === targetFacId)
        if (fac) params.faculty = fac.name
      }
      const res = await getStudentsByFilter(params, adminToken)
      setPreviewCount(res?.data?.length ?? 0)
    } catch { setPreviewCount(null) }
    finally   { setPreviewing(false) }
  }

  // ── Items helpers ──
  const updateItem  = (i, field, val) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it))
  const addItem     = () => setItems(prev => [...prev, { label: '', amount: '' }])
  const removeItem  = (i) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const totalAmount = items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0)

  const validateItems = () => {
    if (items.some(it => !it.label.trim() || !it.amount || parseFloat(it.amount) <= 0))
      return 'All fee items must have a label and a valid amount greater than 0.'
    return null
  }

  // ── Submit ──
  const handleSubmit = async () => {
    setError(null)
    const itemErr = validateItems()
    if (itemErr)   return setError(itemErr)
    if (!session)  return setError('Please select a session.')
    if (!semester) return setError('Please select a semester.')

    const cleanItems = items.map(it => ({
      label:  it.label.trim().toLowerCase() === 'id card' ? 'ID Card' : it.label.trim(),
      amount: parseFloat(it.amount),
    }))

    setSubmitting(true)
    try {
      if (mode === 'single') {
        if (!selected) { setError('Please search and select a student.'); setSubmitting(false); return }
        await createFinanceRecord({ studentId: selected._id, session, semester, items: cleanItems }, adminToken)
        setSuccess('single')
      } else {
        const payload = { session, semester, items: cleanItems, target: mode }

        if (mode === 'department') {
          if (!targetDeptId) { setError('Please select a department.'); setSubmitting(false); return }
          payload.department = selectedDeptObj?.name || ''
          if (targetLevel) payload.level = Number(targetLevel)
        }

        if (mode === 'faculty') {
          if (!targetFacId) { setError('Please select a faculty.'); setSubmitting(false); return }
          const fac = faculties.find(f => f._id === targetFacId)
          payload.faculty = fac?.name || ''
        }

        const res = await createFinanceBulk(payload, adminToken)
        setSuccess({ created: res.created, skipped: res.skipped, total: res.total })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSuccess(null); setMode('single'); setSelected(null); setQuery('')
    setSession(''); setSemester(''); setItems([{ label: '', amount: '' }])
    setTargetDeptId(''); setTargetLevel(''); setTargetFacId('')
    setPreviewCount(null); setError(null)
  }

  // ── Success screen ──
  if (success) {
    const isSingle = success === 'single'
    return (
      <AdminLayout navItems={NAV_ITEMS}>
        <div className="max-w-lg mx-auto mt-16 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {isSingle ? 'Record Created!' : 'Bulk Records Created!'}
            </h2>
            {isSingle ? (
              <p className="text-slate-500 text-sm mt-1">
                Finance record for <span className="text-white font-semibold">{selected?.name || selected?.matricNumber}</span> created successfully.
              </p>
            ) : (
              <div className="mt-3 space-y-1">
                <p className="text-slate-400 text-sm">
                  <span className="text-emerald-400 font-bold">{success.created}</span> records created
                  {success.skipped > 0 && (
                    <span className="text-slate-500"> · <span className="text-amber-400 font-bold">{success.skipped}</span> skipped (already existed)</span>
                  )}
                </p>
                <p className="text-slate-600 text-xs">out of {success.total} students matched</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors">
              Create Another
            </button>
            <button onClick={() => navigate('/admin/bursar/records')} className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold hover:bg-amber-400 transition-colors">
              View Records
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout navItems={NAV_ITEMS}>
      <div className="max-w-2xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Finance Record</h1>
          <p className="text-slate-500 text-sm mt-1">Assign a fee structure to a student, department, faculty, or all students</p>
        </div>

        {/* Registry data error */}
        {dataError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            Could not load faculties/departments: {dataError}. Ask your backend dev to allow finance_admin to read registry data.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── STEP 1: Mode ── */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">1. Who is this for?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ModeTab icon={UserCheck}     label="Single Student" desc="One student"    active={mode === 'single'}     onClick={() => { setMode('single');     setPreviewCount(null) }} />
            <ModeTab icon={GraduationCap} label="Department"     desc="Dept / level"  active={mode === 'department'} onClick={() => { setMode('department'); setPreviewCount(null) }} />
            <ModeTab icon={Building2}     label="Faculty"        desc="Entire faculty" active={mode === 'faculty'}    onClick={() => { setMode('faculty');    setPreviewCount(null) }} />
            <ModeTab icon={Globe}         label="All Students"   desc="Everyone"       active={mode === 'all'}        onClick={() => { setMode('all');        setPreviewCount(null) }} />
          </div>
        </div>

        {/* ── STEP 2: Target ── */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">2. Select Target</h2>

          {/* Single student */}
          {mode === 'single' && (
            <div className="space-y-3">
              <div className="relative">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus-within:border-amber-500/50 transition-colors">
                  {searching
                    ? <Loader2 size={16} className="text-slate-500 animate-spin flex-shrink-0" />
                    : <Search  size={16} className="text-slate-500 flex-shrink-0" />
                  }
                  <input
                    type="text"
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    placeholder="Search by name or matric number…"
                    className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
                  />
                  {query && (
                    <button onClick={clearStudent} className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
                      <X size={15} />
                    </button>
                  )}
                </div>

                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-20">
                    {results.length === 0 ? (
                      <p className="px-4 py-3 text-slate-500 text-sm">No students found.</p>
                    ) : results.map(s => (
                      <button
                        key={s._id}
                        onClick={() => selectStudent(s)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/60 transition-colors text-left border-b border-slate-700/50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-amber-400 font-bold text-xs">
                            {(s.name || s.matricNumber || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{s.name || '—'}</p>
                          <p className="text-slate-500 text-xs">{s.matricNumber} · {s.department} · {s.level} Level</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selected && (
                <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <UserCheck size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{selected.name || '—'}</p>
                    <p className="text-slate-400 text-xs">{selected.matricNumber} · {selected.department} · {selected.level} Level</p>
                  </div>
                  <button onClick={clearStudent} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Department mode */}
          {mode === 'department' && (
            <div className="space-y-3">
              {loadingData ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Loading departments…
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Department dropdown */}
                  <SelectField value={targetDeptId} onChange={handleDeptChange}>
                    <option value="">Select department</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                        {d.faculty?.name ? ` (${d.faculty.name})` : ''}
                      </option>
                    ))}
                  </SelectField>

                  {/* Level dropdown — built from selected dept's range */}
                  <SelectField
                    value={targetLevel}
                    onChange={val => { setTargetLevel(val); setPreviewCount(null) }}
                    disabled={!targetDeptId}
                  >
                    <option value="">All Levels</option>
                    {levelOptions.map(l => (
                      <option key={l} value={l}>{l} Level</option>
                    ))}
                  </SelectField>
                </div>
              )}

              {/* Show dept info when selected */}
              {selectedDeptObj && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border border-slate-700/40 rounded-xl text-slate-400 text-xs">
                  <GraduationCap size={13} className="text-amber-400 flex-shrink-0" />
                  <span>
                    <span className="text-white font-semibold">{selectedDeptObj.name}</span>
                    {selectedDeptObj.faculty?.name && <span> · {selectedDeptObj.faculty.name} Faculty</span>}
                    <span> · Levels {selectedDeptObj.minLevel}–{selectedDeptObj.maxLevel}</span>
                  </span>
                </div>
              )}

              <PreviewButton
                onClick={handlePreview}
                disabled={previewing || !targetDeptId}
                previewing={previewing}
              />
              <PreviewResult count={previewCount} suffix="will receive this fee record" />
            </div>
          )}

          {/* Faculty mode */}
          {mode === 'faculty' && (
            <div className="space-y-3">
              {loadingData ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Loading faculties…
                </div>
              ) : (
                <SelectField value={targetFacId} onChange={handleFacChange}>
                  <option value="">Select faculty</option>
                  {faculties.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name}
                      {f.departmentCount != null ? ` (${f.departmentCount} dept${f.departmentCount !== 1 ? 's' : ''})` : ''}
                    </option>
                  ))}
                </SelectField>
              )}

              {/* Show faculty info when selected */}
              {targetFacId && (() => {
                const fac = faculties.find(f => f._id === targetFacId)
                return fac ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border border-slate-700/40 rounded-xl text-slate-400 text-xs">
                    <Building2 size={13} className="text-amber-400 flex-shrink-0" />
                    <span>
                      <span className="text-white font-semibold">{fac.name} Faculty</span>
                      {fac.departmentCount != null && <span> · {fac.departmentCount} department{fac.departmentCount !== 1 ? 's' : ''}</span>}
                    </span>
                  </div>
                ) : null
              })()}

              <PreviewButton
                onClick={handlePreview}
                disabled={previewing || !targetFacId}
                previewing={previewing}
              />
              <PreviewResult count={previewCount} suffix="in this faculty will receive this fee record" />
            </div>
          )}

          {/* All students mode */}
          {mode === 'all' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Globe size={18} className="text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-amber-400 font-bold text-sm">All Students</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    This fee record will be created for every registered student.
                    Records that already exist for the selected session/semester will be skipped.
                  </p>
                </div>
              </div>
              <PreviewButton onClick={handlePreview} disabled={previewing} previewing={previewing} />
              <PreviewResult count={previewCount} suffix="total students in the system" />
            </div>
          )}
        </div>

        {/* ── STEP 3: Session + Semester ── */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">3. Session & Semester</h2>
          <div className="grid grid-cols-2 gap-4">
            <SelectField value={session} onChange={setSession}>
              <option value="">Select session</option>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </SelectField>
            <SelectField value={semester} onChange={setSemester}>
              <option value="">Select semester</option>
              {SEMESTERS.map(s => <option key={s} value={s}>{s} Semester</option>)}
            </SelectField>
          </div>
        </div>

        {/* ── STEP 4: Fee items ── */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">4. Fee Items</h2>
            <span className="text-xs text-slate-600">Type or pick from suggestions</span>
          </div>

          <div className="space-y-2.5">
            {items.map((item, i) => (
              <ItemRow
                key={i}
                item={item}
                index={i}
                onChange={updateItem}
                onRemove={removeItem}
                canRemove={items.length > 1}
              />
            ))}
          </div>

          <button
            onClick={addItem}
            className="flex items-center gap-2 text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors"
          >
            <Plus size={15} />
            Add fee item
          </button>

          {totalAmount > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-slate-400 text-sm font-medium">Total per student</span>
              <span className="text-white font-black text-lg">₦{totalAmount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={submitting || loadingData}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/30"
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Creating…</>
          ) : mode === 'single' ? 'Create Finance Record'
            : mode === 'all'    ? 'Create Records for All Students'
            : mode === 'faculty' ? `Create Records for ${faculties.find(f => f._id === targetFacId)?.name || 'Faculty'} Faculty`
            : `Create Records for ${departments.find(d => d._id === targetDeptId)?.name || 'Department'}`
          }
        </button>

      </div>
    </AdminLayout>
  )
}

// ─── Small reusable helpers ───────────────────────────────────────────────────
function PreviewButton({ onClick, disabled, previewing }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {previewing ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
      {previewing ? 'Checking…' : 'Preview how many students will be affected'}
    </button>
  )
}

function PreviewResult({ count, suffix }) {
  if (count === null) return null
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm font-semibold">
      <Users size={14} />
      {count} student{count !== 1 ? 's' : ''} {suffix}
      {count === 0 && <span className="text-slate-500 font-normal ml-1">(no students match this filter)</span>}
    </div>
  )
}