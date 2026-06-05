import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStudentFinances, getActiveSession } from '../../services/api'
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
}

function StatusChip({ status }) {
  const s = (status || '').toLowerCase()
  if (s === 'paid')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
        <CheckCircle2 size={12} /> Paid
      </span>
    )
  if (s === 'partial')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700">
        <Clock size={12} /> Partially Paid
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 border border-red-200 text-red-700">
      <AlertTriangle size={12} /> Unpaid
    </span>
  )
}

function StatCard({ label, amount, color, currency = 'NGN' }) {
  const currencySymbol = currency === 'XAF' ? 'FCFA' : '₦'
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">{label}</p>
      <p className="text-2xl font-extrabold">
        {currencySymbol}{Number(amount || 0).toLocaleString()}
      </p>
    </div>
  )
}

// Supports both a single finance record or an array of records (per session)
export default function Finance() {
  const { token }  = useAuth()
  const [records,  setRecords]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [activeSession, setActiveSession] = useState(null)

  useEffect(() => {
    // Fetch active session
    getActiveSession(token)
      .then(res => setActiveSession(res.data || null))
      .catch(() => {})

    // Fetch finances
    getStudentFinances(token)
  .then((response) => {
    const data = response.data  // ← unwrap the { data: ... } wrapper
    if (Array.isArray(data)) setRecords(data)
    else if (data) setRecords([data])
    else setRecords([])
  })
  .catch((err) => setError(err.message))
  .finally(() => setLoading(false))
  }, [token])

  // Aggregate totals across all records
  const totals = records.reduce(
    (acc, r) => ({
      totalFees: acc.totalFees + Number(r.totalAmount || 0),
    totalPaid: acc.totalPaid + Number(r.totalPaid   || 0),
    balance:   acc.balance   + Number(r.outstandingBalance || 0),
  }),
  { totalFees: 0, totalPaid: 0, balance: 0 }
  )

  // Get currency from first record (assuming all records in same session use same currency)
  const currency = records.length > 0 ? (records[0].currency || 'NGN') : 'NGN'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Financial Status</h1>
        <p className="text-slate-500 text-sm mt-1">Your fee records and payment history</p>
        {activeSession && (
          <p className="text-slate-400 text-xs mt-1">
            {activeSession.session} · {activeSession.phase === 'summer' ? 'Summer (Remedial)' : activeSession.semester} Semester
          </p>
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
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Wallet size={28} className="text-slate-400" />
          </div>
          <h3 className="text-slate-700 font-semibold text-base">No financial records</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            Your fee records haven't been posted yet. The bursar admin will update this.
          </p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && records.length > 0 && (
        <div className="space-y-6">

          {/* Summary stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Fees"
              amount={totals.totalFees}
              color="bg-slate-50 border-slate-200 text-slate-800"
              currency={currency}
            />
            <StatCard
              label="Total Paid"
              amount={totals.totalPaid}
              color="bg-emerald-50 border-emerald-200 text-emerald-800"
              currency={currency}
            />
            <StatCard
              label="Outstanding Balance"
              amount={totals.balance}
              color={totals.balance > 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}
              currency={currency}
            />
          </div>

          {/* Per-session breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Session Breakdown</h2>
            </div>

            <div className="divide-y divide-slate-50">
              {records.map((record, idx) => {
                const fees    = Number(record.totalAmount        || 0)
                const paid    = Number(record.totalPaid          || 0)
                const balance = Number(record.outstandingBalance || 0)
                const pct     = fees > 0 ? Math.min(100, Math.round((paid / fees) * 100)) : 0
                const recordCurrency = record.currency || 'NGN'
                const currencySymbol = recordCurrency === 'XAF' ? 'FCFA' : '₦'

                return (
                  <div key={record._id || idx} className="p-5">
                    {/* Row top */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {record.session || `Session ${idx + 1}`}
                        </p>
                        {record.semester && (
                          <p className="text-xs text-slate-400 mt-0.5">{record.semester} Semester</p>
                        )}
                      </div>
                      <StatusChip status={record.status} />
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Payment progress</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Total Fees</p>
                        <p className="text-sm font-bold text-slate-800">{currencySymbol}{fees.toLocaleString()}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <p className="text-xs text-emerald-600 mb-1">Paid</p>
                        <p className="text-sm font-bold text-emerald-700">{currencySymbol}{paid.toLocaleString()}</p>
                      </div>
                      <div className={`rounded-xl p-3 ${balance > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                        <p className={`text-xs mb-1 flex items-center justify-center gap-1 ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          <TrendingDown size={10} /> Balance
                        </p>
                        <p className={`text-sm font-bold ${balance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                          {currencySymbol}{balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {/* Footer note */}
      {!loading && records.length > 0 && (
        <p className="text-xs text-slate-400 px-1">
          For payment inquiries or discrepancies, please visit the Bursar's office.
        </p>
      )}

    </div>
  )
}
