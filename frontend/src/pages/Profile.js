import React, { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile() {
  const [collections, setCollections] = useState({ liked: [], watchlist: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:8000/user/collections", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          console.error("API ERROR:", res.status);
          setCollections({ liked: [], watchlist: [] });
          setLoading(false);
          return;
        }

        const data = await res.json();

        setCollections({
          liked: Array.isArray(data.liked) ? data.liked : [],
          watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
        });
      } catch (error) {
        console.error("Fetch ERROR:", error);
        setCollections({ liked: [], watchlist: [] });
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="profile-page">Yükleniyor...</div>;

  return (
    <div className="profile-page">
      <h1>Koleksiyonların</h1>

      {/* Beğenilenler */}
      <section>
        <h2>❤️ Beğendiğin Filmler</h2>
        {collections.liked.length === 0 ? (
          <p style={{ color: "#bbb" }}>Henüz beğenilmiş film yok.</p>
        ) : (
          <div className="grid">
            {collections.liked.map((m) => (
              <div className="movie-card" key={m.id}>
                <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} />
                <p>{m.title}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Watchlist */}
      <section>
        <h2>📌 İzleme Listen</h2>
        {collections.watchlist.length === 0 ? (
          <p style={{ color: "#bbb" }}>Listen boş.</p>
        ) : (
          <div className="grid">
            {collections.watchlist.map((m) => (
              <div className="movie-card" key={m.id}>
                <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} />
                <p>{m.title}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
