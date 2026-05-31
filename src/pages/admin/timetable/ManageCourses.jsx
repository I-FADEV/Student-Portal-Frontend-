import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import { TIMETABLE_NAV } from './Dashboard'
import {
  getAllFaculties, getAllDepartments,
  getTimetableCourses, createTimetableCourse,
  updateTimetableCourse, deleteTimetableCourse,
} from '../../../services/api'
import {
  BookOpen, Plus, X, Check, Trash2, Pencil, AlertCircle,
  Loader2, RefreshCw, ChevronDown, Phone, User,
  Building2, BookMarked, Search, Target,
} from 'lucide-react'

const SEMESTERS = ['First', 'Second']

const EMPTY_FORM = {
  courseCode: '', courseName: '', lecturer: '', lecturerPhone: '',
  session: '', semester: '',
  targets: [], // [{ type: 'department'|'faculty', name, level }]
}

const LEVEL_NUMS = [100, 200, 300, 400, 500]

function Badge({ children, color = 'bg-slate-700 text-slate-300' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {children}
    </span>
  )
}

export default function ManageCourses() {
  const { adminToken } = useAdminAuth()

  const [faculties,   setFaculties]   = useState([])
  const [departments, setDepartments] = useState([])
  const [courses,     setCourses]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  // Session filter
  const [filterSession,  setFilterSession]  = useState('')
  const [filterSemester, setFilterSemester] = useState('')
  const [search,         setSearch]         = useState('')

  // Form
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [creating,  setCreating]  = useState(false)
  const [formErr,   setFormErr]   = useState(null)

  // Edit
  const [editId,    setEditId]    = useState(null)
  const [editing,   setEditing]   = useState(false)
  const [editErr,   setEditErr]   = useState(null)

  // Target builder (within form)
  const [tgtType,   setTgtType]   = useState('department')
  const [tgtName,   setTgtName]   = useState('')
  const [tgtLevel,  setTgtLevel]  = useState('')

  // Delete
  const [confirmId, setConfirmId] = useState(null)
  const [deleting,  setDeleting]  = useState(null)

  // Load registry data once
  useEffect(() => {
    Promise.all([getAllFaculties(adminToken), getAllDepartments(adminToken)])
      .then(([f, d]) => { setFaculties(f); setDepartments(d) })
      .catch(() => {})
  }, [adminToken])

  const loadCourses = async () => {
    if (!filterSession || !filterSemester) return
    setLoading(true)
    setError(null)
    try {
      const data = await getTimetableCourses(filterSession, filterSemester, adminToken)
      setCourses(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCourses() }, [filterSession, filterSemester])

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addTarget = () => {
    if (!tgtName || !tgtLevel) return
    const exists = form.targets.some(t => t.type === tgtType && t.name === tgtName && t.level === Number(tgtLevel))
    if (exists) return
    sf('targets', [...form.targets, { type: tgtType, name: tgtName, level: Number(tgtLevel) }])
    setTgtName('')
    setTgtLevel('')
  }

  const removeTarget = (idx) => sf('targets', form.targets.filter((_, i) => i !== idx))

  const validateForm = (f) => {
    if (!f.courseCode.trim()) return 'Course code is required.'
    if (!f.courseName.trim()) return 'Course name is required.'
    if (!f.lecturer.trim())   return 'Lecturer name is required.'
    if (!f.session.trim())    return 'Session is required.'
    if (!f.semester)          return 'Semester is required.'
    if (f.targets.length === 0) return 'Add at least one target (who takes this course).'
    return null
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const err = validateForm(form)
    if (err) { setFormErr(err); return }
    setCreating(true)
    setFormErr(null)
    try {
      const created = await createTimetableCourse(form, adminToken)
      setCourses(prev => [created, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
      // update filter to match new course
      if (!filterSession)  setFilterSession(form.session)
      if (!filterSemester) setFilterSemester(form.semester)
    } catch (err) {
      setFormErr(err.message)
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (c) => {
    setEditId(c._id)
    setForm({
      courseCode: c.courseCode, courseName: c.courseName,
      lecturer: c.lecturer, lecturerPhone: c.lecturerPhone || '',
      session: c.session, semester: c.semester,
      targets: c.targets || [],
    })
    setEditErr(null)
    setShowForm(false)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    const err = validateForm(form)
    if (err) { setEditErr(err); return }
    setEditing(true)
    setEditErr(null)
    try {
      const updated = await updateTimetableCourse(editId, form, adminToken)
      setCourses(prev => prev.map(c => c._id === editId ? updated : c))
      setEditId(null)
    } catch (err) {
      setEditErr(err.message)
    } finally {
      setEditing(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    setConfirmId(null)
    try {
      await deleteTimetableCourse(id, adminToken)
      setCourses(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const filtered = courses.filter(c =>
    !search ||
    c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
    c.courseName.toLowerCase().includes(search.toLowerCase()) ||
    c.lecturer.toLowerCase().includes(search.toLowerCase())
  )

  const TargetBuilder = ({ form, addTarget, removeTarget, tgtType, setTgtType, tgtName, setTgtName, tgtLevel, setTgtLevel, err }) => (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
        Course Targets <span className="text-red-400">*</span>
        <span className="text-slate-600 font-normal ml-1">— who takes this course?</span>
      </label>

      {/* Existing targets */}
      {form.targets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {form.targets.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg
              bg-blue-500/10 border border-blue-500/20 text-blue-300">
              {t.type === 'faculty' ? '🏛' : '🏢'} {t.name} — L{t.level}
              <button type="button" onClick={() => removeTarget(i)} className="text-blue-400/60 hover:text-red-400">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Target builder row */}
      <div className="flex flex-wrap gap-2 items-end">
        {/* Type toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-700">
          {['department', 'faculty'].map(t => (
            <button type="button" key={t}
              onClick={() => { setTgtType(t); setTgtName('') }}
              className={`px-3 py-2 text-xs font-bold transition-colors capitalize
                ${tgtType === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Name select */}
        <div className="relative flex-1 min-w-[140px]">
          <select value={tgtName} onChange={e => setTgtName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white
              appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition"
          >
            <option value="">Select {tgtType}…</option>
            {tgtType === 'faculty'
              ? faculties.map(f => <option key={f._id} value={f.name}>{f.name}</option>)
              : departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)
            }
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        {/* Level select */}
        <div className="relative">
          <select value={tgtLevel} onChange={e => setTgtLevel(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white
              appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition"
          >
            <option value="">Level…</option>
            {LEVEL_NUMS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        <button type="button" onClick={addTarget}
          disabled={!tgtName || !tgtLevel}
          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold
            disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
        >
          <Plus size={12} /> Add
        </button>
      </div>
      {err && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11}/>{err}</p>}
    </div>
  )

  const CourseForm = ({ isEdit = false }) => (
    <form onSubmit={isEdit ? handleEdit : handleCreate}
      className={`bg-slate-900 border rounded-2xl p-5 space-y-4 ${isEdit ? 'border-blue-500/30' : 'border-slate-700'}`}
    >
      <p className="text-sm font-bold text-blue-300">{isEdit ? `Editing: ${form.courseCode}` : 'New Course'}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Course code */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Code <span className="text-red-400">*</span></label>
          <input type="text" value={form.courseCode}
            onChange={e => sf('courseCode', e.target.value.toUpperCase())}
            placeholder="e.g. CSC301"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white
              placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition uppercase"
          />
        </div>

        {/* Course name */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Course Title <span className="text-red-400">*</span></label>
          <input type="text" value={form.courseName}
            onChange={e => sf('courseName', e.target.value)}
            placeholder="e.g. Data Structures"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white
              placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
          />
        </div>

        {/* Lecturer */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Lecturer <span className="text-red-400">*</span></label>
          <div className="relative">
            <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={form.lecturer}
              onChange={e => sf('lecturer', e.target.value)}
              placeholder="Dr. John Doe"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white
                placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
        </div>

        {/* Lecturer phone */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Lecturer Phone</label>
          <div className="relative">
            <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={form.lecturerPhone}
              onChange={e => sf('lecturerPhone', e.target.value)}
              placeholder="08012345678"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white
                placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
        </div>

        {/* Session */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Session <span className="text-red-400">*</span></label>
          <input type="text" value={form.session}
            onChange={e => sf('session', e.target.value)}
            placeholder="e.g. 2025/2026"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white
              placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
          />
        </div>

        {/* Semester */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Semester <span className="text-red-400">*</span></label>
          <div className="flex gap-2">
            {SEMESTERS.map(s => (
              <button type="button" key={s}
                onClick={() => sf('semester', s)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all
                  ${form.semester === s ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Targets */}
      <TargetBuilder
        form={form} addTarget={addTarget} removeTarget={removeTarget}
        tgtType={tgtType} setTgtType={setTgtType}
        tgtName={tgtName} setTgtName={setTgtName}
        tgtLevel={tgtLevel} setTgtLevel={setTgtLevel}
      />

      {(isEdit ? editErr : formErr) && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={13} /> {isEdit ? editErr : formErr}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button type="submit"
          disabled={isEdit ? editing : creating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500
            text-white text-sm font-bold disabled:opacity-40 transition"
        >
          {(isEdit ? editing : creating) ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {(isEdit ? editing : creating) ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Course')}
        </button>
        <button type="button"
          onClick={() => isEdit ? setEditId(null) : (setShowForm(false), setForm(EMPTY_FORM))}
          className="px-5 py-2.5 rounded-xl bg-slate-700 text-slate-300 text-sm font-bold hover:bg-slate-600 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )

  return (
    <AdminLayout navItems={TIMETABLE_NAV}>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Manage Courses</h1>
            <p className="text-slate-500 text-sm mt-1">Add all courses before generating the timetable</p>
          </div>
          <button onClick={() => { setShowForm(p => !p); setEditId(null); setForm(EMPTY_FORM) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${showForm ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'}`}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Cancel' : 'Add Course'}
          </button>
        </div>

        {/* Add form */}
        {showForm && !editId && <CourseForm />}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[160px]">
            <input type="text" value={filterSession}
              onChange={e => setFilterSession(e.target.value)}
              placeholder="Session (e.g. 2025/2026)"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
                placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
          <div className="flex gap-2">
            {['', ...SEMESTERS].map(s => (
              <button key={s || 'all'} onClick={() => setFilterSemester(s)}
                className={`px-3 py-2.5 rounded-xl border text-sm font-bold transition-all
                  ${filterSemester === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
          <button onClick={loadCourses} disabled={loading || !filterSession || !filterSemester}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800
              text-slate-400 hover:text-white transition disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Search */}
        {courses.length > 0 && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by code, title or lecturer…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
                placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* Prompt to set filter */}
        {!filterSession && (
          <div className="py-12 text-center text-slate-600 text-sm">
            Enter a session above to load courses.
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && filterSession && filterSemester && courses.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
              <BookMarked size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No courses for this session/semester</p>
            <p className="text-slate-600 text-sm">Click "Add Course" to start adding.</p>
          </div>
        )}

        {/* Course list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
                {editId === c._id ? (
                  <div className="p-4"><CourseForm isEdit /></div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BookOpen size={16} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-black px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">
                            {c.courseCode}
                          </span>
                          <p className="text-white font-semibold text-sm">{c.courseName}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><User size={10}/>{c.lecturer}</span>
                          {c.lecturerPhone && <span className="flex items-center gap-1"><Phone size={10}/>{c.lecturerPhone}</span>}
                          <span className="flex items-center gap-1"><Building2 size={10}/>{c.session} · {c.semester}</span>
                        </div>
                        {/* Targets */}
                        {c.targets?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {c.targets.map((t, i) => (
                              <Badge key={i} color="bg-blue-500/10 border border-blue-500/20 text-blue-300">
                                <Target size={8}/> {t.type === 'faculty' ? '🏛' : '🏢'} {t.name} L{t.level}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {confirmId === c._id ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-400">Delete?</span>
                          <button onClick={() => handleDelete(c._id)} disabled={deleting === c._id}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-400 transition disabled:opacity-50"
                          >
                            {deleting === c._id ? <Loader2 size={11} className="animate-spin"/> : 'Yes'}
                          </button>
                          <button onClick={() => setConfirmId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-600 transition"
                          >Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => startEdit(c)}
                            className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center
                              text-slate-500 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all"
                          ><Pencil size={13}/></button>
                          <button onClick={() => setConfirmId(c._id)}
                            className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center
                              text-slate-500 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                          ><Trash2 size={13}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}