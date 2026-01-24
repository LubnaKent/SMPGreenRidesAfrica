import Link from "next/link";
import { Bike, ArrowRight, Leaf, Users, TrendingUp } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-green-800" />

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-green-100 text-sm font-medium mb-6">
              <Leaf className="h-4 w-4" />
              <span>Sustainable Mobility Solutions</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Empowering{" "}
              <span className="text-green-300">Green Mobility</span>{" "}
              in Africa
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-green-100 leading-relaxed max-w-2xl">
              We connect skilled drivers with leading e-mobility partners, driving sustainable transportation across the continent through strategic acquisition and training programs.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors"
              >
                Become a Partner
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats/Visual */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main Icon */}
              <div className="flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center">
                    <Bike className="h-24 w-24 text-white" />
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute top-0 right-0 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">1,000+</p>
                    <p className="text-xs text-gray-500">Drivers Trained</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">50+</p>
                    <p className="text-xs text-gray-500">Active Partners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 lg:hidden">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">1,000+</p>
            <p className="text-xs text-green-200">Drivers</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">50+</p>
            <p className="text-xs text-green-200">Partners</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-xs text-green-200">Cities</p>
          </div>
        </div>
      </div>
    </section>
  );
}
