from pydantic import BaseModel

class UserBase(BaseModel):
    username: str | None = None
    email: str | None = None
    name: str | None = None

class UserUpdate(UserBase):
    password: str | None = None


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    name: str | None

    class Config:
        from_attributes = True
