"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Clock, Target, DollarSign, Download, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAnalyticsData, getDrivers } from "@/lib/supabase/database";
import { PIPELINE_STAGES, SOURCE_CHANNELS, MONTHLY_TARGETS_2026, CPA_RATE_UGX } from "@/constants";
import { exportDriversToCSV, generateDriverSummary, exportSummaryReport, exportAnalyticsPDF } from "@/lib/export";
import { PermissionGate } from "@/components/auth";
import type { Driver, SourceChannel } from "@/types/database";
import { useTranslations } from "next-intl";

const FUNNEL_COLORS = ["#9CA3AF", "#FCD34D", "#60A5FA", "#A78BFA", "#34D399"];
const SOURCE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280"];

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const pipeline = useTranslations("pipeline.stages");
  const months = useTranslations("analytics.months");
  const sources = useTranslations("drivers.sources");

  // Source and stage labels with translations
  const SOURCE_CHANNEL_LABELS: Record<SourceChannel, string> = {
    social_media: sources("socialMedia"),
    referral: sources("referral"),
    roadshow: sources("roadshow"),
    boda_stage: sources("bodaStage"),
    whatsapp: sources("whatsapp"),
    online_application: sources("onlineApplication"),
    other: sources("other"),
  };

  const STAGE_LABELS: Record<string, string> = {
    sourced: pipeline("sourced"),
    screening: pipeline("screening"),
    qualified: pipeline("qualified"),
    onboarding: pipeline("onboarding"),
    handed_over: pipeline("handedOver"),
  };
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [data, setData] = useState<{
    funnelData: Record<string, number>;
    sourceData: Record<string, number>;
    monthlyData: Record<string, number>;
    totalDrivers: number;
    handedOver: number;
    conversionRate: number;
  } | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [analyticsData, driversData] = await Promise.all([
          getAnalyticsData(),
          getDrivers(),
        ]);
        setData(analyticsData);
        setDrivers(driversData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const handleExportDrivers = () => {
    exportDriversToCSV(drivers);
  };

  const handleExportSummary = () => {
    const summary = generateDriverSummary(drivers);
    exportSummaryReport(summary);
  };

  const handleExportPDF = () => {
    const summary = generateDriverSummary(drivers);
    exportAnalyticsPDF(summary, data?.monthlyData || {});
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Transform data for charts
  const funnelChartData = PIPELINE_STAGES.filter(s => s.id !== "rejected").map((stage, index) => ({
    name: STAGE_LABELS[stage.id] || stage.label,
    value: data?.funnelData[stage.id] || 0,
    fill: FUNNEL_COLORS[index],
  }));

  const sourceChartData = SOURCE_CHANNELS.map((source, index) => ({
    name: SOURCE_CHANNEL_LABELS[source.id as SourceChannel] || source.label,
    value: data?.sourceData[source.id] || 0,
    fill: SOURCE_COLORS[index],
  })).filter(item => item.value > 0);

  const monthlyTableData = [
    { month: months("february"), key: "february", target: MONTHLY_TARGETS_2026.february },
    { month: months("march"), key: "march", target: MONTHLY_TARGETS_2026.march },
    { month: months("april"), key: "april", target: MONTHLY_TARGETS_2026.april },
    { month: months("may"), key: "may", target: MONTHLY_TARGETS_2026.may },
    { month: months("june"), key: "june", target: MONTHLY_TARGETS_2026.june },
    { month: months("july"), key: "july", target: MONTHLY_TARGETS_2026.july },
  ];

  const totalTarget = Object.values(MONTHLY_TARGETS_2026).reduce((a, b) => a + b, 0);
  const totalActual = data?.handedOver || 0;

  // Current month target (based on current date)
  const currentMonth = new Date().getMonth();
  const currentMonthKey = ["january", "february", "march", "april", "may", "june", "july"][currentMonth] || "february";
  const currentTarget = MONTHLY_TARGETS_2026[currentMonthKey as keyof typeof MONTHLY_TARGETS_2026] || 40;
  const currentActual = data?.monthlyData[currentMonthKey] || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500">
            {t("subtitle")}
          </p>
        </div>
        <PermissionGate permission="EXPORT_DATA">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportPDF}
              disabled={drivers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              {t("export.pdf")}
            </button>
            <button
              onClick={handleExportSummary}
              disabled={drivers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {t("export.csv")}
            </button>
            <button
              onClick={handleExportDrivers}
              disabled={drivers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {t("export.drivers")}
            </button>
          </div>
        </PermissionGate>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("kpi.costPerAcquisition")}</p>
              <p className="text-2xl font-bold text-gray-900">
                UGX {CPA_RATE_UGX.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">{t("kpi.perQualified")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("kpi.totalDrivers")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.totalDrivers || 0}
              </p>
              <p className="text-xs text-gray-400">{t("kpi.inPipeline")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("kpi.conversionRate")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.conversionRate.toFixed(1) || 0}%
              </p>
              <p className="text-xs text-gray-400">{t("kpi.sourcedToHandedOver")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("kpi.thisMonth")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentActual} / {currentTarget}
              </p>
              <p className="text-xs text-gray-400">{t("kpi.driversHandedOver")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Acquisition Funnel */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">{t("funnel.title")}</h2>
          <p className="text-sm text-gray-500">{t("funnel.subtitle")}</p>
          <div className="mt-4 h-72">
            {funnelChartData.every(d => d.value === 0) ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p className="text-sm">{t("funnel.empty")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip
                    formatter={(value) => [value, "Drivers"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Source Performance */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">{t("sources.title")}</h2>
          <p className="text-sm text-gray-500">{t("sources.subtitle")}</p>
          <div className="mt-4 h-72">
            {sourceChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p className="text-sm">{t("sources.empty")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Drivers"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t("targets.title")}</h2>
        <p className="text-sm text-gray-500">{t("targets.subtitle")}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left font-medium text-gray-500">{t("targets.month")}</th>
                <th className="pb-3 text-right font-medium text-gray-500">{t("targets.target")}</th>
                <th className="pb-3 text-right font-medium text-gray-500">{t("targets.actual")}</th>
                <th className="pb-3 text-right font-medium text-gray-500">{t("targets.progress")}</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTableData.map((row) => {
                const actual = data?.monthlyData[row.key] || 0;
                const progress = row.target > 0 ? (actual / row.target) * 100 : 0;
                return (
                  <tr key={row.month} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{row.month}</td>
                    <td className="py-3 text-right text-gray-900">{row.target}</td>
                    <td className="py-3 text-right text-gray-900">{actual}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span
                          className={
                            progress >= 100
                              ? "text-green-600"
                              : progress >= 50
                              ? "text-yellow-600"
                              : "text-gray-400"
                          }
                        >
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-medium">
                <td className="pt-3 text-gray-900">{t("targets.total")}</td>
                <td className="pt-3 text-right text-gray-900">{totalTarget}</td>
                <td className="pt-3 text-right text-gray-900">{totalActual}</td>
                <td className="pt-3 text-right">
                  <span
                    className={
                      totalActual >= totalTarget
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  >
                    {totalTarget > 0
                      ? ((totalActual / totalTarget) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
