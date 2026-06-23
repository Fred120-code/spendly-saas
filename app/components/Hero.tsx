import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Colonne texte */}
        <div>
          <div
            data-aos="fade-up"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0FF67]/10 border border-[#E0FF67]/30 text-[#E0FF67] text-xs font-semibold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Propulsé par Google Gemini
          </div>

          <h1
            data-aos="fade-up"
            data-aos-delay="50"
            className="text-white font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
          >
            Vos{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E0FF67] via-[#c4e933] to-[#a8d600]">
              finances
            </span>{" "}
            réinventées par l&apos;intelligence artificielle
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl"
          >
            <span className="text-[#E0FF67] font-semibold">Spendly AI</span>{" "}
            vous aide à créer des budgets, suivre vos dépenses et obtenir des
            rapports financiers générés automatiquement par IA.
          </p>

          <div
            data-aos="fade-up"
            data-aos-delay="150"
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/sign-up"
              className="text-center px-8 py-4 bg-[#E0FF67] text-[#151425] font-bold text-lg rounded-xl hover:bg-[#d4ff52] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              Commencer gratuitement
            </Link>
            <a
              href="#comment-ca-marche"
              className="text-center px-8 py-4 border-2
            border-[#E0FF67] text-[#E0FF67] font-semibold text-lg rounded-xl
            hover:bg-[#E0FF67]/10 transition-all duration-300"
            >
              Comment ça marche
            </a>
          </div>
        </div>

        {/* Colonne visuelle : aperçu illustratif du dashboard */}
        <div data-aos="fade-up" data-aos-delay="200" className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-[#E0FF67]/20 to-transparent rounded-3xl blur-2xl" />
          <div className="relative rounded-2xl border border-[#E0FF67]/20 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white font-semibold text-sm">
                Aperçu du tableau de bord
              </span>
              <span className="flex items-center gap-1 text-xs text-[#3EF583] font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                +12%
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: "Alimentation", value: 65 },
                { label: "Transport", value: 40 },
                { label: "Loisirs", value: 85 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{row.label}</span>
                    <span>{row.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E0FF67] to-[#a8d600]"
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[#E0FF67]/5 border border-[#E0FF67]/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#E0FF67]/10">
                <Sparkles className="w-4 h-4 text-[#E0FF67]" />
              </div>
              <p className="text-xs text-gray-300">
                « Vos dépenses loisirs ont augmenté de 20% ce mois-ci »
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
