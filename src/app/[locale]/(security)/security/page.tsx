"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Eye,
  ArrowRight,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";

interface SecurityStats {
  pendingVetting: number;
  documentsVerifiedToday: number;
  driversVetted: number;
  recentActivityCount: number;
}

export default function SecurityDashboard() {
  const { profile } = useAuth();
  const t = useTranslations("security.dashboard");
  const [stats, setStats] = useState<SecurityStats>({
    pendingVetting: 0,
    documentsVerifiedToday: 0,
    driversVetted: 0,
    recentActivityCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      id: string;
      action: string;
      resource_type: string;
      created_at: string;
    }>
  >([]);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      // Fetch pending documents for vetting
      const { count: pendingVetting } = await supabase
        .from("driver_documents")
        .select("*", { count: "exact", head: true })
        .eq("verified", false);

      // Fetch documents verified today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: documentsVerifiedToday } = await supabase
        .from("driver_documents")
        .select("*", { count: "exact", head: true })
        .eq("verified", true)
        .gte("verified_at", today.toISOString());

      // Fetch total drivers with verified documents
      const { count: driversVetted } = await supabase
        .from("drivers")
        .select("*", { count: "exact", head: true })
        .in("status", ["qualified", "onboarding", "handed_over"]);

      // Fetch recent audit activity
      const { data: recentAudit, count: recentActivityCount } = await supabase
        .from("audit_logs")
        .select("id, action, resource_type, created_at", { count: "exact" })
        .in("action", ["VIEW_SENSITIVE", "DECRYPT", "VERIFY_DOCUMENTS"])
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        pendingVetting: pendingVetting || 0,
        documentsVerifiedToday: documentsVerifiedToday || 0,
        driversVetted: driversVetted || 0,
        recentActivityCount: recentActivityCount || 0,
      });
      setRecentActivity(recentAudit || []);
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: t("stats.pendingVetting"),
      value: stats.pendingVetting,
      icon: Clock,
      color: "bg-yellow-500",
      href: "/security/vetting",
      urgent: stats.pendingVetting > 10,
    },
    {
      name: t("stats.verifiedToday"),
      value: stats.documentsVerifiedToday,
      icon: CheckCircle,
      color: "bg-green-500",
      href: "/security/vetting",
    },
    {
      name: t("stats.driversVetted"),
      value: stats.driversVetted,
      icon: Users,
      color: "bg-blue-500",
      href: "/security/drivers",
    },
    {
      name: t("stats.securityEvents"),
      value: stats.recentActivityCount,
      icon: Shield,
      color: "bg-purple-500",
      href: "/security/audit",
    },
  ];

  const quickActions = [
    {
      name: t("quickActions.vettingQueue"),
      description: t("quickActions.vettingQueueDesc"),
      icon: FileCheck,
      href: "/security/vetting",
      color: "bg-yellow-100 text-yellow-600",
      badge: stats.pendingVetting > 0 ? stats.pendingVetting : null,
    },
    {
      name: t("quickActions.driverRecords"),
      description: t("quickActions.driverRecordsDesc"),
      icon: Eye,
      href: "/security/drivers",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: t("quickActions.auditLogs"),
      description: t("quickActions.auditLogsDesc"),
      icon: FileText,
      href: "/security/audit",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("welcome", { name: profile?.name?.split(" ")[0] || t("welcomeDefault") })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-1.5">
          <Shield className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            {t("secureSession")}
          </span>
        </div>
      </div>

      {/* Alert banner */}
      {stats.pendingVetting > 10 && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="font-medium text-yellow-800">
                {t("alert.title")}
              </p>
              <p className="text-sm text-yellow-600">
                {t("alert.message", { count: stats.pendingVetting })}
              </p>
            </div>
            <Link
              href="/security/vetting"
              className="ml-auto rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
            >
              {t("alert.reviewNow")}
            </Link>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className={cn(
              "rounded-xl border bg-white p-6 hover:shadow-md transition-shadow",
              stat.urgent ? "border-yellow-300" : "border-gray-200"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "-" : stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("quickActions.title")}
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{action.name}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                {action.badge && (
                  <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                    {action.badge}
                  </span>
                )}
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("activity.title")}
            </h2>
            <Link
              href="/security/audit"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              {t("activity.viewAll")}
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {t("activity.noActivity")}
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.resource_type}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Security guidelines */}
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
        <div className="flex items-start gap-4">
          <Shield className="h-6 w-6 text-purple-600 mt-1" />
          <div>
            <h3 className="font-semibold text-purple-900">{t("guidelines.title")}</h3>
            <ul className="mt-2 space-y-1 text-sm text-purple-700">
              <li>• {t("guidelines.items.logged")}</li>
              <li>• {t("guidelines.items.verify")}</li>
              <li>• {t("guidelines.items.report")}</li>
              <li>• {t("guidelines.items.credentials")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
