"use client";
import { Brain, ChartNoAxesCombined, Zap } from "lucide-react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import FeaturesSection from "./components/FeaturesSection";
import StatsSection from "./components/StatsSection";
import CtaSection from "./components/CtaSection";

export default function Home() {

  const features = [
    {
      id: 0,
      icon: Brain,
      title: "Intelligence Artificielle",
      description:
        "Catégorisation automatique de vos dépenses et recommandations personnalisées.",
    },
    {
      id: 1,
      icon: ChartNoAxesCombined,
      title: "Analyses détaillées",
      description:
        "Visualisez vos habitudes financières avec des graphiques interactifs.",
    },
    {
      id: 2,
      icon: Zap,
      title: "Alertes en temps réel",
      description: "Recevez des notifications lors de dépassements de budget.",
    },
  ];

  const stats = [
    {
      id: 0,
      number: "10K+",
      descriptioin: "Utilisateurs actifs",
    },
    {
      id: 1,
      number: "€2.5M",
      descriptioin: "Économies générées",
    },
    {
      id: 2,
      number: "4.9/5",
      descriptioin: "Note moyenne",
    },
  ];

  return (
    <div className="bg-[#151425]">
      <div className="flex items-center flex-col w-full bg-blend-overlay">
        <Header />
        <div>
          <Hero />
        </div>
        <div className="bg-[#e1ff6750] h-[1px] w-full mt-10"></div>
        <div className="mt-15 mb-15 w-full flex flex-col justify-around items-center">
          <div className="flex flex-col text-center lg:items-start lg:justify-start mb-6 lg:w-[60%]">
            <h2 className="text-white font-bold lg:text-3xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-[#DAF866] text-xs lg:text-lg italic">
              Des fonctionnalités puissantes pour une gestion financière
              simplifiée
            </p>
          </div>
          <FeaturesSection features={features} />
          <StatsSection stats={stats} />
        </div>
        <div className="bg-[#e1ff6750] h-[1px] w-full mt-10"></div>
        <CtaSection />
      </div>
    </div>
  );
}
