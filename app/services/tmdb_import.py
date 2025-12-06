# app/services/tmdb_import.py

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_V4_TOKEN = os.getenv("TMDB_V4_TOKEN")

HEADERS_V4 = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_V4_TOKEN}"
}


# ---------------------------
# ⭐ TR FULL MOVIE DETAILS
# ---------------------------
def fetch_movie_full(tmdb_id):
    """Filmin Türkçe overview + genre + poster + title bilgilerini çeker"""
    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "tr-TR"
    }

    try:
        res = requests.get(url, params=params).json()

        return {
            "title": res.get("title"),
            "overview": res.get("overview"),
            "poster_path": res.get("poster_path"),
            "genres": res.get("genres", []),
            "release_date": res.get("release_date"),
            "vote_average": res.get("vote_average"),
            "vote_count": res.get("vote_count"),
            "popularity": res.get("popularity"),
        }
    except:
        print("❌ TR detay alınamadı:", tmdb_id)
        return None


# ---------------------------
# ⭐ Popüler Filmler (TR)
# ---------------------------
def fetch_popular_movies():
    if not TMDB_V4_TOKEN:
        print("❌ TMDB_V4_TOKEN yok!")
        return []

    url = "https://api.themoviedb.org/3/movie/popular"
    params = {
        "language": "tr-TR",
        "page": 1
    }

    try:
        resp = requests.get(url, params=params, headers=HEADERS_V4)
        resp.raise_for_status()
        return resp.json().get("results", [])
    except Exception as e:
        print(f"❌ Popüler film API hatası: {e}")
        return []


# ---------------------------
# ⭐ Upcoming Filmler (TR)
# ---------------------------
def fetch_upcoming_movies():
    if not TMDB_V4_TOKEN:
        print("❌ TMDB_V4_TOKEN yok!")
        return []

    url = "https://api.themoviedb.org/3/movie/upcoming"

    params = {
        "language": "tr-TR",
        "region": "TR",
        "page": 1
    }

    try:
        resp = requests.get(url, params=params, headers=HEADERS_V4)
        resp.raise_for_status()
        return resp.json().get("results", [])
    except Exception as e:
        print(f"❌ Upcoming API hatası: {e}")
        return []


# ---------------------------
# ⭐ Filmleri Veritabanına Ekle
# ---------------------------
def add_movies_to_db(db, Movie):
    print("🎬 TMDB popüler filmler çekiliyor...")

    popular = fetch_popular_movies()
    upcoming = fetch_upcoming_movies()

    all_movies = popular + upcoming
    added = 0

    for m in all_movies:
        tmdb_id = m.get("id")
        if not tmdb_id:
            continue

        # Film zaten ekli mi?
        if db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first():
            continue

        # ⭐ TR FULL DETAY
        full = fetch_movie_full(tmdb_id)
        if not full:
            continue

        movie = Movie(
            tmdb_id=tmdb_id,
            title=full["title"],
            overview=full["overview"],
            poster_path=full["poster_path"],
            release_date=full["release_date"],
            popularity=full["popularity"],
            vote_average=full["vote_average"],
            vote_count=full["vote_count"],
            genres=json.dumps(full["genres"])  # ⭐ Genre artık boş değil!
        )

        db.add(movie)
        added += 1

    db.commit()

    print(f"🔥 {added} film TR + genre + overview ile eklendi.")
    print("🎯 TMDB import tamamlandı!")
