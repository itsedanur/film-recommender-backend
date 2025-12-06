from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.db import get_db




from app.models.movie import Movie
from app.models.like import Like
from app.models.rating import Rating
from app.core.security import get_current_user
from app.recommender.content import recommend_by_content

router = APIRouter(prefix="/recommend", tags=["Recommend"])


@router.get("/ai")
def ai_recommend(db: Session = Depends(get_db)):
    movies = db.query(Movie).all()
    return recommend_by_content(movies, top_n=20)


# ---- 👇 YENİ: Kullanıcıya özel ----
@router.get("/user")
def user_recommend(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1) Kullanıcının beğendiği / yüksek puan verdiği filmler
    liked_ids = [
        l.movie_id
        for l in db.query(Like).filter(Like.user_id == current_user.id).all()
    ]

    high_rated_ids = [
        r.movie_id
        for r in db.query(Rating)
        .filter(Rating.user_id == current_user.id, Rating.score >= 4)
        .all()
    ]

    base_ids = list(set(liked_ids + high_rated_ids))

    # Eğer hiç etkileşim yoksa: en popüler filmlerden ver
    if not base_ids:
        movies = (
            db.query(Movie)
            .order_by(Movie.popularity.desc())
            .limit(20)
            .all()
        )
        return [
            {
                "id": m.id,
                "title": m.title,
                "poster_path": m.poster_path,
                "vote_average": m.vote_average,
            }
            for m in movies
        ]

    # 2) Bu filmlerden içerik tabanlı öneri
    seed_movies = db.query(Movie).filter(Movie.id.in_(base_ids)).all()
    all_movies = db.query(Movie).all()

    # basitçe tüm filmlerden content-based öneri alıyoruz
    from app.recommender.content import recommend_by_content

    content_recs = recommend_by_content(all_movies, top_n=50)

    # Kullanıcının zaten gördüklerini filtrele
    seen_ids = set(base_ids)
    result = [m for m in content_recs if m["id"] not in seen_ids][:20]

    return result


# ---- 👇 Yeni: Bir filme göre öneri (content-based) ----
@router.get("/{movie_id}")
def recommend_for_movie(movie_id: int, db: Session = Depends(get_db)):
    # 1) Verilen filmi al
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        return {"error": "Film bulunamadı."}

    # 2) Tüm filmleri al
    all_movies = db.query(Movie).all()

    # 3) Content-based öneri üret
    from app.recommender.content import recommend_by_content
    recommendations = recommend_by_content(
        all_movies,
        seed_movie=movie,
        top_n=20
    )

    # 4) Kendini listeden çıkar
    filtered = [m for m in recommendations if m["id"] != movie_id]

    # İlk 10 öneriyi dön
    return filtered[:10]

@router.get("/{movie_id}")
def recommend_for_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        return {"error": "Film bulunamadı."}

    all_movies = db.query(Movie).all()

    from app.recommender.content import recommend_by_content
    recommendations = recommend_by_content(
        all_movies,
        seed_movie=movie,
        top_n=20
    )

    return recommendations[:10]

