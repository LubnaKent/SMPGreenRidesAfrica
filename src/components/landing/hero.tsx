"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Clock, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("hero");

  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900" />

        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 left-20 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-emerald-300 text-sm font-medium mb-8 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {t("badge")}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight">
              {t("title").split("Green Revolution")[0]}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400">
                Green Revolution
              </span>
              {t("title").split("Green Revolution")[1] || "on Two Wheels"}
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-emerald-100/80 leading-relaxed max-w-xl">
              {t("subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-emerald-900 font-bold text-lg rounded-2xl hover:bg-emerald-50 transition-all shadow-2xl shadow-black/20"
              >
                {t("cta")}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all border border-white/20"
              >
                {t("partnerLogin")}
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { value: t("stats.drivers"), label: t("stats.driversLabel") },
                { value: t("stats.partners"), label: t("stats.partnersLabel") },
                { value: t("stats.successRate"), label: t("stats.successRateLabel") },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-sm text-emerald-300/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Creative Visual */}
          <div className="hidden lg:block relative">
            {/* Main visual container */}
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-spin-slow" />

              {/* Middle ring */}
              <div className="absolute inset-8 rounded-full border border-white/10" />

              {/* Center content */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🌍</div>
                  <p className="text-white font-bold text-lg">Africa&apos;s Future</p>
                  <p className="text-emerald-300 text-sm">Moves Green</p>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 right-10 bg-white rounded-2xl p-4 shadow-2xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Fast Onboarding</p>
                    <p className="text-sm text-gray-500">48hr approval</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/3 -left-8 bg-white rounded-2xl p-4 shadow-2xl animate-float animation-delay-1000">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Fully Insured</p>
                    <p className="text-sm text-gray-500">Ride protected</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 right-1/4 bg-white rounded-2xl p-4 shadow-2xl animate-float animation-delay-2000">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Flexible Hours</p>
                    <p className="text-sm text-gray-500">You decide</p>
                  </div>
                </div>
              </div>

              {/* Decorative dots */}
              <div className="absolute top-1/2 -right-4 w-3 h-3 rounded-full bg-emerald-400" />
              <div className="absolute bottom-1/4 -left-2 w-2 h-2 rounded-full bg-teal-400" />
              <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-yellow-400" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2">
          <span className="text-emerald-300/50 text-sm">{t("scrollToExplore")}</span>
          <button onClick={scrollToAbout} className="animate-bounce">
            <ChevronDown className="h-6 w-6 text-emerald-300/50" />
          </button>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 30s linear infinite; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </section>
  );
}
