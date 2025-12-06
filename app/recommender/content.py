import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer


def recommend_by_content(movies, seed_movie=None, top_n=20):
    """
    movies         : tüm Movie objeleri
    seed_movie     : belirli bir filme göre öneri olsun istiyorsan Movie objesi
    top_n          : kaç öneri istiyorsun
    """

    if not movies:
        return []

    # ----------------------------------------
    # 1) Metin birleşimi (title + overview)
    # ----------------------------------------
    corpus = []
    for m in movies:
        text = f"{m.title} {m.overview or ''}"
        corpus.append(text)

    # ----------------------------------------
    # 2) TF-IDF modeli
    # ----------------------------------------
    tfidf = TfidfVectorizer(stop_words="english")
    matrix = tfidf.fit_transform(corpus)

    # ----------------------------------------
    # 3) Anchor (kıyaslama yapılacak film)
    # ----------------------------------------
    if seed_movie:
        # Belirli filme göre öneri
        try:
            anchor_index = movies.index(seed_movie)
        except ValueError:
            # Olmazsa popüler filmi fallback seç
            anchor_index = np.argmax([m.popularity for m in movies])
    else:
        # Varsayılan: en popüler film
        anchor_index = np.argmax([m.popularity for m in movies])

    # ----------------------------------------
    # 4) Benzerlikleri hesapla
    # ----------------------------------------
    similarities = cosine_similarity(matrix[anchor_index:anchor_index + 1], matrix).flatten()

    # Kendini çıkar
    similarities[anchor_index] = -1  

    # En benzer filmleri bul
    indices = similarities.argsort()[::-1][:top_n]

    # ----------------------------------------
    # 5) JSON formatında döndür
    # ----------------------------------------
    recommended = []
    for idx in indices:
        m = movies[idx]
        recommended.append({
            "id": m.id,
            "title": m.title,
            "poster_path": m.poster_path,
            "overview": m.overview,
            "vote_average": m.vote_average,
            "popularity": m.popularity,
        })

    return recommended
