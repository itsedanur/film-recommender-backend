# app/routers/movies.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.models.movie import Movie
from app.schemas.movies import MovieOut
from app.db import get_db
from app.utils.tmdb import get_movie_details, get_movie_stats
from app.services.tmdb_import import fetch_upcoming_movies

router = APIRouter(prefix="/movies", tags=["Movies"])


# -----------------------------
#  UNIVERSAL CONVERT FUNCTION
# -----------------------------
def convert(movie: Movie, tmdb_extra=None):

    # DIRECTOR
    if tmdb_extra and tmdb_extra.get("director"):
        directors = [{"name": tmdb_extra["director"]}]
    else:
        directors = [{"name": "Bilinmiyor"}]

    # CAST
    cast = tmdb_extra["cast"] if tmdb_extra and tmdb_extra.get("cast") else []

    # GENRES
    genres = json.loads(movie.genres) if movie.genres else []

    return MovieOut(
        id=movie.id,

        # Başlık
        title=(
            tmdb_extra.get("title")
            if (tmdb_extra and tmdb_extra.get("title"))
            else movie.title
        ),

        # ÖZET — TR veya veritabanı
        overview=(
            tmdb_extra.get("overview")
            if (tmdb_extra and tmdb_extra.get("overview"))
            else movie.overview
        ),

        # ⭐⭐ TR ÖZET — veritabanındaki otomatik çeviri
        overview_tr=movie.overview_tr,      # 🔥 en önemli satır

        poster_path=movie.poster_path,
        poster_url=movie.poster_url,

        release_date=(
            tmdb_extra.get("release_date")
            if (tmdb_extra and tmdb_extra.get("release_date"))
            else movie.release_date
        ),

        vote_average=movie.vote_average,
        vote_count=movie.vote_count,
        popularity=movie.popularity,

        genres=genres,
        cast=cast,
        directors=directors,
    )


# -----------------------------
# TÜM FİLMLER (1500+)
# -----------------------------
@router.get("/all", response_model=list[MovieOut])
def all_movies(db: Session = Depends(get_db)):
    movies = db.query(Movie).order_by(Movie.popularity.desc()).all()
    return [convert(m) for m in movies]


# -----------------------------
# POPÜLER (20)
# -----------------------------
@router.get("/popular", response_model=list[MovieOut])
def popular(db: Session = Depends(get_db)):
    movies = db.query(Movie).order_by(Movie.popularity.desc()).limit(20).all()
    return [convert(m) for m in movies]


# -----------------------------
# EN İYİLER (vote_average)
# -----------------------------
@router.get("/top", response_model=list[MovieOut])
def top_rated(db: Session = Depends(get_db)):
    movies = db.query(Movie).order_by(Movie.vote_average.desc()).limit(20).all()
    return [convert(m) for m in movies]


# -----------------------------
# YAKINDA (TMDB)
# -----------------------------
@router.get("/upcoming", response_model=list[MovieOut])
def upcoming():
    upcoming = fetch_upcoming_movies()

    return [
        MovieOut(
            id=m["id"],              # TMDB ID
            title=m["title"],
            overview=m.get("overview", ""),
            overview_tr=None,        # upcoming filmlerde yok
            poster_path=m.get("poster_path"),
            poster_url=None,
            release_date=m.get("release_date"),
            vote_average=m.get("vote_average"),
            vote_count=m.get("vote_count"),
            popularity=m.get("popularity"),
            genres=[],
            cast=[],
            directors=[],
        )
        for m in upcoming
    ]


# -----------------------------
# SEARCH
# -----------------------------
@router.get("/search/{query}", response_model=list[MovieOut])
def search(query: str, db: Session = Depends(get_db)):
    movies = db.query(Movie).filter(Movie.title.ilike(f"%{query}%")).all()
    return [convert(m) for m in movies]


# -----------------------------
# YAKINDA: TEK FİLM DETAY (TMDB)
# -----------------------------
@router.get("/upcoming/detail/{tmdb_id}")
def upcoming_detail(tmdb_id: int):
    detail = get_movie_details(tmdb_id)   # TR başlık + TR özet
    stats = get_movie_stats(tmdb_id)

    return {
        "id": tmdb_id,
        "title": detail.get("title"),
        "overview": detail.get("overview"),
        "overview_tr": None,
        "poster_path": detail.get("poster_path"),
        "release_date": detail.get("release_date"),
        "vote_average": stats.get("vote_average"),
        "vote_count": stats.get("vote_count"),
        "cast": detail.get("cast"),
        "directors": [{"name": detail.get("director")}],
    }


# -----------------------------
# VERİTABANI FİLM DETAY
# -----------------------------
@router.get("/{movie_id}", response_model=MovieOut)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()

    if not movie:
        raise HTTPException(404, "Movie not found")

    # TMDB’den güncel TR bilgiler
    tmdb_extra = get_movie_details(movie.tmdb_id)
    stats = get_movie_stats(movie.tmdb_id)

    if stats.get("vote_count") is not None:
        movie.vote_count = stats["vote_count"]

    if stats.get("vote_average") is not None:
        movie.vote_average = stats["vote_average"]

    db.commit()

    return convert(movie, tmdb_extra)
# -----------------------------
# BENZER FİLMLER (Genre-Based)
# -----------------------------
@router.get("/{movie_id}/similar", response_model=list[MovieOut])
def similar_movies(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(404, "Movie not found")

    # Türler yoksa benzerlik yapamayız → boş liste
    if not movie.genres:
        return []

    genres = json.loads(movie.genres)

    # Aynı türlerden en popüler 6 filmi çek
    movies = (
        db.query(Movie)
        .filter(Movie.id != movie_id)
        .filter(Movie.genres.like(f"%{genres[0]}%"))
        .order_by(Movie.popularity.desc())
        .limit(6)
        .all()
    )

    return [convert(m) for m in movies]
