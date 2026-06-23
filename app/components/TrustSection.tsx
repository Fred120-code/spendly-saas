import { ShieldCheck, Lock, Sparkles, Wallet2 } from "lucide-react";

const trustPoints = [
  {
    id: 0,
    icon: ShieldCheck,
    title: "Authentification sécurisée",
    description: "Connexion gérée par Clerk, chaque compte est isolé.",
  },
  {
    id: 1,
    icon: Lock,
    title: "Vos données vous appartiennent",
    description: "Aucune donnée partagée entre utilisateurs, ni revendue.",
  },
  {
    id: 2,
    icon: Sparkles,
    title: "IA Gemini intégrée",
    description: "Rapports et réponses générés par l'IA de Google.",
  },
  {
    id: 3,
    icon: Wallet2,
    title: "Budgets illimités",
    description: "Créez autant de budgets que nécessaire, sans restriction.",
  },
];

export default function TrustSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {trustPoints.map((point, index) => {
          const Icon = point.icon;
          return (
            <div
              key={point.id}
              data-aos="fade-up"
              data-aos-delay={`${index * 100}`}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#E0FF67]/10 to-[#E0FF67]/5 border border-[#E0FF67]/30 hover:border-[#E0FF67]/60 hover:from-[#E0FF67]/20 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#E0FF67]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-5 h-5 text-[#E0FF67]" />
              </div>
              <h3 className="text-white font-bold text-base mb-1.5">
                {point.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {point.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
