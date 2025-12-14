from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # kullanıcı bilgileri
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True) # 🔥 YENİ: Profil Fotoğrafı


    # Şifre artık hashed_password olarak saklanıyor
    hashed_password = Column(String, nullable=False)

    is_admin = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Verification
    is_verified = Column(Integer, default=0) # Using Integer for consistency (0/1) or Boolean if supported by DB
    verification_token = Column(String, nullable=True)

    # ilişkiler
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    lists = relationship("ListItem", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="user", cascade="all, delete-orphan")
    watched = relationship("Watched", back_populates="user", cascade="all, delete-orphan") # 🔥 YENİ: İzlediklerim
