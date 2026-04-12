import { useAuth } from '../../context/AuthContext'

function Courses() {
  const { user } = useAuth()

  // This will come from backend later
  const courses = []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C5E]">Course Outline</h1>
        <p className="text-gray-400 text-sm mt-1">
          {user?.dept} — {user?.level || 'Level not assigned'}
        </p>
      </div>

      {/* Session Badge */}
      <div className="bg-[#1A3C5E] text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-blue-200 uppercase tracking-widest mb-1">Current Session</p>
          <p className="text-lg font-bold">2025/2026 Academic Session</p>
          <p className="text-sm text-blue-200 mt-0.5">Second Semester</p>
        </div>
        <span className="text-4xl">📚</span>
      </div>

      {/* Courses List */}
      {courses.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1A3C5E] text-white">
                <th className="text-left px-6 py-4 text-sm font-semibold">Course Code</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Course Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Credit Units</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Lecturers</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Lecturers No</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={course._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-bold text-[#1A3C5E]">{course.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{course.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{course.creditUnit}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      course.department === 'ALL'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {course.department === 'ALL' ? 'General' : 'Departmental'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (

        /* Empty State */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1A3C5E] text-white">
                <th className="text-left px-6 py-4 text-sm font-semibold">Course Code</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Course Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Credit Units</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Lecturers</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Lecturers No</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="text-center py-16">
                  <p className="text-4xl mb-3">📚</p>
                  <p className="text-sm font-semibold text-gray-500">No courses assigned yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your courses will appear here once added by your admin</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

export default Courses