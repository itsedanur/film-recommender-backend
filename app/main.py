from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi

from app.routers import auth, users, movies, ratings, reviews, lists, admin
from app.database import Base, engine, SessionLocal

# Poster ve film ekleme fonksiyonları
from app.init_data import update_movie_posters
from app.services.tmdb_import import add_movies_to_db


# ================================
# FASTAPI APP
# ================================
app = FastAPI(title="Film Recommender API", version="1.0.0")


# ================================
# CORS SETTINGS
# ================================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================================
# DATABASE
# ================================
Base.metadata.create_all(bind=engine)


# ================================
# JWT CONFIG FOR SWAGGER
# ================================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def custom_openapi():
    """
    Swagger'a Bearer Token (JWT) güvenlik şeması ekler.
    Bu sayede sağ üstte "Authorize" butonu görünür.
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Film Recommender API",
        version="1.0.0",
        routes=app.routes,
    )

    # Security Scheme tanımı ekle
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # Tüm endpointlere BearerAuth ekle (opsiyonel)
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


# ================================
# STARTUP EVENT
# ================================
@app.on_event("startup")
def startup_event():
    """
    Backend açıldığında:
    1) Popüler filmleri TMDB’den çeker ve DB'ye ekler
    2) Poster günceller
    """

    print("🎬 TMDB popüler filmler çekiliyor...")
    add_movies_to_db()   # ❗ Parametresiz
    print("🎯 TMDB film import tamamlandı!")

    update_movie_posters()
    print("🔥 Poster güncelleme tamamlandı!")


# ================================
# ROUTERS
# ================================
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(movies.router)
app.include_router(ratings.router)
app.include_router(reviews.router)
app.include_router(lists.router)
app.include_router(admin.router)


# ================================
# ROOT
# ================================
@app.get("/")
def home():
    return {"message": "Film Recommender Backend Running!"}
