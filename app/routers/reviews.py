# app/routers/reviews.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.review import Review
from app.models.movie import Movie
from app.models.users import User
from app.utils.nlp import is_clean_text
from app.core.jwt import get_current_user
from app.services.nlp_filter import is_clean
from app.db import SessionLocal
from app.db import get_db


router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/add/{movie_id}")
def add_review(movie_id: int, text: str, 
               db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):

    if not is_clean(text):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yorumunuz argo veya uygunsuz içerik barındırıyor."
        )

    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Film bulunamadı")

    review = Review(text=text, user_id=current_user.id, movie_id=movie_id)
    db.add(review)
    db.commit()
    db.refresh(review)

    return {"message": "Yorum eklendi", "review": review}


@router.get("/{movie_id}")
def get_movie_reviews(movie_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(
        Review.movie_id == movie_id
    ).order_by(Review.created_at.desc()).all()
    
    # Return with User info
    results = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        results.append({
            "id": r.id,
            "text": r.text,
            "created_at": r.created_at, # datetime objesi, JSON response'da oto string olur
            "user": {
                "username": user.username if user else "Anonim"
            }
        })
    return results
