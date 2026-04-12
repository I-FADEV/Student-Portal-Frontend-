import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function IDCard() {
  const { user } = useAuth()
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Will connect to backend later
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C5E]">ID Card</h1>
        <p className="text-gray-400 text-sm mt-1">Submit your ID card details</p>
      </div>

      {/* Status Banner */}
      {submitted ? (
        <div className="flex items-center gap-4 p-5 bg-green-50 rounded-2xl border border-green-100">
          <span className="text-3xl">✅</span>
          <div>
            <p className="text-sm font-bold text-green-700">Submitted Successfully!</p>
            <p className="text-xs text-green-600 mt-0.5">Your ID card details have been submitted. Wait for accreditation.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
          <span className="text-3xl">⏳</span>
          <div>
            <p className="text-sm font-bold text-yellow-700">Not Submitted Yet</p>
            <p className="text-xs text-yellow-600 mt-0.5">Please fill in your details and upload your photo below</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ID Card Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#1A3C5E]">ID Card Preview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Front view of your ID card</p>
          </div>

          {/* Card Design */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-[#1A3C5E] to-[#2A5A8E] rounded-2xl p-5 text-white max-w-xs mx-auto shadow-xl">

              {/* Card Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/20">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain rounded-full mix-blend-lighten" />
                <div>
                  <p className="text-xs font-bold tracking-widest">IFATOSS</p>
                  <p className="text-xs text-blue-200 leading-tight">Student Identity Card</p>
                </div>
              </div>

              {/* Photo + Info */}
              <div className="flex gap-4">
                <div className="w-20 h-24 rounded-xl bg-white/10 border-2 border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {preview ? (
                    <img src={preview} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div>
                    <p className="text-xs text-blue-200">Name</p>
                    <p className="text-sm font-bold">{user?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Matric No.</p>
                    <p className="text-sm font-bold">{user?.matric || 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Department</p>
                    <p className="text-xs font-semibold leading-tight">{user?.dept || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Level</p>
                    <p className="text-sm font-bold">{user?.level || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Session */}
              <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
                <p className="text-xs text-blue-200">Session: <span className="text-white font-semibold">2025/2026</span></p>
                <div className="bg-[#E8A020] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  STUDENT
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#1A3C5E]">Submit Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Upload your photo to proceed</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Passport Photo
              </label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#1A3C5E] transition-all"
                onClick={() => document.getElementById('photoInput').click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-xl mx-auto" />
                ) : (
                  <div className="space-y-2">
                    <p className="text-3xl">📷</p>
                    <p className="text-sm font-medium text-gray-500">Click to upload photo</p>
                    <p className="text-xs text-gray-400">JPG, PNG up to 2MB</p>
                  </div>
                )}
              </div>
              <input
                id="photoInput"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* Matric Number — readonly, comes from backend */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Matric Number
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-400 border border-gray-200">
                {user?.matric || 'Will be assigned by admin'}
              </div>
            </div>

            <button
              type="submit"
              disabled={!photo || loading || submitted}
              className="w-full py-3 bg-gradient-to-r from-[#1A3C5E] to-[#2A5A8E] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : submitted ? 'Already Submitted ✅' : 'Submit ID Card Details'}
            </button>

          </form>
        </div>
      </div>

    </div>
  )
}

export default IDCard