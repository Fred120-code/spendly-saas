import FeatureCard from "./FeatureCard";

export default function FeaturesSection({ features }: { features: any[] }) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {features.map((item, index) => (
          <div
            key={item.id}
            data-aos="fade-up"
            data-aos-delay={`${index * 100}`}
          >
            <FeatureCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
