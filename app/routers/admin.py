from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.db import get_db





from app.models.users import User
from app.models.movie import Movie
from app.models.rating import Rating
from app.models.like import Like
from app.core.security import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])


def verify_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user


@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(verify_admin),
):
    user_count = db.query(User).count()
    movie_count = db.query(Movie).count()
    rating_count = db.query(Rating).count()
    like_count = db.query(Like).count()

    # En çok beğenilen 5 film
    top_liked = (
        db.query(Movie, Like)
        .join(Like, Movie.id == Like.movie_id)
        .group_by(Movie.id)
        .order_by(db.func.count(Like.id).desc())
        .limit(5)
        .all()
    )

    top_liked_movies = [
        {
            "id": m.id,
            "title": m.title,
        }
        for (m, _) in top_liked
    ]

    return {
        "users": user_count,
        "movies": movie_count,
        "ratings": rating_count,
        "likes": like_count,
        "top_liked": top_liked_movies,
    }
