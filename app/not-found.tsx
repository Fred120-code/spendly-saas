import Link from "next/link";
import { Wallet, ArrowLeft, Home } from "lucide-react";

/**
 * Affiché quand Next.js ne trouve aucune route correspondante,
 * ou quand tu appelles notFound() depuis une Server Action / page.
 * Composant serveur : pas de "use client".
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#151425] flex items-center justify-center px-4">
      {/* Halo accent en arrière-plan */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E0FF67]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Icône */}
        <div className="w-20 h-20 rounded-2xl bg-[#E0FF67]/10 border border-[#E0FF67]/20 flex items-center justify-center mb-8">
          <Wallet className="w-10 h-10 text-[#E0FF67]" />
        </div>

        {/* Code d'erreur — gros, typé finance */}
        <p className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#E0FF67] to-[#E0FF67]/20 select-none mb-2">
          404
        </p>

        <h1 className="text-2xl font-bold text-white mb-3">
          Cette page n&apos;existe pas
        </h1>

        <p className="text-gray-400 text-base leading-relaxed mb-10">
          La page que vous cherchez a peut-être été supprimée, ou l&apos;adresse
          est incorrecte. Vérifiez l&apos;URL ou retournez à vos budgets.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#E0FF67] text-[#151425] rounded-xl font-bold hover:bg-[#d4ff52] transition-all hover:shadow-lg hover:shadow-[#E0FF67]/30"
          >
            <Home className="w-4 h-4" />
            Tableau de bord
          </Link>

          <Link
            href="/budgets"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Mes budgets
          </Link>
        </div>
      </div>
    </div>
  );
}
