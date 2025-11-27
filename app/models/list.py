# ...existing code...
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ListItem(Base):
    __tablename__ = "lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    type = Column(String, nullable=True)

    user = relationship("User", back_populates="lists")
    movie = relationship("Movie", back_populates="lists")
# ...existing code...