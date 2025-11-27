# ...existing code...
from pydantic import BaseModel
from typing import Optional

    
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    name: Optional[str] = None   # zorunlu değil yapıldı
    

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
# ...existing code...