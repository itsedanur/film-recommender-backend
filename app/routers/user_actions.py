from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_collections import UserLikedMovie, UserWatchList
from app.models.movie import Movie

router = APIRouter(prefix="/user", tags=["User Actions"])


# ❤️ BEĞEN
@router.post("/like/{movie_id}")
def like_movie(movie_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):

    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(404, "Film bulunamadı")

    exists = db.query(UserLikedMovie).filter_by(
        user_id=user.id, movie_id=movie_id
    ).first()

    if exists:
        return {"message": "Zaten beğenmişsin ❤️"}

    new_like = UserLikedMovie(user_id=user.id, movie_id=movie_id)
    db.add(new_like)
    db.commit()

    return {"message": "Beğenildi ❤️"}


# 📌 LİSTEYE EKLE
@router.post("/watchlist/{movie_id}")
def add_watchlist(movie_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):

    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(404, "Film bulunamadı")

    exists = db.query(UserWatchList).filter_by(
        user_id=user.id, movie_id=movie_id
    ).first()

    if exists:
        return {"message": "Zaten listede 📌"}

    new_item = UserWatchList(user_id=user.id, movie_id=movie_id)
    db.add(new_item)
    db.commit()

    return {"message": "Listeye eklendi 📌"}


# 📚 TÜM KOLEKSİYONLAR (BEĞENİLEN + İZLEME LİSTESİ)
@router.get("/collections")
def user_collections(user=Depends(get_current_user), db: Session = Depends(get_db)):

    liked = db.query(UserLikedMovie).filter(UserLikedMovie.user_id == user.id).all()
    watchlist = db.query(UserWatchList).filter(UserWatchList.user_id == user.id).all()

    return {
        "liked": [l.movie_id for l in liked],
        "watchlist": [w.movie_id for w in watchlist],
    }
