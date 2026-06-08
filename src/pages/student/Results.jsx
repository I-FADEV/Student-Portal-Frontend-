import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStudentResults, getActiveSession } from '../../services/api'
import { TrendingUp, BookOpen, AlertCircle, ChevronDown, ChevronUp, Award } from 'lucide-react'

// ─── Grade system ────────────────────────────────────────────────────────────
const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }
const GRADE_COLORS = {
  A: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  B: 'bg-blue-50   text-blue-700   border-blue-200',
  C: 'bg-cyan-50   text-cyan-700   border-cyan-200',
  D: 'bg-amber-50  text-amber-700  border-amber-200',
  E: 'bg-orange-50 text-orange-700 border-orange-200',
  F: 'bg-red-50    text-red-700    border-red-200',
}

function gradeFromTotal(total) {
  if (total >= 70) return 'A'
  if (total >= 60) return 'B'
  if (total >= 50) return 'C'
  if (total >= 45) return 'D'
  if (total >= 40) return 'E'
  return 'F'
}

function calcGPA(results) {
  const valid = results.filter((r) => r.creditUnit > 0)
  if (!valid.length) return null
  const totalPoints = valid.reduce((sum, r) => {
    const grade = r.grade || gradeFromTotal(r.total || 0)
    return sum + (GRADE_POINTS[grade] || 0) * (r.creditUnit || 0)
  }, 0)
  const totalUnits = valid.reduce((sum, r) => sum + (r.creditUnit || 0), 0)
  return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : null
}

function gpaColor(gpa) {
  if (gpa >= 4.5) return 'text-emerald-600'
  if (gpa >= 3.5) return 'text-blue-600'
  if (gpa >= 2.5) return 'text-amber-600'
  return 'text-red-600'
}

function gpaLabel(gpa) {
  if (gpa >= 4.5) return 'First Class'
  if (gpa >= 3.5) return 'Second Class Upper'
  if (gpa >= 2.5) return 'Second Class Lower'
  if (gpa >= 1.5) return 'Third Class'
  return 'Pass / Fail'
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
}

// ─── Session block (collapsible) ─────────────────────────────────────────────
function SessionBlock({ sessionKey, results }) {
  const [open, setOpen] = useState(true)
  const gpa = calcGPA(results)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Session header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen size={15} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-800 text-sm">{sessionKey}</p>
            <p className="text-xs text-slate-400">{results.length} course{results.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {gpa && (
            <span className={`text-sm font-extrabold ${gpaColor(parseFloat(gpa))}`}>
              GPA: {gpa}
            </span>
          )}
          {open ? <ChevronUp size={17} className="text-slate-400" /> : <ChevronDown size={17} className="text-slate-400" />}
        </div>
      </button>

      {/* Results table */}
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-semibold">Course</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Code</th>
                <th className="text-center px-4 py-3 font-semibold">Test</th>
                <th className="text-center px-4 py-3 font-semibold">Exam</th>
                <th className="text-center px-4 py-3 font-semibold">Total</th>
                <th className="text-center px-4 py-3 font-semibold hidden md:table-cell">Units</th>
                <th className="text-center px-4 py-3 font-semibold">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {results.map((r, idx) => {
                const total = r.total ?? ((r.test || 0) + (r.exam || 0))
                const grade = r.grade || gradeFromTotal(total)
                const gradeClass = GRADE_COLORS[grade] || 'bg-slate-50 text-slate-600 border-slate-200'

                return (
                  <tr key={r._id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-slate-800 font-medium">
                      {r.courseName || r.course || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs hidden sm:table-cell">
                      {r.courseCode || r.code || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-700">{r.test ?? '—'}</td>
                    <td className="px-4 py-3.5 text-center text-slate-700">{r.exam ?? '—'}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">{total}</td>
                    <td className="px-4 py-3.5 text-center text-slate-500 hidden md:table-cell">{r.creditUnit ?? '—'}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${gradeClass}`}>
                        {grade}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Results() {
  const { token }   = useAuth()
  const [results,   setResults]  = useState([])
  const [loading,   setLoading]  = useState(true)
  const [error,     setError]    = useState(null)
  const [activeSession, setActiveSession] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      getStudentResults(token),
      getActiveSession(token),
    ]).then(([r, s]) => {
      if (r.status === 'fulfilled') {
        setResults(Array.isArray(r.value) ? r.value : r.value?.data || r.value?.results || [])
      } else {
        setError(r.reason?.message === 'NOT_READY' ? 'NOT_READY' : r.reason?.message)
      }
      if (s.status === 'fulfilled') setActiveSession(s.value?.data || null)
    }).finally(() => setLoading(false))
  }, [token])

  // Group by "session – semester"
  const grouped = results.reduce((acc, r) => {
    const key = [r.session, r.semester].filter(Boolean).join(' — ') || 'All Results'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  // CGPA across everything
  const cgpa  = calcGPA(results)
  const cgpaF = cgpa ? parseFloat(cgpa) : null

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Results</h1>
        <p className="text-slate-500 text-sm mt-1">Academic performance across all sessions</p>
        {activeSession && (
          <p className="text-slate-400 text-xs mt-1">
            Current: {activeSession.session} · {activeSession.phase === 'summer' ? 'Summer (Remedial)' : activeSession.semester} Semester
          </p>
        )}
      </div>

      {/* Coming soon */}
      {error === 'NOT_READY' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <TrendingUp size={28} className="text-blue-400" />
          </div>
          <h3 className="text-slate-700 font-semibold text-base">Results coming soon</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            The results feature is being set up. Your results will appear here once uploaded by the admin.
          </p>
        </div>
      )}

      {/* Other errors */}
      {error && error !== 'NOT_READY' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <TrendingUp size={28} className="text-slate-400" />
          </div>
          <h3 className="text-slate-700 font-semibold text-base">No results available</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            Your results have not been uploaded yet. Check back after your results are published by the admin.
          </p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && results.length > 0 && (
        <div className="space-y-6">

          {/* CGPA summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* CGPA card */}
            <div className="sm:col-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-center shadow-xl">
              <div className="pointer-events-none absolute -top-6 -right-6 w-28 h-28 rounded-full bg-blue-600/20 blur-2xl" />
              <Award size={22} className="text-blue-400 mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Cumulative GPA</p>
              <p className={`text-4xl font-black mb-1 ${gpaColor(cgpaF)}`}>{cgpa}</p>
              {cgpaF && (
                <p className="text-slate-400 text-xs font-medium">{gpaLabel(cgpaF)}</p>
              )}
            </div>

            {/* Total courses */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-center">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Total Courses</p>
              <p className="text-3xl font-black text-slate-800">{results.length}</p>
              <p className="text-slate-400 text-xs mt-1">across all sessions</p>
            </div>

            {/* Total credit units */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-center">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Credit Units</p>
              <p className="text-3xl font-black text-slate-800">
                {results.reduce((s, r) => s + (r.creditUnit || 0), 0)}
              </p>
              <p className="text-slate-400 text-xs mt-1">total units earned</p>
            </div>
          </div>

          {/* Grade key */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(GRADE_POINTS).map(([g, pts]) => (
              <span key={g} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${GRADE_COLORS[g]}`}>
                {g} = {pts}pt
              </span>
            ))}
            <span className="text-xs text-slate-400 self-center ml-1">(Grade points)</span>
          </div>

          {/* Session blocks */}
          <div className="space-y-4">
            {Object.entries(grouped).map(([key, items]) => (
              <SessionBlock key={key} sessionKey={key} results={items} />
            ))}
          </div>

        </div>
      )}

    </div>
  )
}