import React, { useState } from "react";

const API_BASE ="http://localhost:8000";

export default function Summarizer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const summarize = async () => {
    if (!text.trim()) return;
    if (text.trim().length < 30) {
      setError("Please provide more text to summarize (at least 30 characters).");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      if (!data.summary || !data.key_takeaways) {
        throw new Error("Invalid response format. Please try again.");
      }
      setResult(data);
    } catch (e) {
      setError(e.message || "Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setText("");
    setResult(null);
    setError("");
  };

  return (
    <div className="panel">
      <div className="section-label">Paste your notes below</div>
      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your study notes, lecture text, or any content you want summarized..."
        style={{ width: "100%", marginBottom: "10px" }}
        disabled={loading}
      />
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          className="btn btn-primary"
          onClick={summarize}
          disabled={loading || !text.trim()}
          style={{ flex: 1 }}
        >
          {loading ? "Summarizing..." : "Summarize Notes"}
        </button>
        {(result || text) && (
          <button className="btn btn-sm" onClick={clear}>
            Clear
          </button>
        )}
      </div>

      {error && <div className="error-card">⚠️ {error}</div>}

      {loading && (
        <div className="loading-card">
          Analyzing your notes...{" "}
          <span className="loading-dots">
            <span /><span /><span />
          </span>
        </div>
      )}

      {result && (
        <div className="summary-result">
          <div className="summary-section">
            <div className="summary-section-title">✦ Summary</div>
            <ul className="summary-points">
              {result.summary.map((point, i) => (
                <li key={i}>
                  <span className="point-dot" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="summary-section">
            <div className="summary-section-title" style={{ color: "var(--teal)" }}>
              ★ Key Takeaways
            </div>
            <ul className="summary-points">
              {result.key_takeaways.map((point, i) => (
                <li key={i}>
                  <span className="point-dot takeaway-dot" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
