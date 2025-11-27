import csv
from .database import SessionLocal
from .utils.tmdb import get_poster_url
from app.models.movie import Movie



# ❗ Bu fonksiyon CSV’den film eklemek içindir (ilk yükleme)
def import_movies():
    db = SessionLocal()

    with open("app/data/filmtv_movies.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            # Filmin daha önce eklenmiş olup olmadığını kontrol et
            existing = db.query(Movie).filter(Movie.title == row["title"]).first()
            if existing:
                continue  # aynı filmi tekrar ekleme

            poster = get_poster_url(row["title"])

            movie = Movie(
                title=row["title"],
                genre=row["genre"],
                description=row.get("plot") or row.get("notes") or "",
                poster_url=poster
            )

            db.add(movie)

    db.commit()



# ⭐ Bu fonksiyon asıl gerekli olan — mevcut kayıtların posterlerini günceller
def update_movie_posters():
    db = SessionLocal()
    movies = db.query(Movie).all()

    print(f"🎬 {len(movies)} film bulundu. Posterler güncelleniyor...")

    for movie in movies:
        if not movie.poster_url or movie.poster_url.strip() == "":
            poster = get_poster_url(movie.title)

            if poster:
                movie.poster_url = poster
                print(f"✔ Poster bulundu: {movie.title}")
            else:
                print(f"❌ Poster bulunamadı: {movie.title}")

    db.commit()
    print("🔥 Poster güncellemesi tamamlandı!")
