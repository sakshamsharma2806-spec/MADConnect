"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("cho");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); setLoading(false); return; }
      if (data.user.role !== selectedRole) {
        setError(`This account is not registered as a ${selectedRole === "admin" ? "Core Member" : "Chapter Organizer"}.`);
        setLoading(false); return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      setTimeout(() => router.push("/dashboard"), 500);
    } catch { setError("Login failed. Please try again."); setLoading(false); }
  };

  return (
    <>
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="login-container">
        <div className="left-panel">
          <h1>MAD Connect</h1>
          <p className="title">Chapter Management System</p>
          <div className="quote">
            <h2>Welcome Back</h2>
            <p>Every attendance tells a story. Every volunteer makes a difference.</p>
          </div>
        </div>
        <div className="right-panel">
          <div className="login-card">
            <h2>Login</h2>
            <p>Sign in to continue</p>
            <div className="role-selector">
              <button type="button" className={`role-btn ${selectedRole === "cho" ? "active" : ""}`} onClick={() => setSelectedRole("cho")}>
                <span className="role-icon">{"\u{1F465}"}</span>
                <span className="role-label">Chapter Organizer</span>
              </button>
              <button type="button" className={`role-btn ${selectedRole === "admin" ? "active" : ""}`} onClick={() => setSelectedRole("admin")}>
                <span className="role-icon">{"\u{1F6E1}"}</span>
                <span className="role-label">Core Member / Admin</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {error && <div className="error">{error}</div>}
              <label>Email</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label>Password</label>
              <div className="password-box">
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>{showPassword ? "\u{1F441}" : "\u{1F441}\uFE0F"}</span>
              </div>
              <div className="show-password">
                <input type="checkbox" id="showPasswordCheck" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                <label htmlFor="showPasswordCheck">Show Password</label>
              </div>
              <div className="options">
                <label><input type="checkbox" /> Remember Me</label>
                <a href="#">Need Help?</a>
              </div>
              <button type="submit" className={loading ? "loading" : ""} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
