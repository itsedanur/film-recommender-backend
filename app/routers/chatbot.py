
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db import get_db
from app.core.security import get_current_user_optional
from app.services.nlp_filter import is_clean
from app.services.recommendation import recommend_personal
from app.models.movie import Movie
from sqlalchemy import or_

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.post("/ask")
async def ask_chatbot(
    msg: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    text = msg.get("message", "").lower().strip()
    
    # 1. MODERATION
    if not is_clean(text):
        return {
            "reply": "Lütfen saygılı bir dil kullanalım. Size nasıl yardımcı olabilirim?",
            "action": "none"
        }

    # 2. GREETING
    if text in ["merhaba", "selam", "hi", "hello", "naber"]:
        return {
            "reply": "Merhaba! Ben FilmRec asistanıyım. Sana film önerebilir, teknik destek verebilir veya hesabınla ilgili yardımcı olabilirim. Ne istersin?",
            "action": "none"
        }

    # 3. PERSONAL RECOMMENDATION (Broadened)
    # "bana öner", "film öner", "ne izlesem", "tavsiye"
    recommendation_keywords = ["öner", "tavsiye", "ne izle", "zevkim", "benim için", "mood"]
    if any(k in text for k in recommendation_keywords):
        # Specific check to ensure it's not a specific genre request like "komedi öner" (handled below)
        # But actually, if "komedi" is present, we might want to prioritize genre search.
        # Let's check genre keywords first in the flow or check logic here.
        
        # If text has a genre, let the genre block handle it (skip this block)
        has_genre = any(g in text for g in ["aksiyon", "komedi", "dram", "bilim", "korku", "macera", "romantik", "animasyon", "suç"])
        if has_genre:
            pass # Fall through to Genre Search
        else:
            if not current_user:
                return {
                    "reply": "Sana özel öneriler sunabilmem için giriş yapman gerekiyor. Giriş yaparsan zevkini analiz edip harika filmler önerebilirim!",
                    "action": "login_redirect"
                }
            
            recs = recommend_personal(db, current_user.id)
            if not recs:
                # Fallback to popular if no personal data
                recs = db.query(Movie).order_by(Movie.popularity.desc()).limit(5).all()
                titles = ", ".join([m.title for m in recs])
                return {
                    "reply": "Henüz senin zevkini yeterince öğrenemedim ama şimdilik en popüler şu filmlere bakabilirsin:",
                     "movies": [{"id": m.id, "title": m.title, "poster": m.poster_url or m.poster_path} for m in recs]
                }
                
            titles = ", ".join([m.title for m in recs])
            return {
                "reply": f"Senin için seçtiklerim: {titles}. İyi seyirler!",
                "movies": [{"id": m.id, "title": m.title, "poster": m.poster_url or m.poster_path} for m in recs]
            }

    # 3.5 RANDOM / SURPRISE
    if "rastgele" in text or "şans" in text or "farketmez" in text or "sürpriz" in text:
        from sqlalchemy.sql.expression import func
        random_movie = db.query(Movie).order_by(func.random()).first()
        if random_movie:
             return {
                "reply": f"Şansına bu çıktı: {random_movie.title}. Konusu: {random_movie.overview_tr or random_movie.overview}",
                "movies": [{"id": random_movie.id, "title": random_movie.title, "poster": random_movie.poster_url or random_movie.poster_path}]
            }

    # 4. GENRE SEARCH (Enhanced)
    genres_map = {
        "aksiyon": "Action", "komedi": "Comedy", "dram": "Drama",
        "bilim": "Science Fiction", "kurgu": "Science Fiction", 
        "korku": "Horror", "gerilim": "Thriller", "suç": "Crime",
        "macera": "Adventure", "romantik": "Romance", 
        "animasyon": "Animation", "aile": "Family", "savaş": "War",
        "tarih": "History", "gizem": "Mystery", "western": "Western"
    }
    
    for k, v in genres_map.items():
        if k in text:
            movies = (db.query(Movie)
                      .filter(Movie.genres.like(f"%{v}%"))
                      .order_by(Movie.vote_average.desc()) # Quality first
                      .limit(5).all())
            return {
                "reply": f"İşte senin için en iyi {k.capitalize()} filmleri:",
                "movies": [{"id": m.id, "title": m.title, "poster": m.poster_url or m.poster_path} for m in movies]
            }

    # 5. BEST / POPULAR
    if "en iyi" in text or "top" in text or "popüler" in text or "gündem" in text:
        movies = db.query(Movie).order_by(Movie.popularity.desc()).limit(5).all()
        return {
            "reply": "Şu sıralar herkesin konuştuğu en popüler filmler bunlar:",
             "movies": [{"id": m.id, "title": m.title, "poster": m.poster_url or m.poster_path} for m in movies]
        }
    
    # 6. UPCOMING
    if "yakında" in text or "gelecek" in text or " vizyon" in text:
         return {
             "reply": "Yakında vizyona girecek filmler 'Yakında' sayfasında! Seni oraya yönlendiriyorum.",
             "action": "navigate_upcoming"
         }

    # 7. ACCOUNT / HELP
    if "şifre" in text or "giremiyorum" in text:
        return {"reply": "Giriş sorunu yaşıyorsan 'Şifremi Unuttum' diyebilir veya bana sorunu anlatabilirsin."}
    
    if "liste" in text or "koleksiyon" in text:
        return {"reply": "Filmleri 'Listeye Ekle' butonuyla kişisel listelerine kaydedebilirsin."}

    # 8. CHITTER CHATTER
    if "nasılsın" in text:
        return {"reply": "Harikayım! Film izlemek (daha doğrusu önermek) beni mutlu ediyor. Sen nasılsın?"}
    
    if "tesekkür" in text or "teşekkür" in text or "sağol" in text:
        return {"reply": "Rica ederim! İyi seyirler 🍿"}
    
    if "kimsin" in text or "adın ne" in text:
        return {"reply": "Ben FilmRec Asistanı. Senin film zevkini çözüp nokta atışı öneriler yapmak için buradayım."}

    # ⚡ DEFAULT SEARCH (Actor/Director/Title)
    if len(text) > 2:
        results = (db.query(Movie).filter(
            or_(
                Movie.title.ilike(f"%{text}%"),
                Movie.cast.ilike(f"%{text}%"),
                Movie.directors.ilike(f"%{text}%")
            )
        ).limit(3).all())
        
        if results:
            return {
                "reply": f"Veritabanımda '{text}' ile ilgili şunları buldum:",
                "movies": [{"id": m.id, "title": m.title, "poster": m.poster_url or m.poster_path} for m in results]
            }

    # FALLBACK
    return {
        "reply": "Bunu tam anlayamadım. Bana 'film öner', 'komedi filmleri', 'en iyiler', 'rastgele bir film' gibi şeyler sorabilirsin.",
        "action": "none"
    }
