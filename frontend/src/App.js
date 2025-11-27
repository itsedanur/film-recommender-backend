// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";              // 👈 ANA SAYFA
import MovieList from "./pages/MovieList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieDetail from "./pages/MovieDetail";
import Profile from "./pages/Profile";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/SuperNavbar";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Navbar tüm sayfalarda görünsün */}
        <Navbar />

        <Routes>
          {/* 👇 ANA SAYFAYI MovieList değil, Home yapıyoruz */}
          <Route path="/" element={<Home />} />

          <Route path="/movies" element={<MovieList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 👇 Film detay sayfası */}
          <Route path="/movie/:id" element={<MovieDetail />} />

          {/* 🔒 Korunan sayfa */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
