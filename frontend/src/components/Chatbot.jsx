
import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api';
import './Chatbot.css';
import { useNavigate } from 'react-router-dom';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Merhaba! Ben FilmRec asistanı. Sana ne önermemi istersin? 🤖' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const bottomRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const res = await apiFetch('/chatbot/ask', {
                method: 'POST',
                body: { message: userMsg }
            });

            // Handle response
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: res.reply,
                movies: res.movies // Array of {id, title, poster}
            }]);

            if (res.action === 'login_redirect') navigate('/login');
            if (res.action === 'navigate_upcoming') navigate('/upcoming');

        } catch (err) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Üzgünüm, şu an bağlantı kuramıyorum.' }]);
        } finally {
            setLoading(false);
        }
    };

    // Example Commands
    const suggestions = [
        "Bana film öner 🎲",
        "Aksiyon filmi öner 💥",
        "Brad Pitt filmleri 🎬",
        "Komedi filmleri 😂",
        "Yakındaki filmler 📅"
    ];

    const handleChipClick = (msg) => {
        // Set input and auto send
        setMessages(prev => [...prev, { sender: 'user', text: msg }]);
        setLoading(true);

        // Call API
        apiFetch('/chatbot/ask', {
            method: 'POST',
            body: { message: msg }
        })
            .then(res => {
                setMessages(prev => [...prev, {
                    sender: 'bot',
                    text: res.reply,
                    movies: res.movies
                }]);
                if (res.action === 'login_redirect') navigate('/login');
                if (res.action === 'navigate_upcoming') navigate('/upcoming');
            })
            .catch(() => {
                setMessages(prev => [...prev, { sender: 'bot', text: 'Üzgünüm, şu an bağlantı kuramıyorum.' }]);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="chatbot-wrapper">
            {/* TOGGLE BUTTON */}
            {!isOpen && (
                <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                    💬
                </button>
            )}

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>FilmRec Asistan</h3>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-bubble ${m.sender}`}>
                                <p>{m.text}</p>
                                {/* Embedded Movies */}
                                {m.movies && (
                                    <div className="chat-movie-carousel">
                                        {m.movies.map(mov => (
                                            <div key={mov.id} className="chat-movie-card" onClick={() => navigate(`/movies/${mov.id}`)}>
                                                <img src={mov.poster ? `https://image.tmdb.org/t/p/w200${mov.poster}` : "https://via.placeholder.com/100"} alt={mov.title} />
                                                <span>{mov.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && <div className="chat-bubble bot typing">...</div>}
                        <div ref={bottomRef} />
                    </div>

                    {/* SUGGESTION CHIPS */}
                    <div className="chat-suggestions">
                        {suggestions.map((s, i) => (
                            <button key={i} className="chip" onClick={() => handleChipClick(s)}>{s}</button>
                        ))}
                    </div>

                    <div className="chat-input-area">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Bir şeyler sor..."
                        />
                        <button onClick={handleSend}>➤</button>
                    </div>
                </div>
            )}
        </div>
    );
}
