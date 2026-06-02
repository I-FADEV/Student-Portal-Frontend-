import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { REGISTRY_NAV } from './Dashboard'
import {
  getFaculties, createFaculty, deleteFaculty,
} from '../../../services/api'
import {
  Building2, Plus, Trash2, AlertCircle,
  CheckCircle2, X, Loader2,
} from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-700/40 rounded-xl ${className}`} />
}

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3
                     rounded-xl shadow-xl border text-sm font-medium animate-fade-in
                     ${type === 'success'
                       ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
                       : 'bg-red-900/90 border-red-700 text-red-200'}`}>
      {type === 'success'
        ? <CheckCircle2 size={16} />
        : <AlertCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}

export default function Faculties() {
  const { adminToken } = useAdminAuth()

  const [faculties,  setFaculties]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [toast,      setToast]      = useState(null)

  // Add form
  const [showForm,   setShowForm]   = useState(false)
  const [newName,    setNewName]    = useState('')
  const [adding,     setAdding]     = useState(false)
  const [addError,   setAddError]   = useState('')

  // Delete confirmation
  const [deleteId,   setDeleteId]   = useState(null)
  const [deleting,   setDeleting]   = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = () => {
    setLoading(true)
    getFaculties(adminToken)
      .then((res) => {
        console.log('Faculty response:', res)
        setFaculties(res.data || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [adminToken])

  const handleAdd = async () => {
    if (!newName.trim()) { setAddError('Faculty name is required'); return }
    setAdding(true)
    setAddError('')
    try {
      await createFaculty({ name: newName.trim() }, adminToken)
      setNewName('')
      setShowForm(false)
      load()
      showToast('Faculty added successfully')
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await deleteFaculty(id, adminToken)
      setDeleteId(null)
      load()
      showToast('Faculty deleted')
    } catch (err) {
      setDeleteId(null)
      showToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminLayout navItems={REGISTRY_NAV} title="Registry Admin">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Faculties</h1>
            <p className="text-slate-400 text-sm mt-1">
              {faculties.length} {faculties.length === 1 ? 'faculty' : 'faculties'} registered
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setAddError('') }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600
                       hover:bg-blue-500 text-white text-sm font-semibold
                       transition-colors shadow-md shadow-blue-900/40"
          >
            <Plus size={16} />
            Add Faculty
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">New Faculty</h3>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Faculty Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. Faculty of Science"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600
                           text-slate-200 placeholder:text-slate-600 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {addError && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {addError}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600
                           hover:bg-blue-500 text-white text-sm font-semibold
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {adding ? 'Adding…' : 'Add Faculty'}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName(''); setAddError('') }}
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
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && faculties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-700/40 flex items-center
                            justify-center mb-4">
              <Building2 size={28} className="text-slate-500" />
            </div>
            <h3 className="text-slate-300 font-semibold">No faculties yet</h3>
            <p className="text-slate-500 text-sm mt-1">
              Add the first faculty to get started.
            </p>
          </div>
        )}

        {/* Faculty list */}
        {!loading && !error && faculties.length > 0 && (
          <div className="space-y-3">
            {faculties.map((faculty) => (
              <div
                key={faculty._id}
                className="flex items-center justify-between p-4 rounded-xl
                           bg-slate-800 border border-slate-700/60
                           hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-900/50 border border-indigo-700/40
                                  flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{faculty.name}</p>
                    <p className="text-xs text-slate-500">
                      {faculty.departmentCount ?? 0} department{faculty.departmentCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Delete / confirm inline */}
                {deleteId === faculty._id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 mr-1">Delete?</span>
                    <button
                      onClick={() => handleDelete(faculty._id)}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500
                                 text-white text-xs font-semibold disabled:opacity-50
                                 transition-colors"
                    >
                      {deleting ? 'Deleting…' : 'Yes, Delete'}
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
                  <button
                    onClick={() => setDeleteId(faculty._id)}
                    title="Delete faculty"
                    className="w-8 h-8 rounded-lg flex items-center justify-center
                               text-slate-600 hover:text-red-400 hover:bg-red-900/20
                               border border-transparent hover:border-red-800/40
                               transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info note */}
        {!loading && faculties.length > 0 && (
          <p className="text-xs text-slate-600 px-1">
            ⚠ A faculty with registered departments or students cannot be deleted.
          </p>
        )}

      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </AdminLayout>
  )
}