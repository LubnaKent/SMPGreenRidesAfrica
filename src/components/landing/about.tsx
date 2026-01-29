"use client";

import { Target, Eye, Award, Globe, TrendingUp, Users, MapPin, Star } from "lucide-react";

const stats = [
  { value: "2,500+", label: "Active Drivers", icon: Users },
  { value: "50+", label: "Partner Companies", icon: TrendingUp },
  { value: "5", label: "African Cities", icon: MapPin },
  { value: "4.9", label: "Average Rating", icon: Star },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To accelerate the adoption of green transportation in Africa by connecting trained, qualified drivers with e-mobility partners.",
    color: "from-[#00D54B] to-[#00A038]",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description: "A sustainable Africa where clean, efficient mobility is accessible to everyone through a network of skilled drivers.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Award,
    title: "Our Values",
    description: "Integrity, sustainability, and excellence drive everything we do. We believe in creating lasting impact through quality partnerships.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Globe,
    title: "Our Reach",
    description: "Operating across major African cities, we're building the continent's largest network of green mobility professionals.",
    color: "from-orange-500 to-orange-600",
  },
];

export function About() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D54B]/10 rounded-full text-[#00D54B] text-sm font-bold uppercase tracking-wider">
            About Us
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black text-gray-900">
            Driving <span className="text-[#00D54B]">Sustainable Change</span> Across Africa
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            SMP Green Rides Africa is a strategic driver acquisition company dedicated to building the workforce that powers Africa&apos;s green mobility revolution.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative group text-center p-8 rounded-3xl bg-white border border-gray-100 hover:border-[#00D54B]/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D54B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#00D54B] to-[#00A038] flex items-center justify-center mb-4">
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <p className="text-4xl sm:text-5xl font-black text-gray-900">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Values Grid */}
        <div className="mt-20 grid md:grid-cols-2 gap-6">
          {values.map((item) => (
            <div
              key={item.title}
              className="group flex gap-6 p-8 rounded-3xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Banner */}
        <div className="mt-20 relative overflow-hidden rounded-3xl bg-gray-900 p-8 lg:p-12">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D54B]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D54B]/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl lg:text-4xl font-black text-white">
                Partner with Us
              </h3>
              <p className="mt-4 text-gray-400 text-lg leading-relaxed">
                Are you a fleet operator or e-mobility company looking for qualified drivers? We provide trained, vetted professionals ready to join your team.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-[#00D54B]">
                  <div className="w-2 h-2 rounded-full bg-[#00D54B]" />
                  <span className="text-sm font-medium">Pre-screened drivers</span>
                </div>
                <div className="flex items-center gap-2 text-[#00D54B]">
                  <div className="w-2 h-2 rounded-full bg-[#00D54B]" />
                  <span className="text-sm font-medium">Trained professionals</span>
                </div>
                <div className="flex items-center gap-2 text-[#00D54B]">
                  <div className="w-2 h-2 rounded-full bg-[#00D54B]" />
                  <span className="text-sm font-medium">Ongoing support</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#00D54B] text-white font-bold text-lg rounded-full hover:bg-[#00C043] transition-all hover:scale-105 shadow-lg shadow-[#00D54B]/30"
              >
                Become a Partner
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
