import React, { useState } from "react";

function LoginPage() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail) {
          if (Array.isArray(data.detail)) setMessage(data.detail[0].msg);
          else if (typeof data.detail === "object") setMessage(data.detail.msg);
          else setMessage(data.detail);
        } else setMessage("Login failed");
        return;
      }

      localStorage.setItem("token", data.access_token);
      setMessage("Login successful!");

      setTimeout(() => {
        window.location.href = "/profile";
      }, 800);

    } catch (error) {
      console.error("Login error:", error);
      setMessage("Server error");
    }
  };



return (
  <div className="page-container">
    <h1 className="page-title">🔐 Login</h1>

    <input
      name="email"
      type="email"
      placeholder="Email"
      value={form.email}
      onChange={handleChange}
      className="form-input"
    />

    <input
      name="password"
      type="password"
      placeholder="Password"
      value={form.password}
      onChange={handleChange}
      className="form-input"
    />

    <button onClick={handleLogin} className="form-button">
      Login
    </button>

    {message && (
      <p style={{ marginTop: "20px", color: "yellow" }}>{message}</p>
    )}
  </div>
);

}

export default LoginPage;





