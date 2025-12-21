// frontend/src/pages/Home.js

import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [personalRecs, setPersonalRecs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState(null);

  // 🔍 SEARCH LOGIC
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allMovies, setAllMovies] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Load All Movies to Sort Client-Side (Boost Actors) & For Search
        const allData = await apiFetch("/movies/all");
        setAllMovies(allData);
        setFiltered(allData);

        // 👑 Custom Sorting Logic
        const pinnedActors = ["Al Pacino", "Brad Pitt", "Tom Hanks", "Leonardo DiCaprio"];

        const sorted = [...allData].sort((a, b) => {
          // Check boosts
          const hasPinnedA = (a.cast || []).some(c => pinnedActors.some(p => c.name.includes(p)));
          const hasPinnedB = (b.cast || []).some(c => pinnedActors.some(p => c.name.includes(p)));

          if (hasPinnedA && !hasPinnedB) return -1;
          if (!hasPinnedA && hasPinnedB) return 1;

          // Fallback to popularity/votes
          return (b.popularity || 0) - (a.popularity || 0);
        });

        setTrending(sorted);

        // 2. If logged in, load personalized dashboard
        if (token) {
          try {
            const dashData = await apiFetch("/dashboard/user");
            setDashboard(dashData);
            setPersonalRecs(dashData.recommendations || []);
          } catch (e) {
            console.error("Dashboard load failed", e);
          }
        }

      } catch (err) {
        console.error("Home load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  // Set Hero Movie
  useEffect(() => {
    const source = personalRecs.length > 0 ? personalRecs : trending;
    if (source.length > 0) {
      const random = source[Math.floor(Math.random() * Math.min(5, source.length))];
      setHeroMovie(random);
    }
  }, [personalRecs, trending]);

  const handleRandomPick = () => {
    const source = trending.length > 0 ? trending : [];
    if (source.length > 0) {
      const random = source[Math.floor(Math.random() * source.length)];
      navigate(`/movies/${random.id}`);
    }
  };

  // 🔍 SEARCH HANDLERS
  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const result = allMovies.filter((m) => {
      const title = (m.title || "").toLowerCase();
      const overview = (m.overview || "").toLowerCase();
      const castMatch = (m.cast || []).some(c => (c.name || "").toLowerCase().includes(q));
      return title.includes(q) || overview.includes(q) || castMatch;
    });
    setFiltered(result);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const filterCategory = (type) => {
    setQuery("");
    if (type === "all") {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    let result = [];
    switch (type) {
      case "turk":
        // 🇹🇷 Filter by Original Language (requires backend migration complete)
        result = allMovies.filter(m => m.original_language === 'tr');
        break;
      case "imdb85":
        result = allMovies.filter(m => (m.vote_average || 0) >= 8.5);
        break;
      case "aksiyon":
        result = allMovies.filter(m => /aksiyon|action/i.test(JSON.stringify(m.genres || [])));
        break;
      case "dram":
        result = allMovies.filter(m => /drama|dram/i.test(JSON.stringify(m.genres || [])));
        break;
      case "komedi":
        result = allMovies.filter(m => /komedi|comedy/i.test(JSON.stringify(m.genres || [])));
        break;
      case "bilim":
        result = allMovies.filter(m => /science|bilim/i.test(JSON.stringify(m.genres || [])));
        break;
      case "korku":
        result = allMovies.filter(m => /horror|korku/i.test(JSON.stringify(m.genres || [])));
        break;
      case "romantik":
        result = allMovies.filter(m => /romance|romantik/i.test(JSON.stringify(m.genres || [])));
        break;
      case "animasyon":
        result = allMovies.filter(m => /animation|animasyon/i.test(JSON.stringify(m.genres || [])));
        break;
      case "aile":
        result = allMovies.filter(m => /family|aile/i.test(JSON.stringify(m.genres || [])));
        break;
      case "belgesel":
        result = allMovies.filter(m => /documentary|belgesel/i.test(JSON.stringify(m.genres || [])));
        break;
      default:
        result = allMovies;
    }
    setFiltered(result);
  };

  if (loading) return <div className="loading-screen">Yükleniyor...</div>;

  return (
    <div className="home-container">

      {/* 🌟 HERO SECTION (Brand Style) */}
      <header
        className="hero-section brand-hero"
        style={{
          position: 'relative',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          overflow: 'hidden',
          backgroundColor: '#000'
        }}
      >
        {/* 🎞️ CSS Animated Film Background */}
        <div className="film-strip-bg"></div>
        <div className="film-strip-overlay"></div>
        <div className="hero-content animate-fade-up">

          {/* 🎬 Animated CSS Clapperboard */}
          <div className="brand-icon-wrapper">
            <div className="clapperboard">
              <div className="clapper-top"></div>
              <div className="clapper-bottom"></div>
            </div>
          </div>

          {/* 🏷️ Title */}
          <h1 className="brand-title">
            Film<span style={{ color: '#e50914' }}>Rec</span>
          </h1>

          {/* 📝 Subtitle */}
          <p className="brand-subtitle">
            En iyi filmleri keşfet, incele ve favorilerine ekle!
          </p>

          {/* 🔍 Search Bar (Integrated) */}
          <div className="search-box-brand">
            <input
              type="text"
              placeholder="Bilim kurgu, romantik, komedi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSearch} className="search-btn-brand">
              Bul 🔍
            </button>
          </div>

          {/* 🏷️ Quick Filters */}
          <div className="quick-filters">
            <button className="filter-pill" onClick={() => filterCategory("bilim")}>Bilim Kurgu</button>
            <button className="filter-pill" onClick={() => filterCategory("korku")}>Korku</button>
            <button className="filter-pill" onClick={() => filterCategory("turk")}>Türk Filmleri</button>
            <button className="filter-pill" onClick={() => filterCategory("imdb85")}>IMDb 8.5+</button>
            <button className="filter-pill" onClick={() => filterCategory("dram")}>Dram</button>
            <button className="filter-pill" onClick={() => filterCategory("komedi")}>Komedi</button>
            <button className="filter-pill" onClick={() => filterCategory("romantik")}>Romantik</button>
            <button className="filter-pill" onClick={() => filterCategory("animasyon")}>Animasyon</button>
            <button className="filter-pill" onClick={() => filterCategory("aile")}>Aile</button>
            <button className="filter-pill" onClick={() => filterCategory("belgesel")}>Belgesel</button>
          </div>

        </div>
      </header>

      <div className="container dashboard-main">

        {/* VIEW 1: SEARCH RESULTS */}
        {isSearching ? (
          <div className="section-block">
            <h2 className="section-title">Arama Sonuçları ({filtered.length})</h2>
            <div className="movie-grid">
              {filtered.map((m) => (
                <MovieCard key={m.id} id={m.id} title={m.title} poster_path={m.poster_path} vote_average={m.vote_average} />
              ))}
              {filtered.length === 0 && <p className="no-results">Sonuç bulunamadı.</p>}
            </div>
          </div>
        ) : (
          /* VIEW 2: DASHBOARD */
          <>
            {/* 🔥 POPULAR MOVIES (Single Section) */}
            <div className="section-block">
              <h2 className="section-title">Popüler Filmler 🍿</h2>
              <div className="movie-grid">
                {trending.slice(0, 20).map((m) => (
                  <MovieCard key={m.id} {...m} />
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div >
  );
}
