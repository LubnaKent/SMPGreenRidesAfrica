"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

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
    <section id="contact" className="py-20 lg:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
            Contact Us
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
            Get in Touch
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Have questions about our services or want to become a partner? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="mt-1 text-gray-600">info@smpgreenrides.africa</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <p className="mt-1 text-gray-600">+256 700 000 000</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Location</h3>
                <p className="mt-1 text-gray-600">Kampala, Uganda</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Message Sent!
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Thank you for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-green-600 font-medium hover:text-green-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
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
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
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
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none bg-white"
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
                      className="block text-sm font-medium text-gray-700 mb-1.5"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="h-4 w-4" />
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
