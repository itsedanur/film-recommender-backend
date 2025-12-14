import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import MovieCard from "../components/MovieCard";
import "../components/MovieCard.css";
import "./watchlist.css";

export default function WatchList() {
  const [collections, setCollections] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(true);

  // Verileri Yükle
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Koleksiyonlar
      const cols = await apiFetch("/collections/");
      setCollections(cols);

      // 2. Beğenilenler
      // Note: /likes/me returns { movie_ids: [...] }. We need full movie details.
      // Ideally backend should return full movies for /likes/me.
      // Let's check backend implementation of /likes/me. It returns movie_ids only.
      // This is a problem. I either update backend or fetch details one by one (bad).
      // I will update backend to return full movie objects for /likes/me.
      // For now, let's assume I will fix backend in next step. I'll write frontend expecting list of movies.

      const likesData = await apiFetch("/likes/me/details"); // New endpoint I will create
      setLikedMovies(likesData);

    } catch (err) {
      console.error("Veri yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Yeni Koleksiyon Oluştur
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      await apiFetch("/collections/", {
        method: "POST",
        body: { name: newListName },
      });
      setNewListName("");
      loadData();
    } catch (err) {
      alert("Liste oluşturulamadı: " + (err.detail || err.message));
    }
  };

  // Koleksiyon Sil
  const handleDeleteList = async (id) => {
    if (!window.confirm("Bu listeyi silmek istediğine emin misin?")) return;
    try {
      await apiFetch(`/collections/${id}`, { method: "DELETE" });
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (err) { alert("Silinemedi"); }
  };

  // Film Sil (Koleksiyondan)
  const handleRemoveMovieFromCol = async (collectionId, movieId) => {
    try {
      await apiFetch(`/collections/${collectionId}/remove/${movieId}`, { method: "DELETE" });
      // UI update optimization
      const newCols = collections.map(c => {
        if (c.id === collectionId) {
          return { ...c, movies: c.movies.filter(m => m.id !== movieId) };
        }
        return c;
      });
      setCollections(newCols);
    } catch (err) { alert("Film silinemedi"); }
  };

  // Beğeni Kaldır
  const handleUnlike = async (movieId) => {
    try {
      await apiFetch(`/likes/toggle/${movieId}`, { method: 'POST' });
      setLikedMovies(prev => prev.filter(m => m.id !== movieId));
    } catch (err) { alert("İşlem başarısız"); }
  };

  if (loading) return <div className="page-container loading"><h2>Yükleniyor...</h2></div>;

  return (
    <div className="page-container container watchlist-page">
      <header className="watchlist-header">
        <h1 className="page-title">Kütüphanem</h1>
        <p className="page-subtitle">Kaydettiğin filmler ve oluşturduğun listeler tek bir yerde.</p>
      </header>

      {/* --- BEĞENDİKLERİM --- */}
      <section className="watchlist-section liked-section">
        <div className="section-header-row">
          <h2>❤️ Beğendiklerim</h2>
          <span className="count-badge">{likedMovies?.length || 0} Film</span>
        </div>

        <div className="movie-grid">
          {likedMovies && likedMovies.length > 0 ? (
            likedMovies.map((movie) => (
              <div key={movie.id} className="movie-grid-item">
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  poster_path={movie.poster_path}
                  poster_url={movie.poster_url}
                  vote_average={movie.vote_average}
                />
                <button
                  className="remove-movie-btn"
                  onClick={() => handleUnlike(movie.id)}
                  title="Beğenmekten Vazgeç"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">💔</span>
              <p>Henüz hiç film beğenmedin.</p>
            </div>
          )}
        </div>
      </section>

      <div className="divider"></div>

      {/* YENİ LİSTE OLUŞTURMA */}
      <section className="create-list-section">
        <h2 className="section-title-small">📂 Kişisel Listelerin</h2>
        <form onSubmit={handleCreateList} className="create-list-form">
          <input
            type="text"
            placeholder="Yeni liste adı yaz... (örn: Bilim Kurgu Klasikleri)"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <button type="submit" className="btn-create-list">
            + Oluştur
          </button>
        </form>
      </section>

      {/* KOLEKSİYONLARI LİSTELE */}
      <div className="collections-container">
        {collections.length === 0 ? (
          <div className="empty-state">
            <p>Henüz hiç özel listen yok.</p>
          </div>
        ) : (
          collections.map((col) => (
            <div key={col.id} className="collection-card">
              <div className="collection-header">
                <h3>📂 {col.name} <span className="count-pill">{col.movies?.length || 0}</span></h3>
                <button
                  className="delete-list-btn"
                  onClick={() => handleDeleteList(col.id)}
                >
                  Listeyi Sil
                </button>
              </div>

              <div className="movie-grid">
                {col.movies && col.movies.length > 0 ? (
                  col.movies.map((movie) => (
                    <div key={movie.id} className="movie-grid-item">
                      <MovieCard
                        id={movie.id}
                        title={movie.title}
                        poster_path={movie.poster_path}
                        poster_url={movie.poster_url}
                        vote_average={movie.vote_average}
                      />
                      <button
                        className="remove-movie-btn"
                        onClick={() => handleRemoveMovieFromCol(col.id, movie.id)}
                        title="Listeden Çıkar"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-list-placeholder">
                    Bu liste henüz boş.
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
