import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStudentIDCard, getStudentProfile, submitIDCard } from '../../services/api'
import {
  CreditCard,
  Upload,
  ImagePlus,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  ShieldAlert,
  X,
  User,
  Phone,
  Globe,
  Calendar,
} from 'lucide-react'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_META = {
  unsubmitted: {
    label: 'Unsubmitted',
    icon: AlertCircle,
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    desc: 'You have not submitted your ID card request yet.',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    desc: 'Your ID card is under review. It will be ready within 3–5 working days.',
  },
  collected: {
    label: 'Collected',
    icon: PackageCheck,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    desc: 'Your ID card has been collected.',
  },
  rejected: {
    label: 'Rejected',
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    desc: 'Your ID card request was rejected. You may resubmit after correcting the issues.',
  },
}

// ─── Status Banner ────────────────────────────────────────────────────────────
function StatusBanner({ status }) {
  const key = (status || 'unsubmitted').toLowerCase()
  const meta = STATUS_META[key] || STATUS_META.unsubmitted
  const Icon = meta.icon
  return (
    <div className={`flex items-center gap-4 p-5 rounded-2xl border ${meta.bg} ${meta.border}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.bg} border ${meta.border} flex-shrink-0`}>
        <Icon size={22} className={meta.text} />
      </div>
      <div>
        <p className={`font-bold text-base ${meta.text}`}>Status: {meta.label}</p>
        <p className="text-slate-500 text-sm mt-0.5">{meta.desc}</p>
        {key === 'pending' && (
          <p className="text-amber-600 text-xs font-medium mt-1">
            📍 Please visit the Student Affairs office to collect your ID card once ready.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── ID Card Preview (matches physical card layout) ───────────────────────────
function IDCardPreview({ formData, photoPreview }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl select-none"
      style={{ aspectRatio: '85.6 / 54', maxWidth: '520px', minWidth: '280px', fontFamily: 'Georgia, serif' }}
    >
      {/* Dark blue header band */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />

      {/* Top header section */}
      <div className="relative z-10 flex items-center gap-2 px-3 pt-2 pb-1.5" style={{ height: '32%' }}>
        {/* University logo placeholder (circle) */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-blue-400 bg-slate-800 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="text-blue-300 text-[5px] font-bold leading-tight">i-FATOSS</div>
            <div className="text-blue-300 text-[4px] leading-tight">UNIVERSITY</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-[11px] leading-tight tracking-tight">i-FATOSS UNIVERSITY-BENIN</p>
          <p className="text-blue-300 text-[6.5px] leading-tight font-medium tracking-wide">INSTITUT DES FORMATIONS AVANCÉES</p>
          <p className="text-slate-400 text-[5.5px] italic mt-0.5">...where dreams become reality</p>
        </div>
        {/* Coat of arms placeholder */}
        <div className="flex-shrink-0 w-10 h-10 rounded border border-yellow-600/40 bg-yellow-900/20 flex items-center justify-center">
          <span className="text-yellow-500 text-[8px]">⚜️</span>
        </div>
      </div>

      {/* Body section: white/light area */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-slate-100 flex"
        style={{ top: '32%' }}
      >
        {/* Left: photo + red CARTE D'ETUDIANT strip */}
        <div className="relative flex-shrink-0" style={{ width: '30%' }}>
          {/* Passport photo */}
          <div className="absolute inset-0 bg-slate-200 overflow-hidden">
            {photoPreview ? (
              <img src={photoPreview} alt="Passport" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-300">
                <User size={24} className="text-slate-400" />
              </div>
            )}
          </div>
          {/* Red vertical CARTE D'ETUDIANT strip */}
          <div
            className="absolute right-0 top-0 bottom-0 bg-red-600 flex items-center justify-center"
            style={{ width: '22%' }}
          >
            <span
              className="text-white font-black tracking-widest"
              style={{
                fontSize: '5px',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                letterSpacing: '2px',
              }}
            >
              CARTE D'ETUDIANT
            </span>
          </div>
        </div>

        {/* Right: info fields */}
        <div className="flex-1 bg-sky-50 text-slate-800 overflow-hidden" style={{ fontSize: '7px' }}>
          {/* Row: Nom & Prénoms */}
          <div className="border-b border-slate-300 px-1.5 py-0.5">
            <p className="text-slate-500 font-bold uppercase" style={{ fontSize: '5.5px' }}>Nom &amp; Prénoms</p>
            <p className="font-semibold text-slate-900 mt-0.5 truncate" style={{ fontSize: '8px' }}>
              {formData.fullName || <span className="text-slate-400 italic">Full Name</span>}
            </p>
          </div>
          {/* Row: Nationalité + Date of Birth */}
          <div className="border-b border-slate-300 px-1.5 py-0.5 flex gap-1">
            <div className="flex-1 border-r border-slate-300 pr-1">
              <p className="text-slate-500 font-bold uppercase" style={{ fontSize: '5px' }}>Nationalité</p>
              <p className="text-slate-800 mt-0.5">{formData.nationality || <span className="text-slate-400 italic">—</span>}</p>
            </div>
            <div className="flex-1 pl-1">
              <p className="text-slate-500 font-bold uppercase" style={{ fontSize: '5px' }}>Date of Birth</p>
              <p className="text-slate-800 mt-0.5">
                {formData.dateOfBirth
                  ? new Date(formData.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '-')
                  : <span className="text-slate-400 italic">—</span>}
              </p>
            </div>
          </div>
          {/* Row: Filière */}
          <div className="border-b border-slate-300 px-1.5 py-0.5">
            <p className="text-slate-500 font-bold uppercase" style={{ fontSize: '5px' }}>Filière</p>
            <p className="text-slate-800 italic mt-0.5">{formData.department || <span className="text-slate-400">—</span>}</p>
          </div>
          {/* Row: Année académique + Gender + Grade */}
          <div className="border-b border-slate-300 px-1.5 py-0.5 flex gap-1">
            <div className="flex-1 border-r border-slate-300 pr-1">
              <p className="text-slate-500 font-bold uppercase" style={{ fontSize: '5px' }}>Année Académique</p>
              <p className="text-blue-700 font-black mt-0.5" style={{ fontSize: '8px' }}>
                {formData.session || '—'}
              </p>
            </div>
            <div className="border-r border-slate-300 px-1">
              <p className="text-slate-500 font-bold uppercase" style={{ fontSize: '5px' }}>Gender</p>
              <p className="text-slate-800 italic mt-0.5">{formData.gender || '—'}</p>
            </div>
            <div className="pl-1">
              <p className="text-slate-500 font-bold uppercase" style={{ fontSize: '5px' }}>Grade</p>
              <p className="text-slate-800 font-bold mt-0.5">{formData.level || '—'}</p>
            </div>
          </div>
          {/* Row: Matric + QR */}
          <div className="border-b border-slate-300 px-1.5 py-0.5 flex justify-between items-center">
            <div>
              <p className="text-slate-500 font-bold uppercase" style={{ fontSize: '5px' }}>Matric N°:</p>
              <p className="text-blue-700 font-bold" style={{ fontSize: '7.5px' }}>
                {formData.matricNumber || <span className="text-slate-400 italic">—</span>}
              </p>
            </div>
            {/* QR placeholder */}
            <div className="w-7 h-7 border border-slate-400 bg-white flex items-center justify-center flex-shrink-0">
              <div className="grid grid-cols-3 gap-px w-full h-full p-0.5">
                {[1,0,1,0,1,0,1,0,1].map((v,i) => (
                  <div key={i} className={`${v ? 'bg-slate-900' : 'bg-white'}`} />
                ))}
              </div>
            </div>
          </div>
          {/* Row: Phone */}
          <div className="px-1.5 py-0.5">
            <p className="text-slate-700" style={{ fontSize: '6px' }}>
              TEL: {formData.phone || <span className="text-slate-400 italic">+XXX XXX XXX</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ onConfirm, onCancel, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={20} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Confirm Submission</h2>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
          <p className="font-bold">⚠️ This is a one-time submission.</p>
          <p>Once submitted, you will <strong>not</strong> be able to edit or resubmit your ID card information until the current semester ends or your request is rejected by the ID card administrator.</p>
          <p className="mt-2">Please make sure all your information is correct before proceeding.</p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Go Back & Review
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 shadow-md disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            ) : (
              <><CheckCircle2 size={16} /> Yes, Submit</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function IDCard() {
  const { token } = useAuth()
  const fileRef = useRef(null)

  const [idCard, setIdCard] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('form') // 'form' | 'preview'

  // Fields the student fills manually
  const [formData, setFormData] = useState({
    fullName: '',
    nationality: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    // auto-filled from profile:
    matricNumber: '',
    department: '',
    level: '',
    session: '',
  })

  useEffect(() => {
    Promise.allSettled([getStudentIDCard(token), getStudentProfile(token)])
      .then(([c, p]) => {
        if (c.status === 'fulfilled') {
          const idCardData = c.value?.data || c.value
          setIdCard(idCardData)
        }
        if (p.status === 'fulfilled') {
          const prof = p.value?.data || p.value
          setProfile(prof)
          setFormData(prev => ({
            ...prev,
            matricNumber: prof.matricNumber || '',
            department: prof.department || '',
            level: prof.level ? String(prof.level) : '',
            session: prof.currentSession || prof.session || '',
          }))
        }
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e) => {
    const chosen = e.target.files[0]
    if (!chosen) return
    if (!chosen.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    setFile(chosen)
    setPhotoPreview(URL.createObjectURL(chosen))
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (!dropped) return
    if (!dropped.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    setFile(dropped)
    setPhotoPreview(URL.createObjectURL(dropped))
    setError(null)
  }

  const isFormComplete = () => {
    return (
      formData.fullName.trim() &&
      formData.nationality.trim() &&
      formData.dateOfBirth &&
      formData.gender &&
      formData.phone.trim() &&
      file
    )
  }

  const handleSubmitConfirmed = async () => {
    setSubmitting(true)
    setError(null)

    const fd = new FormData()
    fd.append('photoURL', file)
    fd.append('fullName', formData.fullName)
    fd.append('nationality', formData.nationality)
    fd.append('dateOfBirth', formData.dateOfBirth)
    fd.append('gender', formData.gender)
    fd.append('phone', formData.phone)
    fd.append('matricNumber', formData.matricNumber)
    fd.append('department', formData.department)
    fd.append('level', formData.level)
    fd.append('session', formData.session)

    try {
      const result = await submitIDCard(fd, token)
      setIdCard(result.idCard || result.data || result)
      setSuccess(true)
      setShowConfirm(false)
    } catch (err) {
      setError(err.message)
      setShowConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <div className="h-7 w-40 bg-slate-200 animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-64 bg-slate-200 animate-pulse rounded-lg" />
        </div>
        <div className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    )
  }

  const status = (idCard?.status || 'unsubmitted').toLowerCase()
  const feePaid = idCard?.feePaid === true  // bursar has marked this student's fee as paid
  const alreadySubmitted = status === 'pending' || status === 'collected'
  const isRejected = status === 'rejected'  // allow resubmission if rejected

  // ── CASE 1: Already submitted (pending or collected) ──
  if (alreadySubmitted) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ID Card</h1>
          <p className="text-slate-500 text-sm mt-1">Your submission details and current status.</p>
        </div>

        <StatusBanner status={status} />

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            <CheckCircle2 size={18} className="flex-shrink-0" />
            ID card submitted successfully! Please visit the Student Affairs office to collect it once ready.
          </div>
        )}

        {/* Submitted card preview */}
        {idCard && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Submitted Information</h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Photo */}
              <div className="flex-shrink-0">
                {idCard.photoURL ? (
                  <img
                    src={idCard.photoURL}
                    alt="Passport"
                    className="w-28 h-32 object-cover rounded-xl border-2 border-slate-200 shadow"
                  />
                ) : (
                  <div className="w-28 h-32 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center">
                    <User size={32} className="text-slate-400" />
                  </div>
                )}
              </div>
              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-600 flex-1">
                {[
                  ['Full Name',          idCard.fullName],
                  ['Matric Number',      idCard.matricNumber || profile?.matricNumber],
                  ['Nationality',        idCard.nationality],
                  ['Date of Birth',      idCard.dateOfBirth ? new Date(idCard.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                  ['Department',         idCard.department || profile?.department],
                  ['Level',              idCard.level ? `${idCard.level} Level` : profile?.level ? `${profile.level} Level` : '—'],
                  ['Gender',             idCard.gender],
                  ['Phone',              idCard.phone],
                  ['Academic Year',      idCard.session || profile?.currentSession],
                  ['Submitted',          idCard.submittedAt ? new Date(idCard.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="font-medium text-slate-700">{label}: </span>
                    <span>{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-slate-400 px-1">
          <CreditCard size={14} className="flex-shrink-0 mt-0.5" />
          <p>For any issues with your ID card, please visit the Student Affairs office directly.</p>
        </div>
      </div>
    )
  }

  // ── CASE 2: Fee not yet paid ──
  if (!feePaid) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ID Card</h1>
          <p className="text-slate-500 text-sm mt-1">Student ID card request.</p>
        </div>

        <StatusBanner status={isRejected ? 'rejected' : 'unsubmitted'} />

        {/* Locked notice */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Lock size={28} className="text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-700">ID Card Fee Not Paid</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              Before you can submit your ID card request, you must first pay the ID card fee at the <strong>Bursar's office</strong>. Once the payment is confirmed by the Bursar, you will be able to fill and submit this form.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
            <AlertCircle size={16} />
            Please visit the Bursar's office to pay your ID card fee.
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-400 px-1">
          <CreditCard size={14} className="flex-shrink-0 mt-0.5" />
          <p>After paying, log out and log back in — the form will unlock automatically once the Bursar confirms your payment.</p>
        </div>
      </div>
    )
  }

  // ── CASE 2.5: Rejected but fee paid - show rejection message with option to resubmit ──
  if (isRejected) {
    return (
      <>
        {showConfirm && (
          <ConfirmModal
            onConfirm={handleSubmitConfirmed}
            onCancel={() => setShowConfirm(false)}
            submitting={submitting}
          />
        )}

        <div className="space-y-6 max-w-3xl">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ID Card Application</h1>
            <p className="text-slate-500 text-sm mt-1">
              Your previous submission was rejected. You may resubmit after correcting the issues.
            </p>
          </div>

          <StatusBanner status="rejected" />

          {idCard && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Previously Submitted Information</h2>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {idCard.photoURL ? (
                    <img
                      src={idCard.photoURL}
                      alt="Passport"
                      className="w-28 h-32 object-cover rounded-xl border-2 border-slate-200 shadow"
                    />
                  ) : (
                    <div className="w-28 h-32 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center">
                      <User size={32} className="text-slate-400" />
                    </div>
                  )}
                </div>
                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-600 flex-1">
                  {[
                    ['Full Name',          idCard.fullName],
                    ['Matric Number',      idCard.matricNumber || profile?.matricNumber],
                    ['Nationality',        idCard.nationality],
                    ['Date of Birth',      idCard.dateOfBirth ? new Date(idCard.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                    ['Department',         idCard.department || profile?.department],
                    ['Level',              idCard.level ? `${idCard.level} Level` : profile?.level ? `${profile.level} Level` : '—'],
                    ['Gender',             idCard.gender],
                    ['Phone',              idCard.phone],
                    ['Academic Year',      idCard.session || profile?.currentSession],
                    ['Rejected At',        idCard.rejectedAt ? new Date(idCard.rejectedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span className="font-medium text-slate-700">{label}: </span>
                      <span>{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium w-fit">
            <CheckCircle2 size={16} />
            ID card fee confirmed. You may now resubmit your request.
          </div>

          <button
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                fullName: idCard?.fullName || '',
                nationality: idCard?.nationality || '',
                dateOfBirth: idCard?.dateOfBirth || '',
                gender: idCard?.gender || '',
                phone: idCard?.phone || '',
              }))
              if (idCard?.photoURL) {
                setPhotoPreview(idCard.photoURL)
                // Note: We can't restore the actual file from URL, user needs to re-upload
              }
              setActiveTab('form')
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <Upload size={18} />
            Resubmit ID Card Request
          </button>
        </div>
      </>
    )
  }

  // ── CASE 3: Fee paid, not yet submitted — show form + preview ──
  return (
    <>
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleSubmitConfirmed}
          onCancel={() => setShowConfirm(false)}
          submitting={submitting}
        />
      )}

      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ID Card Application</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill in your details below. A live preview will show you exactly how your ID card will look.
          </p>
        </div>

        {/* Fee paid badge */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium w-fit">
          <CheckCircle2 size={16} />
          ID card fee confirmed. You may now fill and submit your request.
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'form'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User size={15} />
            Fill Details
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Eye size={15} />
            Preview Card
          </button>
        </div>

        {/* ── TAB: FORM ── */}
        {activeTab === 'form' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">

            {/* Photo upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Passport Photo <span className="text-red-500">*</span>
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors group"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-28 object-cover rounded-lg shadow border border-slate-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors flex-shrink-0">
                    <ImagePlus size={24} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-600">
                    {photoPreview ? 'Click to change photo' : 'Click or drag to upload passport photo'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP · Clear passport-style photo recommended</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Form fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name (Nom &amp; Prénoms) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => handleField('fullName', e.target.value)}
                    placeholder="e.g. ABUBAKAR Shuaibu Abdullahi"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  />
                </div>
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={e => handleField('nationality', e.target.value)}
                    placeholder="e.g. Nigerian"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => handleField('dateOfBirth', e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={e => handleField('gender', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleField('phone', e.target.value)}
                    placeholder="e.g. +2349064353167"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  />
                </div>
              </div>

              {/* Auto-filled fields (read-only) */}
              <div className="sm:col-span-2">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Auto-filled from your profile (read-only)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {[
                      ['Matric No.',    formData.matricNumber],
                      ['Department',   formData.department],
                      ['Level',        formData.level ? `${formData.level} Level` : '—'],
                      ['Session',      formData.session],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs text-slate-400 font-medium">{label}</p>
                        <p className="text-slate-700 font-semibold text-sm mt-0.5">{value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview hint */}
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <Eye size={14} />
              Switch to the <strong>Preview Card</strong> tab above to see how your ID card will look before submitting.
            </div>

            {/* Submit button */}
            <button
              onClick={() => {
                if (!isFormComplete()) {
                  setError('Please fill in all required fields and upload a photo before submitting.')
                  return
                }
                setError(null)
                setShowConfirm(true)
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Upload size={18} />
              Submit ID Card Request
            </button>
          </div>
        )}

        {/* ── TAB: PREVIEW ── */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Live Card Preview</h2>
              <p className="text-xs text-slate-400 mt-0.5">This is exactly how your ID card data will appear. Fill in the form to see updates here.</p>
            </div>
            <div className="flex justify-center">
              <IDCardPreview formData={formData} photoPreview={photoPreview} />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveTab('form')}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                ← Back to Form
              </button>
              <button
                onClick={() => {
                  if (!isFormComplete()) {
                    setActiveTab('form')
                    setError('Please fill in all required fields and upload a photo before submitting.')
                    return
                  }
                  setError(null)
                  setShowConfirm(true)
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <Upload size={16} />
                Submit Request
              </button>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-slate-400 px-1">
          <CreditCard size={14} className="flex-shrink-0 mt-0.5" />
          <p>After submission, the ID card administrator will review your request. You will be notified once your ID card is ready for collection (typically 3–5 working days).</p>
        </div>
      </div>
    </>
  )
}