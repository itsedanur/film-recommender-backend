import React, { useState } from "react";

function RegisterPage() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.detail)
          ? data.detail[0].msg
          : data.detail;

        setMessage(errorMsg || "Registration failed");
        return;
      }

      setMessage("Registered successfully!");
    } catch (error) {
      console.error("Register error:", error);
      setMessage("Server error");
    }
  };

  return (
  <div className="page-container">
    <h1 className="page-title">📝 Register</h1>

    <input
      name="username"
      type="text"
      placeholder="Username"
      value={form.username}
      onChange={handleChange}
      className="form-input"
    />

    <input
      name="name"
      type="text"
      placeholder="Full Name (Optional)"
      value={form.name}
      onChange={handleChange}
      className="form-input"
    />

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
      onChange={handleChange}
      className="form-input"
    />

    <button onClick={handleRegister} className="form-button">
      Register
    </button>

    {message && (
      <p style={{ marginTop: "20px", color: "yellow" }}>{message}</p>
    )}
  </div>
);

}

export default RegisterPage;




