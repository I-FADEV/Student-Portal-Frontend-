import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getStudentProfile,
  getStudentFinances,
  getStudentIDCard,
} from '../../services/api'
import {
  User,
  CreditCard,
  Wallet,
  BookOpen,
  Calendar,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  GraduationCap,
  PackageCheck,
  Lock,
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────
function idCardStatusMeta(status) {
  switch ((status || 'unsubmitted').toLowerCase()) {
    case 'pending':
      return {
        label: 'Pending',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        icon: Clock,
        note: 'Your ID card will be ready within 3–5 working days. Visit the Student Affairs office to collect it.',
      }
    case 'collected':
      return {
        label: 'Collected',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: PackageCheck,
        note: 'Your ID card has been collected.',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: AlertCircle,
        note: 'Your ID card request was rejected. You may resubmit after correcting the issues.',
      }
    case 'unsubmitted':
    default:
      return {
        label: 'Not Submitted',
        color: 'text-slate-500 bg-slate-50 border-slate-200',
        icon: AlertCircle,
        note: null,
      }
  }
}

function financeStatusMeta(status) {
  switch ((status || '').toLowerCase()) {
    case 'paid':    return { label: 'Cleared',     color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
    case 'partial': return { label: 'Part-Paid',   color: 'text-amber-600 bg-amber-50 border-amber-200' }
    default:        return { label: 'Outstanding', color: 'text-red-600 bg-red-50 border-red-200' }
  }
}

// ─── Loading skeleton ────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
}

// ─── Quick-link card ─────────────────────────────────────────────────────────
function QuickCard({ label, path, icon: Icon, gradient, navigate }) {
  return (
    <button
      onClick={() => navigate(path)}
      className="group relative flex flex-col items-start gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${gradient}`}>
        <Icon size={20} className="text-white" strokeWidth={2} />
      </div>
      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{label}</span>
      <ChevronRight
        size={15}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-slate-500 transition-colors"
      />
    </button>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { token } = useAuth()
  const navigate  = useNavigate()

  const [profile, setProfile]   = useState(null)
  const [finance, setFinance]   = useState(null)
  const [idCard,  setIdCard]    = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const [p, f, c] = await Promise.allSettled([
        getStudentProfile(token),
        getStudentFinances(token),
        getStudentIDCard(token),
      ])
      if (p.status === 'fulfilled') setProfile(p.value)
      if (f.status === 'fulfilled') {
        const financeData = f.value?.data || f.value
        if (Array.isArray(financeData)) {
          setFinance(financeData[0]) // Use the first record for display
        } else {
          setFinance(financeData)
        }
      }
      if (c.status === 'fulfilled') setIdCard(c.value)
      setLoading(false)
    }
    fetchAll()
  }, [token])

  // Derive status — if no idCard record at all, treat as unsubmitted
  const rawStatus = idCard?.status || 'unsubmitted'
  const idMeta    = idCardStatusMeta(rawStatus)
  const finMeta   = financeStatusMeta(finance?.status)
  const IDIcon    = idMeta.icon

  // Show lock icon if fee not paid and not yet submitted
  const feePaid       = idCard?.feePaid === true
  const isUnsubmitted = rawStatus === 'unsubmitted'

  const quickLinks = [
    { label: 'Profile',   path: '/student/profile',   icon: User,        gradient: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { label: 'ID Card',   path: '/student/idcard',    icon: CreditCard,  gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
    { label: 'Timetable', path: '/student/timetable', icon: Calendar,    gradient: 'bg-gradient-to-br from-violet-500 to-violet-600' },
    { label: 'Courses',   path: '/student/courses',   icon: BookOpen,    gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    { label: 'Finance',   path: '/student/finance',   icon: Wallet,      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { label: 'Results',   path: '/student/results',   icon: TrendingUp,  gradient: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  ]

  return (
    <div className="space-y-8">

      {/* ── Welcome header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-7 py-8 shadow-xl">
        <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-600/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-indigo-600/20 blur-2xl" />

        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <GraduationCap size={28} className="text-white" />
          </div>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-6 w-44 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  {profile?.matricNumber && <span className="font-mono">{profile.matricNumber}</span>}
                  {profile?.department && <span> · {profile.department}</span>}
                  {profile?.level && <span> · {profile.level} Level</span>}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Status cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ID Card status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <CreditCard size={16} />
              ID Card Status
            </div>
            {!loading && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${idMeta.color}`}>
                <IDIcon size={11} />
                {idMeta.label}
              </span>
            )}
          </div>

          {loading ? (
            <Skeleton className="h-5 w-3/4" />
          ) : rawStatus === 'pending' ? (
            <div className="space-y-1">
              <p className="text-slate-700 text-sm">
                Submitted on{' '}
                <span className="font-medium">
                  {idCard?.submittedAt
                    ? new Date(idCard.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </p>
              <p className="text-amber-600 text-xs font-medium">
                📍 Ready in 3–5 working days. Visit the Student Affairs office to collect.
              </p>
            </div>
          ) : rawStatus === 'collected' ? (
            <p className="text-slate-700 text-sm flex items-center gap-1.5">
              <PackageCheck size={14} className="text-blue-500" />
              Your ID card has been collected.
            </p>
          ) : (
            // Unsubmitted
            <div className="space-y-1.5">
              {!feePaid ? (
                <p className="text-slate-500 text-sm flex items-center gap-1.5">
                  <Lock size={13} className="text-slate-400" />
                  Pay ID card fee at Bursar's office to apply.
                </p>
              ) : (
                <p className="text-slate-500 text-sm flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  No submission yet.{' '}
                  <button
                    onClick={() => navigate('/student/idcard')}
                    className="text-blue-600 underline ml-0.5"
                  >
                    Apply now
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Finance status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Wallet size={16} />
              Finance Status
            </div>
            {!loading && finance && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${finMeta.color}`}>
                {finMeta.label}
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-5 w-3/4" />
          ) : finance ? (
            <p className="text-slate-700 text-sm">
              Session: <span className="font-medium">{finance.session || '—'}</span>
              {finance.balance != null && (
                <span className="ml-2 text-slate-500">
                  · Balance:{' '}
                  <span className="font-semibold text-slate-800">
                    ₦{Number(finance.balance).toLocaleString()}
                  </span>
                </span>
              )}
            </p>
          ) : (
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              <AlertCircle size={14} />
              No financial record available yet.
            </p>
          )}
        </div>
      </div>

      {/* ── Quick links ── */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((item) => (
            <QuickCard key={item.path} {...item} navigate={navigate} />
          ))}
        </div>
      </div>

    </div>
  )
}