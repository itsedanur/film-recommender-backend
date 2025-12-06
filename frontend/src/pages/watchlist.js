import React, { useEffect, useState } from "react";

export default function WatchList() {
  const [liked, setLiked] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("http://localhost:8000/user/collections", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await res.json();

      // film ID listesini alınca gerçek film verilerini çekiyoruz
      const likedMovies = await Promise.all(
        data.liked.map((id) => fetch(`http://localhost:8000/movies/${id}`).then(r => r.json()))
      );

      const listMovies = await Promise.all(
        data.watchlist.map((id) => fetch(`http://localhost:8000/movies/${id}`).then(r => r.json()))
      );

      setLiked(likedMovies);
      setWatchlist(listMovies);
    }

    load();
  }, []);

  return (
    <div className="watchlist-page">
      <h1>Koleksiyonların</h1>

      <h2>❤️ Beğendiğin Filmler</h2>
      <div className="grid">
        {liked.length === 0 ? <p>Henüz beğendiğin film yok.</p> :
          liked.map((m) => (
            <div key={m.id} className="watch-card">
              <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} />
              <p>{m.title}</p>
            </div>
          ))
        }
      </div>

      <h2>📌 İzleme Listen</h2>
      <div className="grid">
        {watchlist.length === 0 ? <p>Listen boş.</p> :
          watchlist.map((m) => (
            <div key={m.id} className="watch-card">
              <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} />
              <p>{m.title}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}
