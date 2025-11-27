import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("No token found. Please login first.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.detail || "Failed to load profile");
          return;
        }

        setUser(data);
        setMessage("");
      } catch (error) {
        console.error("Profile fetch error:", error);
        setMessage("Server error");
      }
    };

    fetchMe();
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">👤 Profile</h1>

      {!user ? (
        <p>{message}</p>
      ) : (
        <div style={{ fontSize: "18px", marginTop: "20px" }}>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}
    </div>
  );
}

export default Profile;
