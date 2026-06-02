import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { REGISTRY_NAV } from './Dashboard'
import { getFaculties, getDepartments } from '../../../services/api'
import {
  Hash, Copy, CheckCheck, ChevronDown,
  AlertCircle, Loader2, RefreshCw, Clock,
} from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-700/40 rounded-xl ${className}`} />
}

export default function GenerateMatric() {
  const { adminToken } = useAdminAuth()

  const [faculties,    setFaculties]    = useState([])
  const [departments,  setDepartments]  = useState([])
  const [loadingDeps,  setLoadingDeps]  = useState(true)

  const [selectedFac,  setSelectedFac]  = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [year,         setYear]         = useState(new Date().getFullYear().toString().slice(-2))

  const [generating,   setGenerating]   = useState(false)
  const [generated,    setGenerated]    = useState(null)   // { matricNumber, dept, year }
  const [genError,     setGenError]     = useState('')
  const [copied,       setCopied]       = useState(false)

  // History of generated numbers this session
  const [history,      setHistory]      = useState([])

  useEffect(() => {
    Promise.all([getFaculties(adminToken), getDepartments(adminToken)])
      .then(([fac, dep]) => {
        setFaculties(Array.isArray(fac) ? fac : fac?.faculties || [])
        setDepartments(Array.isArray(dep) ? dep : dep?.departments || [])
      })
      .catch(() => {})
      .finally(() => setLoadingDeps(false))
  }, [adminToken])

  const filteredDepts = selectedFac
    ? departments.filter((d) => (d.faculty?._id || d.facultyId) === selectedFac)
    : departments

  const handleGenerate = async () => {
    if (!selectedDept) { setGenError('Please select a department'); return }
    if (!year || year.length < 2) { setGenError('Please enter a valid year'); return }

    setGenerating(true)
    setGenError('')
    setGenerated(null)

    try {
      // ── PLACEHOLDER ────────────────────────────────────────────────────────
      // Matric number generation logic will be added once the format is confirmed.
      // Replace the mock below with the real API call:
      //
      //   const result = await generateMatricNumber({ departmentId: selectedDept, year }, adminToken)
      //   setGenerated(result)
      //
      await new Promise((r) => setTimeout(r, 800)) // simulate network
      const dept = departments.find((d) => d._id === selectedDept)
      const mockNumber = `I-FAT/${year}/${dept?.code || 'XXX'}/0001` // placeholder format
      const result = { matricNumber: mockNumber, department: dept?.name, year }
      // ── END PLACEHOLDER ────────────────────────────────────────────────────

      setGenerated(result)
      setHistory((prev) => [{ ...result, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)])
    } catch (err) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!generated?.matricNumber) return
    navigator.clipboard.writeText(generated.matricNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) =>
    String(currentYear - 1 + i).slice(-2),
  )

  return (
    <AdminLayout navItems={REGISTRY_NAV} title="Registry Admin">
      <div className="space-y-6 max-w-2xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Generate Matric Number</h1>
          <p className="text-slate-400 text-sm mt-1">
            Issue a new matric number for an incoming student
          </p>
        </div>

        {/* Notice banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl
                        bg-amber-900/20 border border-amber-700/30 text-amber-300 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>
            Matric number format is being finalised. The generator is UI-ready —
            the actual logic will be wired in once the format is confirmed.
          </p>
        </div>

        {/* Generator card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-300">Student Details</h2>

          {loadingDeps ? (
            <div className="space-y-3">
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
            </div>
          ) : (
            <div className="space-y-4">

              {/* Faculty filter (optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Faculty (optional filter)</label>
                <div className="relative">
                  <select
                    value={selectedFac}
                    onChange={(e) => { setSelectedFac(e.target.value); setSelectedDept('') }}
                    className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-900
                               border border-slate-600 text-slate-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Faculties</option>
                    {faculties.map((f) => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2
                                                     text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Department <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-900
                               border border-slate-600 text-slate-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select department…</option>
                    {filteredDepts.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2
                                                     text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Year of Entry <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-900
                               border border-slate-600 text-slate-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{`20${y}`}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2
                                                     text-slate-500 pointer-events-none" />
                </div>
              </div>

              {genError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} /> {genError}
                </p>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating || !selectedDept}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors shadow-md shadow-blue-900/40"
              >
                {generating
                  ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
                  : <><Hash size={16} /> Generate Matric Number</>}
              </button>
            </div>
          )}
        </div>

        {/* Result card */}
        {generated && (
          <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/40
                          border border-blue-700/50 rounded-2xl p-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Generated Matric Number
            </p>
            <div className="flex items-center justify-between gap-4">
              <p className="text-2xl font-bold text-white font-mono tracking-wide">
                {generated.matricNumber}
              </p>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                            transition-all border
                            ${copied
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
              >
                {copied ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <div className="flex gap-4 text-xs text-slate-400">
              <span>Dept: <span className="text-slate-300">{generated.department}</span></span>
              <span>Year: <span className="text-slate-300">20{generated.year}</span></span>
            </div>
            <button
              onClick={() => { setGenerated(null); setSelectedDept('') }}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300
                         transition-colors mt-1"
            >
              <RefreshCw size={12} /> Generate another
            </button>
          </div>
        )}

        {/* Session history */}
        {history.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700 flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                This Session ({history.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-700/50 max-h-64 overflow-y-auto">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-mono font-semibold text-slate-200">
                      {item.matricNumber}
                    </p>
                    <p className="text-xs text-slate-500">{item.department}</p>
                  </div>
                  <span className="text-xs text-slate-600">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}