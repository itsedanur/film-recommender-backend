import React from "react";
import { Link } from "react-router-dom";
import "./MovieCard.css";

export default function MovieCard({ id, title, poster_path, vote_average }) {
  return (
    <Link to={`/movies/${id}`} className="movie-card">
      <div className="poster-wrap">
        <img
          src={`https://image.tmdb.org/t/p/w500${poster_path}`}
          alt={title}
          className="poster"
        />
        <span className="rating">⭐ {vote_average?.toFixed(1)}</span>
      </div>

      <h3 className="movie-title">{title}</h3>
    </Link>
  );
}
