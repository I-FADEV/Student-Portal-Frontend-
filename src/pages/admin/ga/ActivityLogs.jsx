import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { GA_NAV } from './Dashboard'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { getActivityLogs } from '../../../services/api'
import { ScrollText, AlertCircle, RefreshCw, Clock, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const TYPE_META = {
  general_admin:   { label: 'General',   color: 'text-amber-400' },
  registry_admin:  { label: 'Registry',  color: 'text-blue-400' },
  timetable_admin: { label: 'Timetable', color: 'text-violet-400' },
  finance_admin:   { label: 'Finance',    color: 'text-emerald-400' },
  idcard_admin:    { label: 'Idcard',       color: 'text-cyan-400' },
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />
}

export default function ActivityLogs() {
  const { adminToken } = useAdminAuth()
  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [filter,     setFilter]     = useState('all')
  const [page,       setPage]       = useState(1)
  const [limit,      setLimit]      = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [startDate, setStartDate]  = useState('')
  const [endDate,   setEndDate]    = useState('')

  const fetchLogs = () => {
  setLoading(true)
  setError(null)
  getActivityLogs(adminToken, { page, limit, startDate, endDate })
    .then(data => {
      const logsData = Array.isArray(data?.data?.logs) ? data.data.logs :
                       Array.isArray(data?.data) ? data.data :
                       Array.isArray(data?.logs) ? data.logs :
                       Array.isArray(data) ? data :
                       []
      setLogs(logsData)
      setTotalPages(data?.totalPages || Math.ceil(logsData.length / limit) || 1)
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}

  useEffect(() => { fetchLogs() }, [adminToken, page, limit, startDate, endDate])

  const FILTERS = [
    { value: 'all',            label: 'All Admins' },
    { value: 'registry_admin', label: 'Registry' },
    { value: 'timetable_admin',label: 'Timetable' },
    { value: 'finance_admin',  label: 'Finance' },
    { value: 'idcard_admin',   label: 'Idcard' },
    { value: 'general_admin',  label: 'General' },
  ]

  const filtered = filter === 'all' ? logs : logs.filter(l => l.adminType === filter)

  return (
    <AdminLayout navItems={GA_NAV}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Activity Logs</h1>
            <p className="text-slate-500 text-sm mt-1">All admin actions across the system</p>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={17} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-slate-600" />
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                ${filter === f.value
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-slate-600" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-slate-600"
            />
            <span className="text-slate-600 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-slate-600"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setPage(1) }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-600 text-xs">Per page:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
              className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-slate-600"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-xs text-slate-600">
            Showing <span className="text-slate-400 font-semibold">{filtered.length}</span> log{filtered.length !== 1 ? 's' : ''}
            {totalPages > 1 && (
              <span className="ml-2"> · Page <span className="text-slate-400 font-semibold">{page}</span> of <span className="text-slate-400 font-semibold">{totalPages}</span></span>
            )}
          </p>
        )}

        {/* Log feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                <ScrollText size={22} className="text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm">No activity logs found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filtered.map((log, i) => {
                const meta = TYPE_META[log.adminType] || { label: log.adminType, color: 'text-slate-400' }
                return (
                  <div key={log._id || i} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-800/20 transition-colors">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock size={14} className="text-slate-500" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm leading-snug">
                        <span className={`font-bold ${meta.color}`}>  
                          {meta.label} Admin
                        </span>
                        {log.adminUsername && (
                          <span className="text-slate-500 text-xs ml-1">({log.adminUsername})</span>
                        )}
                        {' — '}
                        <span className="text-slate-300">{log.description}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-600 text-xs">{timeAgo(log.createdAt)}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 ${
                          log.action === 'CREATE' ? 'text-emerald-400' :
                          log.action === 'UPDATE' ? 'text-blue-400' :
                          log.action === 'DELETE' ? 'text-red-400' :
                          log.action === 'LOGIN'  ? 'text-amber-400' :
                          'text-slate-400'       
                        }`}>
                          {log.action}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${page === pageNum
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}