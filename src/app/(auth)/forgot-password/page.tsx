"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const errors = useTranslations("errors");
  const common = useTranslations("common");
  const nav = useTranslations("nav");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError(errors("unexpected"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">{t("success.title")}</h1>
          <p className="mt-2 text-gray-600">
            {t("success.description", { email })}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            {t("success.hint").split("try again")[0]}
            <button
              onClick={() => setSuccess(false)}
              className="font-medium text-green-600 hover:text-green-700"
            >
              {common("tryAgain").toLowerCase()}
            </button>
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("success.backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      {/* Back to Login */}
      <Link
        href="/login"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToLogin")}
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
            <Bike className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            {t("subtitle")}
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t("email")}
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder={t("emailPlaceholder")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {loading ? common("sending") : t("submit")}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t("rememberPassword")}{" "}
          <Link
            href="/login"
            className="font-medium text-green-600 hover:text-green-700"
          >
            {nav("signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
