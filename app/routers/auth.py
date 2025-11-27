# ...existing code...
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import jwt, JWTError

from app.database import get_db
from app.models.users import User


from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token, SECRET_KEY, ALGORITHM
from app.schemas.auth import UserRegister, UserLogin, Token

router = APIRouter(prefix="/auth", tags=["Auth"])


# ==========================
# REGISTER
# ==========================
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already exists")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(400, "Username already exists")

    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        name=data.name,
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "User creation failed due to DB constraint")
    except Exception:
        db.rollback()
        raise HTTPException(500, "Internal Server Error")

    token = create_access_token({"id": new_user.id})
    return Token(access_token=token)


# ==========================
# LOGIN
# ==========================
@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(400, "Invalid email or password")

    token = create_access_token({"id": user.id})
    return Token(access_token=token)


# ==========================
# GET CURRENT USER /auth/me
# ==========================
@router.get("/me")
def get_me(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """
    Returns current logged-in user.
    Requires: Authorization: Bearer <token>
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
    except JWTError:
        raise HTTPException(401, "Invalid token")

    if not user_id:
        raise HTTPException(401, "Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": user.name,
    }
# ...existing code...