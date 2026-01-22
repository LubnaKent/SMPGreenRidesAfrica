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
import type { Driver } from "@/types/database";

const FUNNEL_COLORS = ["#9CA3AF", "#FCD34D", "#60A5FA", "#A78BFA", "#34D399"];
const SOURCE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280"];

export default function AnalyticsPage() {
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
    name: stage.label,
    value: data?.funnelData[stage.id] || 0,
    fill: FUNNEL_COLORS[index],
  }));

  const sourceChartData = SOURCE_CHANNELS.map((source, index) => ({
    name: source.label,
    value: data?.sourceData[source.id] || 0,
    fill: SOURCE_COLORS[index],
  })).filter(item => item.value > 0);

  const monthlyTableData = [
    { month: "February", key: "february", target: MONTHLY_TARGETS_2026.february },
    { month: "March", key: "march", target: MONTHLY_TARGETS_2026.march },
    { month: "April", key: "april", target: MONTHLY_TARGETS_2026.april },
    { month: "May", key: "may", target: MONTHLY_TARGETS_2026.may },
    { month: "June", key: "june", target: MONTHLY_TARGETS_2026.june },
    { month: "July", key: "july", target: MONTHLY_TARGETS_2026.july },
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">
            Track performance metrics and acquisition data
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
              Export PDF
            </button>
            <button
              onClick={handleExportSummary}
              disabled={drivers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportDrivers}
              disabled={drivers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export Drivers
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
              <p className="text-sm text-gray-500">Cost per Acquisition</p>
              <p className="text-2xl font-bold text-gray-900">
                UGX {CPA_RATE_UGX.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Per qualified driver</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.totalDrivers || 0}
              </p>
              <p className="text-xs text-gray-400">In pipeline</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.conversionRate.toFixed(1) || 0}%
              </p>
              <p className="text-xs text-gray-400">Sourced to handed over</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentActual} / {currentTarget}
              </p>
              <p className="text-xs text-gray-400">Drivers handed over</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Acquisition Funnel */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Acquisition Funnel</h2>
          <p className="text-sm text-gray-500">Drivers at each pipeline stage</p>
          <div className="mt-4 h-72">
            {funnelChartData.every(d => d.value === 0) ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p className="text-sm">No data yet. Add drivers to see the funnel.</p>
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
          <h2 className="text-lg font-semibold text-gray-900">Source Performance</h2>
          <p className="text-sm text-gray-500">Drivers by acquisition channel</p>
          <div className="mt-4 h-72">
            {sourceChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p className="text-sm">No data yet. Add drivers to see source breakdown.</p>
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
        <h2 className="text-lg font-semibold text-gray-900">Monthly Targets (2026)</h2>
        <p className="text-sm text-gray-500">Track progress against acquisition targets</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left font-medium text-gray-500">Month</th>
                <th className="pb-3 text-right font-medium text-gray-500">Target</th>
                <th className="pb-3 text-right font-medium text-gray-500">Actual</th>
                <th className="pb-3 text-right font-medium text-gray-500">Progress</th>
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
                <td className="pt-3 text-gray-900">Total</td>
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
