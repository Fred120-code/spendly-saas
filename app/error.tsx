"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Affiché quand une erreur JavaScript non attrapée se produit dans l'app.
 * DOIT être "use client" — Next.js impose ça pour les error boundaries.
 * Reçoit `error` (l'erreur) et `reset` (fonction pour réessayer le rendu).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log l'erreur côté client pour debugging (sera visible dans la console)
  useEffect(() => {
    console.error("[Spendly Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#151425] flex items-center justify-center px-4">
      {/* Halo rouge en arrière-plan */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF4C4C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Icône */}
        <div className="w-20 h-20 rounded-2xl bg-[#FF4C4C]/10 border border-[#FF4C4C]/20 flex items-center justify-center mb-8">
          <AlertTriangle className="w-10 h-10 text-[#FF4C4C]" />
        </div>

        {/* Code d'erreur */}
        <p className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#FF4C4C] to-[#FF4C4C]/20 select-none mb-2">
          500
        </p>


        <p className="text-gray-400 text-base leading-relaxed mb-4">
          Une erreur inattendue s&apos;est produite. Vos données sont en
          sécurité — aucune modification n&apos;a été enregistrée.
        </p>

        {/* Détail technique (discret, utile en dev) */}
        {error.message && (
          <div className="w-full mb-8 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-left">
            <p className="text-gray-500 text-xs font-mono leading-relaxed break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-gray-600 text-[10px] mt-1 font-mono">
                ID : {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* Réessayer — action principale */}
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#E0FF67] text-[#151425] rounded-xl font-bold hover:bg-[#d4ff52] transition-all hover:shadow-lg hover:shadow-[#E0FF67]/30"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>

          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Home className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
