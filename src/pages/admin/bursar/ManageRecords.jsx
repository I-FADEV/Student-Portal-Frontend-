import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import AdminLayout from '../../../components/shared/AdminLayout'
import {
  getAllFinanceRecords,
  recordFinancePayment,
  addItemToFinanceRecord,
} from '../../../services/api'
import {
  TrendingUp, Plus, FileText, Wallet,
  Search, ChevronDown, Loader2, CheckCircle2,
  Clock, XCircle, X, AlertCircle, ChevronRight,
  CreditCard, DollarSign, PlusCircle, Trash2,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',       path: '/admin/bursar',                 icon: TrendingUp },
  { label: 'Create Record',   path: '/admin/bursar/create',          icon: Plus },
  { label: 'Manage Records',  path: '/admin/bursar/records',         icon: FileText },
  { label: 'Change Password', path: '/admin/bursar/change-password', icon: Wallet },
]

const SESSIONS  = ['2025/2026', '2024/2025', '2023/2024', '2022/2023']
const SEMESTERS = ['First', 'Second']
const STATUSES  = ['Paid', 'Partial', 'Unpaid']

const PRESET_LABELS = [
  'Tuition', 'ID Card', 'Library Fee', 'Lab Fee',
  'Exam Fee', 'Sports Fee', 'Medical Fee', 'Development Levy', 'Resit Fee',
]

function statusMeta(status) {
  switch ((status || '').toLowerCase()) {
    case 'paid':    return { label: 'Paid',    cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 }
    case 'partial': return { label: 'Partial', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20',     icon: Clock }
    default:        return { label: 'Unpaid',  cls: 'text-red-400 bg-red-500/10 border-red-500/20',           icon: XCircle }
  }
}

function itemStatusCls(status) {
  switch ((status || '').toLowerCase()) {
    case 'paid':    return 'text-emerald-400'
    case 'partial': return 'text-amber-400'
    default:        return 'text-red-400'
  }
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ record, onClose, onSuccess, adminToken }) {
  const [payments,   setPayments]   = useState(
    record.items.map(it => ({
      itemLabel:  it.label,
      amountPaid: '',
      max:        it.amount - it.paidAmount,
      paidAmount: it.paidAmount,
      total:      it.amount,
    }))
  )
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  const update = (i, val) => setPayments(prev => prev.map((p, idx) => idx === i ? { ...p, amountPaid: val } : p))

  const handleSubmit = async () => {
    setError(null)
    const active = payments.filter(p => p.amountPaid && parseFloat(p.amountPaid) > 0)
    if (active.length === 0) return setError('Enter at least one payment amount.')
    for (const p of active) {
      if (parseFloat(p.amountPaid) > p.max)
        return setError(`Payment for "${p.itemLabel}" exceeds the remaining balance of ₦${p.max.toLocaleString()}.`)
    }
    setSubmitting(true)
    try {
      await recordFinancePayment(record._id, {
        payments: active.map(p => ({ itemLabel: p.itemLabel, amountPaid: parseFloat(p.amountPaid) })),
      }, adminToken)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-white font-black text-base">Record Payment</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {record.student?.name || record.student?.matricNumber} · {record.session} {record.semester} Sem.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-72 overflow-y-auto">
          {payments.map((p, i) => {
            const remaining = p.max
            return (
              <div key={p.itemLabel} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-semibold">{p.itemLabel}</p>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">
                      Paid: <span className="text-white font-medium">₦{Number(p.paidAmount).toLocaleString()}</span> / ₦{Number(p.total).toLocaleString()}
                    </p>
                    {remaining > 0 && <p className="text-amber-400 text-xs">Remaining: ₦{Number(remaining).toLocaleString()}</p>}
                  </div>
                </div>
                {remaining > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus-within:border-amber-500/50 transition-colors">
                    <span className="text-slate-500 text-sm">₦</span>
                    <input
                      type="number"
                      value={p.amountPaid}
                      onChange={e => update(i, e.target.value)}
                      placeholder={`Max ₦${Number(remaining).toLocaleString()}`}
                      min="0"
                      max={remaining}
                      className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Fully paid</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mx-6 mb-3 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={13} className="flex-shrink-0" />{error}
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-800 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 disabled:opacity-50 transition-all"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
            {submitting ? 'Saving…' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────
function AddItemModal({ record, onClose, onSuccess, adminToken }) {
  const [label,      setLabel]      = useState('')
  const [amount,     setAmount]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  const handleSubmit = async () => {
    setError(null)
    if (!label.trim())                      return setError('Please enter a fee label.')
    if (!amount || parseFloat(amount) <= 0) return setError('Please enter a valid amount.')

    // Normalise ID Card label
    const cleanLabel = label.trim().toLowerCase() === 'id card' ? 'ID Card' : label.trim()

    setSubmitting(true)
    try {
      await addItemToFinanceRecord(record._id, {
        label:  cleanLabel,
        amount: parseFloat(amount),
      }, adminToken)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-white font-black text-base">Add Fee Item</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {record.student?.name || record.student?.matricNumber} · {record.session} {record.semester} Sem.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Fee Label</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Resit Fee"
              list="add-item-presets"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <datalist id="add-item-presets">
              {PRESET_LABELS.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount</label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus-within:border-amber-500/50 transition-colors">
              <span className="text-slate-500 text-sm">₦</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={13} className="flex-shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-800 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 disabled:opacity-50 transition-all"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
            {submitting ? 'Adding…' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Record Detail Panel ──────────────────────────────────────────────────────
function DetailPanel({ record, onClose, onPay, onAddItem }) {
  const meta = statusMeta(record.paymentStatus)
  const Icon = meta.icon

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-md h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0">
          <div>
            <p className="text-white font-black text-base">{record.student?.name || 'Unknown'}</p>
            <p className="text-slate-500 text-xs mt-0.5">{record.student?.matricNumber} · {record.student?.department}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-slate-400 text-xs">{record.session} · {record.semester} Semester</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.cls}`}>
                <Icon size={9} />{meta.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 flex-shrink-0">
          {[
            ['Total',       `₦${Number(record.totalAmount).toLocaleString()}`,        'text-white'],
            ['Paid',        `₦${Number(record.totalPaid).toLocaleString()}`,          'text-emerald-400'],
            ['Outstanding', `₦${Number(record.outstandingBalance).toLocaleString()}`, record.outstandingBalance > 0 ? 'text-red-400' : 'text-emerald-400'],
          ].map(([label, value, cls]) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className={`text-base font-black ${cls}`}>{value}</p>
              <p className="text-slate-600 text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Carried over */}
        {record.carriedOverBalance > 0 && (
          <div className="mx-5 mt-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex-shrink-0">
            <p className="text-amber-400 text-xs font-medium">
              ⚠ Carried over from previous session: ₦{Number(record.carriedOverBalance).toLocaleString()}
            </p>
          </div>
        )}

        {/* Items breakdown */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Fee Breakdown</p>
          {record.items.map((item, i) => {
            const pct = item.amount > 0 ? Math.round((item.paidAmount / item.amount) * 100) : 0
            return (
              <div key={i} className="p-3 bg-slate-800/50 border border-slate-700/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                  <span className={`text-xs font-bold ${itemStatusCls(item.status)}`}>{item.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>₦{Number(item.paidAmount).toLocaleString()} paid of ₦{Number(item.amount).toLocaleString()}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="px-5 py-4 border-t border-slate-800 flex-shrink-0 space-y-2">
          {/* Add new fee item — always available */}
          <button
            onClick={onAddItem}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all"
          >
            <PlusCircle size={15} className="text-amber-400" />
            Add New Fee Item
          </button>

          {/* Record payment — only if not fully paid */}
          {record.paymentStatus !== 'Paid' && (
            <button
              onClick={() => onPay(record)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/30"
            >
              <CreditCard size={15} />
              Record Payment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageRecords() {
  const { adminToken } = useAdminAuth()

  const [records,  setRecords]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  // Filters
  const [search,   setSearch]   = useState('')
  const [session,  setSession]  = useState('')
  const [semester, setSemester] = useState('')
  const [status,   setStatus]   = useState('')

  // UI state
  const [detail,   setDetail]   = useState(null)
  const [paying,   setPaying]   = useState(null)
  const [addingItem, setAddingItem] = useState(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllFinanceRecords({ session, semester, status }, adminToken)
      setRecords(res?.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [adminToken, session, semester, status])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  // Client-side name/matric search
  const filtered = records.filter(r => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.student?.name?.toLowerCase().includes(q) ||
      r.student?.matricNumber?.toLowerCase().includes(q)
    )
  })

  const handlePaymentSuccess = () => {
    setPaying(null)
    setDetail(null)
    fetchRecords()
  }

  const handleAddItemSuccess = () => {
    setAddingItem(null)
    setDetail(null)
    fetchRecords()
  }

  return (
    <AdminLayout navItems={NAV_ITEMS}>

      {detail && !paying && !addingItem && (
        <DetailPanel
          record={detail}
          onClose={() => setDetail(null)}
          onPay={rec => setPaying(rec)}
          onAddItem={() => setAddingItem(detail)}
        />
      )}
      {paying && (
        <PaymentModal
          record={paying}
          onClose={() => setPaying(null)}
          onSuccess={handlePaymentSuccess}
          adminToken={adminToken}
        />
      )}
      {addingItem && (
        <AddItemModal
          record={addingItem}
          onClose={() => setAddingItem(null)}
          onSuccess={handleAddItemSuccess}
          adminToken={adminToken}
        />
      )}

      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Manage Records</h1>
          <p className="text-slate-500 text-sm mt-1">View all finance records, record payments, and add new fee items</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl flex-1 min-w-48">
            <Search size={15} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or matric…"
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-600 hover:text-slate-400 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {[
            { value: session,  onChange: setSession,  options: SESSIONS,  placeholder: 'All Sessions' },
            { value: semester, onChange: setSemester, options: SEMESTERS, placeholder: 'All Semesters' },
            { value: status,   onChange: setStatus,   options: STATUSES,  placeholder: 'All Statuses' },
          ].map(({ value, onChange, options, placeholder }) => (
            <div key={placeholder} className="relative">
              <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              >
                <option value="">{placeholder}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />{error}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 size={24} className="text-slate-600 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No finance records found.</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <span>Student</span>
                <span>Session</span>
                <span>Total</span>
                <span>Paid</span>
                <span>Status</span>
                <span></span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {filtered.map(rec => {
                  const meta = statusMeta(rec.paymentStatus)
                  const Icon = meta.icon
                  return (
                    <div
                      key={rec._id}
                      className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors cursor-pointer items-center"
                      onClick={() => setDetail(rec)}
                    >
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{rec.student?.name || 'Unknown'}</p>
                        <p className="text-slate-500 text-xs">{rec.student?.matricNumber}</p>
                      </div>
                      <p className="text-slate-300 text-sm">{rec.session} <span className="text-slate-600">·</span> {rec.semester}</p>
                      <p className="text-white text-sm font-bold">₦{Number(rec.totalAmount).toLocaleString()}</p>
                      <p className="text-emerald-400 text-sm font-semibold">₦{Number(rec.totalPaid).toLocaleString()}</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${meta.cls}`}>
                        <Icon size={10} />{meta.label}
                      </span>
                      <ChevronRight size={15} className="text-slate-700 hidden sm:block" />
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <p className="text-slate-600 text-xs text-center">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''} shown
        </p>
      </div>
    </AdminLayout>
  )
}