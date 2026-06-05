import styles from './Login.module.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { studentLogin, getStudentProfile } from '../../services/api'

function Login() {
  const [password, setPassword] = useState('')
  const [matricNo, setMatricNo] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { user, token } = await studentLogin(matricNo, password)
      // Fetch profile to get student name
      const profile = await getStudentProfile(token)
      const profileData = profile?.data || profile
      // Merge profile data with user object
      const userWithProfile = {
        ...user,
        name: profileData?.name || '',
        matricNumber: profileData?.matricNumber || '',
        department: profileData?.department || '',
        level: profileData?.level || '',
      }
      login(userWithProfile, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid matric number or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Left Side */}
      <div className={styles.leftSide}>
        <div className={styles.logoArea}>
          <img src="/logo.png" alt="Ifatoss Logo" className={styles.logo} />
          <h1 className={styles.schoolName}>IFATOSS</h1>
          <p className={styles.schoolSub}>Student Portal</p>
        </div>
        <p className={styles.tagline}>
          Your academic journey, <br /> all in one place.
        </p>
      </div>

      {/* Right Side – Login Only */}
      <div className={styles.rightSide}>
        <div className={styles.card}>
          <h2 className={styles.welcomeText}>Welcome Back</h2>
          <p className={styles.subText}>Sign in to your account</p>

          <form onSubmit={handleLogin} className={styles.form}>

            <div className={styles.inputGroup}>
              <label>Matric Number</label>
              <input
                type="text"
                placeholder="Enter your matric number"
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
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

          <div className={styles.adminLink}>
            <p>Are you an admin?</p>
            <a href="/admin/login">Admin Login →</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login