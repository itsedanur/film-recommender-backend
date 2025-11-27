# ...existing code...
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_V4_TOKEN = os.getenv("TMDB_V4_TOKEN")

HEADERS = {"accept": "application/json"}
if TMDB_V4_TOKEN:
    HEADERS["Authorization"] = f"Bearer {TMDB_V4_TOKEN}"

def fetch_popular_movies(retries: int = 3, backoff: float = 1.0):
    """TMDB popüler filmleri çeker. Öncelikle V4 token, yoksa v3 api_key kullan."""
    url = "https://api.themoviedb.org/3/movie/popular"
    params = {"language": "en-US", "page": 1}
    # Eğer v3 api key varsa parametreye ekle
    if TMDB_API_KEY:
        params["api_key"] = TMDB_API_KEY

    if not TMDB_V4_TOKEN and not TMDB_API_KEY:
        print("❌ Ne TMDB_V4_TOKEN ne de TMDB_API_KEY bulunamadı! .env veya ortam değişkenini kontrol et.")
        return []

    # ...mevcut retry/requests kodunu aynen kullan...
    attempt = 0
    while attempt < retries:
        try:
            resp = requests.get(url, headers=HEADERS if TMDB_V4_TOKEN else None, params=params, timeout=10)
            resp.raise_for_status()
            return resp.json().get("results", [])
        except RequestException as e:
            print(f"❌ TMDB isteği başarısız (deneme {attempt+1}/{retries}): {e}")
            time.sleep(backoff * (attempt + 1))
            attempt += 1

    print("❌ TMDB'e ulaşılamadı; tüm denemeler başarısız.")
    return []
# ...existing code...