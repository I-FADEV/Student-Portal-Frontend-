import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import { TIMETABLE_NAV } from './Dashboard'
import { getAllDepartments, getAdminTimetable, updateTimetableEntry, deleteTimetableEntry } from '../../../services/api'
import {
  Grid3X3, Search, ChevronDown, RefreshCw, AlertCircle,
  Pencil, Trash2, Loader2, Check, X,
} from 'lucide-react'

const TIME_SLOTS = ['8:00 - 10:00', '10:00 - 12:00', '1:00 - 3:00', '3:00 - 5:00']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const SEMESTERS = ['First', 'Second']

const DAY_COLORS = {
  Monday:    'bg-blue-500/15 border-blue-500/25 text-blue-300',
  Tuesday:   'bg-indigo-500/15 border-indigo-500/25 text-indigo-300',
  Wednesday: 'bg-violet-500/15 border-violet-500/25 text-violet-300',
  Thursday:  'bg-cyan-500/15 border-cyan-500/25 text-cyan-300',
  Friday:    'bg-teal-500/15 border-teal-500/25 text-teal-300',
}

export default function ViewTimetable() {
  const { adminToken } = useAdminAuth()

  const [departments, setDepartments] = useState([])
  const [entries,     setEntries]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  // Filters
  const [session,    setSession]    = useState('')
  const [semester,   setSemester]   = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [levelFilter,setLevelFilter]= useState('')
  const [codeSearch, setCodeSearch] = useState('')

  // Edit
  const [editId,    setEditId]    = useState(null)
  const [editForm,  setEditForm]  = useState({})
  const [editing,   setEditing]   = useState(false)
  const [editErr,   setEditErr]   = useState(null)

  // Delete
  const [confirmId, setConfirmId] = useState(null)
  const [deleting,  setDeleting]  = useState(null)

  useEffect(() => {
    getAllDepartments(adminToken)
      .then(d => setDepartments(d))
      .catch(() => {})
  }, [adminToken])

  const load = async () => {
    if (!session || !semester) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminTimetable({ session, semester, department: deptFilter, level: levelFilter }, adminToken)
      setEntries(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [session, semester, deptFilter, levelFilter])

  const startEdit = (entry) => {
    setEditId(entry._id)
    setEditForm({ day: entry.day, time: entry.time, lecturer: entry.lecturer || '' })
    setEditErr(null)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setEditing(true)
    setEditErr(null)
    try {
      const updated = await updateTimetableEntry(editId, editForm, adminToken)
      setEntries(prev => prev.map(en => en._id === editId ? updated : en))
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
      await deleteTimetableEntry(id, adminToken)
      setEntries(prev => prev.filter(en => en._id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  // Filter by code search
  const filtered = codeSearch
    ? entries.filter(e => e.courseCode.toLowerCase().includes(codeSearch.toLowerCase()))
    : entries

  // Build grid: {day__time -> [entry]}
  const gridMap = {}
  filtered.forEach(e => {
    const key = `${e.day}__${e.time}`
    if (!gridMap[key]) gridMap[key] = []
    gridMap[key].push(e)
  })

  // Unique levels from loaded entries
  const levels = [...new Set(entries.map(e => e.level))].sort((a, b) => a - b)

  return (
    <AdminLayout navItems={TIMETABLE_NAV}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">View & Edit Timetable</h1>
          <p className="text-slate-500 text-sm mt-1">Browse, filter, and edit published timetable entries</p>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3">
          <input type="text" value={session} onChange={e => setSession(e.target.value)}
            placeholder="Session (e.g. 2025/2026)"
            className="flex-1 min-w-[150px] px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
              placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
          />
          <div className="flex gap-2">
            {SEMESTERS.map(s => (
              <button key={s} onClick={() => setSemester(p => p === s ? '' : s)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all
                  ${semester === s ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
              >{s}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Department filter */}
          <div className="relative flex-1 min-w-[160px]">
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
                appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
          </div>

          {/* Level filter */}
          <div className="relative">
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
                appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            >
              <option value="">All Levels</option>
              {(levels.length > 0 ? levels : [100,200,300,400,500]).map(l => (
                <option key={l} value={l}>{l} Level</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
          </div>

          {/* Code search */}
          <div className="relative flex-1 min-w-[140px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input type="text" value={codeSearch} onChange={e => setCodeSearch(e.target.value)}
              placeholder="Search course code…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
                placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>

          <button onClick={load} disabled={loading || !session || !semester}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800
              text-slate-400 hover:text-white transition disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Prompt */}
        {!session && (
          <div className="py-12 text-center text-slate-600 text-sm">Enter a session to load the timetable.</div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="h-10 rounded-xl bg-slate-900 border border-slate-800 animate-pulse"/>)}
          </div>
        )}

        {/* Empty */}
        {!loading && session && entries.length === 0 && !error && (
          <div className="py-12 text-center text-slate-600 text-sm">
            No timetable entries found for this filter. Generate and publish a timetable first.
          </div>
        )}

        {/* Grid view */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 font-semibold">
                {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}
                {deptFilter && ` — ${deptFilter}`}
                {levelFilter && ` · Level ${levelFilter}`}
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="bg-slate-900">
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 text-left w-28 border-b border-r border-slate-800">Time</th>
                    {DAYS.map(d => (
                      <th key={d} className="px-3 py-3 text-xs font-bold text-slate-400 text-center border-b border-r border-slate-800 last:border-r-0">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time, ti) => (
                    <>
                      <tr key={time} className="bg-slate-950/50">
                        <td className="px-3 py-3 text-xs font-bold text-slate-500 border-b border-r border-slate-800 whitespace-nowrap">{time}</td>
                        {DAYS.map(day => {
                          const key = `${day}__${time}`
                          const cellEntries = gridMap[key] || []
                          return (
                            <td key={day} className="px-1.5 py-1.5 border-b border-r border-slate-800 last:border-r-0 align-top min-w-[100px]">
                              {cellEntries.length === 0
                                ? <div className="text-slate-800 text-center text-xs py-2">—</div>
                                : <div className="space-y-1">
                                    {cellEntries.map(entry => (
                                      <div key={entry._id}>
                                        {editId === entry._id ? (
                                          <form onSubmit={handleEdit} className="bg-slate-800 rounded-lg p-2 space-y-1.5 text-xs">
                                            <div className="flex gap-1">
                                              <select value={editForm.day} onChange={e => setEditForm(p => ({...p, day: e.target.value}))}
                                                className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs appearance-none"
                                              >
                                                {DAYS.map(d => <option key={d} value={d}>{d.slice(0,3)}</option>)}
                                              </select>
                                              <select value={editForm.time} onChange={e => setEditForm(p => ({...p, time: e.target.value}))}
                                                className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs appearance-none"
                                              >
                                                {TIME_SLOTS.map(t => <option key={t} value={t}>{t.split(' - ')[0]}</option>)}
                                              </select>
                                            </div>
                                            <input type="text" value={editForm.lecturer}
                                              onChange={e => setEditForm(p => ({...p, lecturer: e.target.value}))}
                                              placeholder="Lecturer name"
                                              className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs"
                                            />
                                            {editErr && <p className="text-red-400 text-[10px]">{editErr}</p>}
                                            <div className="flex gap-1">
                                              <button type="submit" disabled={editing}
                                                className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold"
                                              >{editing ? '…' : 'Save'}</button>
                                              <button type="button" onClick={() => setEditId(null)}
                                                className="flex-1 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-[10px] font-bold"
                                              >Cancel</button>
                                            </div>
                                          </form>
                                        ) : (
                                          <div className={`p-1.5 rounded-lg border group relative ${DAY_COLORS[day]}`}>
                                            <p className="text-[10px] font-black leading-tight">{entry.courseCode}</p>
                                            <p className="text-[9px] text-slate-400 truncate max-w-[90px]">{entry.lecturer}</p>
                                            {!deptFilter && (
                                              <p className="text-[9px] text-slate-500 truncate max-w-[90px]">{entry.department} L{entry.level}</p>
                                            )}
                                            {/* Hover actions */}
                                            <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-0.5">
                                              <button onClick={() => startEdit(entry)}
                                                className="w-5 h-5 rounded bg-slate-900/80 flex items-center justify-center text-slate-400 hover:text-blue-400"
                                              ><Pencil size={9}/></button>
                                              {confirmId === entry._id
                                                ? <>
                                                    <button onClick={() => handleDelete(entry._id)} className="w-5 h-5 rounded bg-red-500 flex items-center justify-center">
                                                      {deleting === entry._id ? <Loader2 size={9} className="animate-spin text-white"/> : <Check size={9} className="text-white"/>}
                                                    </button>
                                                    <button onClick={() => setConfirmId(null)} className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center"><X size={9} className="text-slate-300"/></button>
                                                  </>
                                                : <button onClick={() => setConfirmId(entry._id)}
                                                    className="w-5 h-5 rounded bg-slate-900/80 flex items-center justify-center text-slate-400 hover:text-red-400"
                                                  ><Trash2 size={9}/></button>
                                              }
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                              }
                            </td>
                          )
                        })}
                      </tr>
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
          </>
        )}
      </div>
    </AdminLayout>
  )
}