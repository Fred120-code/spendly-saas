"use client";

import { useState } from "react";

/**
 * Avant : ce composant recevait un `email` en prop, renvoyé tel quel au
 * serveur dans le body de /api/chat-ia. Le serveur résout maintenant
 * l'utilisateur via sa session Clerk : plus besoin de prop du tout.
 */
const ChatIA = () => {
  const [message, setMessage] = useState<{ from: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }
    const newMessage = [...message, { from: "user", text: input }];
    setMessage(newMessage);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      const text = res.ok ? data.reponse : `✗ ${data.error ?? "Erreur inconnue"}`;
      setMessage([...newMessage, { from: "ai", text }]);
    } catch (error) {
      console.error(error);
      setMessage([...newMessage, { from: "ai", text: "✗ Erreur de connexion" }]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-[#1D283A] p-4 rounded-xl w-full text-white">
      <h2 className="text-[#DAF866] font-bold mb-3 text-lg">Assistant IA 💬</h2>
      <div className="h-64 overflow-y-auto mb-3 border border-gray-600 p-3 rounded-md">
        {message.map((m, i) => (
          <p
            key={i}
            className={`mb-2 ${
              m.from === "user"
                ? "text-right bg-[#2a4164b9] p-2 rounded-2xl"
                : "text-left bg-[#0c1420b9] p-2 rounded-2xl"
            }`}
          >
            <span className="block text-sm text-right mt-3 ">{m.text}</span>
            <span className="text-xs">{m.from === "user" ? "Vous" : " IA"}</span>
          </p>
        ))}
        {loading && (
          <span className="loading loading-dots loading-xl text-white"></span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question à ton IA..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2 rounded bg-[#0F172A] text-white outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-[#DAF866] text-black font-bold px-4 rounded"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatIA;
