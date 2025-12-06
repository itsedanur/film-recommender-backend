// frontend/src/components/register.js

import React, { useState } from "react";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("Registering...");

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: {
          username,
          email,
          password
        }
      });

      // Kayıt başarılı
      setMessage("Registration successful! Redirecting to login...");
      // Genellikle token alınır ve login sayfasına yönlendirilir.
      setTimeout(() => navigate("/login"), 800);

    } catch (err) {
      console.log("REGISTER ERROR:", err);

      if (err.status === 422) {
        // Doğrulama hatası (Validation Error) - Fast API'de genellikle parola/format hatası
        setMessage("Input validation failed. Check password length (min 6 chars) and ensure email is valid.");
      } else if (err.status === 400) {
        // Eğer backend 400 hatasını sadece e-posta çakışması için kullanıyorsa:
        setMessage("This email is already registered.");
      } else if (err.status === 0) {
        // Bağlantı hatası
        setMessage("Connection failed. The backend server might be offline.");
      } else {
        // Diğer beklenmeyen hatalar
        setMessage(`Registration failed: ${err.detail || "An unexpected error occurred."}`);
      }
    }
  }

  return (
    <div className="auth-background">
      <div className="auth-card">
        <h1 className="auth-title">Sign Up</h1>

        <form onSubmit={handleRegister}>
          <input
            className="auth-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-button">Sign Up</button>
        </form>

        {message && <p className={`auth-message ${message.includes("successful") ? 'success' : 'error'}`}>{message}</p>}

        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign in now.</span>
        </p>
      </div>
    </div>
  );
}

export default Register;