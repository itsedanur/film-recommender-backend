// frontend/src/pages/Home.js

import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { apiFetch } from "../api";
import "./Home.css";

export default function Home() {
  const [allMovies, setAllMovies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [sectionTitle, setSectionTitle] = useState("Popüler Filmler");

  useEffect(() => {
    async function load() {
      try {
        // Tüm filmleri çek
        const data = await apiFetch("/movies/all");

        // 👑 KULLANICI İSTEĞİ: "Efsaneler" ve "Leonardo DiCaprio" filmleri en üstte olsun.
        // Algoritma: Normal Puan + Bonus Puan
        const pinnedKeywords = [
          "Baba", "Godfather",
          "Yıldızlararası", "Interstellar",
          "Yüzüklerin Efendisi", "Lord of the Rings",
          "Titanik", "Titanic",
          "Forrest Gump",
          "Başlangıç", "Inception",
          "Yenilmezler", "Avengers",
          "Kara Şövalye", "Dark Knight",
          "Matrix"
        ];

        const getBonus = (m) => {
          let bonus = 0;
          const title = (m.title || "").toLowerCase();

          // 1. İsim Kontrolü (Devasa Boost)
          if (pinnedKeywords.some(k => title.includes(k.toLowerCase()))) {
            bonus += 10000;
          }

          // 2. Oyuncu Kontrolü (Leonardo DiCaprio vb.)
          if (m.cast && m.cast.some(c => c.name === "Leonardo DiCaprio")) {
            bonus += 5000;
          }

          return bonus;
        };

        const sorted = [...data].sort((a, b) => {
          // Temel Puan (Kalite + Popülerlik)
          // Scale: 0 - 50 arası genelde
          const votesA = a.vote_count || ((a.popularity || 0) * 50) || 100;
          const votesB = b.vote_count || ((b.popularity || 0) * 50) || 100;

          const baseScoreA = (a.vote_average || 0) * Math.log10(votesA);
          const baseScoreB = (b.vote_average || 0) * Math.log10(votesB);

          // Toplam Puan = Temel + Bonus
          const totalA = baseScoreA + getBonus(a);
          const totalB = baseScoreB + getBonus(b);

          return totalB - totalA;
        });

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
      setSectionTitle("Popüler Filmler");
      return;
    }

    const result = allMovies.filter((m) => {
      const title = (m.title || "").toLowerCase();
      const overview = (m.overview || "").toLowerCase();

      // Cast içinde ara
      const castMatch = (m.cast || []).some(c =>
        (c.name || "").toLowerCase().includes(q)
      );

      // Director içinde ara
      const dirMatch = (m.directors || []).some(d =>
        (d.name || "").toLowerCase().includes(q)
      );

      return title.includes(q) || overview.includes(q) || castMatch || dirMatch;
    });

    setFiltered(result);
    setSectionTitle(`"${query}" için sonuçlar`);
  };

  // ⭐ Kategori filtreleri (Türk filmleri, IMDb 8.5+, aksiyon, dram, komedi, bilim kurgu)
  const filterCategory = (type) => {
    setQuery(""); // Clear search query when filtering by category
    if (type === "all") {
      setFiltered(allMovies);
      setSectionTitle("Popüler Filmler");
      return;
    }

    let result = [];
    let title = "Filmler";

    switch (type) {
      case "turk":
        result = allMovies.filter((m) => {
          const t = (m.title || "").toLowerCase();
          const o = (m.overview || "").toLowerCase();
          return t.includes("türk") || o.includes("türk");
        });
        title = "Türk Filmleri";
        break;

      case "imdb85":
        result = allMovies.filter((m) => (m.vote_average || 0) >= 8.5);
        title = "IMDb 8.5+ Filmler";
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
        title = "Aksiyon Filmleri";
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
        title = "Dram Filmleri";
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
        title = "Komedi Filmleri";
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
        title = "Bilim Kurgu Filmleri";
        break;

      default:
        result = allMovies;
        break;
    }

    setFiltered(result);
    setSectionTitle(title);
  };

  // ✨ FEATURED HERO MOVIE
  // En yüksek puanlı yabancı filmlerden rasgele birini seç
  const [heroMovie, setHeroMovie] = useState(null);

  useEffect(() => {
    if (allMovies.length > 0) {
      // Filter: Foreign (not "tr" original language if avail, or just check title), Popular, High Rated
      // Let's pick from top 20 popular movies that are likely foreign (check overview language or just random)
      const candidates = allMovies
        .filter(m => m.poster_path && m.vote_average > 7.5)
        .slice(0, 15);

      if (candidates.length > 0) {
        const random = candidates[Math.floor(Math.random() * candidates.length)];
        setHeroMovie(random);
      }
    }
  }, [allMovies]);

  return (
    <div className="home-container">
      {/* 🌟 CINEMATIC HERO SECTION */}
      {heroMovie ? (
        <header
          className="hero-section"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path || heroMovie.poster_path})`
          }}
        >
          <div className="hero-overlay">
            <div className="container hero-content">
              <h1 className="hero-title">{heroMovie.title}</h1>
              <p className="hero-overview">
                {heroMovie.overview_tr
                  ? (heroMovie.overview_tr.length > 150 ? heroMovie.overview_tr.slice(0, 150) + "..." : heroMovie.overview_tr)
                  : (heroMovie.overview || "").slice(0, 150) + "..."}
              </p>
              <div className="hero-buttons">

                <button className="btn-hero secondary" onClick={() => window.location.href = `/movies/${heroMovie.id}`}>
                  ℹ️ Daha Fazla Bilgi
                </button>
              </div>
            </div>
          </div>
        </header>
      ) : (
        /* Fallback Hero if no movies loaded yet */
        <div className="hero-section fallback-hero">
          <div className="hero-content">
            <h1>FilmRec</h1>
          </div>
        </div>
      )}

      {/* SEARCH & FILTERS SECTION */}
      <div className="search-filter-container container">
        <div className="search-box-home">
          <input
            type="text"
            placeholder="Film, oyuncu veya yönetmen ara... (örn: Nolan, DiCaprio)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="search-btn">
            🔍
          </button>
        </div>

        <div className="category-pills">
          <button className={filtered === allMovies ? "pill active" : "pill"} onClick={() => filterCategory("all")}>Tümü</button>
          <button className="pill" onClick={() => filterCategory("turk")}>Türk Filmleri</button>
          <button className="pill" onClick={() => filterCategory("imdb85")}>IMDb 8.5+</button>
          <button className="pill" onClick={() => filterCategory("aksiyon")}>Aksiyon</button>
          <button className="pill" onClick={() => filterCategory("dram")}>Dram</button>
          <button className="pill" onClick={() => filterCategory("komedi")}>Komedi</button>
          <button className="pill" onClick={() => filterCategory("bilim")}>Bilim Kurgu</button>
        </div>
      </div>

      {/* MOVIE GRID */}
      <div className="container" style={{ marginTop: '40px' }}>
        <h2 className="section-title">
          {sectionTitle}
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
    </div>
  );
}
