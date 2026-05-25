import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStudentCourses } from '../../services/api'
import {
  BookOpen, Hash, Layers, AlertCircle,
  Search, User, Phone, ChevronRight,
} from 'lucide-react'

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-700/40 rounded-lg ${className}`} />
}

// ─── Course Card ─────────────────────────────────────────────────────────────
function CourseCard({ course }) {
  const code       = course.code       || course.courseCode || '—'
  const name       = course.name       || course.courseName || '—'
  const credits    = course.creditUnit ?? course.credit_unit
  const lecturer   = course.lecturer   || null
  const phone      = course.lecturerPhone || null

  return (
    <div className="group bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex flex-col gap-3
                    hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20
                    hover:-translate-y-0.5 transition-all duration-200">

      {/* Top row: code badge + credits */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                         bg-blue-900/50 border border-blue-700/50 text-blue-300
                         text-xs font-bold font-mono">
          <Hash size={11} />
          {code}
        </span>
        {credits != null && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400
                           bg-slate-700/60 px-2 py-1 rounded-lg font-medium">
            <Layers size={11} />
            {credits} unit{credits !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Course name */}
      <p className="font-semibold text-slate-100 text-sm leading-snug
                    group-hover:text-blue-300 transition-colors">
        {name}
      </p>

      {/* Lecturer */}
      {lecturer && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <User size={12} className="text-slate-500 flex-shrink-0" />
          <span>{lecturer}</span>
        </div>
      )}

      {/* Phone — clickable */}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-2 text-xs text-blue-400
                     hover:text-blue-300 transition-colors w-fit"
        >
          <Phone size={12} className="flex-shrink-0" />
          {phone}
        </a>
      )}

      {/* No lecturer info */}
      {!lecturer && !phone && (
        <p className="text-xs text-slate-600 italic">Lecturer info not available</p>
      )}
    </div>
  )
}

// ─── Tab button ──────────────────────────────────────────────────────────────
function Tab({ label, count, active, isCurrent, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  transition-all duration-150 border
                  ${active
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/40'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                  }`}
    >
      {label}
      {isCurrent && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold
                          ${active ? 'bg-blue-400/30 text-blue-100' : 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50'}`}>
          Current
        </span>
      )}
      <span className={`text-[11px] px-1.5 py-0.5 rounded-md
                        ${active ? 'bg-blue-500/40 text-blue-100' : 'bg-slate-700 text-slate-500'}`}>
        {count}
      </span>
    </button>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Sort tabs: latest session first, within same session Second > First
function sortTabKey(key) {
  // key format: "2024/2025__First" or "2024/2025__Second"
  const [session, semester] = key.split('__')
  const year = parseInt(session.split('/')[0], 10)
  const semOrder = semester === 'Second' ? 1 : 0
  return year * 10 + semOrder
}

function tabLabel(key) {
  const [session, semester] = key.split('__')
  return `${session} · ${semester}`
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Courses() {
  const { token }  = useAuth()
  const [allCourses, setAllCourses] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [activeTab,  setActiveTab]  = useState(null)

  useEffect(() => {
    getStudentCourses(token)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.courses || data?.data || [])
        setAllCourses(list)
      })
      .catch((err) => setError(err.message === 'NOT_READY' ? 'NOT_READY' : err.message))
      .finally(() => setLoading(false))
  }, [token])

  // Group courses into tabs by "session__semester"
  const tabs = useMemo(() => {
    const map = {}
    allCourses.forEach((c) => {
      const key = `${c.session}__${c.semester}`
      if (!map[key]) map[key] = []
      map[key].push(c)
    })
    // Sort keys: latest first
    const sorted = Object.keys(map).sort((a, b) => sortTabKey(b) - sortTabKey(a))
    return { map, sorted }
  }, [allCourses])

  // Set default active tab to latest (current)
  useEffect(() => {
    if (tabs.sorted.length > 0 && !activeTab) {
      setActiveTab(tabs.sorted[0])
    }
  }, [tabs.sorted, activeTab])

  // Reset search when tab changes
  const handleTabChange = (key) => {
    setActiveTab(key)
    setSearch('')
  }

  const activeCourses = activeTab ? (tabs.map[activeTab] || []) : []

  const filtered = activeCourses.filter((c) => {
    const q = search.toLowerCase()
    return (
      (c.name       || c.courseName || '').toLowerCase().includes(q) ||
      (c.code       || c.courseCode || '').toLowerCase().includes(q) ||
      (c.lecturer   || '').toLowerCase().includes(q)
    )
  })

  const currentTabKey = tabs.sorted[0] || null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Course Outline</h1>
        <p className="text-slate-400 text-sm mt-1">
          {!loading && allCourses.length > 0
            ? `${activeCourses.length} course${activeCourses.length !== 1 ? 's' : ''} — ${activeTab ? tabLabel(activeTab) : ''} Semester`
            : 'Courses registered for your department and level'}
        </p>
      </div>

      {/* ── Error: backend not ready ── */}
      {error === 'NOT_READY' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-900/30 flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-blue-400" />
          </div>
          <h3 className="text-slate-200 font-semibold text-base">Courses coming soon</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Course listings are being prepared. They will appear here once the admin publishes them.
          </p>
        </div>
      )}

      {/* ── Other errors ── */}
      {error && error !== 'NOT_READY' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-900/20 border border-red-700/40 text-red-400 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="space-y-6">
          {/* Tab skeletons */}
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-36" />
            ))}
          </div>
          {/* Card skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── No courses at all ── */}
      {!loading && !error && allCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-700/40 flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-slate-500" />
          </div>
          <h3 className="text-slate-300 font-semibold text-base">No courses available</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Course information for your department hasn't been posted yet. Please check back later.
          </p>
        </div>
      )}

      {/* ── Tabs + content ── */}
      {!loading && !error && allCourses.length > 0 && (
        <div className="space-y-5">

          {/* Tab row */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.sorted.map((key) => (
              <Tab
                key={key}
                label={tabLabel(key)}
                count={tabs.map[key].length}
                active={activeTab === key}
                isCurrent={key === currentTabKey}
                onClick={() => handleTabChange(key)}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700/50" />

          {/* Search + count row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-slate-400 text-sm">
              <span className="text-slate-200 font-semibold">{activeCourses.length}</span>
              {' '}course{activeCourses.length !== 1 ? 's' : ''} this semester
            </p>
            <div className="relative max-w-xs w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, code or lecturer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-800 border border-slate-700
                           rounded-xl text-slate-200 placeholder:text-slate-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* No search results */}
          {filtered.length === 0 && search && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No courses match{' '}
              <span className="font-medium text-slate-300">"{search}"</span>
            </div>
          )}

          {/* Course grid */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((course, idx) => (
                <CourseCard key={course._id || course.code || idx} course={course} />
              ))}
            </div>
          )}

          {/* History hint — show only on current tab when there are older ones */}
          {activeTab === currentTabKey && tabs.sorted.length > 1 && (
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
              <ChevronRight size={13} />
              {tabs.sorted.length - 1} previous semester{tabs.sorted.length - 1 !== 1 ? 's' : ''} available — select a tab above to view history
            </div>
          )}
        </div>
      )}

    </div>
  )
}