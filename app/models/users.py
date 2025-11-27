from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)   # <-- DOĞRU ALAN
    name = Column(String, nullable=True)               # <-- İsim alanı

    # ilişkiler
    reviews = relationship("Review", back_populates="user")
    ratings = relationship("Rating", back_populates="user")
    lists = relationship("ListItem", back_populates="user")
