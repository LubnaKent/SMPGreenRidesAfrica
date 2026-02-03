"use client";

import { Users, Handshake, Leaf, Truck, GraduationCap, Shield, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

const accentStyles: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200" },
  blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200" },
  violet: { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-200" },
  teal: { bg: "bg-teal-500", text: "text-teal-600", border: "border-teal-200" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-200" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-200" },
};

export function Services() {
  const t = useTranslations("services");

  const services = [
    {
      icon: Users,
      title: t("items.acquisition.title"),
      description: t("items.acquisition.description"),
      accent: "emerald",
    },
    {
      icon: GraduationCap,
      title: t("items.certification.title"),
      description: t("items.certification.description"),
      accent: "blue",
    },
    {
      icon: Handshake,
      title: t("items.partnerships.title"),
      description: t("items.partnerships.description"),
      accent: "violet",
    },
    {
      icon: Leaf,
      title: t("items.sustainability.title"),
      description: t("items.sustainability.description"),
      accent: "teal",
    },
    {
      icon: Truck,
      title: t("items.logistics.title"),
      description: t("items.logistics.description"),
      accent: "amber",
    },
    {
      icon: Shield,
      title: t("items.quality.title"),
      description: t("items.quality.description"),
      accent: "rose",
    },
  ];
  return (
    <section id="services" className="py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-teal-100/50 to-transparent rounded-tr-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full mb-4">
            {t("sectionLabel")}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
            {t("title").split("Solutions")[0]}
            <span className="block text-emerald-600">Solutions</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Services Grid - Bento style */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const styles = accentStyles[service.accent];
            return (
              <div
                key={service.title}
                className={`group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 ${
                  index === 0 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${styles.bg}`}>
                  <service.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {service.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {service.description}
                </p>

                {/* Hover arrow */}
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className={`h-5 w-5 ${styles.text}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-2 bg-white rounded-2xl shadow-lg border border-gray-100">
            <p className="px-4 text-gray-600">
              {t("cta.question")}
            </p>
            <a
              href="#contact"
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              {t("cta.button")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
