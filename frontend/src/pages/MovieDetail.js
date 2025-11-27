import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MovieDetail.css";
import { useAuth } from "../context/AuthContext";

function MovieDetail() {
  const { id } = useParams();
  const { token } = useAuth();

  const [movie, setMovie] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  // Film bilgilerini çek
  useEffect(() => {
    fetch(`${API_URL}/movies/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => console.error("Movie fetch error:", err));
  }, [API_URL, id]);

  // --- YORUM EKLEME ---
  const addComment = async () => {
    if (!comment.trim()) return;

    const res = await fetch(`${API_URL}/reviews/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie_id: id,
        text: comment,
      }),
    });

    if (res.ok) {
      alert("Yorum eklendi!");
      setComment("");
    } else {
      alert("Yorum eklenirken hata oluştu.");
    }
  };

  // --- BEĞENME ---
  const toggleLike = async () => {
    const res = await fetch(`${API_URL}/ratings/like/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) alert("Beğeni gönderildi ✔️");
  };

  // --- LİSTEYE EKLE ---
  const addToList = async () => {
    const res = await fetch(`${API_URL}/lists/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movie_id: id }),
    });
    if (res.ok) alert("Listeye eklendi ✔️");
  };

  if (loading) return <h2>Loading...</h2>;
  if (!movie) return <h2>Film bulunamadı.</h2>;

  return (
    <div className="movie-detail-container">
      {/* SOL TARAF POSTER */}
      <img src={movie.poster} alt={movie.title} className="detail-poster" />

      {/* SAĞ TARAF BİLGİ */}
      <div className="detail-info">
        <h1 className="detail-title">{movie.title}</h1>
        <p className="detail-genre">🎭 Tür: {movie.genre || "Bilinmiyor"}</p>
        <p className="detail-rating">⭐ {movie.rating || "0.0"}</p>

        {/* BUTONLAR */}
        <div className="detail-buttons">
          <button className="like-btn" onClick={toggleLike}>❤️ Beğen</button>
          <button className="save-btn" onClick={addToList}>➕ Listeye Ekle</button>
        </div>

        {/* YORUM ALANI */}
        <div className="comment-section">
          <h3>Yorum Yap</h3>
          <textarea
            className="comment-box"
            placeholder="Yorum yaz..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>

          <button className="comment-btn" onClick={addComment}>
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
