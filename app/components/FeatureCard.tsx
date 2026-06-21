import React from "react";

type Feature = {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
};

export default function FeatureCard({ item }: { item: Feature }) {
  const Icon = item.icon;
  return (
    <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/30 hover:border-[#E0FF67] transition-all duration-300 group hover:shadow-2xl hover:shadow-[#E0FF67]/20 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5">
      {/* Icon Container */}
      <div className="w-16 h-16 bg-gradient-to-br from-[#E0FF67] to-[#c4e933] flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <Icon className="text-[#151425] w-8 h-8 stroke-[2]" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold text-white group-hover:text-[#E0FF67] transition-colors duration-300">
          {item.title}
        </h3>
        <p className="text-gray-300 text-base leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
          {item.description}
        </p>
      </div>
    </div>
  );
}
