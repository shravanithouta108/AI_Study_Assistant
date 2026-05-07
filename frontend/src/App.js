import React, { useState } from "react";
import Chat from "./components/Chat";
import MCQ from "./components/MCQ";
import Summarizer from "./components/Summarizer";
import "./App.css";

const TABS = [
  { id: "chat", label: "AI Chat", icon: "💬" },
  { id: "mcq", label: "MCQ Practice", icon: "📝" },
  { id: "summarizer", label: "Notes Summarizer", icon: "📄" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="app">
      <header className="header">
        <div className="header-badge">✦ AI POWERED</div>
        <h1>Study <em>Assistant</em></h1>
        <p>Chat · Generate MCQs · Summarize Notes — all in one place</p>
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === "chat" && <Chat />}
        {activeTab === "mcq" && <MCQ />}
        {activeTab === "summarizer" && <Summarizer />}
      </main>
    </div>
  );
}
