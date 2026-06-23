"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    id: 0,
    question: "Mes données financières sont-elles en sécurité ?",
    answer:
      "Oui. L'authentification est gérée par Clerk et chaque compte accède uniquement à ses propres budgets et transactions, jamais à ceux d'un autre utilisateur.",
  },
  {
    id: 1,
    question: "Quelles devises sont supportées ?",
    answer:
      "Spendly affiche actuellement vos montants en FCFA. D'autres devises pourront être ajoutées par la suite.",
  },
  {
    id: 2,
    question: "Comment fonctionne l'IA de Spendly ?",
    answer:
      "Spendly utilise l'API Gemini de Google pour analyser vos budgets et transactions, générer un rapport mensuel et répondre à vos questions financières dans le chat intégré.",
  },
  {
    id: 3,
    question: "Puis-je utiliser Spendly sur mobile ?",
    answer:
      "Oui, l'interface est entièrement responsive et s'adapte aux smartphones, tablettes et ordinateurs.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-3xl mx-auto">
        <div data-aos="fade-up" className="text-center mb-12">
          <h2 className="text-white font-bold text-3xl lg:text-4xl mb-3">
            Questions fréquentes
          </h2>
          <p className="text-gray-400 text-base lg:text-lg">
            Tout ce que vous devez savoir avant de commencer
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                data-aos="fade-up"
                data-aos-delay={`${index * 50}`}
                className="rounded-2xl border border-[#E0FF67]/20 bg-gradient-to-br from-white/5 to-white/2 overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-white font-semibold">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#E0FF67] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
