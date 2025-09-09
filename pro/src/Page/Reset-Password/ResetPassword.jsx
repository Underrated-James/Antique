import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ResetPassword.module.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters, include 1 uppercase letter and 1 number");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${apiUrl}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Password reset failed");
      }

      setSuccess("Password has been reset successfully!");
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles["reset-page"]}>
      <form className={styles["reset-form"]} onSubmit={handleSubmit}>
        <h2 className={styles["form-title"]}>Reset Password</h2>

        {error && <p className={styles["error-message"]}>{error}</p>}
        {success && <p className={styles["success-message"]}>{success}</p>}

        <div className={styles["form-group"]}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles["form-input"]}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles["form-input"]}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="password">New Password</label>
          <div className={styles["password-input-container"]}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles["form-input"]}
              required
            />
            <span
              className={styles["password-toggle-icon"]}
              onClick={() => setShowPassword((prev) => !prev)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🔓" : "🔒"}
            </span>
          </div>
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className={styles["password-input-container"]}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles["form-input"]}
              required
            />
            <span
              className={styles["password-toggle-icon"]}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? "🔓" : "🔒"}
            </span>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className={styles["error-message"]}>Passwords do not match</p>
          )}
        </div>

        <button type="submit" className={styles["reset-btn"]} disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>

        <div className={styles["bottom-actions"]}>
          <button
            type="button"
            className={styles["link-btn"]}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
