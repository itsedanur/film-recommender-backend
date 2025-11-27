from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(pw: str):
    return pwd_context.hash(pw)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)
