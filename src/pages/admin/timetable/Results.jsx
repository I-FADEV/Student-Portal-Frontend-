import { useState, useEffect, useRef } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import { TIMETABLE_NAV } from './Dashboard'
import {
  getTimetableCourses, getResultsByCourse,
  saveResultsBulk, getResultsByStudent, updateResult,
} from '../../../services/api'
import {
  BarChart2, Upload, Users, Search, ChevronDown,
  AlertCircle, Loader2, Check, X, FileSpreadsheet,
  CheckCircle2, RefreshCw, User,
} from 'lucide-react'

const SEMESTERS = ['First', 'Second']

// ── Grade calculation (A:70-100, B:60-69, C:50-59, D:40-49, E:30-39, F:0-29) ─
function calcGrade(total) {
  const t = Number(total)
  if (t >= 70) return 'A'
  if (t >= 60) return 'B'
  if (t >= 50) return 'C'
  if (t >= 40) return 'D'
  if (t >= 30) return 'E'
  return 'F'
}

const GRADE_COLORS = {
  A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  B: 'text-blue-400    bg-blue-500/10    border-blue-500/20',
  C: 'text-cyan-400    bg-cyan-500/10    border-cyan-500/20',
  D: 'text-amber-400   bg-amber-500/10   border-amber-500/20',
  E: 'text-orange-400  bg-orange-500/10  border-orange-500/20',
  F: 'text-red-400     bg-red-500/10     border-red-500/20',
}

// ── Parse Excel using SheetJS (npm install xlsx) ──────────────────────────────
async function parseExcel(file) {
  const XLSX = await import('xlsx')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'binary' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
        resolve(rows)
      } catch { reject(new Error('Failed to parse Excel file.')) }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsBinaryString(file)
  })
}

// Normalise a raw Excel row → {studentName, matricNumber, test, exam, total, grade}
function normaliseRow(row) {
  // Headers may be case-insensitive — find key flexibly
  const get = (...keys) => {
    for (const k of keys) {
      const match = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase())
      if (match !== undefined && row[match] !== '') return row[match]
    }
    return ''
  }
  const test  = Number(get('test', 'testscore', 'test score')) || 0
  const exam  = Number(get('exam', 'examscore', 'exam score')) || 0
  const total = Number(get('total', 'totalscore', 'total score')) || (test + exam)
  const grade = get('grade') || calcGrade(total)
  return {
    studentName:  String(get('studentname', 'student name', 'name', 'fullname') || '').trim(),
    matricNumber: String(get('matricnumber', 'matric number', 'matric', 'matric no') || '').trim(),
    test, exam, total, grade,
  }
}

export default function Results() {
  const { adminToken } = useAdminAuth()

  // ── Shared filters ─────────────────────────────────────────────────────────
  const [session,    setSession]    = useState('')
  const [semester,   setSemester]   = useState('')
  const [activeTab,  setActiveTab]  = useState('course') // 'course' | 'student'

  // ── By Course ──────────────────────────────────────────────────────────────
  const [courses,      setCourses]      = useState([])
  const [loadingC,     setLoadingC]     = useState(false)
  const [selectedCode, setSelectedCode] = useState('')
  const [students,     setStudents]     = useState([]) // {_id?, name, matric, test, exam, total, grade, resultId?}
  const [loadingS,     setLoadingS]     = useState(false)

  // Upload mode: 'excel' | 'manual'
  const [uploadMode,   setUploadMode]   = useState('excel')
  const [xlFile,       setXlFile]       = useState(null)
  const [xlRows,       setXlRows]       = useState([])  // parsed preview
  const [xlError,      setXlError]      = useState(null)
  const [parsing,      setParsing]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [saveMsg,      setSaveMsg]      = useState(null)
  const [saveErr,      setSaveErr]      = useState(null)

  const fileRef = useRef()

  // ── By Student ─────────────────────────────────────────────────────────────
  const [studentQuery, setStudentQuery] = useState('')
  const [studentResults, setStudentResults] = useState([])
  const [loadingSR,    setLoadingSR]    = useState(false)
  const [srError,      setSrError]      = useState(null)
  const [editingId,    setEditingId]    = useState(null)
  const [editRow,      setEditRow]      = useState({})
  const [editSaving,   setEditSaving]   = useState(false)

  // Load courses when session+semester change
  useEffect(() => {
    if (!session || !semester) return
    setLoadingC(true)
    getTimetableCourses(session, semester, adminToken)
      .then(data => setCourses(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
      .finally(() => setLoadingC(false))
  }, [session, semester])

  // Load students for selected course
  const loadStudents = async () => {
    if (!selectedCode || !session || !semester) return
    setLoadingS(true)
    setSaveMsg(null)
    setSaveErr(null)
    try {
      const data = await getResultsByCourse({ courseCode: selectedCode, session, semester }, adminToken)
      setStudents(Array.isArray(data) ? data : data?.data || [])
    } catch { setStudents([]) }
    finally { setLoadingS(false) }
  }

  useEffect(() => { loadStudents() }, [selectedCode])

  // ── Excel upload ───────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setXlFile(file)
    setXlError(null)
    setXlRows([])
    setParsing(true)
    try {
      const rawRows = await parseExcel(file)
      setXlRows(rawRows.map(normaliseRow))
    } catch (err) {
      setXlError(err.message)
    } finally {
      setParsing(false)
    }
  }

  const handleExcelSave = async () => {
    if (!xlRows.length || !selectedCode) return
    setSaving(true)
    setSaveErr(null)
    setSaveMsg(null)
    try {
      const payload = xlRows.map(r => ({
        courseCode: selectedCode,
        session, semester,
        studentName:  r.studentName,
        matricNumber: r.matricNumber,
        test:  r.test,
        exam:  r.exam,
        total: r.total,
        grade: r.grade,
      }))
      await saveResultsBulk(payload, adminToken)
      setSaveMsg(`${payload.length} result${payload.length !== 1 ? 's' : ''} saved successfully.`)
      setXlFile(null)
      setXlRows([])
      loadStudents()
    } catch (err) {
      setSaveErr(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Manual entry ───────────────────────────────────────────────────────────
  const updateManualRow = (idx, key, val) => {
    setStudents(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [key]: val }
      if (key === 'test' || key === 'exam') {
        const t = key === 'test' ? Number(val) : Number(next[idx].test || 0)
        const ex = key === 'exam' ? Number(val) : Number(next[idx].exam || 0)
        next[idx].total = t + ex
        next[idx].grade = calcGrade(t + ex)
      }
      return next
    })
  }

  const handleManualSave = async () => {
    setSaving(true)
    setSaveErr(null)
    setSaveMsg(null)
    try {
      const payload = students.map(s => ({
        courseCode: selectedCode,
        session, semester,
        studentName:  s.name || s.studentName,
        matricNumber: s.matric || s.matricNumber,
        test: s.test || 0,
        exam: s.exam || 0,
        total: s.total || 0,
        grade: s.grade || calcGrade(s.total || 0),
        ...(s.resultId ? { resultId: s.resultId } : {}),
      }))
      await saveResultsBulk(payload, adminToken)
      setSaveMsg(`${payload.length} result${payload.length !== 1 ? 's' : ''} saved.`)
    } catch (err) {
      setSaveErr(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── By Student search ──────────────────────────────────────────────────────
  const searchStudent = async () => {
    if (!studentQuery || !session || !semester) return
    setLoadingSR(true)
    setSrError(null)
    try {
      const data = await getResultsByStudent({ query: studentQuery, session, semester }, adminToken)
      setStudentResults(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      setSrError(err.message)
    } finally {
      setLoadingSR(false)
    }
  }

  const startEditResult = (r) => {
    setEditingId(r._id)
    setEditRow({ test: r.test, exam: r.exam, total: r.total, grade: r.grade })
  }

  const handleEditResult = async () => {
    setEditSaving(true)
    try {
      const updated = await updateResult(editingId, editRow, adminToken)
      setStudentResults(prev => prev.map(r => r._id === editingId ? { ...r, ...updated } : r))
      setEditingId(null)
    } catch {} finally { setEditSaving(false) }
  }

  return (
    <AdminLayout navItems={TIMETABLE_NAV}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Results</h1>
          <p className="text-slate-500 text-sm mt-1">Upload or manage student results per course</p>
        </div>

        {/* Session + Semester */}
        <div className="flex flex-wrap gap-3">
          <input type="text" value={session} onChange={e => setSession(e.target.value)}
            placeholder="Session (e.g. 2025/2026)"
            className="flex-1 min-w-[160px] px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
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

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-0">
          {[{ id: 'course', label: 'By Course' }, { id: 'student', label: 'By Student' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px
                ${activeTab === t.id ? 'border-blue-500 text-blue-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >{t.label}</button>
          ))}
        </div>

        {/* ── BY COURSE ── */}
        {activeTab === 'course' && (
          <div className="space-y-5">
            {/* Course selector */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <select value={selectedCode} onChange={e => setSelectedCode(e.target.value)}
                  disabled={loadingC || !session || !semester}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
                    appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition disabled:opacity-40"
                >
                  <option value="">Select a course…</option>
                  {courses.map(c => (
                    <option key={c._id} value={c.courseCode}>{c.courseCode} — {c.courseName}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
              </div>
              <button onClick={loadStudents} disabled={!selectedCode || loadingS}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800
                  text-slate-400 hover:text-white transition disabled:opacity-40"
              ><RefreshCw size={14} className={loadingS ? 'animate-spin' : ''}/></button>
            </div>

            {selectedCode && (
              <>
                {/* Upload mode toggle */}
                <div className="flex gap-2">
                  {[{ id: 'excel', label: '📊 Excel Upload' }, { id: 'manual', label: '✏️ Manual Entry' }].map(m => (
                    <button key={m.id} onClick={() => setUploadMode(m.id)}
                      className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all
                        ${uploadMode === m.id ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                    >{m.label}</button>
                  ))}
                </div>

                {/* Success / Error messages */}
                {saveMsg && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
                    <CheckCircle2 size={15}/> {saveMsg}
                  </div>
                )}
                {saveErr && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <AlertCircle size={15}/> {saveErr}
                  </div>
                )}

                {/* ── Excel Upload ── */}
                {uploadMode === 'excel' && (
                  <div className="space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-blue-300/70 text-xs">
                        <FileSpreadsheet size={14} className="flex-shrink-0 mt-0.5"/>
                        <div>
                          <p className="font-bold text-blue-300 mb-0.5">Expected columns (any order):</p>
                          <p>studentName · matricNumber · test · exam</p>
                          <p className="text-blue-300/50 mt-0.5">total and grade are auto-calculated if missing</p>
                        </div>
                      </div>

                      <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden"/>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-slate-700
                          rounded-xl text-slate-400 hover:border-blue-500/50 hover:text-blue-400 transition-all cursor-pointer"
                      >
                        {parsing
                          ? <><Loader2 size={18} className="animate-spin"/> Parsing file…</>
                          : xlFile
                            ? <><FileSpreadsheet size={18} className="text-blue-400"/> {xlFile.name}</>
                            : <><Upload size={18}/> Click to upload Excel file (.xlsx)</>
                        }
                      </button>

                      {xlError && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertCircle size={13}/> {xlError}
                        </div>
                      )}
                    </div>

                    {/* Preview table */}
                    {xlRows.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Preview — {xlRows.length} student{xlRows.length !== 1 ? 's' : ''}
                          </p>
                          <button onClick={handleExcelSave} disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500
                              text-white text-sm font-bold disabled:opacity-50 transition"
                          >
                            {saving ? <Loader2 size={13} className="animate-spin"/> : <Check size={13}/>}
                            {saving ? 'Saving…' : 'Confirm & Save'}
                          </button>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="w-full min-w-[520px] text-xs">
                            <thead className="bg-slate-900">
                              <tr>
                                {['Student Name', 'Matric No.', 'Test', 'Exam', 'Total', 'Grade'].map(h => (
                                  <th key={h} className="px-3 py-2.5 text-left font-bold text-slate-500 border-b border-slate-800">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {xlRows.map((r, i) => {
                                const noMatric = !r.matricNumber
                                return (
                                  <tr key={i} className={`border-b border-slate-800/60 ${noMatric ? 'bg-red-500/5' : ''}`}>
                                    <td className="px-3 py-2 text-slate-300">{r.studentName || '—'}</td>
                                    <td className={`px-3 py-2 font-mono ${noMatric ? 'text-red-400' : 'text-white'}`}>
                                      {r.matricNumber || '⚠ missing'}
                                    </td>
                                    <td className="px-3 py-2 text-slate-300">{r.test}</td>
                                    <td className="px-3 py-2 text-slate-300">{r.exam}</td>
                                    <td className="px-3 py-2 text-slate-300 font-semibold">{r.total}</td>
                                    <td className="px-3 py-2">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${GRADE_COLORS[r.grade] || ''}`}>
                                        {r.grade}
                                      </span>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Manual Entry ── */}
                {uploadMode === 'manual' && (
                  <div className="space-y-3">
                    {loadingS ? (
                      <div className="space-y-2">
                        {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-slate-900 border border-slate-800 animate-pulse"/>)}
                      </div>
                    ) : students.length === 0 ? (
                      <div className="py-10 text-center text-slate-600 text-sm">
                        No students found for this course. Check course targets are set correctly.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="w-full min-w-[520px] text-xs">
                            <thead className="bg-slate-900">
                              <tr>
                                {['Student', 'Matric', 'Test /30', 'Exam /70', 'Total', 'Grade'].map(h => (
                                  <th key={h} className="px-3 py-2.5 text-left font-bold text-slate-500 border-b border-slate-800">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {students.map((s, idx) => (
                                <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-900/50">
                                  <td className="px-3 py-2 text-slate-300">{s.name || s.studentName || '—'}</td>
                                  <td className="px-3 py-2 text-white font-mono text-[10px]">{s.matric || s.matricNumber}</td>
                                  <td className="px-2 py-1.5">
                                    <input type="number" min="0" max="30"
                                      value={s.test || ''}
                                      onChange={e => updateManualRow(idx, 'test', e.target.value)}
                                      className="w-16 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs
                                        focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <input type="number" min="0" max="70"
                                      value={s.exam || ''}
                                      onChange={e => updateManualRow(idx, 'exam', e.target.value)}
                                      className="w-16 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs
                                        focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                                    />
                                  </td>
                                  <td className="px-3 py-2 font-semibold text-slate-200">{s.total || 0}</td>
                                  <td className="px-3 py-2">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${GRADE_COLORS[s.grade || calcGrade(s.total || 0)] || ''}`}>
                                      {s.grade || calcGrade(s.total || 0)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-end">
                          <button onClick={handleManualSave} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                              text-white text-sm font-bold disabled:opacity-50 transition"
                          >
                            {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                            {saving ? 'Saving…' : 'Save All Results'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── BY STUDENT ── */}
        {activeTab === 'student' && (
          <div className="space-y-5">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input type="text" value={studentQuery}
                  onChange={e => setStudentQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchStudent()}
                  placeholder="Search by name or matric number…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
                    placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                />
              </div>
              <button onClick={searchStudent} disabled={!studentQuery || !session || !semester || loadingSR}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold
                  disabled:opacity-40 transition"
              >
                {loadingSR ? <Loader2 size={14} className="animate-spin"/> : <Search size={14}/>}
                Search
              </button>
            </div>

            {(!session || !semester) && (
              <p className="text-slate-600 text-sm text-center py-8">Set session and semester above first.</p>
            )}

            {srError && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle size={15}/> {srError}
              </div>
            )}

            {!loadingSR && studentResults.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800">
                  <p className="text-white font-bold">{studentResults[0]?.studentName}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{studentResults[0]?.matricNumber} · {session} {semester} Semester</p>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-slate-900/50">
                    <tr>
                      {['Course', 'Test', 'Exam', 'Total', 'Grade', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-bold text-slate-500 border-b border-slate-800">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentResults.map((r) => (
                      <tr key={r._id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                        {editingId === r._id ? (
                          <>
                            <td className="px-4 py-2 text-white font-mono font-bold">{r.courseCode}</td>
                            <td className="px-2 py-1.5">
                              <input type="number" value={editRow.test}
                                onChange={e => {
                                  const test = Number(e.target.value)
                                  const total = test + Number(editRow.exam)
                                  setEditRow(p => ({...p, test, total, grade: calcGrade(total)}))
                                }}
                                className="w-14 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" value={editRow.exam}
                                onChange={e => {
                                  const exam = Number(e.target.value)
                                  const total = Number(editRow.test) + exam
                                  setEditRow(p => ({...p, exam, total, grade: calcGrade(total)}))
                                }}
                                className="w-14 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                              />
                            </td>
                            <td className="px-4 py-2 font-semibold text-slate-200">{editRow.total}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${GRADE_COLORS[editRow.grade]}`}>
                                {editRow.grade}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-1">
                                <button onClick={handleEditResult} disabled={editSaving}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold"
                                >{editSaving ? '…' : 'Save'}</button>
                                <button onClick={() => setEditingId(null)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-[10px] font-bold"
                                >Cancel</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-white font-mono font-bold">{r.courseCode}</td>
                            <td className="px-4 py-3 text-slate-300">{r.test}</td>
                            <td className="px-4 py-3 text-slate-300">{r.exam}</td>
                            <td className="px-4 py-3 font-semibold text-slate-200">{r.total}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${GRADE_COLORS[r.grade] || ''}`}>
                                {r.grade}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => startEditResult(r)}
                                className="text-slate-500 hover:text-blue-400 transition-colors"
                              ><Users size={13}/></button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingSR && studentQuery && studentResults.length === 0 && (
              <div className="py-10 text-center text-slate-600 text-sm">No results found for this student/session.</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}