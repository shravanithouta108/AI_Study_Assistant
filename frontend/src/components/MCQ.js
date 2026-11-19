import React, { useState } from "react";

const API_BASE = "https://ai-study-assistant-backend-ekna.onrender.com";
const TOTAL_QUESTIONS = 100;   // total questions to generate
const BATCH_SIZE = 10;         // questions per request (backend limit is 10)

export default function MCQ() {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});   // idx -> selected letter
  const [correct, setCorrect] = useState({});   // idx -> boolean
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(""); // e.g. "Generating 30 of 100..."
  const [error, setError] = useState("");

  const generateMCQ = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setCorrect({});

    let all = [];
    try {
      for (let batch = 0; batch < TOTAL_QUESTIONS / BATCH_SIZE; batch++) {
        setProgress(`Generating ${all.length} of ${TOTAL_QUESTIONS}...`);

        const res = await fetch(`${API_BASE}/generate-mcq`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topic.trim(),
            count: BATCH_SIZE,
            avoid: all.map((q) => q.question), // prevents repeated questions
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Server error ${res.status}`);
        }
        if (!data.questions || data.questions.length === 0) {
          throw new Error("No questions returned. Please try again.");
        }
        all = [...all, ...data.questions];
      }
    } catch (e) {
      setError(
        all.length > 0
          ? `Stopped after ${all.length} questions: ${e.message}`
          : e.message || "Failed to generate MCQs. Please try again."
      );
    } finally {
      setQuestions(all);
      setLoading(false);
      setProgress("");
    }
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
