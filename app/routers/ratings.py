# ...existing code...
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.rating import Rating
from app.schemas.ratings import RatingCreate

router = APIRouter(prefix="/ratings", tags=["Ratings"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_rating(data: RatingCreate, db: Session = Depends(get_db)):
    # TODO: gerçek kullanıcı id'sini auth'dan al; şu an 1 geçici
    new_rating = Rating(score=data.score, movie_id=data.movie_id, user_id=1)
    db.add(new_rating)
    try:
        db.commit()
        db.refresh(new_rating)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="DB constraint error")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")

    return {"message": "Rating added", "id": new_rating.id}