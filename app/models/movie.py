from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    genre = Column(String)
    description = Column(Text)
    poster_url = Column(String)

    ratings = relationship("Rating", back_populates="movie")
    reviews = relationship("Review", back_populates="movie")

    # 🔥 EKLENMESİ GEREKEN
    lists = relationship("ListItem", back_populates="movie")
