import React, { useState } from "react";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      // Token sakla
      localStorage.setItem("token", data.access_token);

      // Kullanıcı bilgisi backend’den çek (auth/me)
      const me = await apiFetch("/auth/me");

      login(me, data.access_token);

      setMessage("Login successful!");
      setTimeout(() => navigate("/"), 800);

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      setMessage(err.detail || "Login failed.");
    }
  }

  return (
    <div className="auth-background">
      <div className="auth-card">
        <h1 className="auth-title">Sign In</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-button">Sign In</button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          New to FilmRec?
          <span onClick={() => navigate("/register")}> Sign up now.</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
