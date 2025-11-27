from pydantic import BaseModel

class ListCreate(BaseModel):
    movie_id: int
    type: str
