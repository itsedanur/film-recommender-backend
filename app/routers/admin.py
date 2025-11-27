# app/routers/admin.py
from fastapi import APIRouter, HTTPException, status

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Basit kontrol
@router.get("/")
def admin_panel():
    return {"message": "Admin paneline hoş geldiniz!"}

# Film ekleme örneği
@router.post("/add-movie")
def add_movie(title: str, genre: str):
    if len(title.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Film ismi en az 2 karakter olmalıdır."
        )
    return {"title": title, "genre": genre, "status": "Film başarıyla eklendi"}

# Kullanıcı silme örneği
@router.delete("/delete-user/{user_id}")
def delete_user(user_id: int):
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz kullanıcı ID"
        )
    return {"user_id": user_id, "status": "Kullanıcı silindi"}
