"use client";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

/**
 * Avant : recevait un `email` en prop, transmis à /api/report?email=...
 * Maintenant la route lit la session Clerk côté serveur, donc plus besoin
 * de prop ni de paramètre dans l'URL.
 */
const RapportAI = () => {
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/report")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setReport(data.report);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de générer le rapport pour le moment.");
      });
  }, []);

  return (
    <div className="w-full bg-[#1D283A] rounded-xl p-4 text-white shadow-md">
      <h2 className="font-bold text-lg mb-2 text-[#DAF866]">🧠 Rapport IA</h2>

      {error ? (
        <div className="text-red-400">{error}</div>
      ) : report ? (
        <div className="text-sm leading-relaxed text-white">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-gray-400 animate-pulse">
          Analyse en cours... ⚙️
        </div>
      )}
    </div>
  );
};

export default RapportAI;
