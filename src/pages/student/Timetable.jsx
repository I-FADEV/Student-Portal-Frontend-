import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStudentTimetable, getStudentProfile } from '../../services/api'
import { Calendar, Download, AlertCircle, Coffee } from 'lucide-react'

// ─── Fixed time slots (must match backend enum exactly) ──────────────────────
const TIME_SLOTS = [
  { label: '8:00 - 10:00',   key: '8:00 - 10:00' },
  { label: '10:00 - 12:00',  key: '10:00 - 12:00' },
  { label: 'BREAK',          key: 'BREAK',  isBreak: true },
  { label: '1:00 - 3:00',    key: '1:00 - 3:00' },
  { label: '3:00 - 5:00',    key: '3:00 - 5:00' },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri' }

// ─── Build grid: grid[timeKey][day] = entry ──────────────────────────────────
function buildGrid(entries) {
  const grid = {}
  TIME_SLOTS.forEach(({ key }) => {
    grid[key] = {}
    DAYS.forEach((d) => { grid[key][d] = null })
  })
  entries.forEach((entry) => {
    const day  = entry.day
    const time = entry.time
    if (grid[time] && DAYS.includes(day)) {
      grid[time][day] = entry
    }
  })
  return grid
}

// ─── Print handler ────────────────────────────────────────────────────────────
function handlePrint(timetable, profile) {
  const slotRows = TIME_SLOTS.map(({ label, key, isBreak }) => {
    if (isBreak) {
      return `<tr style="background:#f1f5f9;">
        <td style="text-align:center;color:#94a3b8;font-style:italic;padding:8px;" colspan="6">☕ Break Time</td>
      </tr>`
    }
    const cells = DAYS.map((day) => {
      const entry = timetable.find((e) => e.time === key && e.day === day)
      return entry
        ? `<td><strong>${entry.courseCode}</strong><br/><small>${entry.lecturer || ''}</small></td>`
        : `<td style="color:#cbd5e1;">—</td>`
    }).join('')
    return `<tr><td><strong>${label}</strong></td>${cells}</tr>`
  }).join('')

  const win = window.open('', '_blank')
  win.document.write(`
    <html><head>
      <title>Timetable – ${profile?.name || 'Student'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
        h2 { margin-bottom: 4px; }
        p  { color: #64748b; font-size: 13px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e2e8f0; padding: 10px 12px; vertical-align: top; }
        th { background: #1e293b; color: white; text-align: center; }
        td:first-child { background: #f8fafc; font-weight: 600; white-space: nowrap; }
        @media print { button { display: none !important; } }
      </style>
    </head><body>
      <h2>Class Timetable</h2>
      <p>${profile?.name || ''} · ${profile?.department || ''} · ${profile?.level ? profile.level + ' Level' : ''}</p>
      <button onclick="window.print()" style="margin-bottom:16px;padding:8px 18px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;">
        Print / Save as PDF
      </button>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            ${DAYS.map((d) => `<th>${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody>${slotRows}</tbody>
      </table>
    </body></html>
  `)
  win.document.close()
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
}

// ─── Cell component ───────────────────────────────────────────────────────────
function Cell({ entry }) {
  if (!entry) {
    return (
      <td className="border border-slate-100 px-3 py-4 text-center">
        <span className="text-slate-200 text-lg">—</span>
      </td>
    )
  }
  return (
    <td className="border border-slate-100 px-3 py-3 align-top">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-2.5 min-h-[64px] flex flex-col gap-1">
        <span className="text-xs font-extrabold text-blue-700 font-mono leading-tight">
          {entry.courseCode}
        </span>
        <span className="text-[11px] text-slate-500 leading-tight line-clamp-2">
          {entry.courseName}
        </span>
        {entry.lecturer && (
          <span className="text-[10px] text-slate-400 mt-auto leading-tight truncate">
            {entry.lecturer}
          </span>
        )}
      </div>
    </td>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Timetable() {
  const { token } = useAuth()
  const [timetable, setTimetable] = useState([])
  const [profile,   setProfile]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    Promise.allSettled([
      getStudentTimetable(token),
      getStudentProfile(token),
    ]).then(([t, p]) => {
      if (t.status === 'fulfilled') {
        const raw = t.value
        setTimetable(Array.isArray(raw) ? raw : raw?.data || [])
      } else {
        setError(t.reason?.message)
      }
      if (p.status === 'fulfilled') setProfile(p.value?.data || p.value)
    }).finally(() => setLoading(false))
  }, [token])

  const grid    = buildGrid(timetable)
  const isEmpty = timetable.length === 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Timetable</h1>
          <p className="text-slate-500 text-sm mt-1">Your weekly class schedule</p>
        </div>
        {!loading && !isEmpty && (
          <button
            onClick={() => handlePrint(timetable, profile)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex-shrink-0"
          >
            <Download size={16} />
            Download PDF
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-x-auto">
          <div className="min-w-[600px] space-y-3">
            <div className="grid grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-3">
                {[...Array(6)].map((_, j) => <Skeleton key={j} className="h-16" />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Calendar size={28} className="text-slate-400" />
          </div>
          <h3 className="text-slate-700 font-semibold text-base">No timetable available</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            Your timetable has not been posted yet. Check back after the timetable admin publishes it.
          </p>
        </div>
      )}

      {/* Timetable grid */}
      {!loading && !error && !isEmpty && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Legend */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100" />
              Course slot
            </div>
            <div className="flex items-center gap-1.5">
              <Coffee size={12} className="text-amber-400" />
              Break time (12:00 – 1:00)
            </div>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="bg-slate-900">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-[110px]">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th key={day} className="px-3 py-3 text-center text-xs font-bold text-white uppercase tracking-wide">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{DAY_SHORT[day]}</span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {TIME_SLOTS.map(({ label, key, isBreak }) => {
                  if (isBreak) {
                    return (
                      <tr key="break" className="bg-amber-50/60">
                        <td colSpan={6} className="px-5 py-2.5 border border-amber-100">
                          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold">
                            <Coffee size={13} />
                            Break Time — 12:00 – 1:00
                          </div>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={key} className="hover:bg-slate-50/40 transition-colors">
                      {/* Time label */}
                      <td className="border border-slate-100 px-4 py-3 align-middle">
                        <span className="text-xs font-bold text-slate-700 font-mono whitespace-nowrap">
                          {label}
                        </span>
                      </td>

                      {/* Day cells */}
                      {DAYS.map((day) => (
                        <Cell key={day} entry={grid[key][day]} />
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}