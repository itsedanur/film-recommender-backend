// frontend/src/App.js
import AdminDashboard from "./pages/AdminDashboard";
import "./i18n/i18n";

import React from "react";
import { Routes, Route } from "react-router-dom";

import About from "./pages/About";
import Contact from "./pages/Contact";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieList from "./pages/MovieList";
import MovieDetail from "./pages/MovieDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Ana Sayfa */}
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Film Listeleri */}
        <Route path="/movies" element={<MovieList type="all" />} />
        <Route path="/trending" element={<MovieList type="trending" />} />
        <Route path="/upcoming" element={<MovieList type="upcoming" />} />

        {/* Film Detayları */}
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/upcoming/:id" element={<MovieDetail type="upcoming" />} />

        {/* Diziler */}
        <Route
          path="/series"
          element={<div style={{ padding: 32 }}>Diziler yakında...</div>}
        />

        {/* Watchlist / Profil */}
        <Route path="/watchlist" element={<Profile />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
