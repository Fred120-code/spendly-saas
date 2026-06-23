import { Wallet, Receipt, Sparkles } from "lucide-react";

const steps = [
  {
    id: 0,
    icon: Wallet,
    title: "Créez vos budgets",
    description:
      "Définissez un budget par catégorie (alimentation, transport, loisirs...) avec le montant que vous souhaitez allouer.",
  },
  {
    id: 1,
    icon: Receipt,
    title: "Suivez vos dépenses",
    description:
      "Ajoutez vos transactions au fil de l'eau et visualisez en temps réel ce qu'il vous reste sur chaque budget.",
  },
  {
    id: 2,
    icon: Sparkles,
    title: "Recevez des insights IA",
    description:
      "Spendly analyse vos habitudes et génère des rapports et réponses personnalisées via l'IA Gemini.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="py-20 px-4 sm:px-6 lg:px-8 w-full"
    >
      <div className="max-w-6xl mx-auto">
        <div
          data-aos="fade-up"
          className="text-center mb-16 flex flex-col items-center"
        >
          <h2 className="text-white font-bold text-3xl lg:text-4xl mb-3">
            Comment ça marche
          </h2>
          <p className="text-gray-400 text-base lg:text-lg max-w-xl">
            Trois étapes simples pour reprendre le contrôle de vos finances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Ligne de connexion (visible à partir de md) */}
          <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-[#E0FF67]/40 to-transparent" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                data-aos="fade-up"
                data-aos-delay={`${index * 100}`}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E0FF67] to-[#c4e933] flex items-center justify-center mb-5 shadow-lg shadow-[#E0FF67]/20">
                  <Icon className="w-7 h-7 text-[#151425]" />
                </div>
                <span className="text-[#E0FF67] text-xs font-bold mb-2">
                  ÉTAPE {index + 1}
                </span>
                <h3 className="text-white font-bold text-xl mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
