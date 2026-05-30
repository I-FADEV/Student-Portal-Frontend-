import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { REGISTRY_NAV } from './Dashboard'
import {
  getFaculties, getDepartments, createDepartment,
  updateDepartment, deleteDepartment,
} from '../../../services/api'
import {
  BookOpen, Plus, Trash2, Pencil, AlertCircle,
  CheckCircle2, X, Loader2, Building2, ChevronDown,
} from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-700/40 rounded-xl ${className}`} />
}

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3
                     rounded-xl shadow-xl border text-sm font-medium
                     ${type === 'success'
                       ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
                       : 'bg-red-900/90 border-red-700 text-red-200'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}

const LEVEL_OPTIONS = [
  { label: '100 – 300 (3 years)', min: 100, max: 300 },
  { label: '100 – 400 (4 years)', min: 100, max: 400 },
  { label: '100 – 500 (5 years)', min: 100, max: 500 },
  { label: '100 – 600 (6 years)', min: 100, max: 600 },
]

const blankForm = { name: '', facultyId: '', minLevel: 100, maxLevel: 400 }

export default function Departments() {
  const { token } = useAdminAuth()

  const [faculties,    setFaculties]    = useState([])
  const [departments,  setDepartments]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [toast,        setToast]        = useState(null)
  const [filterFacId,  setFilterFacId]  = useState('all')

  // Form state (used for both add and edit)
  const [showForm,     setShowForm]     = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)   // null = add, object = edit
  const [form,         setForm]         = useState(blankForm)
  const [saving,       setSaving]       = useState(false)
  const [formError,    setFormError]    = useState('')

  // Delete confirmation
  const [deleteId,     setDeleteId]     = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadAll = () => {
    setLoading(true)
    Promise.all([getFaculties(token), getDepartments(token)])
      .then(([fac, dep]) => {
        setFaculties(Array.isArray(fac) ? fac : fac?.faculties || [])
        setDepartments(Array.isArray(dep) ? dep : dep?.departments || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [token])

  const openAdd = () => {
    setEditTarget(null)
    setForm(blankForm)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (dept) => {
    setEditTarget(dept)
    setForm({
      name:      dept.name,
      facultyId: dept.faculty?._id || dept.facultyId || '',
      minLevel:  dept.minLevel || 100,
      maxLevel:  dept.maxLevel || 400,
    })
    setFormError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim())    { setFormError('Department name is required'); return }
    if (!form.facultyId)      { setFormError('Please select a faculty');     return }
    setSaving(true)
    setFormError('')
    try {
      if (editTarget) {
        await updateDepartment(editTarget._id, form, token)
        showToast('Department updated')
      } else {
        await createDepartment(form, token)
        showToast('Department added successfully')
      }
      setShowForm(false)
      loadAll()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await deleteDepartment(id, token)
      setDeleteId(null)
      loadAll()
      showToast('Department deleted')
    } catch (err) {
      setDeleteId(null)
      showToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const visibleDepts = filterFacId === 'all'
    ? departments
    : departments.filter((d) => (d.faculty?._id || d.facultyId) === filterFacId)

  // Group by faculty for display
  const grouped = faculties.reduce((acc, fac) => {
    const depts = visibleDepts.filter(
      (d) => (d.faculty?._id || d.facultyId) === fac._id,
    )
    if (depts.length > 0 || filterFacId === fac._id) {
      acc.push({ faculty: fac, depts })
    }
    return acc
  }, [])

  // Ungrouped depts with no matching faculty
  const ungrouped = visibleDepts.filter(
    (d) => !faculties.some((f) => f._id === (d.faculty?._id || d.facultyId)),
  )

  return (
    <AdminLayout navItems={REGISTRY_NAV} title="Registry Admin">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Departments</h1>
            <p className="text-slate-400 text-sm mt-1">
              {departments.length} department{departments.length !== 1 ? 's' : ''} across{' '}
              {faculties.length} {faculties.length === 1 ? 'faculty' : 'faculties'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Faculty filter */}
            <div className="relative">
              <select
                value={filterFacId}
                onChange={(e) => setFilterFacId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-800
                           border border-slate-700 text-slate-300 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Faculties</option>
                {faculties.map((f) => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2
                                                 text-slate-500 pointer-events-none" />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600
                         hover:bg-blue-500 text-white text-sm font-semibold
                         transition-colors shadow-md shadow-blue-900/40"
            >
              <Plus size={16} />
              Add Department
            </button>
          </div>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              {editTarget ? `Edit — ${editTarget.name}` : 'New Department'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Department Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600
                             text-slate-200 placeholder:text-slate-600 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Faculty */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Faculty</label>
                <div className="relative">
                  <select
                    value={form.facultyId}
                    onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-900
                               border border-slate-600 text-slate-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select faculty…</option>
                    {faculties.map((f) => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2
                                                     text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Level range */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-slate-400 font-medium">Level Range (Programme Duration)</label>
                <div className="flex gap-3 flex-wrap">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.max}
                      type="button"
                      onClick={() => setForm({ ...form, minLevel: opt.min, maxLevel: opt.max })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                                  ${form.maxLevel === opt.max
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} /> {formError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600
                           hover:bg-blue-500 text-white text-sm font-semibold
                           disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Department'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-400
                           hover:text-slate-200 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl
                          bg-red-900/20 border border-red-700/40 text-red-400 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && departments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-700/40 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-slate-500" />
            </div>
            <h3 className="text-slate-300 font-semibold">No departments yet</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Add faculties first, then register departments under them.
            </p>
          </div>
        )}

        {/* Grouped list */}
        {!loading && !error && visibleDepts.length > 0 && (
          <div className="space-y-6">
            {grouped.map(({ faculty, depts }) => (
              <div key={faculty._id}>
                {/* Faculty header */}
                <div className="flex items-center gap-2 mb-3">
                  <Building2 size={14} className="text-indigo-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                    {faculty.name}
                  </h2>
                  <span className="text-xs text-slate-600">({depts.length})</span>
                </div>

                <div className="space-y-2">
                  {depts.map((dept) => (
                    <div
                      key={dept._id}
                      className="flex items-center justify-between p-4 rounded-xl
                                 bg-slate-800 border border-slate-700/60
                                 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-900/50 border border-blue-700/40
                                        flex items-center justify-center flex-shrink-0">
                          <BookOpen size={15} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{dept.name}</p>
                          <p className="text-xs text-slate-500">
                            Level {dept.minLevel || 100} – {dept.maxLevel || 400}
                            {dept.studentCount != null && (
                              <span className="ml-2">· {dept.studentCount} student{dept.studentCount !== 1 ? 's' : ''}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {deleteId === dept._id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 mr-1">Delete?</span>
                          <button
                            onClick={() => handleDelete(dept._id)}
                            disabled={deleting}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500
                                       text-white text-xs font-semibold disabled:opacity-50
                                       transition-colors"
                          >
                            {deleting ? 'Deleting…' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="px-3 py-1.5 rounded-lg border border-slate-600
                                       text-slate-400 hover:text-slate-200 text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(dept)}
                            title="Edit department"
                            className="w-8 h-8 rounded-lg flex items-center justify-center
                                       text-slate-500 hover:text-blue-400 hover:bg-blue-900/20
                                       border border-transparent hover:border-blue-800/40
                                       transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(dept._id)}
                            title="Delete department"
                            className="w-8 h-8 rounded-lg flex items-center justify-center
                                       text-slate-500 hover:text-red-400 hover:bg-red-900/20
                                       border border-transparent hover:border-red-800/40
                                       transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Ungrouped fallback */}
            {ungrouped.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-3">Unassigned</p>
                <div className="space-y-2">
                  {ungrouped.map((dept) => (
                    <div key={dept._id} className="p-4 rounded-xl bg-slate-800 border
                                                    border-slate-700 text-slate-300 text-sm">
                      {dept.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && departments.length > 0 && (
          <p className="text-xs text-slate-600 px-1">
            ⚠ A department with registered students cannot be deleted.
          </p>
        )}

      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </AdminLayout>
  )
}