import React from "react";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

function MovieCard({ id, title, poster, rating }) {
  const navigate = useNavigate();

  return (
    <div
      className="movie-card"
      onClick={() => navigate(`/movies/${id}`)}
    >
      <img
        src={poster}
        className="movie-poster"
        alt={title}
      />
      <div className="movie-info">
        <h3 className="movie-title">{title}</h3>
        <p className="movie-rating">{rating ?? "Unknown"}</p>
      </div>
    </div>
  );
}

export default MovieCard;
