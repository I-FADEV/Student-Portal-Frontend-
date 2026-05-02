import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
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
      // 🔁 REPLACE THIS URL WITH YOUR ACTUAL BACKEND ENDPOINT
      const response = await fetch("https://student-portal-backend-xa6w.onrender.com/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Assuming your backend returns:
      // { role, route, title, token, ... }
      // Adjust property names to match your actual response
      const { role, route, title, token } = data;

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