import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import "../components/MovieCard.css";

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${API_URL}/movies/`);
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error("API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [API_URL]);

  if (loading) return <h2 style={{ color: "white" }}>Loading movies...</h2>;

  return (
    <div className="container">
      <h1 className="page-title">🎬 Movie List</h1>

      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default MovieList;
