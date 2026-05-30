import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/shared/AdminLayout'
import { TAC_NAV } from './Dashboard'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { getAllIdCards, markIdCardCollected, rejectIdCardAdmin } from '../../../services/api'
import {
  CreditCard, Clock, CheckCircle2, XCircle,
  AlertCircle, RefreshCw, X, User, ChevronRight,
  Loader2, Eye,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const STATUS_META = {
  pending:     { label: 'Pending',     icon: Clock,        chip: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  collected:   { label: 'Collected',   icon: CheckCircle2, chip: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  rejected:    { label: 'Rejected',    icon: XCircle,      chip: 'bg-red-500/15 text-red-400 border-red-500/30' },
  unsubmitted: { label: 'Unsubmitted', icon: AlertCircle,  chip: 'bg-slate-700 text-slate-400 border-slate-600' },
}

function timeAgo(date) {
  if (!date) return '—'
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusChip({ status }) {
  const meta = STATUS_META[status] || STATUS_META.unsubmitted
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${meta.chip}`}>
      <Icon size={11} />
      {meta.label}
    </span>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />
}

// ── Reject modal ──────────────────────────────────────────────────────────────
function RejectModal({ card, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Reject ID Card</h2>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <p className="text-slate-400 text-sm">
          Rejecting <span className="text-white font-semibold">{card.fullName || card.matricNumber}</span>'s submission. They will be able to resubmit.
        </p>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Reason for Rejection</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Photo is not clear, wrong information..."
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 transition resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPanel({ card, onClose, onCollect, onReject, actionLoading }) {
  const photoSrc = card.photoURL
    ? (card.photoURL.startsWith('http') ? card.photoURL : `${API_BASE_URL}/uploads/${card.photoURL}`)
    : null

  const fields = [
    ['Full Name',       card.fullName],
    ['Matric Number',   card.matricNumber],
    ['Nationality',     card.nationality],
    ['Date of Birth',   card.dateOfBirth ? new Date(card.dateOfBirth).toLocaleDateString('en-GB') : null],
    ['Gender',          card.gender],
    ['Department',      card.department],
    ['Level',           card.level ? `${card.level} Level` : null],
    ['Session',         card.session],
    ['Phone',           card.phone],
    ['Submitted',       timeAgo(card.submittedAt)],
  ]

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-base font-bold text-white">ID Card Submission</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <StatusChip status={card.status} />
            {card.rejectionReason && (
              <p className="text-xs text-red-400 italic max-w-[200px] text-right">{card.rejectionReason}</p>
            )}
          </div>

          {/* Photo */}
          <div className="flex justify-center">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt="Passport"
                className="w-32 h-36 object-cover rounded-xl border-2 border-slate-700 shadow-lg"
              />
            ) : (
              <div className="w-32 h-36 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                <User size={32} className="text-slate-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 divide-y divide-slate-700/40">
            {fields.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                <span className="text-slate-500 text-xs font-medium flex-shrink-0">{label}</span>
                <span className="text-slate-200 text-xs text-right">{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {card.status === 'pending' && (
          <div className="p-4 border-t border-slate-800 flex gap-3 flex-shrink-0">
            <button
              onClick={() => onReject(card)}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-all disabled:opacity-40"
            >
              <XCircle size={15} />
              Reject
            </button>
            <button
              onClick={() => onCollect(card._id)}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-sm transition-all shadow-lg disabled:opacity-40"
            >
              {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              Mark Collected
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const FILTERS = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'collected', label: 'Collected' },
  { value: 'rejected',  label: 'Rejected' },
]

export default function Submissions() {
  const { adminToken } = useAdminAuth()
  const [cards,         setCards]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [filter,        setFilter]        = useState('pending')
  const [selected,      setSelected]      = useState(null)
  const [rejectTarget,  setRejectTarget]  = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchCards = (status) => {
    setLoading(true)
    setError(null)
    const param = status === 'all' ? {} : { status }
    getAllIdCards(adminToken, param)
      .then(data => setCards(data?.data || data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCards(filter) }, [filter, adminToken])

  const handleCollect = async (cardId) => {
    setActionLoading(true)
    try {
      await markIdCardCollected(cardId, adminToken)
      setCards(prev => prev.map(c => c._id === cardId ? { ...c, status: 'collected', collectedAt: new Date() } : c))
      setSelected(prev => prev?._id === cardId ? { ...prev, status: 'collected' } : prev)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (reason) => {
    if (!rejectTarget) return
    setActionLoading(true)
    try {
      await rejectIdCardAdmin(rejectTarget._id, reason, adminToken)
      setCards(prev => prev.map(c => c._id === rejectTarget._id ? { ...c, status: 'rejected', rejectionReason: reason } : c))
      setSelected(prev => prev?._id === rejectTarget._id ? { ...prev, status: 'rejected', rejectionReason: reason } : prev)
      setRejectTarget(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const counts = cards.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc }, {})

  return (
    <>
      {rejectTarget && (
        <RejectModal
          card={rejectTarget}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}
      {selected && (
        <DetailPanel
          card={selected}
          onClose={() => setSelected(null)}
          onCollect={handleCollect}
          onReject={(c) => { setRejectTarget(c); }}
          actionLoading={actionLoading}
        />
      )}

      <AdminLayout navItems={TAC_NAV}>
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">ID Card Submissions</h1>
              <p className="text-slate-500 text-sm mt-1">{cards.length} submission{cards.length !== 1 ? 's' : ''} shown</p>
            </div>
            <button onClick={() => fetchCards(filter)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={17} className="flex-shrink-0" />{error}
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setSelected(null) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                  ${filter === f.value
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                  }`}
              >
                {f.label}
                {f.value !== 'all' && counts[f.value] != null && (
                  <span className="ml-1.5 opacity-70">{counts[f.value]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : cards.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  <CreditCard size={22} className="text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm">No {filter === 'all' ? '' : filter} submissions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/50">
                      {['Student', 'Matric No.', 'Department', 'Submitted', 'Status', ''].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card, i) => (
                      <tr
                        key={card._id || i}
                        className="border-t border-slate-800/60 hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => setSelected(card)}
                      >
                        <td className="px-5 py-3.5 text-white font-semibold text-sm">{card.fullName || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{card.matricNumber || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{card.department || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{timeAgo(card.submittedAt)}</td>
                        <td className="px-5 py-3.5"><StatusChip status={card.status} /></td>
                        <td className="px-5 py-3.5">
                          <ChevronRight size={15} className="text-slate-600" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </AdminLayout>
    </>
  )
}