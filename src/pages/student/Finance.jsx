function Finance() {

  const financeData = null

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C5E]">Financial Status</h1>
        <p className="text-gray-400 text-sm mt-1">Your fees and payment records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Fees</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-[#1A3C5E]">
            {financeData ? `₦${financeData.totalOwed}` : '₦0.00'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Current session</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount Paid</p>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-2xl font-bold text-green-500">
            {financeData ? `₦${financeData.totalPaid}` : '₦0.00'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Confirmed payments</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Balance</p>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {financeData ? `₦${financeData.balance}` : '₦0.00'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Outstanding balance</p>
        </div>

      </div>

      {/* Fee Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1A3C5E]">Fee Breakdown</h2>
          <p className="text-xs text-gray-400 mt-0.5">2025/2026 Academic Session</p>
        </div>

        {financeData ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Fee Item</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {financeData.items.map((item, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1A3C5E]">₦{item.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      item.paid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💰</p>
            <p className="text-sm font-semibold text-gray-500">No financial records yet</p>
            <p className="text-xs text-gray-400 mt-1">Your fee records will appear here once uploaded by the bursar</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Finance