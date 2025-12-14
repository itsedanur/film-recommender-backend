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
        # Fallback to DB
        try:
            directors = json.loads(movie.directors) if movie.directors else [{"name": "Bilinmiyor"}]
        except:
            directors = [{"name": "Bilinmiyor"}]

    # CAST
    if tmdb_extra and tmdb_extra.get("cast"):
        cast = tmdb_extra["cast"]
    else:
        # Fallback to DB
        try:
            cast = json.loads(movie.cast) if movie.cast else []
        except:
            cast = []

    # GENRES
    try:
        raw_genres = json.loads(movie.genres) if movie.genres else []
    except:
        raw_genres = []

    # FIX: Eğer liste stringlerden oluşuyorsa (Manuel eklenenler: ["Komedi"]) -> Dict listesine çevir
    if raw_genres and isinstance(raw_genres, list) and len(raw_genres) > 0 and isinstance(raw_genres[0], str):
        genres = [{"id": 0, "name": g} for g in raw_genres]
    else:
        genres = raw_genres

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
        trailer_url=getattr(movie, "trailer_url", None), # Map new field
        backdrop_path=getattr(movie, "backdrop_path", None), # Add backdrop support if model has it, or handle cleanly

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
    from sqlalchemy import or_
    movies = db.query(Movie).filter(
        or_(
            Movie.title.ilike(f"%{query}%"),
            Movie.cast.ilike(f"%{query}%"),
            Movie.directors.ilike(f"%{query}%")
        )
    ).all()
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

    # KULLANILAN MANTIK: Gelişmiş İçerik Tabanlı Öneri (TF-IDF + Cast + Director + Genre)
    from app.recommender.content import recommend_by_content
    
    # Tüm filmleri (veya geniş bir havuzu) çekelim
    # Gerçek canlıda her requestte 1500 film çekmek yavaş olabilir ama 1500 film için sorun değil.
    # Optimizasyon için: Cache mekanizması eklenebilir.
    
    all_movies_pool = db.query(Movie).all()
    
    recommendations = recommend_by_content(all_movies_pool, seed_movie=movie, top_n=6)
    
    # Model dönüşümü
    results = []
    for r in recommendations:
        # movie ID'sinden DB objesini bul (veya recommendations zaten data içeriyor)
        # recommend_by_content dict dönüyor, biz DB object arıyoruz convert için
        m_obj = next((m for m in all_movies_pool if m.id == r['id']), None)
        if m_obj:
            results.append(convert(m_obj))
            
    return results
