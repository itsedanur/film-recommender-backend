import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import "./MovieDetail.css";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [collections, setCollections] = useState([]);
  const [reviews, setReviews] = useState([]);

  // UI State
  const [showCollections, setShowCollections] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [comment, setComment] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false); // 🔥 New state
  const [isWatched, setIsWatched] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/movies/${id}`);
        setMovie(data);

        try {
          const simData = await apiFetch(`/movies/${id}/similar`);
          setSimilar(Array.isArray(simData) ? simData.slice(0, 12) : []);
        } catch (e) { console.log("Benzer film hatası", e); }

        if (token) {
          try {
            const cols = await apiFetch("/collections/");
            setCollections(cols);
          } catch (e) {
            console.log("Koleksiyon yüklenemedi", e);
          }

          try {
            const wRes = await apiFetch(`/watched/${id}/check`);
            setIsWatched(wRes.is_watched);
          } catch (e) { console.log("Watched check failed", e); }

          try {
            const rRes = await apiFetch(`/ratings/${id}/my-rating`);
            if (rRes.has_rated) setUserRating(rRes.score);
          } catch (e) { console.log("Rating check failed", e); }
        }

      } catch (err) {
        console.error("Film yüklenemedi:", err);
      }
    }


    async function loadReviews() {
      try {
        const data = await apiFetch(`/reviews/${id}`);
        if (Array.isArray(data)) setReviews(data);
      } catch (e) { console.log("Yorumlar çekilemedi", e); }
    }

    load();
    loadReviews();
  }, [id, token]);

  if (!movie) return <div className="loading-screen">Yükleniyor...</div>;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : (movie.poster_url || `https://image.tmdb.org/t/p/original${movie.poster_path}`);

  // Actions
  // Helper to format error message safely
  const getErrorMessage = (err) => {
    if (typeof err?.detail === "string") return err.detail;
    if (typeof err?.message === "string") return err.message;
    if (typeof err === "string") return err;
    return JSON.stringify(err);
  };

  const handleError = (err) => {
    const msg = getErrorMessage(err);
    if (err.status === 401 || msg.includes("Token expired") || msg.includes("invalid")) {
      localStorage.removeItem("token");
      alert("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
      navigate("/login");
      return;
    }
    alert("Hata: " + msg);
  };

  // Actions
  const handleLike = async () => {
    if (!token) return navigate("/login");
    try {
      const res = await apiFetch(`/likes/toggle/${id}`, { method: "POST" });
      alert(res.liked ? "❤️ Beğenildi" : "💔 Beğeni geri alındı");
    } catch (err) {
      handleError(err);
    }
  };

  const handleAddToCollection = async (collectionId) => {
    try {
      const res = await apiFetch(`/collections/${collectionId}/add/${id}`, { method: "POST" });
      alert(res.added ? "✅ Listeye eklendi!" : "⚠️ " + (res.detail || "İşlem başarısız"));
      setShowCollections(false);
    } catch (err) {
      handleError(err);
    }
  };

  const handleToggleWatched = async () => {
    if (!token) return navigate("/login");
    try {
      const res = await apiFetch(`/watched/${id}`, { method: "POST" });
      setIsWatched(res.status === "added");
      // Eğer izledim kaldırılırsa puanı da sıfırlayalım mı? Kullanıcı tercihi. Şimdilik kalsın.
      alert(res.msg);
    } catch (err) {
      handleError(err);
    }
  };

  const handleRate = async (score) => {
    if (!token) return navigate("/login");
    try {
      // Puan verince otomatik izledim de olsun mu? Genelde evet.
      if (!isWatched) {
        await apiFetch(`/watched/${id}`, { method: "POST" });
        setIsWatched(true);
      }

      const res = await apiFetch("/ratings/add", {
        method: "POST",
        body: { movie_id: parseInt(id), score: score }
      });
      setUserRating(score);
      // alert("Puan verildi: " + score); // Rahatsız etmesin, UI güncelleniyor zaten
    } catch (err) {
      handleError(err);
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    try {
      // Backend expects 'text' as a query parameter
      await apiFetch(`/reviews/add/${id}?text=${encodeURIComponent(comment)}&is_spoiler=${isSpoiler}`, {
        method: "POST"
      });

      alert("Yorum gönderildi!");
      setComment("");

      // Refresh reviews
      const data = await apiFetch(`/reviews/${id}`);
      if (Array.isArray(data)) setReviews(data);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="movie-detail-container">
      {/* 🌟 CINEMATIC BACKDROP HERO */}
      <div
        className="backdrop-hero"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="backdrop-overlay">
          <div className="container hero-content-grid">

            {/* Poster Card (Floating) */}
            <div className="poster-wrapper">
              <img
                src={movie.poster_url || `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="main-poster"
              />
            </div>

            {/* Info */}
            <div className="movie-info">
              <h1 className="detail-movie-title">{movie.title}</h1>
              <div className="meta-row">
                <span className="release-date">{movie.release_date?.split("-")[0]}</span>
                <span className="dot">•</span>
                <div className="imdb-badge-container">
                  <span className="imdb-star">★</span>
                  <span className="imdb-score">{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
                  <span className="imdb-label">/ 10</span>
                </div>
                <span className="dot">•</span>

              </div>

              {/* Director */}
              {movie.directors && movie.directors.length > 0 && (
                <div className="director-row">
                  <span className="director-label">Yönetmen:</span>
                  <span className="director-name">
                    {movie.directors.map((d, i) => (
                      <React.Fragment key={i}>
                        <span
                          onClick={() => navigate(`/person/${d.name}`)}
                          className="clickable-person"
                          style={{ cursor: "pointer", textDecoration: "underline" }}
                        >
                          {d.name}
                        </span>
                        {i < movie.directors.length - 1 && ", "}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              )}

              <div className="genres-list">
                {movie.genres?.map((g, i) => <span key={i} className="genre-pill">{g.name}</span>)}
              </div>



              <p className="overview-text">
                {movie.overview_tr
                  ? (movie.overview_tr.length > 180 ? movie.overview_tr.slice(0, 180) + "..." : movie.overview_tr)
                  : (movie.overview || "").slice(0, 180) + "..."}
              </p>

              {/* Buttons */}
              <div className="action-buttons">
                {movie.trailer_url && (
                  <button className="btn-action primary trailer-btn" onClick={() => setShowTrailer(true)}>
                    ▶ Fragman İzle
                  </button>
                )}
                <button className="btn-action secondary interact-btn" onClick={handleLike}>❤️ Beğen</button>
                <button
                  className={`btn-action secondary interact-btn ${isWatched ? "watched-active" : ""}`}
                  onClick={handleToggleWatched}
                  style={isWatched ? { background: "green", color: "white", borderColor: "green" } : {}}
                >
                  {isWatched ? "✅ İzledim" : "👁️ İzledim"}
                </button>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button className="btn-action secondary interact-btn" onClick={() => setShowCollections(!showCollections)}>📌 Listeye Ekle</button>
                  {/* Collection Popover */}
                  {showCollections && (
                    <div className="collection-popover">
                      {collections.length > 0 ? (
                        collections.map(col => (
                          <div key={col.id} className="popover-item" onClick={() => handleAddToCollection(col.id)}>
                            📂 {col.name}
                          </div>
                        ))
                      ) : (
                        <div className="popover-empty">
                          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '8px' }}>Henüz listeniz yok.</p>
                          <button
                            onClick={() => navigate('/watchlist')}
                            style={{
                              width: '100%',
                              background: '#333',
                              color: 'white',
                              border: 'none',
                              padding: '6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            + Liste Oluştur
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RATING SECTION (Only visible if Watched or User interaction) */}
              {isWatched && (
                <div className="rating-row" style={{ marginTop: 20 }}>
                  <span style={{ marginRight: 10, color: '#aaa' }}>Puanın:</span>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <span
                      key={star}
                      className={`star-icon ${star <= userRating ? "filled" : ""}`}
                      onClick={() => handleRate(star)}
                      style={{ cursor: "pointer", fontSize: "1.5rem", color: star <= userRating ? "#ffc107" : "#444", transition: "color 0.2s" }}
                      title={`${star} Puan`}
                      onMouseOver={(e) => e.target.style.color = "#ffc107"}
                      onMouseOut={(e) => e.target.style.color = star <= userRating ? "#ffc107" : "#444"}
                    >
                      ★
                    </span>
                  ))}
                  <span style={{ marginLeft: 10, fontSize: "1.2rem", color: "#ffc107", fontWeight: "bold" }}>{userRating > 0 ? userRating : ""}</span>
                </div>
              )}

              {/* TRAILER MODAL */}
              {showTrailer && movie.trailer_url && (
                <div className="trailer-modal-backdrop" onClick={() => setShowTrailer(false)}>
                  <div className="trailer-modal-content">
                    <button className="close-modal" onClick={() => setShowTrailer(false)}>×</button>
                    <iframe
                      width="100%"
                      height="100%"
                      src={movie.trailer_url.replace("watch?v=", "embed/") + "?autoplay=1"}
                      title="Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* 📖 FULL PLOT / STORY SECTION */}
      <div className="container content-section">
        <h2 className="section-title">Film Özeti</h2>
        <p className="full-overview-text">
          {movie.overview_tr || movie.overview || "Özet bulunmuyor."}
        </p>
      </div>

      {/* 🎭 CAST & CREW */}
      {movie.cast && movie.cast.length > 0 && (
        <div className="container content-section">
          <h2 className="section-title">Oyuncular</h2>
          <div className="cast-scroller">
            {movie.cast.slice(0, 5).map((c) => (
              <div
                key={c.id || c.name}
                className="cast-card-mini"
                onClick={() => navigate(`/person/${c.name}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                  alt={c.name}
                />
                <div className="actor">{c.name}</div>
                <div className="role">{c.character}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔄 SIMILAR MOVIES */}
      <div className="container content-section">
        <h2 className="section-title">Benzer Filmler</h2>
        <div className="similar-movie-grid">
          {similar.map(m => (
            <div key={m.id} className="similar-card" onClick={() => { navigate(`/movies/${m.id}`); setMovie(null); }}>
              <img src={m.poster_url || `https://image.tmdb.org/t/p/w300${m.poster_path}`} alt={m.title} />
              <div className="similar-overlay">
                <span>{m.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 💬 COMMENTS */}
      <div className="container content-section reviews-section">
        <h2 className="section-title">Yorumlar</h2>

        {/* Review List */}
        <div className="reviews-list">
          {reviews.length === 0 && <p style={{ color: '#777' }}>Henüz yorum yapılmamış. İlk yorumu sen yap!</p>}
          {reviews.map(r => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </div>

        {/* Input */}
        <div className="comment-input-area">
          <textarea
            placeholder="Film hakkında ne düşünüyorsun?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <label style={{ color: '#ccc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
              />
              Spoiler içeriyor
            </label>
            <button className="btn-send" onClick={handleSendComment}>Yorumu Gönder</button>
          </div>
        </div>
      </div>

    </div>
  );
}

function ReviewItem({ review }) {
  const [revealed, setRevealed] = useState(false);
  const isHidden = review.is_spoiler && !revealed;

  return (
    <div className="review-card">
      <div className="review-header">
        <span className="review-user">{review.user.username}</span>
        <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
      </div>

      <div style={{ position: 'relative' }}>
        <p className={`review-text ${isHidden ? 'spoiler-blur' : ''}`}>
          {review.text}
        </p>

        {isHidden && (
          <div className="spoiler-overlay">
            <span style={{ color: '#ff4444', fontWeight: 'bold', marginBottom: 5 }}>SPOILER</span>
            <button
              className="btn-reveal"
              onClick={() => setRevealed(true)}
            >
              Göster
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
