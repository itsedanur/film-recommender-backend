import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import "./Home.css";

function Home() {
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/movies/popular")
      .then(res => res.json())
      .then(data => setPopular(data));

    fetch("http://localhost:8000/movies/top")
      .then(res => res.json())
      .then(data => setTopRated(data));

    fetch("http://localhost:8000/movies/upcoming")
      .then(res => res.json())
      .then(data => setUpcoming(data));
  }, []);

  return (
    <div className="home-container">

      <section className="section">
        <h2 className="section-title">🔥 Trend Filmler</h2>
        <div className="movie-grid">
          {popular.map(movie => (
            <MovieCard
              key={movie.id}
              id={movie.id}     // ⭐ eklendi
              title={movie.title}
              poster={movie.poster}
              rating={movie.rating}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">⭐ En Çok Oy Alanlar</h2>
        <div className="movie-grid">
          {topRated.map(movie => (
            <MovieCard
              key={movie.id}
              id={movie.id}     // ⭐ eklendi
              title={movie.title}
              poster={movie.poster}
              rating={movie.rating}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🎬 Yakında Gösterimde</h2>
        <div className="movie-grid">
          {upcoming.map(movie => (
            <MovieCard
              key={movie.id}
              id={movie.id}     // ⭐ eklendi
              title={movie.title}
              poster={movie.poster}
              rating={movie.rating}
            />
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;
