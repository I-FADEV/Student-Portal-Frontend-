import { useAuth } from '../../context/AuthContext'

function Timetable() {
  const { user } = useAuth()

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = [
    '8:00am - 10:00am',
    '10:00am - 12:00pm',
    '12:00pm - 1:00pm',
    '1:00pm - 3:00pm',
    '3:00pm - 5:00pm',
  ]

  // This will come from backend later
  const timetableData = null

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C5E]">My Timetable</h1>
          <p className="text-gray-400 text-sm mt-1">
            {user?.dept} — {user?.level || 'Level not assigned'}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#1A3C5E] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2A5A8E] transition-all">
           Download PDF
        </button>
      </div>

      {/* Session Badge */}
      <div className="bg-[#1A3C5E] text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-blue-200 uppercase tracking-widest mb-1">Current Session</p>
          <p className="text-lg font-bold">2025/2026 Academic Session</p>
          <p className="text-sm text-blue-200 mt-0.5">Second Semester</p>
        </div>
        <span className="text-4xl"></span>
      </div>

      {/* Timetable */}
      {timetableData ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#1A3C5E] text-white">
                  <th className="text-left px-4 py-4 text-sm font-semibold w-28">Day</th>
                  {timeSlots.map((slot) => (
                    <th
                      key={slot}
                      className={`text-center px-3 py-4 text-xs font-semibold ${
                        slot === '12:00pm - 1:00pm' ? 'bg-[#0F2340]' : ''
                      }`}
                    >
                      {slot === '12:00pm - 1:00pm' ? 'BREAK' : slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, index) => (
                  <tr key={day} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-sm font-bold text-[#1A3C5E]">{day}</td>
                    {timeSlots.map((slot) => (
                      <td
                        key={slot}
                        className={`px-3 py-4 text-center text-xs ${
                          slot === '12:00pm - 1:00pm'
                            ? 'bg-[#1A3C5E] text-white font-bold tracking-widest'
                            : 'text-gray-400'
                        }`}
                      >
                        {slot === '12:00pm - 1:00pm' ? (
                          <span className="writing-mode-vertical">B<br/>R<br/>E<br/>A<br/>K</span>
                        ) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (

        /* Empty State */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#1A3C5E] text-white">
                  <th className="text-left px-4 py-4 text-sm font-semibold w-28">Day</th>
                  {timeSlots.map((slot) => (
                    <th
                      key={slot}
                      className={`text-center px-3 py-4 text-xs font-semibold ${
                        slot === '12:00pm - 1:00pm' ? 'bg-[#0F2340] w-16' : ''
                      }`}
                    >
                      {slot === '12:00pm - 1:00pm' ? 'BREAK' : slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, index) => (
                  <tr
                    key={day}
                    className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-5 text-sm font-bold text-[#1A3C5E]">{day}</td>
                    {timeSlots.map((slot) => (
                      <td
                        key={slot}
                        className={`px-3 py-5 text-center ${
                          slot === '12:00pm - 1:00pm'
                            ? 'bg-[#1A3C5E]'
                            : ''
                        }`}
                      >
                        {slot === '12:00pm - 1:00pm' ? (
                          <div className="flex flex-col items-center text-white font-bold text-xs gap-0.5">
                            <span>B</span>
                            <span>R</span>
                            <span>E</span>
                            <span>A</span>
                            <span>K</span>
                          </div>
                        ) : (
                          <span className="text-gray-200 text-xs">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center py-8 border-t border-gray-100">
            <p className="text-3xl mb-2"></p>
            <p className="text-sm font-semibold text-gray-500">Timetable not published yet</p>
            <p className="text-xs text-gray-400 mt-1">Your timetable will appear here once published by your admin</p>
          </div>
        </div>
      )}

    </div>
  )
}

export default Timetable