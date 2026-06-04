import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { REGISTRY_NAV } from './Dashboard'
import { getFaculties, getDepartments, getMatricCounter, generateMatricNumber } from '../../../services/api'
import {
  Hash, Copy, CheckCheck, ChevronDown,
  AlertCircle, Loader2, RefreshCw, Clock,
  Info, UserCheck,
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
  const [level,        setLevel]        = useState(100)
  const [isTransfer,   setIsTransfer]   = useState(false)
  const [manualCounter, setManualCounter] = useState('')

  const [generating,   setGenerating]   = useState(false)
  const [generated,    setGenerated]    = useState(null)
  const [genError,     setGenError]     = useState('')
  const [copied,       setCopied]       = useState(false)

  // Counter preview
  const [counterPreview, setCounterPreview] = useState(null)
  const [loadingCounter, setLoadingCounter] = useState(false)

  // History of generated numbers this session
  const [history,      setHistory]      = useState([])

  useEffect(() => {
    Promise.all([getFaculties(adminToken), getDepartments(adminToken)])
      .then(([fac, dep]) => {
        setFaculties(Array.isArray(fac) ? fac : fac?.data || [])
        setDepartments(Array.isArray(dep) ? dep : dep?.data || [])
      })
      .catch(() => {})
      .finally(() => setLoadingDeps(false))
  }, [adminToken])

  // Fetch counter preview when level changes (counter is shared across all departments per level)
  useEffect(() => {
    if (level) {
      fetchCounterPreview()
    } else {
      setCounterPreview(null)
    }
  }, [level])

  const filteredDepts = selectedFac
    ? departments.filter((d) => (d.faculty?._id || d.facultyId) === selectedFac)
    : departments

  const selectedDepartment = departments.find((d) => d._id === selectedDept)

  // Calculate graduation year
  const calculateGradYear = () => {
    if (!selectedDepartment) return null
    const currentYear = new Date().getFullYear()
    const yearsToGraduate = (selectedDepartment.maxLevel - level) / 100
    return currentYear + yearsToGraduate
  }

  const gradYear = calculateGradYear()

  const fetchCounterPreview = async () => {
    if (!level) return
    setLoadingCounter(true)
    try {
      const result = await getMatricCounter(level, adminToken)
      setCounterPreview(result.data || result)
    } catch (err) {
      setCounterPreview(null)
    } finally {
      setLoadingCounter(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedDept) { setGenError('Please select a department'); return }
    if (!level) { setGenError('Please select a level'); return }

    setGenerating(true)
    setGenError('')
    setGenerated(null)

    try {
      const payload = {
        departmentId: selectedDept,
        level,
        isTransfer: level > 100 ? isTransfer : false,
      }

      if (manualCounter.trim()) {
        payload.manualCounter = parseInt(manualCounter, 10)
      }

      const result = await generateMatricNumber(payload, adminToken)
      setGenerated(result.data || result)
      setHistory((prev) => [{ 
        ...result.data, 
        time: new Date().toLocaleTimeString() 
      }, ...prev.slice(0, 19)])
      
      // Reset manual counter after generation
      setManualCounter('')
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

  // Generate level options based on department's max level
  const getLevelOptions = () => {
    if (!selectedDepartment) return [100, 200, 300, 400, 500, 600]
    const levels = []
    for (let l = 100; l <= selectedDepartment.maxLevel; l += 100) {
      levels.push(l)
    }
    return levels
  }

  const levelOptions = getLevelOptions()

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
                {selectedDepartment?.abbreviation && (
                  <p className="text-xs text-slate-500 mt-1">
                    Abbreviation: <span className="text-blue-400 font-mono">{selectedDepartment.abbreviation}</span>
                  </p>
                )}
              </div>

              {/* Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Level <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value, 10))}
                    className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-900
                               border border-slate-600 text-slate-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {levelOptions.map((l) => (
                      <option key={l} value={l}>{l} Level</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2
                                                     text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Transfer student toggle (only for levels > 100) */}
              {level > 100 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700">
                  <UserCheck size={18} className="text-cyan-400" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-300">Transfer Student?</label>
                    <p className="text-xs text-slate-500">Append 'TF' to matric number</p>
                  </div>
                  <button
                    onClick={() => setIsTransfer(!isTransfer)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isTransfer ? 'bg-cyan-600' : 'bg-slate-500'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        isTransfer ? 'translate-x-1' : 'translate-x-[-21px]'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Counter preview */}
              {selectedDept && level && (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-blue-400" />
                    <span className="text-xs font-semibold text-slate-300">Matric Preview</span>
                  </div>
                  {loadingCounter ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-slate-500" />
                      <span className="text-xs text-slate-500">Loading counter...</span>
                    </div>
                  ) : counterPreview ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Department Code:</span>
                        <span className="text-slate-200 font-mono">{counterPreview.abbreviation || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Graduation Year:</span>
                        <span className="text-slate-200 font-mono">{gradYear ? String(gradYear).slice(-2) : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Current Counter:</span>
                        <span className="text-slate-200 font-mono">{String(counterPreview.currentCounter || 0).padStart(4, '0')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Next Counter:</span>
                        <span className="text-blue-400 font-mono font-semibold">{String(counterPreview.nextCounter || 1).padStart(4, '0')}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-500">
                          Format: i-FAT/<span className="text-slate-300">{gradYear ? String(gradYear).slice(-2) : 'YY'}</span>/<span className="text-slate-300">{counterPreview.abbreviation || 'XXX'}</span>/<span className="text-blue-400">{String(counterPreview.nextCounter || 1).padStart(4, '0')}</span>{isTransfer && level > 100 ? 'TF' : ''}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No counter data available</p>
                  )}
                </div>
              )}

              {/* Manual counter override */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Manual Counter Override (optional)</label>
                <input
                  type="number"
                  value={manualCounter}
                  onChange={(e) => setManualCounter(e.target.value)}
                  placeholder="e.g., 0150"
                  min={1}
                  max={9999}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600
                             text-slate-200 placeholder:text-slate-600 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500">Override the next counter number. This will become the new base for future generations.</p>
              </div>

              {genError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} /> {genError}
                </p>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating || !selectedDept || !level}
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
                          border border-blue-700/50 rounded-2xl p-6 space-y-4">
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
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 mb-1">Department</p>
                <p className="text-slate-200 font-medium">{generated.department}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 mb-1">Abbreviation</p>
                <p className="text-slate-200 font-mono">{generated.abbreviation}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 mb-1">Level</p>
                <p className="text-slate-200 font-medium">{generated.level} Level</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 mb-1">Graduation Year</p>
                <p className="text-slate-200 font-medium">{generated.graduationYear}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 mb-1">Counter</p>
                <p className="text-slate-200 font-mono">{String(generated.counter).padStart(4, '0')}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 mb-1">Transfer</p>
                <p className={generated.isTransfer ? 'text-cyan-400 font-medium' : 'text-slate-400'}>
                  {generated.isTransfer ? 'Yes (TF)' : 'No'}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setGenerated(null); setSelectedDept(''); setLevel(100); setIsTransfer(false); setManualCounter('') }}
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
                    <p className="text-xs text-slate-500">{item.department} · {item.level}L</p>
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