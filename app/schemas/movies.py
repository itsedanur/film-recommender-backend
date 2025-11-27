from pydantic import BaseModel, ConfigDict

# Ortak alanlar
class MovieBase(BaseModel):
    title: str
    genre: str | None = None
    description: str | None = None
    poster_url: str | None = None   # ←←← EKLENDİ !!!

# Film oluşturma
class MovieCreate(MovieBase):
    pass

# Dışa dönen response modeli
class MovieOut(MovieBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
