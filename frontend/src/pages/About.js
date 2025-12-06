import React from "react";
import "./About.css";

export default function About() {
  return (
    <div className="about-container">
      <div className="about-box">
        <h1 className="about-title">FilmRec Hakkında</h1>
        <p className="about-subtitle">
          Film ve dizi dünyasını keşfetmen için tasarlanmış yapay zeka destekli bir film asistanı.
        </p>

        <div className="about-features">
          <div className="feature-card">
            <h3>🎯 Akıllı Öneriler</h3>
            <p>Beğenilerine göre kişiye özel film ve dizi tavsiyeleri sunar.</p>
          </div>

          <div className="feature-card">
            <h3>⭐ İncelemeler</h3>
            <p>IMDb ve yapay zeka analizleriyle doğru karar vermeni sağlar.</p>
          </div>

          <div className="feature-card">
            <h3>📌 Listeler Oluştur</h3>
            <p>Favorilerini kaydet, organize et ve istediğin zaman geri dön.</p>
          </div>

          <div className="feature-card">
            <h3>📣 Topluluk</h3>
            <p>Film sevenlerle yorum yap, tartış, fikirlerini paylaş.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
