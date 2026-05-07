# 🎓 AI Study Assistant

A full-stack AI-powered web application that helps students learn smarter — featuring an AI Chat tutor, MCQ Practice generator, and Notes Summarizer.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **AI Chat** | Ask any study question and get a structured answer with a direct response and explanation |
| 🔁 **Simplify Answer** | Rewrites any AI response in simple, easy-to-understand language |
| 📝 **MCQ Generator** | Enter any topic and instantly get 5 multiple choice questions with answers and explanations |
| 📄 **Notes Summarizer** | Paste your notes and get bullet-point summaries and key takeaways |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Python + Flask |
| AI Model | Groq API (Llama 3.1 — free) |
| Styling | Custom CSS (dark theme) |

---

## 📁 Project Structure

```
AI Study Assistant/
├── backend/
│   ├── app.py              # Flask API with 4 endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env                # API key (not uploaded to GitHub)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main app with tab navigation
│   │   ├── App.css         # Global styles
│   │   └── components/
│   │       ├── Chat.js         # AI Chat component
│   │       ├── MCQ.js          # MCQ Practice component
│   │       └── Summarizer.js   # Notes Summarizer component
│   ├── package.json
│   └── .env                # API URL (not uploaded to GitHub)
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

Make sure you have these installed:
- Python 3.8 or above → [python.org](https://python.org)
- Node.js 16 or above → [nodejs.org](https://nodejs.org)
- A free Groq API key → [console.groq.com](https://console.groq.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AI_Study_Assistant.git
cd AI_Study_Assistant
```

---

### 2. Backend Setup

```bash
cd backend
```

Install dependencies:
```bash
pip install flask flask-cors groq python-dotenv
```

Create a `.env` file inside the `backend` folder:
```
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend server:
```bash
python app.py
```

The backend will run at: `http://127.0.0.1:8000`

To confirm it is working, open your browser and go to:
```
http://127.0.0.1:8000
```
You should see: `{"status": "ok", "message": "AI Study Assistant API is running"}`

---

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file inside the `frontend` folder:
```
REACT_APP_API_URL=http://127.0.0.1:8000
```

Start the frontend:
```bash
npm start
```

The app will open automatically at: `http://localhost:3000`

---

## 🔑 Environment Variables

| File | Variable | Description |
|---|---|---|
| `backend/.env` | `GROQ_API_KEY` | Your free Groq API key from console.groq.com |
| `frontend/.env` | `REACT_APP_API_URL` | URL of the running backend (default: http://127.0.0.1:8000) |

> ⚠️ Never share your `.env` files. They are excluded from GitHub via `.gitignore`.

---

## 🚀 Running the App (Every Time)

You need **two terminals open at the same time**:

**Terminal 1 — Start Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm start
```

Then open `http://localhost:3000` in your browser.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/chat` | Ask a study question |
| POST | `/simplify` | Simplify an AI response |
| POST | `/generate-mcq` | Generate 5 MCQs for a topic |
| POST | `/summarize` | Summarize study notes |

### Example Request — Chat

```json
POST /chat
{
  "question": "What is Newton's Second Law?"
}
```

### Example Response

```json
{
  "answer": "**Direct Answer:**\nNewton's Second Law states that Force = Mass × Acceleration.\n\n**Explanation:**\nThis means the greater the force applied to an object, the greater its acceleration..."
}
```

---

## 🧪 How to Test Each Feature

1. **AI Chat** → Type `What is photosynthesis?` → Click Ask
2. **MCQ Practice** → Type `French Revolution` → Click Generate MCQs → Select answers
3. **Notes Summarizer** → Paste any paragraph of text → Click Summarize Notes

---

## 🐛 Common Issues

| Problem | Fix |
|---|---|
| `Failed to fetch` error in app | Make sure the backend is running (`python app.py`) |
| `ERR_CONNECTION_REFUSED` | Backend is not running — start it first |
| `model_decommissioned` error | Change model in `app.py` to `llama-3.1-8b-instant` |
| `npm install` fails | Run `npm install --legacy-peer-deps` |
| Port 3000 already in use | Press Y when asked to use another port |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙋‍♀️ Author

Made with ❤️ by **Shravani Thouta**

> If you found this helpful, give it a ⭐ on GitHub!
