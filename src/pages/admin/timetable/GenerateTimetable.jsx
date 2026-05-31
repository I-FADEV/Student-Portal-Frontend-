import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import { TIMETABLE_NAV } from './Dashboard'
import {
  getAllFaculties, getAllDepartments,
  getTimetableCourses, saveTimetableBulk,
} from '../../../services/api'
import {
  Calendar, Zap, AlertTriangle, CheckCircle2,
  ChevronDown, Loader2, Save, RefreshCw,
  X, ArrowRight, Info, BookOpen,
} from 'lucide-react'

const TIME_SLOTS = ['8:00 - 10:00', '10:00 - 12:00', '1:00 - 3:00', '3:00 - 5:00']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const SEMESTERS = ['First', 'Second']

// ── Clash Detection Logic ────────────────────────────────────────────────────

function resolveAudience(course, faculties, departments) {
  const pairs = new Set()
  for (const t of (course.targets || [])) {
    if (t.type === 'department') {
      pairs.add(`${t.name}__${t.level}`)
    } else {
      // Faculty → expand to all depts in that faculty at that level
      const fac = faculties.find(f => f.name === t.name || f._id === t.name)
      if (!fac) continue
      const depts = departments.filter(d => {
        const fId = d.faculty?._id || d.faculty
        return fId === fac._id || d.faculty?.name === t.name
      })
      for (const dept of depts) {
        pairs.add(`${dept.name}__${t.level}`)
      }
    }
  }
  return pairs
}

function audiencesOverlap(a, b) {
  for (const p of a) { if (b.has(p)) return true }
  return false
}

function buildConflictGraph(courses, faculties, departments) {
  const audiences = courses.map(c => resolveAudience(c, faculties, departments))
  const graph = courses.map(() => new Set())

  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const lecturerClash = courses[i].lecturer && courses[j].lecturer &&
        courses[i].lecturer.toLowerCase() === courses[j].lecturer.toLowerCase()
      const audienceClash = audiencesOverlap(audiences[i], audiences[j])

      if (lecturerClash || audienceClash) {
        graph[i].add(j)
        graph[j].add(i)
      }
    }
  }
  return graph
}

function autoGenerate(courses, faculties, departments) {
  const slots = []
  for (const day of DAYS) for (const time of TIME_SLOTS) slots.push({ day, time })

  const graph = buildConflictGraph(courses, faculties, departments)
  // Sort: most conflicts first
  const order = courses.map((_, i) => i).sort((a, b) => graph[b].size - graph[a].size)

  const assignment = new Array(courses.length).fill(null)     // idx -> {day,time}
  const slotMap = {}                                           // 'day__time' -> [idx]

  for (const idx of order) {
    let placed = false
    for (const slot of slots) {
      const key = `${slot.day}__${slot.time}`
      const occupants = slotMap[key] || []
      const noConflict = occupants.every(occ => !graph[idx].has(occ))
      if (noConflict) {
        assignment[idx] = slot
        slotMap[key] = [...occupants, idx]
        placed = true
        break
      }
    }
    if (!placed) assignment[idx] = null // unplaceable
  }

  return { assignment, slotMap, graph }
}

// Expand course into one Timetable entry per dept+level
function expandCourse(course, assignment, faculties, departments, session, semester) {
  if (!assignment) return []
  const { day, time } = assignment
  const audience = resolveAudience(course, faculties, departments)
  return [...audience].map(pair => {
    const [dept, level] = pair.split('__')
    return {
      day, time,
      courseCode: course.courseCode,
      courseName: course.courseName,
      lecturer: course.lecturer,
      department: dept,
      level: Number(level),
      session,
      semester,
    }
  })
}

// ── UI Helpers ───────────────────────────────────────────────────────────────

const DAY_COLORS = {
  Monday: 'bg-blue-500/15 border-blue-500/20 text-blue-300',
  Tuesday: 'bg-indigo-500/15 border-indigo-500/20 text-indigo-300',
  Wednesday: 'bg-violet-500/15 border-violet-500/20 text-violet-300',
  Thursday: 'bg-cyan-500/15 border-cyan-500/20 text-cyan-300',
  Friday: 'bg-teal-500/15 border-teal-500/20 text-teal-300',
}

export default function GenerateTimetable() {
  const { adminToken } = useAdminAuth()

  const [faculties,   setFaculties]   = useState([])
  const [departments, setDepartments] = useState([])
  const [courses,     setCourses]     = useState([])
  const [session,     setSession]     = useState('')
  const [semester,    setSemester]    = useState('')

  const [loading,     setLoading]     = useState(false)
  const [generating,  setGenerating]  = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Generated state
  const [assignment,  setAssignment]  = useState(null) // array[idx] -> {day,time}|null
  const [graph,       setGraph]       = useState(null) // conflict graph
  const [generated,   setGenerated]   = useState(false)

  // Clash resolution UI
  const [activeClash, setActiveClash] = useState(null) // index of course being resolved

  useEffect(() => {
    Promise.all([getAllFaculties(adminToken), getAllDepartments(adminToken)])
      .then(([f, d]) => { setFaculties(f); setDepartments(d) })
      .catch(() => {})
  }, [adminToken])

  const loadCourses = async () => {
    if (!session || !semester) return
    setLoading(true)
    setError(null)
    setGenerated(false)
    setAssignment(null)
    try {
      const data = await getTimetableCourses(session, semester, adminToken)
      setCourses(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = () => {
    if (courses.length === 0) return
    setGenerating(true)
    setSaveSuccess(false)
    setTimeout(() => {
      const { assignment: asgn, graph: g } = autoGenerate(courses, faculties, departments)
      setAssignment(asgn)
      setGraph(g)
      setGenerated(true)
      setGenerating(false)
      setActiveClash(null)
    }, 400)
  }

  // Move a course to a specific slot (manual override)
  const moveToSlot = (courseIdx, day, time) => {
    setAssignment(prev => {
      const next = [...prev]
      next[courseIdx] = { day, time }
      return next
    })
    setActiveClash(null)
  }

  // Get clashing course indices (assigned to same slot AND conflicting)
  const getClashes = useCallback(() => {
    if (!assignment || !graph) return []
    const clashes = []
    for (let i = 0; i < courses.length; i++) {
      if (!assignment[i]) { clashes.push({ idx: i, reason: 'unplaceable' }); continue }
      for (const j of graph[i]) {
        if (j > i && assignment[j] &&
            assignment[i].day === assignment[j].day &&
            assignment[i].time === assignment[j].time) {
          clashes.push({ idx: i, clashWith: j, reason: 'same-slot' })
        }
      }
    }
    return clashes
  }, [assignment, graph, courses])

  const clashes = generated ? getClashes() : []
  const hasClashes = clashes.length > 0

  // Find 3 alternative slots for a course that avoid conflicts with already-placed courses
  const getSuggestions = (courseIdx) => {
    if (!assignment || !graph) return []
    const suggestions = []
    for (const day of DAYS) {
      for (const time of TIME_SLOTS) {
        if (suggestions.length >= 3) break
        // Check no conflict with anything already placed at this slot
        let ok = true
        for (let j = 0; j < courses.length; j++) {
          if (j === courseIdx) continue
          if (assignment[j] && assignment[j].day === day && assignment[j].time === time) {
            if (graph[courseIdx].has(j)) { ok = false; break }
          }
        }
        if (ok) suggestions.push({ day, time })
      }
      if (suggestions.length >= 3) break
    }
    return suggestions
  }

  const handleSave = async () => {
    if (hasClashes || !generated) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      const entries = []
      courses.forEach((c, idx) => {
        const expanded = expandCourse(c, assignment[idx], faculties, departments, session, semester)
        entries.push(...expanded)
      })
      await saveTimetableBulk(entries, adminToken)
      setSaveSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Build grid data: {day__time -> [courseIdx]}
  const gridMap = {}
  if (generated && assignment) {
    courses.forEach((c, idx) => {
      if (!assignment[idx]) return
      const key = `${assignment[idx].day}__${assignment[idx].time}`
      if (!gridMap[key]) gridMap[key] = []
      gridMap[key].push(idx)
    })
  }

  const isClashing = (idx) =>
    clashes.some(cl => cl.idx === idx || cl.clashWith === idx)

  return (
    <AdminLayout navItems={TIMETABLE_NAV}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Generate Timetable</h1>
          <p className="text-slate-500 text-sm mt-1">Auto-assign all courses to clash-free slots</p>
        </div>

        {/* Session / Semester picker */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Session</label>
            <input type="text" value={session} onChange={e => setSession(e.target.value)}
              placeholder="e.g. 2025/2026"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
                placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Semester</label>
            <div className="flex gap-2">
              {SEMESTERS.map(s => (
                <button key={s} onClick={() => setSemester(s)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all
                    ${semester === s ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                >{s}</button>
              ))}
            </div>
          </div>
          <button onClick={loadCourses} disabled={!session || !semester || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700
              text-slate-300 text-sm font-bold hover:bg-slate-700 transition disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Load Courses
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertTriangle size={15} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* Course count + generate button */}
        {courses.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <BookOpen size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''} loaded</p>
                <p className="text-slate-500 text-xs">{session} · {semester} Semester</p>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500
                text-white font-bold text-sm disabled:opacity-50 transition shadow-lg shadow-blue-900/30"
            >
              {generating ? <Loader2 size={15} className="animate-spin"/> : <Zap size={15}/>}
              {generating ? 'Generating…' : generated ? 'Re-generate' : 'Auto-Generate'}
            </button>
          </div>
        )}

        {courses.length === 0 && session && semester && !loading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
            <Info size={15} className="flex-shrink-0"/>
            No courses found for this session/semester. Go to Manage Courses to add them first.
          </div>
        )}

        {/* ── Generated Results ── */}
        {generated && (
          <>
            {/* Status banner */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold
              ${hasClashes
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {hasClashes
                ? <><AlertTriangle size={16}/> {clashes.length} clash{clashes.length !== 1 ? 'es' : ''} detected — resolve all before saving</>
                : <><CheckCircle2 size={16}/> All courses placed without clashes — ready to save & publish</>
              }
            </div>

            {/* Clash panel */}
            {hasClashes && (
              <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">Clash Resolution</p>
                <div className="space-y-3">
                  {clashes.map((cl, i) => {
                    const c = courses[cl.idx]
                    const isActive = activeClash === cl.idx
                    const suggestions = getSuggestions(cl.idx)

                    return (
                      <div key={i} className="bg-slate-800/60 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
                                {c?.courseCode}
                              </span>
                              <span className="text-slate-300 text-sm font-semibold">{c?.courseName}</span>
                            </div>
                            {cl.reason === 'unplaceable'
                              ? <p className="text-slate-500 text-xs mt-1">Could not be placed — no available slot without conflict</p>
                              : <p className="text-slate-500 text-xs mt-1">
                                  Clashes with <span className="text-amber-400 font-semibold">{courses[cl.clashWith]?.courseCode}</span> at {assignment[cl.idx]?.day} {assignment[cl.idx]?.time}
                                </p>
                            }
                          </div>
                          <button onClick={() => setActiveClash(isActive ? null : cl.idx)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex-shrink-0
                              ${isActive ? 'bg-slate-700 text-slate-300' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'}`}
                          >
                            {isActive ? 'Hide' : 'Resolve'}
                          </button>
                        </div>

                        {/* Suggestions */}
                        {isActive && (
                          <div className="space-y-2">
                            <p className="text-xs text-slate-500 font-semibold">Suggested alternative slots:</p>
                            {suggestions.length === 0 ? (
                              <p className="text-xs text-red-400">No conflict-free slot available. Try re-generating or removing some courses.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {suggestions.map((s, si) => (
                                  <button key={si} onClick={() => moveToSlot(cl.idx, s.day, s.time)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                                      bg-emerald-500/10 border border-emerald-500/30 text-emerald-300
                                      hover:bg-emerald-500/20 transition-all"
                                  >
                                    <ArrowRight size={11}/> {s.day} · {s.time}
                                  </button>
                                ))}
                              </div>
                            )}
                            {/* Manual slot selector */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="text-xs text-slate-600 w-full">Or pick manually:</span>
                              {DAYS.map(day => TIME_SLOTS.map(time => {
                                const key = `${day}__${time}`
                                const currentOccupants = gridMap[key] || []
                                const wouldClash = currentOccupants.some(occ => graph[cl.idx].has(occ))
                                if (wouldClash) return null
                                return (
                                  <button key={key} onClick={() => moveToSlot(cl.idx, day, time)}
                                    className="text-[10px] font-semibold px-2 py-1 rounded-lg
                                      bg-slate-700 text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                                  >
                                    {day.slice(0,3)} {time.split(' - ')[0]}
                                  </button>
                                )
                              }))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Timetable Preview Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Timetable Preview</p>
                {!hasClashes && (
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                      text-white font-bold text-sm disabled:opacity-50 transition shadow-lg shadow-emerald-900/30"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
                    {saving ? 'Saving…' : 'Save & Publish'}
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
                  <CheckCircle2 size={16}/> Timetable published! Students can now see their schedules.
                </div>
              )}

              {/* Grid — scrollable on mobile */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className="px-3 py-3 text-xs font-bold text-slate-500 text-left w-28 border-b border-r border-slate-800">Time</th>
                      {DAYS.map(d => (
                        <th key={d} className="px-3 py-3 text-xs font-bold text-slate-400 text-center border-b border-r border-slate-800 last:border-r-0">
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((time, ti) => (
                      <>
                        <tr key={time} className="bg-slate-950/50">
                          <td className="px-3 py-3 text-xs font-bold text-slate-500 border-b border-r border-slate-800 whitespace-nowrap">
                            {time}
                          </td>
                          {DAYS.map(day => {
                            const key = `${day}__${time}`
                            const indices = gridMap[key] || []
                            return (
                              <td key={day} className="px-2 py-2 border-b border-r border-slate-800 last:border-r-0 align-top">
                                {indices.length === 0 ? (
                                  <div className="text-slate-800 text-center text-xs">—</div>
                                ) : (
                                  <div className="space-y-1">
                                    {indices.map(idx => {
                                      const c = courses[idx]
                                      const clashing = isClashing(idx)
                                      return (
                                        <div key={idx}
                                          className={`p-2 rounded-lg border text-[10px] leading-tight
                                            ${clashing
                                              ? 'bg-amber-500/10 border-amber-500/30'
                                              : DAY_COLORS[day]
                                            }`}
                                        >
                                          <p className="font-black">{c?.courseCode}</p>
                                          <p className="text-slate-400 truncate max-w-[100px]">{c?.courseName}</p>
                                          {clashing && <p className="text-amber-400 font-bold">⚠ clash</p>}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                        {/* Break row between slot 2 and 3 */}
                        {ti === 1 && (
                          <tr key="break" className="bg-amber-900/10">
                            <td colSpan={6} className="px-3 py-2 text-center text-xs text-amber-400/60 font-semibold border-b border-slate-800">
                              ☕ 12:00 – 1:00 BREAK
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Unplaceable courses */}
              {assignment && courses.some((_, i) => assignment[i] === null) && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-bold text-red-400 mb-2">Unplaceable Courses</p>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((c, i) => assignment[i] === null && (
                      <span key={i} className="text-xs px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono font-bold">
                        {c.courseCode}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-red-400/60 mt-2">These could not be placed without conflict. Check their targets for overlaps.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}