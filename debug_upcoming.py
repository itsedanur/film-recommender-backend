
import os
import sys
from dotenv import load_dotenv

# Add project root to sys.path
sys.path.append(os.getcwd())

load_dotenv()

from app.services.tmdb_import import fetch_upcoming_movies

print("--- DEBUGGING FETCH_UPCOMING_MOVIES ---")
try:
    movies = fetch_upcoming_movies()
    print(f"Total movies found: {len(movies)}")
    for m in movies:
        print(f" - {m.get('title')} ({m.get('release_date')})")
except Exception as e:
    print(f"Error: {e}")
