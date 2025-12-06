// frontend/src/pages/Home.js

import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { apiFetch } from "../api";
import "./Home.css";

export default function Home() {
  const [allMovies, setAllMovies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Tüm filmleri çek
        const data = await apiFetch("/movies/all");

        // IMDb puanına göre büyükten küçüğe sırala
        const sorted = [...data].sort(
          (a, b) => (b.vote_average || 0) - (a.vote_average || 0)
        );

        setAllMovies(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error("Home load error:", err);
      }
    }

    load();
  }, []);

  // ⭐ Bul butonu
  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(allMovies);
      return;
    }

    const result = allMovies.filter((m) => {
      const title = (m.title || "").toLowerCase();
      const overview = (m.overview || "").toLowerCase();
      return title.includes(q) || overview.includes(q);
    });

    setFiltered(result);
  };

  // ⭐ Kategori filtreleri (Türk filmleri, IMDb 8.5+, aksiyon, dram, komedi, bilim kurgu)
  const filterCategory = (type) => {
    if (type === "all") {
      setFiltered(allMovies);
      return;
    }

    let result = [];

    switch (type) {
      case "turk":
        result = allMovies.filter((m) => {
          const t = (m.title || "").toLowerCase();
          const o = (m.overview || "").toLowerCase();
          return t.includes("türk") || o.includes("türk");
        });
        break;

      case "imdb85":
        result = allMovies.filter((m) => (m.vote_average || 0) >= 8.5);
        break;

      case "aksiyon":
        result = allMovies.filter((m) => {
          const genres = m.genres || [];
          const gMatch = genres.some((g) =>
            /aksiyon|action/i.test(g.name || "")
          );
          const o = (m.overview || "").toLowerCase();
          return gMatch || o.includes("aksiyon") || o.includes("action");
        });
        break;

      case "dram":
        result = allMovies.filter((m) => {
          const genres = m.genres || [];
          const gMatch = genres.some((g) =>
            /drama|dram/i.test(g.name || "")
          );
          const o = (m.overview || "").toLowerCase();
          return gMatch || o.includes("dram") || o.includes("drama");
        });
        break;

      case "komedi":
        result = allMovies.filter((m) => {
          const genres = m.genres || [];
          const gMatch = genres.some((g) =>
            /komedi|comedy/i.test(g.name || "")
          );
          const o = (m.overview || "").toLowerCase();
          return gMatch || o.includes("komedi") || o.includes("comedy");
        });
        break;

      case "bilim":
        result = allMovies.filter((m) => {
          const genres = m.genres || [];
          const gMatch = genres.some((g) =>
            /science fiction|bilim kurgu/i.test(g.name || "")
          );
          const o = (m.overview || "").toLowerCase();
          return (
            gMatch ||
            o.includes("bilim kurgu") ||
            o.includes("science fiction")
          );
        });
        break;

      default:
        result = allMovies;
        break;
    }

    setFiltered(result);
  };

  return (
    <div className="home-container">
      {/* HERO BOX */}
      <div className="hero-box">
        <div className="hero-overlay">
          <h1 className="hero-title">FilmRec</h1>
          <p className="hero-sub">
            En iyi filmleri keşfet, incele ve favorilerine ekle!
          </p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Bilim kurgu, romantik, komedi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}>Bul 🔍</button>
          </div>
        </div>
      </div>

      {/* KATEGORİLER */}
      <div className="category-row">
        <button className="cat-btn" onClick={() => filterCategory("all")}>
          Tümü
        </button>
        <button className="cat-btn" onClick={() => filterCategory("turk")}>
          Türk Filmleri
        </button>
        <button className="cat-btn" onClick={() => filterCategory("imdb85")}>
          IMDb 8.5+
        </button>
        <button className="cat-btn" onClick={() => filterCategory("aksiyon")}>
          Aksiyon
        </button>
        <button className="cat-btn" onClick={() => filterCategory("dram")}>
          Dram
        </button>
        <button className="cat-btn" onClick={() => filterCategory("komedi")}>
          Komedi
        </button>
        <button className="cat-btn" onClick={() => filterCategory("bilim")}>
          Bilim Kurgu
        </button>
      </div>

      {/* FİLMLER */}
      <h2 style={{ margin: "20px 0", color: "white" }}>
        IMDb’ye Göre En İyi Filmler
      </h2>

      <div className="movie-grid">
        {filtered.map((m) => (
          <MovieCard
            key={m.id}
            id={m.id}
            title={m.title}
            poster_path={m.poster_path}
            vote_average={m.vote_average}
          />
        ))}
      </div>
    </div>
  );
}
