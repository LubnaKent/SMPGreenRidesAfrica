"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { SOURCE_CHANNELS } from "@/constants";
import type { SourceChannel } from "@/types/database";
import { createDriver } from "@/lib/supabase/database";
import { useToast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  national_id: string;
  driving_permit_number: string;
  location: string;
  source_channel: SourceChannel;
  notes: string;
}

interface FieldErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  national_id?: string;
  driving_permit_number?: string;
  location?: string;
}

interface TouchedFields {
  first_name?: boolean;
  last_name?: boolean;
  phone?: boolean;
  national_id?: boolean;
  driving_permit_number?: boolean;
  location?: boolean;
}

const initialFormData: FormData = {
  first_name: "",
  last_name: "",
  phone: "",
  national_id: "",
  driving_permit_number: "",
  location: "",
  source_channel: "boda_stage",
  notes: "",
};

export default function NewDriverPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const t = useTranslations("drivers.new");
  const common = useTranslations("common");
  const sources = useTranslations("drivers.sources");

  // Validation functions using translations
  const validateFirstName = (value: string): string | undefined => {
    if (!value.trim()) return t("validation.firstNameRequired");
    if (value.trim().length < 2) return t("validation.firstNameMin");
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return t("validation.firstNameInvalid");
    return undefined;
  };

  const validateLastName = (value: string): string | undefined => {
    if (!value.trim()) return t("validation.lastNameRequired");
    if (value.trim().length < 2) return t("validation.lastNameMin");
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return t("validation.lastNameInvalid");
    return undefined;
  };

  const validatePhone = (value: string): string | undefined => {
    if (!value.trim()) return t("validation.phoneRequired");
    const cleaned = value.replace(/\s/g, "");
    const phoneRegex = /^(\+?256|0)[0-9]{9}$/;
    if (!phoneRegex.test(cleaned)) {
      return t("validation.phoneInvalid");
    }
    return undefined;
  };

  const validateNationalId = (value: string): string | undefined => {
    if (!value.trim()) return undefined;
    if (!/^[A-Z]{2}[0-9A-Z]{13}$/i.test(value.replace(/\s/g, ""))) {
      return t("validation.nationalIdInvalid");
    }
    return undefined;
  };

  const validateDrivingPermit = (value: string): string | undefined => {
    if (!value.trim()) return undefined;
    if (value.trim().length < 6) return t("validation.drivingPermitMin");
    return undefined;
  };

  // Source channel labels with translations
  const SOURCE_CHANNEL_LABELS: Record<SourceChannel, string> = {
    social_media: sources("socialMedia"),
    referral: sources("referral"),
    roadshow: sources("roadshow"),
    boda_stage: sources("bodaStage"),
    whatsapp: sources("whatsapp"),
    online_application: sources("onlineApplication"),
    other: sources("other"),
  };
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const validateField = (name: keyof FieldErrors, value: string): string | undefined => {
    switch (name) {
      case "first_name":
        return validateFirstName(value);
      case "last_name":
        return validateLastName(value);
      case "phone":
        return validatePhone(value);
      case "national_id":
        return validateNationalId(value);
      case "driving_permit_number":
        return validateDrivingPermit(value);
      default:
        return undefined;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing (if field was touched)
    if (touched[name as keyof TouchedFields]) {
      const error = validateField(name as keyof FieldErrors, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof FieldErrors, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFieldValid = (name: keyof FieldErrors): boolean => {
    const value = formData[name];
    return touched[name] === true && !fieldErrors[name] && value.trim().length > 0;
  };

  const getInputClassName = (name: keyof FieldErrors, isRequired: boolean = false) => {
    const baseClass = "mt-1 h-10 w-full rounded-lg border px-3 text-sm transition-colors focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white";

    if (touched[name] && fieldErrors[name]) {
      return `${baseClass} border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20`;
    }

    if (isFieldValid(name) && isRequired) {
      return `${baseClass} border-green-300 dark:border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20`;
    }

    return `${baseClass} border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-green-500`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mark all required fields as touched
    setTouched({
      first_name: true,
      last_name: true,
      phone: true,
      national_id: true,
      driving_permit_number: true,
    });

    // Validate all fields
    const errors: FieldErrors = {
      first_name: validateFirstName(formData.first_name),
      last_name: validateLastName(formData.last_name),
      phone: validatePhone(formData.phone),
      national_id: validateNationalId(formData.national_id),
      driving_permit_number: validateDrivingPermit(formData.driving_permit_number),
    };

    setFieldErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((err) => err !== undefined);
    if (hasErrors) {
      setError(t("validation.fixErrors"));
      // Focus the first field with an error
      const firstErrorField = Object.keys(errors).find(
        (key) => errors[key as keyof FieldErrors]
      );
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.focus();
      }
      return;
    }

    setLoading(true);

    try {
      await createDriver({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        national_id: formData.national_id || null,
        driving_permit_number: formData.driving_permit_number || null,
        location: formData.location || null,
        source_channel: formData.source_channel,
        referred_by: null,
        status: "sourced",
        screening_score: null,
        assigned_agent_id: null,
        notes: formData.notes || null,
      });

      addToast({
        type: "success",
        title: t("success.title"),
        message: t("success.description", { name: `${formData.first_name} ${formData.last_name}` }),
      });

      // Redirect to drivers list
      router.push("/dashboard/drivers");
    } catch (err) {
      console.error("Error creating driver:", err);
      setError(common("error"));
      addToast({
        type: "error",
        title: common("error"),
        message: common("tryAgain"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/drivers"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Personal Information */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("personal.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("personal.subtitle")}</p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("fields.firstName")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={getInputClassName("first_name", true)}
                  placeholder={t("fields.firstNamePlaceholder")}
                />
                {isFieldValid("first_name") && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {touched.first_name && fieldErrors.first_name && (
                  <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {touched.first_name && fieldErrors.first_name && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {fieldErrors.first_name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("fields.lastName")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={getInputClassName("last_name", true)}
                  placeholder={t("fields.lastNamePlaceholder")}
                />
                {isFieldValid("last_name") && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {touched.last_name && fieldErrors.last_name && (
                  <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {touched.last_name && fieldErrors.last_name && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {fieldErrors.last_name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("fields.phone")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={getInputClassName("phone", true)}
                  placeholder={t("fields.phonePlaceholder")}
                />
                {isFieldValid("phone") && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {touched.phone && fieldErrors.phone && (
                  <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {touched.phone && fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("fields.location")}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 text-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder={t("fields.locationPlaceholder")}
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("documents.title")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("documents.subtitle")}</p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="national_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("fields.nationalId")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="national_id"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName("national_id", false)}
                  placeholder={t("fields.nationalIdPlaceholder")}
                />
                {touched.national_id && !fieldErrors.national_id && formData.national_id.trim() && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {touched.national_id && fieldErrors.national_id && (
                  <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {touched.national_id && fieldErrors.national_id && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {fieldErrors.national_id}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="driving_permit_number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("fields.drivingPermit")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="driving_permit_number"
                  name="driving_permit_number"
                  value={formData.driving_permit_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName("driving_permit_number", false)}
                  placeholder={t("fields.drivingPermitPlaceholder")}
                />
                {touched.driving_permit_number && !fieldErrors.driving_permit_number && formData.driving_permit_number.trim() && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {touched.driving_permit_number && fieldErrors.driving_permit_number && (
                  <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {touched.driving_permit_number && fieldErrors.driving_permit_number && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {fieldErrors.driving_permit_number}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Source Information */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("sourceInfo.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("sourceInfo.subtitle")}</p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="source_channel"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {common("sourceChannel")} <span className="text-red-500">*</span>
              </label>
              <select
                id="source_channel"
                name="source_channel"
                value={formData.source_channel}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 text-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                {SOURCE_CHANNELS.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {SOURCE_CHANNEL_LABELS[channel.id as SourceChannel]}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("fields.notes")}
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder={t("fields.notesPlaceholder")}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/drivers"
            className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {common("cancel")}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm hover:shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {common("saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("submit")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
