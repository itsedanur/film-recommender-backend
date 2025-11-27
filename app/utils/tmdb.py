import os
import requests

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

TMDB_V4_TOKEN = os.getenv("TMDB_V4_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {TMDB_V4_TOKEN}",
    "accept": "application/json"
}

def get_poster_url(title: str):
    if not TMDB_V4_TOKEN:
        print("❌ TMDB_V4_TOKEN bulunamadı!")
        return None

    url = f"https://api.themoviedb.org/3/search/movie?query={title}&include_adult=false&language=en-US&page=1"

    response = requests.get(url, headers=HEADERS).json()

    results = response.get("results")
    if results and len(results) > 0:
        poster_path = results[0].get("poster_path")
        if poster_path:
            return f"https://image.tmdb.org/t/p/w500{poster_path}"

    return None
