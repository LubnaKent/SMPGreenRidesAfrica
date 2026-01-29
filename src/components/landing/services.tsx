import { Users, Handshake, Leaf, Truck, GraduationCap, Shield, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Driver Acquisition",
    description: "We source and vet qualified drivers from diverse backgrounds, ensuring a steady pipeline of skilled candidates.",
    color: "from-[#00D54B] to-[#00A038]",
  },
  {
    icon: GraduationCap,
    title: "Training Programs",
    description: "Comprehensive training covering safe driving practices, customer service, and e-vehicle operation.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Handshake,
    title: "Fleet Partnerships",
    description: "Connect with leading e-mobility companies looking for trained drivers. Perfect matching guaranteed.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Leaf,
    title: "Green Mobility",
    description: "Supporting the transition to sustainable transportation with a workforce dedicated to eco-friendly vehicles.",
    color: "from-[#00D54B] to-[#00A038]",
  },
  {
    icon: Truck,
    title: "Last-Mile Delivery",
    description: "Trained delivery riders for e-commerce and logistics partners, optimizing last-mile with green transport.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Rigorous screening and ongoing support ensure our drivers meet the highest standards of professionalism.",
    color: "from-red-500 to-red-600",
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 lg:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D54B]/10 rounded-full text-[#00D54B] text-sm font-bold uppercase tracking-wider">
            What We Offer
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black text-gray-900">
            Complete Mobility Solutions
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            From sourcing to training to placement, we provide end-to-end services that power Africa&apos;s green transportation ecosystem.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent overflow-hidden"
            >
              {/* Hover Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Content */}
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center group-hover:bg-white/20 transition-colors duration-500`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-gray-900 group-hover:text-white transition-colors duration-500">
                  {service.title}
                </h3>

                <p className="mt-3 text-gray-600 leading-relaxed group-hover:text-white/90 transition-colors duration-500">
                  {service.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-[#00D54B] font-semibold group-hover:text-white transition-colors duration-500">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00D54B] to-[#00A038] p-8 lg:p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-black text-white">
                Ready to start earning?
              </h3>
              <p className="mt-2 text-white/80 text-lg">
                Join thousands of drivers already on the platform
              </p>
            </div>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#00D54B] font-bold text-lg rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
