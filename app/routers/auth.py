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



def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):

    payload = decode_access_token(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş oturum")

    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    return user



import os
import uuid  
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr

load_dotenv() 


conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAILTRAP_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAILTRAP_PASSWORD"),
    MAIL_FROM = os.getenv("MAIL_FROM", "no-reply@filmrecommender.com"),
    MAIL_PORT = int(os.getenv("MAILTRAP_PORT", 2525)),
    MAIL_SERVER = os.getenv("MAILTRAP_HOST", "sandbox.smtp.mailtrap.io"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_verification_email(email: str, token: str):
    verification_link = f"http://localhost:8000/auth/verify-email?token={token}"
    
    html = f"""
    <p>Merhaba,</p>
    <p>Hesabını doğrulamak için lütfen aşağıdaki linke tıkla:</p>
    <p><a href="{verification_link}">{verification_link}</a></p>
    <p>FilmRec Ekibi</p>
    """

    message = MessageSchema(
        subject="FilmRec Doğrulama",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    
    print(f"📧 SMTP DEBUG: Host={conf.MAIL_SERVER} Port={conf.MAIL_PORT} User={conf.MAIL_USERNAME} SSL={conf.MAIL_SSL_TLS}")

    try:
        await fm.send_message(message)
        print("SMTP Mail sent successfully via Mailtrap Sandbox")
    except Exception as e:
        print(f"SMTP Mail sending failed: {e}")
    
   
    print(f"\n{'='*40}")
    print(f"DOĞRULAMA LİNKİ (DEBUG):")
    print(f"{verification_link}")
    print(f"{'='*40}\n")
    

@router.post("/register")
async def register(data: UserRegister, db: Session = Depends(get_db)):

    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Bu e-posta adresi zaten kullanımda")

   
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(400, "Bu kullanıcı adı zaten kullanımda")

    token = str(uuid.uuid4())

    new_user = User(
        username=data.username,
        email=data.email,
        name=data.username,
        hashed_password=hash_password(data.password),
        is_verified=0,  
        verification_token=token
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Send Mail (Async)
        await send_verification_email(new_user.email, token)
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "Kullanıcı oluşturulurken hata oluştu")
    except Exception as e:
       
        print(f"Mail Error: {e}")
        # pass

    return {"msg": "Kayıt başarılı! Lütfen e-postanızı kontrol edip doğrulama işlemini tamamlayın."}




@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(400, "Geçersiz token")
        
    if user.is_verified:
        return {"msg": "Hesap zaten doğrulanmış"}
        
    user.is_verified = 1
    user.verification_token = None # Invalidate token
    db.commit()
    
    return {"msg": "Hesap başarıyla doğrulandı! Şimdi giriş yapabilirsiniz."}



@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(400, "Geçersiz e-posta veya şifre")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(400, "Geçersiz e-posta veya şifre")
        
   
    if not user.is_verified:
         raise HTTPException(400, "Lütfen önce e-posta adresinizi doğrulayın.")

    token = create_access_token({"user_id": user.id})
    return Token(access_token=token, token_type="bearer")



@router.put("/avatar")
def update_avatar(body: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    avatar_url = body.get("avatar_url")
    if not avatar_url:
        raise HTTPException(400, "Avatar URL gerekli")
    
    current_user.avatar_url = avatar_url
    db.commit()
    return {"msg": "Profil fotoğrafı güncellendi", "avatar_url": avatar_url}



@router.delete("/me")
def delete_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"msg": "Hesap başarıyla silindi"}




@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
