# ...existing code...
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.list import ListItem
from app.schemas.lists import ListCreate

router = APIRouter(prefix="/lists", tags=["Lists"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_list_item(data: ListCreate, db: Session = Depends(get_db)):
    # TODO: gerçek kullanıcı id'sini auth'dan al; şu an 1 geçici
    item = ListItem(movie_id=data.movie_id, type=data.type, user_id=1)
    db.add(item)
    try:
        db.commit()
        db.refresh(item)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="DB constraint error")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")

    return {"message": "Added to list", "id": item.id}
# ...existing code...