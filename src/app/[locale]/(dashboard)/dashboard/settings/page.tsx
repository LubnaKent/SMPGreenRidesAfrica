"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABELS } from "@/hooks/use-auth";
import type { UserRole } from "@/types/database";
import { useTranslations } from "next-intl";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const t = useTranslations("settings");
  const common = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
        });
      }
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        addToast({
          type: "error",
          title: t("profile.notAuthenticated"),
          message: t("profile.loginAgain"),
        });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      addToast({
        type: "success",
        title: t("profile.updated"),
        message: t("profile.updatedMessage"),
      });

      loadProfile();
    } catch (err) {
      console.error("Error saving profile:", err);
      addToast({
        type: "error",
        title: t("profile.failedToSave"),
        message: common("tryAgain"),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast({
        type: "error",
        title: t("password.mismatch"),
        message: t("password.mismatchMessage"),
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast({
        type: "warning",
        title: t("password.tooShort"),
        message: t("password.tooShortMessage"),
      });
      return;
    }

    setChangingPassword(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      addToast({
        type: "success",
        title: t("password.updated"),
        message: t("password.updatedMessage"),
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      addToast({
        type: "error",
        title: t("password.failedToChange"),
        message: common("tryAgain"),
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t("danger.confirmDelete"))) {
      return;
    }

    addToast({
      type: "info",
      title: t("danger.contactAdmin"),
      message: t("danger.contactAdminMessage"),
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("profile.title")}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("profile.subtitle")}</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.fullName")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.email")}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 px-3 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("profile.emailReadOnly")}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.phone")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t("profile.phonePlaceholder")}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("profile.saveChanges")}
              </button>
            </div>
          </form>

          <form onSubmit={handleChangePassword} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("password.title")}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("password.subtitle")}</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("password.current")}
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("password.new")}
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("password.confirm")}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("password.update")}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("account.title")}</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t("account.role")}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile?.role ? ROLE_LABELS[profile.role] : t("account.unknown")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t("account.memberSince")}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : t("account.unknown")}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">{t("danger.title")}</h2>
            <p className="mt-1 text-sm text-red-600 dark:text-red-300">
              {t("danger.description")}
            </p>
            <button
              onClick={handleDeleteAccount}
              className="mt-4 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-red-900/30 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50"
            >
              {t("danger.deleteAccount")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
