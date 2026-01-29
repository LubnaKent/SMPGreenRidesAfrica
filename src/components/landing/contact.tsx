"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle } from "lucide-react";

export function Contact() {
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

  return (
    <section id="contact" className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D54B]/10 rounded-full text-[#00D54B] text-sm font-bold uppercase tracking-wider">
            Contact Us
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black text-gray-900">
            Let&apos;s <span className="text-[#00D54B]">Connect</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Have questions about our services or want to become a partner? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="group flex items-start gap-5 p-6 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 hover:shadow-xl hover:border-[#00D54B]/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D54B] to-[#00A038] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Email Us</h3>
                <p className="mt-1 text-gray-500">We reply within 24 hours</p>
                <a href="mailto:info@smpgreenrides.africa" className="mt-2 inline-block text-[#00D54B] font-semibold hover:underline">
                  info@smpgreenrides.africa
                </a>
              </div>
            </div>

            <div className="group flex items-start gap-5 p-6 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 hover:shadow-xl hover:border-[#00D54B]/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Call Us</h3>
                <p className="mt-1 text-gray-500">Mon-Fri, 8am-6pm</p>
                <a href="tel:+256700000000" className="mt-2 inline-block text-blue-600 font-semibold hover:underline">
                  +256 700 000 000
                </a>
              </div>
            </div>

            <div className="group flex items-start gap-5 p-6 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 hover:shadow-xl hover:border-[#00D54B]/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Visit Us</h3>
                <p className="mt-1 text-gray-500">Come say hello</p>
                <p className="mt-2 text-purple-600 font-semibold">Kampala, Uganda</p>
              </div>
            </div>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/256700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 bg-[#25D366] text-white rounded-2xl font-bold hover:bg-[#20BD5A] transition-all hover:scale-105"
            >
              <MessageCircle className="h-6 w-6" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 p-8 lg:p-10">
              {success ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#00D54B]/10 flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-[#00D54B]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Message Sent!
                  </h3>
                  <p className="mt-3 text-gray-600 max-w-sm">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-8 px-8 py-3 bg-[#00D54B] text-white font-bold rounded-full hover:bg-[#00C043] transition-all"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-200 text-base focus:border-[#00D54B] focus:ring-0 focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-200 text-base focus:border-[#00D54B] focus:ring-0 focus:outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full h-14 px-5 rounded-2xl border-2 border-gray-200 text-base focus:border-[#00D54B] focus:ring-0 focus:outline-none bg-white transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="driver">Driver Application</option>
                      <option value="general">General Question</option>
                      <option value="support">Support</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 text-base focus:border-[#00D54B] focus:ring-0 focus:outline-none resize-none transition-colors"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#00D54B] text-white font-bold text-lg rounded-full hover:bg-[#00C043] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-[#00D54B]/30"
                  >
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
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
