"use client";

import { UserPlus, ClipboardCheck, GraduationCap, Rocket, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Sign Up",
    description: "Download our app or register online. It takes just 2 minutes to get started.",
    features: ["Quick registration", "No fees", "Instant access"],
  },
  {
    number: "2",
    icon: ClipboardCheck,
    title: "Get Verified",
    description: "Complete our simple verification process. Upload your documents and get approved.",
    features: ["ID verification", "Background check", "License validation"],
  },
  {
    number: "3",
    icon: GraduationCap,
    title: "Complete Training",
    description: "Take our free training program to learn best practices and safety protocols.",
    features: ["Online training", "Safety certification", "Customer service"],
  },
  {
    number: "4",
    icon: Rocket,
    title: "Start Earning",
    description: "Go online and start accepting rides. Earn money on your own schedule.",
    features: ["Flexible hours", "Weekly payouts", "Bonus incentives"],
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D54B]/10 rounded-full text-[#00D54B] text-sm font-bold uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black text-gray-900">
            Start Earning in <span className="text-[#00D54B]">4 Easy Steps</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Join thousands of drivers already earning with Green Rides Africa. Our streamlined process gets you on the road fast.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-20 relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-32 left-[12%] right-[12%] h-1 bg-gradient-to-r from-[#00D54B]/20 via-[#00D54B] to-[#00D54B]/20 rounded-full" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Step Card */}
                <div className="flex flex-col items-center text-center">
                  {/* Number Badge */}
                  <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#00D54B] to-[#00A038] flex items-center justify-center shadow-xl shadow-[#00D54B]/30 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="h-10 w-10 text-white" />
                    </div>
                    <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-lg font-black text-white shadow-lg">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-8 text-2xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features */}
                  <ul className="mt-6 space-y-2">
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-[#00D54B]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-10 py-4 bg-[#00D54B] text-white font-bold text-lg rounded-full hover:bg-[#00C043] transition-all hover:scale-105 shadow-lg shadow-[#00D54B]/30"
            >
              Start Your Application
            </a>
            <span className="text-gray-500 text-sm">
              Join <span className="font-bold text-gray-900">2,500+</span> drivers today
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
