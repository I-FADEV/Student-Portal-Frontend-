import styles from './Login.module.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const departments = [
  'Business Administration',
  'Human Resource Management',
  'Accounting',
  'Banking and Finance',
  'Hospitality Management and Tourism',
  'Economics',
  'Mass Communication',
  'Theatre Art',
  'Linguistics',
  'International Relations',
  'Political Science',
  'Public Administration',
  'Computer Science',
  'Computer Engineering',
  'Software Engineering',
  'Management Information Technology',
  'Estate Management',
  'Civil Engineering',
  'Biochemistry',
  'Microbiology',
  'Nursing',
]

function Login() {
  const [isRegister, setIsRegister] = useState(false)

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [department, setDepartment] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const fakeToken = 'test-token-123'
      const fakeUser = { name: 'Test Student', role: 'student', email }
      login(fakeUser, fakeToken)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Will connect to backend later
      console.log({ fullName, phone, regEmail, department })
      setSuccess('Registration successful! Your matric number will be sent to your email once generated.')
      setLoading(false)
    } catch {
      setError('Registration failed. Please try again.')
      setLoading(false)
    }
  }

  const switchToRegister = () => {
    setError('')
    setSuccess('')
    setIsRegister(true)
  }

  const switchToLogin = () => {
    setError('')
    setSuccess('')
    setIsRegister(false)
  }

  return (
    <div className={styles.container}>

      {/* Left Side */}
      <div className={`${styles.leftSide} ${isRegister ? styles.leftSideRegister : ''}`}>
        <div className={styles.logoArea}>
          <img src="/logo.png" alt="Ifatoss Logo" className={styles.logo} />
          <h1 className={styles.schoolName}>IFATOSS</h1>
          <p className={styles.schoolSub}>Student Portal</p>
        </div>
        <p className={styles.tagline}>
          {isRegister
            ? <>Join IFATOSS, <br /> start your journey today.</>
            : <>Your academic journey, <br /> all in one place.</>
          }
        </p>
      </div>

      {/* Right Side */}
      <div className={styles.rightSide}>

        {/* Login Form */}
        <div className={`${styles.card} ${isRegister ? styles.cardHidden : styles.cardVisible}`}>
          <h2 className={styles.welcomeText}>Welcome Back</h2>
          <p className={styles.subText}>Sign in to your account</p>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.switchArea}>
            <p>New student?</p>
            <button onClick={switchToRegister} className={styles.switchBtn}>
              Register Now →
            </button>
          </div>

          <div className={styles.adminLink}>
            <p>Are you an admin?</p>
            <a href="/admin/login">Admin Login →</a>
          </div>
        </div>

        {/* Register Form */}
        <div className={`${styles.card} ${isRegister ? styles.cardVisible : styles.cardHidden}`}>
          <h2 className={styles.welcomeText}>Create Account</h2>
          <p className={styles.subText}>Register as a new student</p>

          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className={styles.select}
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}
            {success && <p className={styles.successMsg}>{success}</p>}

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className={styles.switchArea}>
            <p>Already have an account?</p>
            <button onClick={switchToLogin} className={styles.switchBtn}>
              ← Back to Login
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login