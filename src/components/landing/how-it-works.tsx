"use client";

import Link from "next/link";
import { UserPlus, ClipboardCheck, GraduationCap, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account in minutes. No fees, no commitment—just opportunity.",
    color: "emerald",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Get Verified",
    description: "Upload your documents for quick verification. Our team reviews within 48 hours.",
    color: "blue",
  },
  {
    number: "03",
    icon: GraduationCap,
    title: "Complete Training",
    description: "Access our free certification program covering safety, service, and sustainability.",
    color: "violet",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Start Earning",
    description: "Get matched with partner companies and begin your journey in green mobility.",
    color: "amber",
  },
];

const colorStyles: Record<string, { bg: string; text: string; light: string; gradient: string }> = {
  emerald: {
    bg: "bg-emerald-500",
    text: "text-emerald-600",
    light: "bg-emerald-100",
    gradient: "from-emerald-500 to-green-600"
  },
  blue: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    light: "bg-blue-100",
    gradient: "from-blue-500 to-indigo-600"
  },
  violet: {
    bg: "bg-violet-500",
    text: "text-violet-600",
    light: "bg-violet-100",
    gradient: "from-violet-500 to-purple-600"
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    light: "bg-amber-100",
    gradient: "from-amber-500 to-orange-600"
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-white text-emerald-600 text-sm font-bold rounded-full shadow-sm mb-4">
            Your Journey
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
            Four Steps to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Your New Career
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Our streamlined process gets you from application to earning in days, not weeks.
          </p>
        </div>

        {/* Steps - Vertical timeline on mobile, horizontal on desktop */}
        <div className="mt-20">
          {/* Desktop view - Horizontal cards with connecting line */}
          <div className="hidden lg:block relative">
            {/* Connection line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 via-violet-200 to-amber-200" />

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const styles = colorStyles[step.color];
                return (
                  <div key={step.number} className="relative">
                    {/* Step indicator on the line */}
                    <div className="absolute top-[5.25rem] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-current" style={{ borderColor: `var(--tw-${step.color}-500)` }}>
                      <div className={`w-full h-full rounded-full ${styles.bg}`} />
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
                      {/* Number */}
                      <span className={`text-5xl font-black ${styles.text} opacity-20`}>
                        {step.number}
                      </span>

                      {/* Icon */}
                      <div className={`mt-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${styles.gradient}`}>
                        <step.icon className="h-7 w-7 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="mt-6 text-xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-gray-600 leading-relaxed text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile view - Vertical timeline */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => {
              const styles = colorStyles[step.color];
              const isLast = index === steps.length - 1;
              return (
                <div key={step.number} className="relative flex gap-6">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${styles.gradient} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    {!isLast && (
                      <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 to-gray-100 mt-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <span className={`text-xs font-bold ${styles.text} uppercase tracking-wider`}>
                        Step {step.number}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-3 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-4 px-4">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-sm">
                Join <span className="font-bold text-gray-900">2,500+</span> drivers
              </p>
            </div>
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              Start Your Application
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
