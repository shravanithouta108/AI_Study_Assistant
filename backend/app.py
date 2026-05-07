from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import os, json

load_dotenv()
app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"
def ask_openai(system, user, max_tokens=800):
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ]
    )
    return response.choices[0].message.content
@app.get("/")
def root():
    return jsonify({"status": "ok", "message": "AI Study Assistant API is running"})

@app.post("/chat")
def chat():
    data = request.get_json()
    question = (data or {}).get("question", "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    system = """You are a helpful AI tutor for students. Answer in this EXACT format:

**Direct Answer:**
[1-2 sentence direct answer]

**Explanation:**
[2-4 sentences with clear explanation]

Keep responses concise and student-friendly."""
    answer = ask_openai(system, question, 600)
    return jsonify({"answer": answer})

@app.post("/simplify")
def simplify():
    data = request.get_json()
    text = (data or {}).get("text", "").strip()
    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400
    system = "Rewrite the given answer for a 12-year-old using simple words, short sentences, friendly tone. Under 100 words."
    result = ask_openai(system, f"Simplify this:\n\n{text}", 300)
    return jsonify({"simplified": result})

@app.post("/generate-mcq")
def generate_mcq():
    data = request.get_json()
    topic = (data or {}).get("topic", "").strip()
    if not topic:
        return jsonify({"error": "Topic cannot be empty"}), 400
    system = """Generate EXACTLY 5 MCQ questions. Return ONLY valid JSON, no extra text, no markdown.
Format: [{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct_answer":"A","explanation":"..."}]
Rules: topic-specific questions, correct_answer must be A/B/C/D only, clear explanations."""
    raw = ask_openai(system, f"Generate 5 MCQs about: {topic}", 1500)
    try:
        clean = raw.strip().replace("```json","").replace("```","")
        questions = json.loads(clean[clean.find('['):clean.rfind(']')+1])
        return jsonify({"questions": questions[:5]})
    except:
        return jsonify({"error": "Failed to parse MCQs, please try again"}), 422

@app.post("/summarize")
def summarize():
    data = request.get_json()
    text = (data or {}).get("text", "").strip()
    if not text or len(text) < 30:
        return jsonify({"error": "Please provide more text"}), 400
    system = """Summarize notes. Return ONLY valid JSON, no extra text, no markdown.
Format: {"summary":["point1","point2","point3","point4"],"key_takeaways":["t1","t2","t3"]}
Short bullet points only, no paragraphs."""
    raw = ask_openai(system, f"Summarize:\n\n{text}", 800)
    try:
        clean = raw.strip().replace("```json","").replace("```","")
        result = json.loads(clean[clean.find('{'):clean.rfind('}')+1])
        return jsonify(result)
    except:
        return jsonify({"error": "Failed to parse summary, please try again"}), 422

if __name__ == "__main__":
    app.run(port=8000, debug=True)