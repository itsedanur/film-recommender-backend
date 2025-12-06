import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const d = await apiFetch("/admin/dashboard");
        setData(d);
      } catch (err) {
        alert("Admin yetkisi gereklidir.");
      }
    }
    load();
  }, []);

  if (!data) return <div style={{ padding: 40 }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>Admin Paneli</h1>
      <p>Toplam Kullanıcı: {data.total_users}</p>
      <p>Toplam Film: {data.total_movies}</p>
      <p>Toplam Yorum: {data.total_reviews}</p>

      <hr />

      <h3>Yeni Film Ekle</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const title = e.target.title.value;
          const genre = e.target.genre.value;

          try {
            await apiFetch("/admin/add-movie?title=" + title + "&genre=" + genre, {
              method: "POST",
            });
            alert("Film eklendi!");
          } catch (err) {
            alert(err.detail);
          }
        }}
      >
        <input name="title" placeholder="Film adı" /> <br />
        <input name="genre" placeholder="Tür" /> <br />
        <button type="submit">Ekle</button>
      </form>

      <hr />
    </div>
  );
}

export default AdminDashboard;
