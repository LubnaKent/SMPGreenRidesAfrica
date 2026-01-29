"use client";

import { Target, Eye, Award, Globe, TrendingUp, Users, MapPin, Sparkles } from "lucide-react";

const stats = [
  { value: "2,500+", label: "Active Drivers", icon: Users, color: "from-emerald-500 to-green-600" },
  { value: "50+", label: "Partner Companies", icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
  { value: "5", label: "African Cities", icon: MapPin, color: "from-violet-500 to-purple-600" },
  { value: "98%", label: "Success Rate", icon: Sparkles, color: "from-amber-500 to-orange-600" },
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
    description: "A sustainable Africa where clean, efficient mobility is accessible to everyone through a network of skilled drivers.",
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
    <section id="about" className="py-24 lg:py-32 bg-white relative">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header - Asymmetric layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-end">
          <div>
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-bold rounded-full mb-4">
              Our Story
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
              Building Africa&apos;s
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Green Future
              </span>
            </h2>
          </div>
          <div className="lg:pb-2">
            <p className="text-lg text-gray-600 leading-relaxed">
              SMP Green Rides Africa is a strategic driver acquisition company dedicated to building the workforce that powers Africa&apos;s green mobility revolution. We connect passionate individuals with sustainable transportation opportunities.
            </p>
          </div>
        </div>

        {/* Stats - Horizontal scroll on mobile, grid on desktop */}
        <div className="mt-16 -mx-4 px-4 overflow-x-auto lg:overflow-visible">
          <div className="flex lg:grid lg:grid-cols-4 gap-4 min-w-max lg:min-w-0">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="w-64 lg:w-auto flex-shrink-0 lg:flex-shrink relative group"
              >
                <div className="h-full p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values - Staggered cards */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900">What Drives Us</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {values.map((item, index) => (
              <div
                key={item.title}
                className={`group relative p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl ${
                  index % 2 === 0
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white lg:translate-y-4"
                    : "bg-white border-2 border-gray-100 hover:border-emerald-200"
                }`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${
                  index % 2 === 0
                    ? "bg-white/20"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600"
                }`}>
                  <item.icon className={`h-7 w-7 ${index % 2 === 0 ? "text-white" : "text-white"}`} />
                </div>
                <h4 className={`text-xl font-bold ${index % 2 === 0 ? "text-white" : "text-gray-900"}`}>
                  {item.title}
                </h4>
                <p className={`mt-3 leading-relaxed ${index % 2 === 0 ? "text-emerald-100" : "text-gray-600"}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Banner - Unique split design */}
        <div className="mt-24 grid lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-2xl">
          {/* Left side - Image/Graphic area */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 p-8 lg:p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl lg:text-8xl mb-4">🤝</div>
              <p className="text-emerald-400 font-bold text-lg">Strategic Partnerships</p>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="lg:col-span-3 bg-gray-900 p-8 lg:p-12 flex flex-col justify-center">
            <h3 className="text-3xl lg:text-4xl font-black text-white">
              Partner with Us
            </h3>
            <p className="mt-4 text-gray-400 text-lg leading-relaxed">
              Are you a fleet operator or e-mobility company looking for qualified drivers? We provide trained, vetted professionals ready to join your team.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {["Pre-screened drivers", "Trained professionals", "Ongoing support"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
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
