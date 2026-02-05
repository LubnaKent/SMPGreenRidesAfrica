"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bike, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth.register");
  const nav = useTranslations("nav");
  const brand = useTranslations("brand");
  const errors = useTranslations("errors");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    if (formData.password.length < 8) {
      setError(t("errors.passwordLength"));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: "smp_agent", // Default role for new signups
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Create profile in the database
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: formData.email,
            name: formData.name,
            role: "smp_agent",
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't block registration if profile creation fails
          // Profile can be created on first login as fallback
        }
      }

      // Redirect to verification message or dashboard
      router.push("/login?message=Check your email to confirm your account");
    } catch {
      setError(errors("unexpected"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {nav("backToHome")}
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
            <Bike className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {brand("name")}
          </h1>
          <p className="text-sm text-gray-500">{brand("partnerDashboard")}</p>
        </div>

        {/* Register Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">{t("title")}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("subtitle")}
          </p>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {t("fullName")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder={t("fullNamePlaceholder")}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder={t("emailPlaceholder")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t("password")}
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 pr-10 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder={t("passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t("passwordHint")}
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                {t("confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder={t("confirmPasswordPlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("submitting") : t("submit")}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t("hasAccount").split("Sign in")[0]}
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
