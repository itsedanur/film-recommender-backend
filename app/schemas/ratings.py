# app/schemas/ratings.py
from pydantic import BaseModel, conint


class RatingCreate(BaseModel):
    score: conint(ge=1, le=5)  # 1–5 arası puan
    movie_id: int
