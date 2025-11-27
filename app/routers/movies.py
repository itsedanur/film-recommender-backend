from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.movie import Movie
from app.schemas.movies import MovieOut

router = APIRouter(prefix="/movies", tags=["Movies"])


# -------------------------
# TÜM FİLMLER
# -------------------------
@router.get("/", response_model=list[MovieOut])
def list_movies(db: Session = Depends(get_db)):
    return db.query(Movie).all()


# -------------------------
# POPULAR (TREND) FİLMLER
# -------------------------
@router.get("/popular", response_model=list[MovieOut])
def get_popular_movies(db: Session = Depends(get_db)):
    movies = db.query(Movie).order_by(Movie.popularity.desc()).limit(20).all()
    return movies


# -------------------------
# EN ÇOK OY ALANLAR
# -------------------------
@router.get("/top", response_model=list[MovieOut])
def get_top_rated_movies(db: Session = Depends(get_db)):
    movies = db.query(Movie).order_by(Movie.rating.desc()).limit(20).all()
    return movies


# -------------------------
# YAKINDA GÖSTERİME GİRECEKLER
# -------------------------
@router.get("/upcoming", response_model=list[MovieOut])
def get_upcoming_movies(db: Session = Depends(get_db)):
    movies = db.query(Movie).filter(Movie.release_date > "2025-01-01").limit(20).all()
    return movies


# -------------------------
# TEK FİLM DETAY
# -------------------------
@router.get("/{movie_id}", response_model=MovieOut)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie
