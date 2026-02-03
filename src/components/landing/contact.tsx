"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle, Clock, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export function Contact() {
  const t = useTranslations("contact");
  const common = useTranslations("common");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: t("methods.email.title"),
      subtitle: t("methods.email.description"),
      value: "info@smpgreenrides.africa",
      href: "mailto:info@smpgreenrides.africa",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Phone,
      title: t("methods.phone.title"),
      subtitle: t("methods.phone.description"),
      value: "+256 700 000 000",
      href: "tel:+256700000000",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: MapPin,
      title: t("methods.visit.title"),
      subtitle: t("methods.visit.description"),
      value: t("methods.visit.address"),
      href: null,
      color: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <section id="contact" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full mb-4">
            {t("sectionLabel")}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
            {t("title").split("Conversation")[0]}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Conversation
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-5 gap-12">
          {/* Left side - Contact methods and quick info */}
          <div className="lg:col-span-2 space-y-6">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <method.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{method.title}</h3>
                  <p className="text-sm text-gray-500">{method.subtitle}</p>
                  {method.href ? (
                    <a href={method.href} className="mt-1 inline-block text-emerald-600 font-semibold hover:underline">
                      {method.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-emerald-600 font-semibold">{method.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/256700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all group"
            >
              <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {t("whatsapp")}
            </a>

            {/* Quick stats */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
              <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-4">{t("whyContact.title")}</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm">{t("whyContact.responseTime")}</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm">{t("whyContact.dedicatedTeam")}</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm">{t("whyContact.satisfaction")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 p-8 lg:p-10">
              {success ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t("form.success.title")}
                  </h3>
                  <p className="mt-3 text-gray-600 max-w-sm">
                    {t("form.success.description")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-8 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                  >
                    {t("form.success.sendAnother")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        {t("form.fullName")}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-14 px-5 rounded-xl border-2 border-gray-200 text-base focus:border-emerald-500 focus:ring-0 focus:outline-none transition-colors"
                        placeholder={t("form.placeholders.name")}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        {t("form.email")}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-14 px-5 rounded-xl border-2 border-gray-200 text-base focus:border-emerald-500 focus:ring-0 focus:outline-none transition-colors"
                        placeholder={t("form.placeholders.email")}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      {t("form.subject")}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full h-14 px-5 rounded-xl border-2 border-gray-200 text-base focus:border-emerald-500 focus:ring-0 focus:outline-none bg-white transition-colors"
                    >
                      <option value="">{t("form.subjects.select")}</option>
                      <option value="partnership">{t("form.subjects.partnership")}</option>
                      <option value="driver">{t("form.subjects.driver")}</option>
                      <option value="general">{t("form.subjects.general")}</option>
                      <option value="support">{t("form.subjects.support")}</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      {t("form.message")}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 text-base focus:border-emerald-500 focus:ring-0 focus:outline-none resize-none transition-colors"
                      placeholder={t("form.placeholders.message")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      common("sending")
                    ) : (
                      <>
                        {t("form.submit")}
                        <Send className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
