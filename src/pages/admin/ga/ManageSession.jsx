import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import {
  getActiveSession,
  createSession,
  endCurrentPhase,
  startNextPhase,
  getSessionHistory,
} from '../../../services/api'
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
  Calendar,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',       path: '/admin/ga',              icon: CalendarClock },
  { label: 'Session Control', path: '/admin/ga/session',      icon: CalendarClock },
  { label: 'Create Admin',    path: '/admin/ga/create',       icon: Plus },
  { label: 'Manage Admins',   path: '/admin/ga/admins',       icon: Plus },
  { label: 'Activity Logs',   path: '/admin/ga/logs',         icon: CalendarClock },
  { label: 'Change Password', path: '/admin/ga/password',     icon: CalendarClock },
]

export default function ManageSession() {
  const { adminToken } = useAdminAuth()
  const navigate = useNavigate()

  const [activeSession, setActiveSession] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state for creating new session
  const [newSessionName, setNewSessionName] = useState('')
  const [startNow, setStartNow] = useState(true)
  const [startDate, setStartDate] = useState('')

  // Form state for scheduling next phases
  const [secondSemesterStartNow, setSecondSemesterStartNow] = useState(true)
  const [secondSemesterDate, setSecondSemesterDate] = useState('')
  const [summerStartNow, setSummerStartNow] = useState(false)
  const [summerDate, setSummerDate] = useState('')
  const [skipSummer, setSkipSummer] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSessionData()
  }, [adminToken])

  const fetchSessionData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [activeRes, historyRes] = await Promise.all([
        getActiveSession(adminToken),
        getSessionHistory(adminToken),
      ])
      setActiveSession(activeRes.data || null)
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (e) => {
    e.preventDefault()
    if (!newSessionName.trim()) return setError('Please enter a session name')
    if (!startNow && !startDate) return setError('Please select a start date')

    setSubmitting(true)
    try {
      await createSession({
        session: newSessionName.trim(),
        startNow,
        startDate: startDate || null,
      }, adminToken)
      await fetchSessionData()
      setNewSessionName('')
      setStartDate('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEndPhase = async () => {
    setSubmitting(true)
    try {
      await endCurrentPhase(adminToken)
      await fetchSessionData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartSecondSemester = async () => {
    setSubmitting(true)
    try {
      await startNextPhase({
        phase: 'second',
        startNow: secondSemesterStartNow,
        startDate: secondSemesterDate || null,
      }, adminToken)
      await fetchSessionData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartSummer = async () => {
    setSubmitting(true)
    try {
      if (skipSummer) {
        // Skip summer - end current phase without scheduling summer
        await endCurrentPhase(adminToken)
      } else {
        await startNextPhase({
          phase: 'summer',
          startNow: summerStartNow,
          startDate: summerDate || null,
        }, adminToken)
      }
      await fetchSessionData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPhaseLabel = (phase) => {
    switch (phase) {
      case 'first': return 'First Semester'
      case 'second': return 'Second Semester'
      case 'summer': return 'Summer (Remedial)'
      default: return phase
    }
  }

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'first': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'second': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'summer': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    }
  }

  return (
    <AdminLayout navItems={NAV_ITEMS}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Session Control</h1>
          <p className="text-slate-500 text-sm mt-1">Manage academic sessions and semester transitions</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-slate-600 animate-spin" />
          </div>
        ) : (
          <>

            {/* State A: No Active Session */}
            {!activeSession && (
              <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    <Calendar size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">No Active Session</h2>
                    <p className="text-slate-500 text-sm">Create a new session to begin</p>
                  </div>
                </div>

                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Session Name
                    </label>
                    <input
                      type="text"
                      value={newSessionName}
                      onChange={e => setNewSessionName(e.target.value)}
                      placeholder="e.g. 2025/2026"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Start First Semester
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                        <input
                          type="radio"
                          name="startTiming"
                          checked={startNow}
                          onChange={() => setStartNow(true)}
                          className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                        />
                        <span className="text-white text-sm">Start immediately</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                        <input
                          type="radio"
                          name="startTiming"
                          checked={!startNow}
                          onChange={() => setStartNow(false)}
                          className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                        />
                        <span className="text-white text-sm">Schedule for date:</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          disabled={startNow}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-amber-500/50"
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/30"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                    {submitting ? 'Creating...' : 'Create Session & Start First Semester'}
                  </button>
                </form>
              </div>
            )}

            {/* State B: First Semester Active */}
            {activeSession && activeSession.phase === 'first' && (
              <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{activeSession.session}</h2>
                      <p className="text-slate-500 text-sm">Started: {formatDate(activeSession.startedAt)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getPhaseColor('first')}`}>
                    <Clock size={12} /> FIRST SEMESTER ACTIVE
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-6 space-y-6">
                  {/* End First Semester */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">End First Semester</h3>
                    <button
                      onClick={handleEndPhase}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Pause size={16} />
                      End First Semester Now
                    </button>
                  </div>

                  {/* Schedule Next Phase */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Schedule Next Phase</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-white text-sm font-medium mb-2">Second Semester</p>
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                            <input
                              type="radio"
                              name="secondSemesterTiming"
                              checked={secondSemesterStartNow}
                              onChange={() => setSecondSemesterStartNow(true)}
                              className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                            />
                            <span className="text-white text-sm">Start immediately after ending</span>
                          </label>
                          <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                            <input
                              type="radio"
                              name="secondSemesterTiming"
                              checked={!secondSemesterStartNow}
                              onChange={() => setSecondSemesterStartNow(false)}
                              className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                            />
                            <span className="text-white text-sm">Schedule for:</span>
                            <input
                              type="date"
                              value={secondSemesterDate}
                              onChange={e => setSecondSemesterDate(e.target.value)}
                              disabled={secondSemesterStartNow}
                              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-amber-500/50"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <p className="text-white text-sm font-medium mb-2">Summer (Optional)</p>
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                            <input
                              type="radio"
                              name="summerTiming"
                              checked={summerStartNow}
                              onChange={() => { setSummerStartNow(true); setSkipSummer(false) }}
                              className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                            />
                            <span className="text-white text-sm">Start immediately after Second Semester</span>
                          </label>
                          <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                            <input
                              type="radio"
                              name="summerTiming"
                              checked={!summerStartNow && !skipSummer}
                              onChange={() => { setSummerStartNow(false); setSkipSummer(false) }}
                              className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                            />
                            <span className="text-white text-sm">Schedule for:</span>
                            <input
                              type="date"
                              value={summerDate}
                              onChange={e => setSummerDate(e.target.value)}
                              disabled={summerStartNow || skipSummer}
                              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-amber-500/50"
                            />
                          </label>
                          <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                            <input
                              type="radio"
                              name="summerTiming"
                              checked={skipSummer}
                              onChange={() => { setSummerStartNow(false); setSkipSummer(true) }}
                              className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                            />
                            <span className="text-white text-sm">Skip Summer entirely</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* State C: Second Semester Active */}
            {activeSession && activeSession.phase === 'second' && (
              <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{activeSession.session}</h2>
                      <p className="text-slate-500 text-sm">Started: {formatDate(activeSession.startedAt)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getPhaseColor('second')}`}>
                    <Clock size={12} /> SECOND SEMESTER ACTIVE
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-6 space-y-6">
                  {/* End Second Semester */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">End Second Semester</h3>
                    <button
                      onClick={handleEndPhase}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Pause size={16} />
                      End Second Semester Now
                    </button>
                  </div>

                  {/* Summer Options */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Summer (Remedial — Optional)</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                        <input
                          type="radio"
                          name="summerOption"
                          checked={summerStartNow}
                          onChange={() => { setSummerStartNow(true); setSkipSummer(false) }}
                          className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                        />
                        <span className="text-white text-sm">Start immediately after ending</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                        <input
                          type="radio"
                          name="summerOption"
                          checked={!summerStartNow && !skipSummer}
                          onChange={() => { setSummerStartNow(false); setSkipSummer(false) }}
                          className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                        />
                        <span className="text-white text-sm">Schedule for:</span>
                        <input
                          type="date"
                          value={summerDate}
                          onChange={e => setSummerDate(e.target.value)}
                          disabled={summerStartNow || skipSummer}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-amber-500/50"
                        />
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                        <input
                          type="radio"
                          name="summerOption"
                          checked={skipSummer}
                          onChange={() => { setSummerStartNow(false); setSkipSummer(true) }}
                          className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500/50"
                        />
                        <span className="text-white text-sm">Skip Summer entirely</span>
                      </label>
                    </div>

                    {!skipSummer && (
                      <button
                        onClick={handleStartSummer}
                        disabled={submitting}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/30"
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        {submitting ? 'Starting...' : 'Start Summer'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* State D: Summer Active */}
            {activeSession && activeSession.phase === 'summer' && (
              <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{activeSession.session}</h2>
                      <p className="text-slate-500 text-sm">Started: {formatDate(activeSession.startedAt)}</p>
                      <p className="text-amber-400 text-xs mt-1">Runs as: First Semester (Remedial)</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getPhaseColor('summer')}`}>
                    <Clock size={12} /> SUMMER ACTIVE
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-6">
                  <button
                    onClick={handleEndPhase}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-900/30"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <SkipForward size={16} />}
                    {submitting ? 'Ending...' : 'End Summer & Close Session'}
                  </button>
                </div>
              </div>
            )}

            {/* Timeline */}
            {history.length > 0 && (
              <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Session Timeline</h3>
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className="text-white font-medium">{item.session}</span>
                      <span className="text-slate-500">—</span>
                      <span className={`text-slate-300 ${item.status === 'active' ? 'text-emerald-400' : ''}`}>
                        {getPhaseLabel(item.phase)}
                      </span>
                      <span className="text-slate-600 text-xs ml-auto">
                        {formatDate(item.startedAt)} → {item.endedAt ? formatDate(item.endedAt) : 'ongoing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </>
        )}

      </div>
    </AdminLayout>
  )
}
