from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.review import Review
from app.schemas.reviews import ReviewCreate

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_review(data: ReviewCreate, db: Session = Depends(get_db)):
    # TODO: gerçek kullanıcı id'sini auth'dan al; şu an 1 geçici
    new_review = Review(text=data.text, movie_id=data.movie_id, user_id=1)
    db.add(new_review)
    try:
        db.commit()
        db.refresh(new_review)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="DB constraint error")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")

    return {"message": "Review  added", "id": new_review.id}