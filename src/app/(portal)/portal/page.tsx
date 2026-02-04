"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  FileText,
  ClipboardList,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";

interface PortalStats {
  applicationStatus: string;
  documentsUploaded: number;
  documentsVerified: number;
  unreadMessages: number;
  upcomingTraining: {
    title: string;
    date: string;
  } | null;
}

const STATUS_COLORS: Record<string, { color: string; icon: typeof CheckCircle }> = {
  pending: { color: "text-yellow-600 bg-yellow-100", icon: Clock },
  under_review: { color: "text-blue-600 bg-blue-100", icon: Clock },
  approved: { color: "text-green-600 bg-green-100", icon: CheckCircle },
  rejected: { color: "text-red-600 bg-red-100", icon: AlertCircle },
  requires_info: { color: "text-orange-600 bg-orange-100", icon: AlertCircle },
};

export default function PortalDashboard() {
  const { profile } = useAuth();
  const t = useTranslations("portal");
  const [stats, setStats] = useState<PortalStats>({
    applicationStatus: "pending",
    documentsUploaded: 0,
    documentsVerified: 0,
    unreadMessages: 0,
    upcomingTraining: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.email) return;

      const supabase = createClient();

      // Fetch application status
      const { data: application } = await supabase
        .from("driver_applications")
        .select("status")
        .eq("email", profile.email)
        .single();

      // Fetch document counts
      const { data: appData } = await supabase
        .from("driver_applications")
        .select("id")
        .eq("email", profile.email)
        .single();

      let documentsUploaded = 0;
      let documentsVerified = 0;

      if (appData?.id) {
        const { count: uploaded } = await supabase
          .from("application_documents")
          .select("*", { count: "exact", head: true })
          .eq("application_id", appData.id);

        const { count: verified } = await supabase
          .from("application_documents")
          .select("*", { count: "exact", head: true })
          .eq("application_id", appData.id)
          .eq("verified", true);

        documentsUploaded = uploaded || 0;
        documentsVerified = verified || 0;
      }

      // Fetch unread messages (simplified)
      const { count: unreadMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)
        .eq("sender_role", "smp_agent");

      // Fetch upcoming training
      const { data: training } = await supabase
        .from("training_sessions")
        .select("title, scheduled_date")
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .limit(1)
        .single();

      setStats({
        applicationStatus: application?.status || "pending",
        documentsUploaded,
        documentsVerified,
        unreadMessages: unreadMessages || 0,
        upcomingTraining: training
          ? {
              title: training.title,
              date: training.scheduled_date,
            }
          : null,
      });
      setLoading(false);
    };

    fetchStats();
  }, [profile?.email]);

  // Translated status labels
  const statusLabels: Record<string, string> = {
    pending: t("status.pending"),
    under_review: t("status.underReview"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
    requires_info: t("status.requiresInfo"),
  };

  const statusInfo = STATUS_COLORS[stats.applicationStatus] || STATUS_COLORS.pending;
  const StatusIcon = statusInfo.icon;
  const statusLabel = statusLabels[stats.applicationStatus] || statusLabels.pending;

  const quickActions = [
    {
      name: t("quickActions.updateProfile"),
      description: t("quickActions.updateProfileDesc"),
      icon: User,
      href: "/portal/profile",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: t("quickActions.uploadDocuments"),
      description: t("quickActions.uploadDocumentsDesc"),
      icon: FileText,
      href: "/portal/documents",
      color: "bg-green-100 text-green-600",
    },
    {
      name: t("quickActions.viewApplication"),
      description: t("quickActions.viewApplicationDesc"),
      icon: ClipboardList,
      href: "/portal/application",
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: t("quickActions.messages"),
      description: t("quickActions.messagesDesc"),
      icon: MessageSquare,
      href: "/portal/messages",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <h1 className="text-2xl font-bold">
          {t("welcome", { name: profile?.name?.split(" ")[0] || t("welcomeDefault") })}
        </h1>
        <p className="text-orange-100 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Application status card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("applicationStatus.title")}
        </h2>
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${statusInfo.color}`}
          >
            <StatusIcon className="h-6 w-6" />
          </div>
          <div>
            <p className={`text-lg font-semibold ${statusInfo.color.split(" ")[0]}`}>
              {statusLabel}
            </p>
            <p className="text-sm text-gray-500">
              {stats.applicationStatus === "approved"
                ? t("applicationStatus.approved")
                : stats.applicationStatus === "rejected"
                ? t("applicationStatus.rejected")
                : t("applicationStatus.reviewing")}
            </p>
          </div>
          <Link
            href="/portal/application"
            className="ml-auto text-orange-600 hover:text-orange-700"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "-" : stats.documentsUploaded}
              </p>
              <p className="text-sm text-gray-500">{t("stats.documentsUploaded")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "-" : stats.documentsVerified}
              </p>
              <p className="text-sm text-gray-500">{t("stats.documentsVerified")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "-" : stats.unreadMessages}
              </p>
              <p className="text-sm text-gray-500">{t("stats.unreadMessages")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              {stats.upcomingTraining ? (
                <>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {stats.upcomingTraining.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(stats.upcomingTraining.date).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">{t("stats.noTraining")}</p>
                  <p className="text-sm text-gray-500">{t("stats.scheduled")}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("quickActions.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="group rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${action.color} mb-4`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
                {action.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
