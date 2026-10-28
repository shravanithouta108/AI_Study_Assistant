import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

MODEL = "openai/gpt-oss-20b"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def ask_ai(system, user, max_tokens=800):
    response = requests.post(
        GROQ_URL,
        headers={
            "Authorization": f"Bearer {os.environ.get('GROQ_API_KEY')}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "max_tokens": max_tokens,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "ok", "message": "AI Study Assistant API is running"})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        system = """You are a helpful AI tutor. Answer in this EXACT format:
**Direct Answer:** [1-2 sentence answer]
**Explanation:** [2-4 sentences]"""
        return jsonify({"answer": ask_ai(system, question, 600)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/simplify", methods=["POST"])
def simplify():
    data = request.get_json() or {}
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400
    try:
        result = ask_ai(
            "Rewrite for a 12-year-old. Simple words, short sentences. Under 100 words.",
            f"Simplify:\n\n{text}",
            300,
        )
        return jsonify({"simplified": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate-mcq", methods=["POST"])
def generate_mcq():
    data = request.get_json() or {}
    topic = data.get("topic", "").strip()
    if not topic:
        return jsonify({"error": "Topic cannot be empty"}), 400
    try:
        system = """Generate EXACTLY 5 MCQs. Return ONLY valid JSON, no markdown.
Format: [{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct_answer":"A","explanation":"..."}]"""
        raw = ask_ai(system, f"Generate 5 MCQs about: {topic}", 4000)
        clean = raw.strip().replace("```json", "").replace("```", "")
        questions = json.loads(clean[clean.find("["):clean.rfind("]") + 1])
        return jsonify({"questions": questions[:5]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json() or {}
    text = data.get("text", "").strip()
    if not text or len(text) < 30:
        return jsonify({"error": "Please provide more text"}), 400
    try:
        system = """Summarize notes. Return ONLY valid JSON, no markdown.
Format: {"summary":["point1","point2","point3","point4"],"key_takeaways":["t1","t2","t3"]}"""
        raw = ask_ai(system, f"Summarize:\n\n{text}", 4000)
        clean = raw.strip().replace("```json", "").replace("```", "")
        result = json.loads(clean[clean.find("{"):clean.rfind("}") + 1])
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
