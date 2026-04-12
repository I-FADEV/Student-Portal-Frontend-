import { useAuth } from '../../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1A3C5E] to-[#2A5A8E] rounded-2xl p-8 text-white">
        <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-2">
          Welcome back
        </p>
        <h1 className="text-3xl font-bold mb-1">
          {user?.name || 'Student'} 👋
        </h1>
        <p className="text-blue-200 text-sm">
          Here's what's happening with your academic journey today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">ID Card</p>
            <span className="text-2xl">🪪</span>
          </div>
          <p className="text-2xl font-bold text-[#1A3C5E]">Pending</p>
          <p className="text-xs text-gray-400 mt-1">Not yet submitted</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Fees</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-[#1A3C5E]">₦0.00</p>
          <p className="text-xs text-gray-400 mt-1">No records yet</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Courses</p>
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-2xl font-bold text-[#1A3C5E]">0</p>
          <p className="text-xs text-gray-400 mt-1">No courses assigned</p>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#1A3C5E] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-[#1A3C5E] hover:text-white transition-all duration-200 group">
            <span className="text-2xl">👤</span>
            <span className="text-sm font-medium text-gray-600 group-hover:text-white">View Profile</span>
          </button>

          <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-[#1A3C5E] hover:text-white transition-all duration-200 group">
            <span className="text-2xl">📅</span>
            <span className="text-sm font-medium text-gray-600 group-hover:text-white">Timetable</span>
          </button>

          <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-[#1A3C5E] hover:text-white transition-all duration-200 group">
            <span className="text-2xl">🪪</span>
            <span className="text-sm font-medium text-gray-600 group-hover:text-white">ID Card</span>
          </button>

          <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-[#1A3C5E] hover:text-white transition-all duration-200 group">
            <span className="text-2xl">💰</span>
            <span className="text-sm font-medium text-gray-600 group-hover:text-white">Finance</span>
          </button>

        </div>
      </div>

      {/* Notice Board */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#1A3C5E] mb-4">📢 Notice Board</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-xl">📌</span>
            <div>
              <p className="text-sm font-semibold text-[#1A3C5E]">Welcome to IFATOSS Student Portal</p>
              <p className="text-xs text-gray-500 mt-1">Complete your profile and submit your ID card details to get started.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Dashboard