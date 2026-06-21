import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2
          data-aos="fade-up"
          className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
        >
          Prêt à transformer vos finances ?
        </h2>

        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-gray-300 text-lg sm:text-xl md:text-2xl mb-12 leading-relaxed"
        >
          Rejoignez des milliers d'utilisateurs qui optimisent leur budget avec{" "}
          <span className="text-[#E0FF67] font-semibold">Spendly AI</span>
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-[#E0FF67] text-[#151425] font-bold text-lg rounded-xl hover:bg-[#d4ff52] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
          >
            Commencer maintenant
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 border-2 border-[#E0FF67] text-[#E0FF67] font-semibold text-lg rounded-xl hover:bg-[#E0FF67]/10 transition-all duration-300">
            Nous contacter
          </button>
        </div>
      </div>
    </section>
  );
}
