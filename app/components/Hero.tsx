import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Heading */}
        <h1
          data-aos="fade-up"
          className="text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-8 text-center"
        >
          Vos{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E0FF67] via-[#c4e933] to-[#a8d600]">
            finances
          </span>{" "}
          réinventées par <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E0FF67] via-[#c4e933] to-[#a8d600]">
            l'intelligence artificielle
          </span>
        </h1>

        {/* Description */}
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-gray-300 text-center text-lg sm:text-xl md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto"
        >
          <span className="text-[#E0FF67] font-semibold">Spendly AI</span> vous
          aide à suivre vos dépenses, comprendre vos habitudes et prédire vos
          besoins futurs — automatiquement.
        </p>

        {/* CTA Button */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-[#E0FF67] text-[#151425] font-bold text-lg rounded-xl hover:bg-[#d4ff52] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
          >
            Commencer maintenant
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 border-2 border-[#E0FF67] text-[#E0FF67] font-semibold text-lg rounded-xl hover:bg-[#E0FF67]/10 transition-all duration-300">
            En savoir plus
          </button>
        </div>
      </div>
    </section>
  );
}
