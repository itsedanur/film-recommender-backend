
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.movie import Movie
from app.models.like import Like
import json

def get_user_favorites_genres(db: Session, user_id: int):
    
    likes = db.query(Like).filter(Like.user_id == user_id).all()
    if not likes:
        return []
    
    movie_ids = [l.movie_id for l in likes]
    movies = db.query(Movie).filter(Movie.id.in_(movie_ids)).all()
    
    genre_counts = {}
    for m in movies:
        try:
            genres = json.loads(m.genres) if m.genres else []
            for g in genres:
                name = g['name'] if isinstance(g, dict) else str(g)
                genre_counts[name] = genre_counts.get(name, 0) + 1
        except:
            continue
            
    
    sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    return [g[0] for g in sorted_genres[:3]]

def recommend_personal(db: Session, user_id: int, limit=5):
   
  
    top_genres = get_user_favorites_genres(db, user_id)
    if not top_genres:
       
        return db.query(Movie).order_by(Movie.popularity.desc()).limit(limit).all()
    

    liked_ids = [l.movie_id for l in db.query(Like).filter(Like.user_id == user_id).all()]
    
    recommendations = []
    
  
    for genre in top_genres:
        matches = (db.query(Movie)
                   .filter(Movie.genres.like(f"%{genre}%"))
                   .filter(Movie.id.notin_(liked_ids))
                   .order_by(Movie.vote_average.desc())
                   .limit(limit)
                   .all())
        recommendations.extend(matches)
        
    
    unique_recs = {m.id: m for m in recommendations}.values()
    final_list = sorted(unique_recs, key=lambda x: x.vote_average or 0, reverse=True)
    
    return final_list[:limit]
