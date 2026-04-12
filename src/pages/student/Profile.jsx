import { useAuth } from '../../context/AuthContext'

function Profile() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C5E]">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-[#1A3C5E] to-[#2A5A8E]" />

        {/* Avatar + Name */}
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-[#E8A020] flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="mb-2">
              <h2 className="text-xl font-bold text-[#1A3C5E]">{user?.name}</h2>
              <p className="text-sm text-gray-400">Student</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Full Name</p>
              <p className="text-sm font-medium text-[#1A3C5E] bg-gray-50 px-4 py-3 rounded-xl">
                {user?.name || '—'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email Address</p>
              <p className="text-sm font-medium text-[#1A3C5E] bg-gray-50 px-4 py-3 rounded-xl">
                {user?.email || '—'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Matric Number</p>
              <p className="text-sm font-medium text-[#1A3C5E] bg-gray-50 px-4 py-3 rounded-xl">
                {user?.matric || 'Not yet assigned'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Department</p>
              <p className="text-sm font-medium text-[#1A3C5E] bg-gray-50 px-4 py-3 rounded-xl">
                {user?.dept || '—'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Level</p>
              <p className="text-sm font-medium text-[#1A3C5E] bg-gray-50 px-4 py-3 rounded-xl">
                {user?.level || '—'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone Number</p>
              <p className="text-sm font-medium text-[#1A3C5E] bg-gray-50 px-4 py-3 rounded-xl">
                {user?.phone || '—'}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ID Card Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#1A3C5E] mb-4">ID Card Status</h2>
        <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="text-sm font-semibold text-yellow-700">Pending</p>
            <p className="text-xs text-yellow-600 mt-0.5">Your ID card has not been submitted yet</p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Profile