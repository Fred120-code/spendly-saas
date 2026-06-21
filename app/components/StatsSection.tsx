export default function StatsSection({ stats }: { stats: any[] }) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {stats.map((stat, index) => (
          <div
            key={stat.id}
            data-aos="fade-up"
            data-aos-delay={`${index * 100}`}
            className="p-8 rounded-2xl bg-gradient-to-br from-[#E0FF67]/10 to-[#E0FF67]/5 border border-[#E0FF67]/30 hover:border-[#E0FF67]/60 hover:from-[#E0FF67]/20 transition-all duration-300 group"
          >
            <h3 className="text-[#E0FF67] text-4xl md:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">
              {stat.number}
            </h3>
            <p className="text-gray-300 text-lg font-medium">
              {stat.descriptioin}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
