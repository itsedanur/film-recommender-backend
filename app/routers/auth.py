from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.security import OAuth2PasswordBearer

from app.db import get_db
from app.models.users import User
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token, decode_access_token
from app.schemas.auth import UserRegister, UserLogin, Token
from app.schemas.users import UserOut

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# --------------------------------------------------------------------
# CURRENT USER UTILITY
# --------------------------------------------------------------------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):

    payload = decode_access_token(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# --------------------------------------------------------------------
# REGISTER
# --------------------------------------------------------------------
@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):

    # email exists?
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already exists")

    # username exists?
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(400, "Username already exists")

    # create user
    new_user = User(
        username=data.username,
        email=data.email,
        name=data.username,    # otomatik doldur
        hashed_password=hash_password(data.password)
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "User creation failed")

    # create token
    token = create_access_token({"user_id": new_user.id})
    return Token(access_token=token, token_type="bearer")


# --------------------------------------------------------------------
# LOGIN
# --------------------------------------------------------------------
@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(400, "Invalid email or password")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(400, "Invalid email or password")

    token = create_access_token({"user_id": user.id})
    return Token(access_token=token, token_type="bearer")


# --------------------------------------------------------------------
# GET CURRENT LOGGED-IN USER
# --------------------------------------------------------------------
@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
