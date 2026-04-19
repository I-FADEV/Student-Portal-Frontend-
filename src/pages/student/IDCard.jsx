import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function IDCard() {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    nationality: user?.nationality || 'Nigerian',
    dob: user?.dob || '',
    department: user?.dept || '',
    year: user?.academicYear || '2025-2026',
    gender: user?.gender || '',
    level: user?.level || '',
    matricNo: user?.matric || '',
    photo: null,
    photoPreview: null,
  })

  const [previewData, setPreviewData] = useState(null)
  const [request, setRequest] = useState(() => {
    const stored = localStorage.getItem('idCardRequest')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: file,
          photoPreview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePreview = () => {
    if (!formData.fullName || !formData.matricNo) {
      setError('Please fill in at least Name and Matric Number')
      return
    }
    setError('')
    setPreviewData({ ...formData })
  }

  const handleSubmit = async () => {
    if (!previewData) {
      setError('Please preview your ID card before submitting')
      return
    }
    setLoading(true)
    setError('')

    setTimeout(() => {
      const newRequest = {
        id: Date.now(),
        ...previewData,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
      }
      localStorage.setItem('idCardRequest', JSON.stringify(newRequest))
      setRequest(newRequest)
      setLoading(false)
    }, 1500)
  }

  const getStatusCardStyle = (status, _currentStatus) => {
    const isActive = status === _currentStatus
    const isCompleted = (status === 'Pending' && _currentStatus !== 'Pending') ||
                        (status === 'Paid' && _currentStatus === 'Collected')
    if (isActive) return 'border-blue-500 bg-blue-50 shadow-md'
    if (isCompleted) return 'border-green-500 bg-green-50'
    return 'border-gray-200 bg-gray-50 opacity-60'
  }

  const getStatusIcon = (status) => {
    if (status === 'Pending') return
    if (status === 'Paid') return 
    if (status === 'Collected') return 
    return ''
  }

  // After submission – show status cards + ID card
  if (request) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C5E]">ID Card Request</h1>
          <p className="text-gray-400 text-sm mt-1">Track your request status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side – Status Cards */}
          <div className="space-y-4">
            {/* Pending Card */}
            <div className={`p-4 rounded-xl border-2 ${getStatusCardStyle('Pending', request.status)} transition-all`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getStatusIcon('Pending')}</span>
                <div>
                  <h3 className="font-bold text-gray-800">Pending</h3>
                  <p className="text-xs text-gray-500">Your form has been submitted. Waiting for TAC admin to review.</p>
                </div>
              </div>
            </div>

            {/* Paid Card */}
            <div className={`p-4 rounded-xl border-2 ${getStatusCardStyle('Paid', request.status)} transition-all`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getStatusIcon('Paid')}</span>
                <div>
                  <h3 className="font-bold text-gray-800">Paid</h3>
                  <p className="text-xs text-gray-500">Bursar has confirmed payment. Card is being printed.</p>
                </div>
              </div>
            </div>

            {/* Collected Card */}
            <div className={`p-4 rounded-xl border-2 ${getStatusCardStyle('Collected', request.status)} transition-all`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getStatusIcon('Collected')}</span>
                <div>
                  <h3 className="font-bold text-gray-800">Collected</h3>
                  <p className="text-xs text-gray-500">You have received your physical ID card.</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Request locked. Contact General Admin for changes.
            </p>
          </div>

          {/* Right side – ID Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1A3C5E]">Your ID Card</h2>
            </div>
            <div className="p-6 flex justify-center">
              <IDCardDisplay data={request} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Before submission – show form + preview
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C5E]">ID Card Request</h1>
        <p className="text-gray-400 text-sm mt-1">Fill in your details, preview, then submit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form - left side */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#1A3C5E]">Your Information</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500">Full Name *</label>
              <input name="fullName" value={formData.fullName} onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="OKONJI, Brenda Chidi" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500">Nationality</label>
              <input name="nationality" value={formData.nationality} onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nigerian" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500">Date of Birth</label>
              <input name="dob" value={formData.dob} onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="15-06-07" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500">Department</label>
              <input name="department" value={formData.department} onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Computer Science" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500">Year</label>
              <input name="year" value={formData.year} onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="2025-2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500">Level</label>
                <input name="level" value={formData.level} onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="300" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500">Matric Number *</label>
              <input name="matricNo" value={formData.matricNo} onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="1-FAT/26/CSC/0253TF" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500">Passport Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
              {formData.photoPreview && (
                <img src={formData.photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg mt-2" />
              )}
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button onClick={handlePreview}
              className="w-full py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
              Preview ID Card
            </button>
          </div>
        </div>

        {/* Preview - right side */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#1A3C5E]">ID Card Preview</h2>
            <p className="text-xs text-gray-400">This is how your card will look</p>
          </div>
          <div className="p-6 flex justify-center">
            {previewData ? (
              <IDCardDisplay data={previewData} />
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p>👈 Fill in your details and click "Preview"</p>
              </div>
            )}
          </div>
          {previewData && (
            <div className="px-6 pb-6">
              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#1A3C5E] to-[#2A5A8E] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Reusable ID Card Display component
function IDCardDisplay({ data }) {
  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl shadow-xl text-white w-full max-w-md overflow-hidden">
      <div className="p-5">
        <div className="text-center border-b border-blue-400 pb-3 mb-4">
          <h2 className="text-lg font-bold">i-FATOSS UNIVERSITY-BENIN</h2>
          <p className="text-[10px] italic">INSTITUT DES FORMATIONS AVANCÉES</p>
          <p className="text-[10px]">where dreams become reality</p>
        </div>
        <div className="flex gap-4">
          <div className="w-24 h-28 bg-white rounded-lg overflow-hidden flex-shrink-0">
            {data.photoPreview ? (
              <img src={data.photoPreview} alt="Student" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
            )}
          </div>
          <div className="flex-1 space-y-1 text-xs">
            <p><span className="font-semibold">NOM & PRÉNOMS</span><br />{data.fullName || '—'}</p>
            <p><span className="font-semibold">NATIONALITÉ</span><br />{data.nationality || '—'}</p>
            <p><span className="font-semibold">DATE OF BIRTH</span><br />{data.dob || '—'}</p>
            <p><span className="font-semibold">DEPARTMENT</span><br />{data.department || '—'}</p>
            <p><span className="font-semibold">YEAR</span><br />{data.year || '—'}</p>
            <div className="flex gap-3">
              <div><span className="font-semibold">GENDER</span><br />{data.gender || '—'}</div>
              <div><span className="font-semibold">LEVEL</span><br />{data.level || '—'}</div>
            </div>
            <p><span className="font-semibold">MATRIC N°</span><br />{data.matricNo || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IDCard