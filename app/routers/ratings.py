# app/routers/ratings.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db import SessionLocal
from app.db import get_db

from app.core.jwt import decode_access_token, get_current_user




from app.models.rating import Rating
from app.schemas.ratings import RatingCreate
from app.routers.auth import oauth2_scheme


router = APIRouter(prefix="/ratings", tags=["Ratings"])


@router.post("/add", status_code=status.HTTP_201_CREATED)
def add_rating(
    data: RatingCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """
    Belirli bir filme, giriş yapmış kullanıcı için puan ekler.
    Aynı kullanıcı aynı filme tekrar puan vermeye çalışırsa 400 döner.
    """
    # TODO: Gerçek uygulamada token'dan user_id çıkar
    # Şimdilik, login sistemi tam oturana kadar place­holder:
    try:
        payload = decode_token(token)
        user_id = payload.get("id")
    except Exception:
        # En kötü ihtimal fallback
        user_id = 1

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bilgisi alınamadı.",
        )

    new_rating = Rating(
        score=data.score,
        movie_id=data.movie_id,
        user_id=user_id,
    )
    db.add(new_rating)

    try:
        db.commit()
        db.refresh(new_rating)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu filme bu kullanıcı tarafından zaten puan verilmiş olabilir.",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sunucu hatası: Puan kaydedilemedi. Detay: {e}",
        )

    return {"message": "Rating added", "id": new_rating.id}
