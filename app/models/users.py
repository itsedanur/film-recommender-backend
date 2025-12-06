from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # kullanıcı bilgileri
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)


    # Şifre artık hashed_password olarak saklanıyor
    hashed_password = Column(String, nullable=False)

    is_admin = Column(Integer, default=0)

    # ilişkiler
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    lists = relationship("ListItem", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
