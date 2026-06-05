import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getStudentProfile } from '../../services/api'
import { User, Hash, Building2, GraduationCap, Mail, AlertCircle } from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon size={17} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-slate-800 font-semibold text-sm truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function Profile() {
  const { token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getStudentProfile(token)
      .then((response) => {
        const profileData = response?.data || response
        setProfile(profileData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'S'

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Your personal information on record</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Avatar card ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center gap-4">
            {/* Photo or initials */}
            <div className="relative">
              {loading ? (
                <Skeleton className="w-28 h-28 rounded-full" />
              ) : profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="Student photo"
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-blue-100 shadow"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-blue-100">
                  <span className="text-white font-bold text-3xl">{initials}</span>
                </div>
              )}
            </div>

            {loading ? (
              <>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div>
                  <p className="text-lg font-bold text-slate-800">{profile?.name || 'Student'}</p>
                  <p className="text-slate-400 text-sm font-mono mt-0.5">{profile?.matricNumber || '—'}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                  Student
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Details card ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Personal Details</h2>

            {loading ? (
              <div className="space-y-4 mt-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-2">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-20 mb-2" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2">
                <InfoRow icon={User}          label="Full Name"       value={profile?.name} />
                <InfoRow icon={Hash}          label="Matric Number"   value={profile?.matricNumber} />
                <InfoRow icon={Building2}     label="Department"      value={profile?.department} />
                <InfoRow icon={GraduationCap} label="Level"           value={profile?.level ? `${profile.level} Level` : null} />
                <InfoRow icon={Mail}          label="ID Card Status"  value={profile?.idCardStatus || 'Not submitted'} />
              </div>
            )}
          </div>

          {/* Note */}
          <p className="text-xs text-slate-400 mt-3 px-1">
            To update your information, please contact the admin office.
          </p>
        </div>

      </div>
    </div>
  )
}