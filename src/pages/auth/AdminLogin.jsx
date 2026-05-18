import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { adminLogin } from "../../services/api";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { role, route, title, token } = await adminLogin(username.trim(), password.trim());

      login(
        {
          username: username.trim(),
          role: role,
          title: title,
        },
        token
      );

      navigate(route);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        <div className={styles.logoArea}>
          <img src="/logo.png" alt="School Logo" className={styles.logo} />
          <h1 className={styles.schoolName}>IFATOSS</h1>
          <p className={styles.schoolSub}>Student Portal</p>
        </div>
        <p className={styles.tagline}>
          Empowering education through<br />
          seamless administration.
        </p>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.card}>
          <div className={styles.adminBadge}>Admin Access</div>
          <h2 className={styles.welcomeText}>Welcome Back</h2>
          <p className={styles.subText}>Sign in to manage your domain</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ga / tac / bursar / timetable"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.loginBtn}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className={styles.backLink}>
              <Link to="/">← Back to Student Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}