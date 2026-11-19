import React, { useState } from "react";

const API_BASE = "https://ai-study-assistant-backend-ekna.onrender.com";
const TOTAL_QUESTIONS = 100;
const FOCUS_AREAS = [
  "key concepts", "definitions", "processes", "examples",
  "causes and effects", "important facts", "comparisons",
  "applications", "history", "key terms",
];
const MAX_CALLS = 60;    // total requests allowed, including retries
const MAX_RETRIES = 5;   // retries allowed after a 429 (rate limit) error
const PAUSE_MS = 4000;   // pause between requests
const RETRY_MS = 15000;  // wait after a 429 before retrying

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MCQ() {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [correct, setCorrect] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const generateMCQ = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setCorrect({});

    const all = [];
    const seen = new Set();
    let lastError = "";
    let retries = 0;

    for (let call = 0; call < MAX_CALLS && all.length < TOTAL_QUESTIONS; call++) {
      if (call > 0) await sleep(PAUSE_MS);
      setProgress(`Generating ${all.length} of ${TOTAL_QUESTIONS}...`);

      const focus = FOCUS_AREAS[call % FOCUS_AREAS.length];
      const subtopic = `${topic.trim()} - ${focus}, set ${Math.floor(call / FOCUS_AREAS.length) + 1}`;

      try {
        const res = await fetch(`${API_BASE}/generate-mcq`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: subtopic }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);

        for (const q of data.questions || []) {
          const key = (q.question || "").trim().toLowerCase();
          if (!key || seen.has(key)) continue;
          seen.add(key);
          all.push(q);
          if (all.length === TOTAL_QUESTIONS) break;
        }
      } catch (e) {
        if (e.message.includes("429") && retries < MAX_RETRIES) {
          retries++;
          await sleep(RETRY_MS);
          call--; // redo the same batch
          continue;
        }
        lastError = e.message;
      }
    }

    if (all.length < TOTAL_QUESTIONS) {
      setError(
        `Only ${all.length} unique questions could be generated.` +
          (lastError ? ` Last error: ${lastError}` : "")
      );
    }
    setQuestions(all);
    setLoading(false);
    setProgress("");
  };

  const selectOption = (qIdx, letter) => {
    if (answers[qIdx]) return;
    const q = questions[qIdx];
    setAnswers((prev) => ({ ...prev, [qIdx]: letter }));
    setCorrect((prev) => ({ ...prev, [qIdx]: letter === q.correct_answer }));
  };

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = Object.values(correct).filter(Boolean).length;
  const LETTERS = ["A", "B", "C", "D"];

  return (
    <div className="panel">
      <div className="input-row">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateMCQ()}
          placeholder="Enter a topic... e.g. Photosynthesis, French Revolution, Algebra"
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={generateMCQ}
          disabled={loading || !topic.trim()}
        >
          {loading ? "Generating..." : `Generate ${TOTAL_QUESTIONS} MCQs`}
        </button>
      </div>

      {error && <div className="error-card">⚠️ {error}</div>}

      {loading && (
        <div className="loading-card">
          {progress}{" "}
          <span className="loading-dots">
            <span /><span /><span />
          </span>
        </div>
      )}

      {questions.length > 0 && (
        <>
          {!loading && totalAnswered === questions.length && (
            <div className="score-banner">
              <div className="score-num">{totalCorrect}/{questions.length}</div>
              <div className="score-label">Questions correct</div>
              <div className="score-row">
                <button className="btn btn-sm btn-primary" onClick={generateMCQ}>
                  Regenerate
                </button>
              </div>
            </div>
          )}

          <div className="mcq-header">
            <span className="mcq-topic">{topic}</span>
            <span className="mcq-progress">
              {totalAnswered}/{questions.length} answered · {totalCorrect} correct
            </span>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="question-card">
              <div className="question-number">Q{i + 1} of {questions.length}</div>
              <div className="question-text">{q.question}</div>
              <div className="options-grid">
                {(q.options || []).map((opt, j) => {
                  const letter = LETTERS[j];
                  const optText = opt.replace(/^[A-D]\.\s*/, "");
                  const selected = answers[i] === letter;
                  const answered = !!answers[i];
                  let cls = "option-btn";
                  if (answered) {
                    if (letter === q.correct_answer) cls += " correct";
                    else if (selected) cls += " incorrect";
                  }
                  return (
                    <button
                      key={letter}
                      className={cls}
                      onClick={() => selectOption(i, letter)}
                      disabled={answered}
                    >
                      <span className="option-letter">{letter}</span>
                      <span>{optText}</span>
                    </button>
                  );
                })}
              </div>
              {answers[i] && (
                <div className="explanation-box">
                  <strong>{correct[i] ? "✓ Correct!" : "✗ Incorrect"}</strong>
                  {" — "}
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}