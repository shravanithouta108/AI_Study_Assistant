import React, { useState, useRef, useEffect } from "react";

const API_BASE ="http://localhost:8000";

function LoadingDots() {
  return (
    <span className="loading-dots">
      <span /><span /><span />
    </span>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question) return;

    setError("");
    setInput("");
    setLoading(true);

    const userMsg = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, simplified: null, simplifying: false },
      ]);
    } catch (e) {
      setError(e.message || "Failed to get a response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const simplifyAnswer = async (idx) => {
    const msg = messages[idx];
    if (!msg || msg.simplified) return;

    setMessages((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, simplifying: true } : m))
    );

    try {
      const res = await fetch(`${API_BASE}/simplify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.content }),
      });
      if (!res.ok) throw new Error("Simplification failed");
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m, i) =>
          i === idx ? { ...m, simplified: data.simplified, simplifying: false } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === idx ? { ...m, simplifying: false, simplified: "Could not simplify. Please try again." } : m
        )
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") sendMessage();
  };

  return (
    <div className="panel">
      <div className="chat-history">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            Ask any study question to get started
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`card ${msg.role === "user" ? "card-user" : "card-ai"}`}>
            <div className="card-header">
              <span className={`role-badge ${msg.role === "user" ? "role-user" : "role-ai"}`}>
                {msg.role === "user" ? "YOU" : "AI TUTOR"}
              </span>
            </div>
            <div className="answer-text">{msg.content}</div>

            {msg.role === "assistant" && (
              <>
                {msg.simplified && (
                  <div className="simplified-box">
                    <div className="simplified-label">✦ SIMPLIFIED VERSION</div>
                    <div className="answer-text">{msg.simplified}</div>
                  </div>
                )}
                <div className="simplify-row">
                  <button
                    className="btn btn-sm btn-teal"
                    onClick={() => simplifyAnswer(i)}
                    disabled={msg.simplifying || !!msg.simplified}
                  >
                    {msg.simplifying ? "Simplifying..." : msg.simplified ? "✓ Simplified" : "🔁 Simplify Answer"}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {loading && (
          <div className="loading-card">
            Thinking <LoadingDots />
          </div>
        )}
        {error && <div className="error-card">⚠️ {error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a study question... e.g. What is Newton's Second Law?"
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? "..." : "Ask"}
          </button>
        </div>
        <p className="input-hint">Press Ask or Ctrl+Enter</p>
      </div>
    </div>
  );
}
