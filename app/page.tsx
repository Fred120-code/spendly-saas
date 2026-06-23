"use client";
import {
  Brain,
  ChartNoAxesCombined,
  Zap,
  Wallet,
  Bot,
  ShieldCheck,
} from "lucide-react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import FeaturesSection from "./components/FeaturesSection";
import TrustSection from "./components/TrustSection";
import FaqSection from "./components/FaqSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
import AosInit from "./components/AosInit";

export default function Home() {
  const features = [
    {
      id: 0,
      icon: Brain,
      title: "Intelligence Artificielle",
      description:
        "Des rapports financiers générés automatiquement par l'IA Gemini, basés sur vos vraies données.",
    },
    {
      id: 1,
      icon: ChartNoAxesCombined,
      title: "Analyses détaillées",
      description:
        "Visualisez vos habitudes financières avec des graphiques interactifs (répartition, suivi par budget).",
    },
    {
      id: 2,
      icon: Zap,
      title: "Alertes en temps réel",
      description: "Soyez prévenu dès qu'un budget approche de sa limite.",
    },
    {
      id: 3,
      icon: Wallet,
      title: "Multi-budgets",
      description:
        "Créez autant de budgets que nécessaire : alimentation, transport, loisirs...",
    },
    {
      id: 4,
      icon: Bot,
      title: "Assistant IA conversationnel",
      description:
        "Posez vos questions financières et obtenez des réponses contextualisées à vos données.",
    },
    {
      id: 5,
      icon: ShieldCheck,
      title: "Confidentialité",
      description:
        "Authentification sécurisée et données strictement isolées par compte.",
    },
  ];

  return (
    <div className="bg-[#151425] overflow-hidden">
      <AosInit />
      <div className="flex items-center flex-col w-full bg-blend-overlay">
        <Header />

        <Hero />

        <div className="bg-[#e1ff6750] h-[1px] w-full"></div>

        <HowItWorks />

        <div className="bg-[#e1ff6750] h-[1px] w-full"></div>

        <div
          id="fonctionnalites"
          className="mt-15 mb-15 w-full flex flex-col justify-around items-center"
        >
          <div
            data-aos="fade-up"
            className="flex flex-col text-center lg:items-center lg:justify-center mb-6 lg:w-[60%]"
          >
            <h2 className="text-white font-bold text-2xl lg:text-3xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-[#DAF866] text-sm lg:text-lg italic">
              Des fonctionnalités puissantes pour une gestion financière
              simplifiée
            </p>
          </div>
          <FeaturesSection features={features} />
        </div>

        <div className="bg-[#e1ff6750] h-[1px] w-full"></div>

        <TrustSection />

        <div className="bg-[#e1ff6750] h-[1px] w-full"></div>

        <FaqSection />

        <div className="bg-[#e1ff6750] h-[1px] w-full"></div>

        <CtaSection />

        <Footer />
      </div>
    </div>
  );
}
