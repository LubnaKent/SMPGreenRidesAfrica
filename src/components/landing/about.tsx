import { Target, Eye, Award, Globe } from "lucide-react";

const stats = [
  { value: "1,000+", label: "Drivers Trained" },
  { value: "50+", label: "Partner Companies" },
  { value: "5", label: "African Cities" },
  { value: "98%", label: "Satisfaction Rate" },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To accelerate the adoption of green transportation in Africa by connecting trained, qualified drivers with e-mobility partners.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description: "A sustainable Africa where clean, efficient mobility is accessible to everyone through a network of skilled drivers and innovative partners.",
  },
  {
    icon: Award,
    title: "Our Values",
    description: "Integrity, sustainability, and excellence drive everything we do. We believe in creating lasting impact through quality partnerships.",
  },
  {
    icon: Globe,
    title: "Our Reach",
    description: "Operating across major African cities, we're building the continent's largest network of green mobility professionals.",
  },
];

export function About() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
            About Us
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
            Driving Sustainable Change Across Africa
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            SMP Green Rides Africa is a strategic driver acquisition company dedicated to building the workforce that powers Africa&apos;s green mobility revolution.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100"
            >
              <p className="text-3xl sm:text-4xl font-bold text-green-600">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values Grid */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          {values.map((item) => (
            <div
              key={item.title}
              className="flex gap-5 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-green-200 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
