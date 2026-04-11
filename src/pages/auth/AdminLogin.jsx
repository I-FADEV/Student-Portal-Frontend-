import styles from './AdminLogin.module.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function AdminLogin() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const fakeToken = 'admin-token-123'
      const fakeUser = { name, role: 'ga' }
      login(fakeUser, fakeToken)
      navigate('/admin/ga')
    } catch {
      setError('Invalid name or password')
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
          <p className={styles.schoolSub}>Admin Portal</p>
        </div>
        <p className={styles.tagline}>
          Manage your institution, <br />
          efficiently and securely.
        </p>
      </div>

      {/* Right Side */}
      <div className={styles.rightSide}>
        <div className={styles.card}>

          <div className={styles.adminBadge}>Admin Access</div>
          <h2 className={styles.welcomeText}>Welcome Back</h2>
          <p className={styles.subText}>Sign in to your admin account</p>

          <form onSubmit={handleSubmit} className={styles.form}>

            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <div className={styles.backLink}>
            <a href="/">← Back to Student Login</a>
          </div>

        </div>
      </div>

    </div>
  )
}

export default AdminLogin