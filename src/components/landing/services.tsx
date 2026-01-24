import { Users, Handshake, Leaf, Truck, GraduationCap, Shield } from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Driver Acquisition",
    description: "We source and vet qualified drivers from diverse backgrounds, ensuring a steady pipeline of skilled candidates ready for e-mobility roles.",
  },
  {
    icon: GraduationCap,
    title: "Training Programs",
    description: "Comprehensive training covering safe driving practices, customer service, and e-vehicle operation to prepare drivers for success.",
  },
  {
    icon: Handshake,
    title: "Fleet Partnerships",
    description: "Connect with leading e-mobility companies looking for trained drivers. We match the right drivers with the right partners.",
  },
  {
    icon: Leaf,
    title: "Green Mobility Solutions",
    description: "Supporting the transition to sustainable transportation by building a workforce dedicated to electric and eco-friendly vehicles.",
  },
  {
    icon: Truck,
    title: "Last-Mile Delivery",
    description: "Trained delivery riders for e-commerce and logistics partners, optimizing last-mile delivery with green transportation.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Rigorous screening and ongoing support ensure our drivers meet the highest standards of professionalism and reliability.",
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
            Our Services
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
            Comprehensive Mobility Solutions
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            From sourcing to training to placement, we provide end-to-end services that power Africa&apos;s green transportation ecosystem.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <service.icon className="h-7 w-7 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                {service.title}
              </h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
