import React, { useState, useEffect } from "react";
import "./Contact.css";
import { getCaptcha, sendContactMessage } from "../api";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    captcha_answer: "",
  });
  const [captcha, setCaptcha] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setCaptcha(data);
    } catch (err) {
      console.error("Captcha error:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      if (!captcha) {
        throw new Error("Captcha yüklenemedi, lütfen sayfayı yenileyin.");
      }

      await sendContactMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        captcha_key: captcha.captcha_key,
        captcha_answer: parseInt(formData.captcha_answer),
      });

      setStatus({ type: "success", message: "Mesajınız başarıyla iletildi! 🚀" });
      setFormData({ name: "", email: "", message: "", captcha_answer: "" });
      fetchCaptcha(); // Yeni captcha getir
    } catch (err) {
      setStatus({ type: "error", message: err.detail || "Bir hata oluştu." });
      // Hata durumunda da yeni captcha gerekebilir (özellikle süresi dolduysa)
      if (err.detail && (err.detail.includes("süresi doldu") || err.detail.includes("Yanlış"))) {
        fetchCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-box">
        <h1 className="contact-title">İletişim</h1>
        <p className="contact-subtitle">Görüş, öneri ve mesajlarını bize ilet.</p>

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Adınız"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-posta adresiniz"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Mesajınız"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          {captcha && (
            <div className="captcha-container">
              <label htmlFor="captcha_answer" className="captcha-label">
                Güvenlik Sorusu: <strong>{captcha.question}</strong>
              </label>
              <input
                type="number"
                name="captcha_answer"
                id="captcha_answer"
                placeholder="Cevap"
                value={formData.captcha_answer}
                onChange={handleChange}
                required
                className="captcha-input"
              />
            </div>
          )}

          <button type="submit" className="contact-btn" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Gönder 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
