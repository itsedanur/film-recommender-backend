import React from "react";
import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact-container">
      <div className="contact-box">
        <h1 className="contact-title">İletişim</h1>
        <p className="contact-subtitle">Görüş, öneri ve mesajlarını bize ilet.</p>

        <form className="contact-form">
          <input type="text" placeholder="Adınız" required />
          <input type="email" placeholder="E-posta adresiniz" required />
          <textarea placeholder="Mesajınız" required></textarea>

          <button type="submit" className="contact-btn">
            Gönder 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
