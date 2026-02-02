"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChevronRight,
  Loader2,
  Zap,
  Target,
  Calendar,
} from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { getDrivers } from "@/lib/supabase/database";
import { useAuth } from "@/hooks/use-auth";
import { SkeletonStats } from "@/components/ui/skeleton";
import type { Driver, DriverStatus } from "@/types/database";

// Monthly targets for 2026
const MONTHLY_TARGETS: Record<string, number> = {
  january: 40,
  february: 40,
  march: 40,
  april: 60,
  may: 60,
  june: 60,
  july: 60,
};

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error("Error loading drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const now = new Date();
  const currentMonth = now.toLocaleString("en-US", { month: "long" }).toLowerCase();
  const monthTarget = MONTHLY_TARGETS[currentMonth] || 40;

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const driversThisMonth = drivers.filter(
    (d) => new Date(d.created_at) >= thisMonthStart
  );

  const totalDrivers = drivers.length;
  const qualifiedCount = drivers.filter((d) => d.status === "qualified" || d.status === "onboarding" || d.status === "handed_over").length;
  const inPipeline = drivers.filter((d) => d.status === "sourced" || d.status === "screening").length;
  const handedOver = drivers.filter((d) => d.status === "handed_over").length;
  const handedOverThisMonth = driversThisMonth.filter((d) => d.status === "handed_over").length;

  const conversionRate = totalDrivers > 0 ? Math.round((qualifiedCount / totalDrivers) * 100) : 0;
  const targetProgress = Math.round((handedOverThisMonth / monthTarget) * 100);

  // Pipeline summary
  const pipelineStats: { stage: string; status: DriverStatus; count: number; color: string }[] = [
    { stage: "Sourced", status: "sourced", count: drivers.filter((d) => d.status === "sourced").length, color: "bg-gray-400" },
    { stage: "Screening", status: "screening", count: drivers.filter((d) => d.status === "screening").length, color: "bg-yellow-400" },
    { stage: "Qualified", status: "qualified", count: drivers.filter((d) => d.status === "qualified").length, color: "bg-blue-400" },
    { stage: "Onboarding", status: "onboarding", count: drivers.filter((d) => d.status === "onboarding").length, color: "bg-purple-400" },
    { stage: "Handed Over", status: "handed_over", count: drivers.filter((d) => d.status === "handed_over").length, color: "bg-green-400" },
  ];

  const recentDrivers = drivers.slice(0, 5);

  const stats = [
    {
      name: "Total Drivers",
      value: totalDrivers,
      change: `+${driversThisMonth.length} this month`,
      trend: driversThisMonth.length > 0 ? "up" : "neutral",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      name: "Qualified",
      value: qualifiedCount,
      change: `${conversionRate}% conversion`,
      trend: conversionRate > 50 ? "up" : "neutral",
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      name: "In Pipeline",
      value: inPipeline,
      change: "Active candidates",
      trend: "neutral",
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      name: "Handed Over",
      value: handedOver,
      change: `${handedOverThisMonth} this month`,
      trend: handedOverThisMonth > 0 ? "up" : "neutral",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
          <div className="mt-2 h-4 w-64 bg-white/20 rounded animate-pulse" />
        </div>
        <SkeletonStats />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="animate-fade-in-up relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {profile?.name?.split(" ")[0] || "Partner"}!
              </h1>
              <p className="mt-1 text-green-100">
                Here&apos;s what&apos;s happening with your driver pipeline today.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/dashboard/drivers/new"
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Driver
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="animate-on-load animate-fade-in-up group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1 cursor-default"
            style={{ animationDelay: `${150 + index * 100}ms` }}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-gray-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-start justify-between">
              <div className={`rounded-lg p-2.5 ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                <div className={`rounded-md bg-gradient-to-br ${stat.color} p-2 shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-6" />
                </div>
              </div>
              {stat.trend === "up" && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              )}
            </div>
            <div className="relative mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {stat.name}
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                <AnimatedNumber value={stat.value} duration={1200} delay={index * 150} />
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Summary */}
        <div className="animate-on-load animate-fade-in-up group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600" style={{ animationDelay: '550ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pipeline Summary
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drivers by stage</p>
            </div>
            <Zap className="h-5 w-5 text-amber-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          </div>

          <div className="mt-6 space-y-4">
            {pipelineStats.map((item, idx) => {
              const percentage = totalDrivers > 0 ? (item.count / totalDrivers) * 100 : 0;
              return (
                <div key={item.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item.stage}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      <AnimatedNumber value={item.count} duration={1000} delay={400 + idx * 100} />
                    </span>
                  </div>
                  <AnimatedProgress
                    value={percentage}
                    duration={1200}
                    delay={500 + idx * 100}
                    barClassName={item.color}
                  />
                </div>
              );
            })}
          </div>

          <Link
            href="/dashboard/pipeline"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            View full pipeline
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Monthly Target */}
        <div className="animate-on-load animate-fade-in-up group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600" style={{ animationDelay: '650ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Target</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {currentMonth} {now.getFullYear()} progress
              </p>
            </div>
            <Target className="h-5 w-5 text-green-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-5xl font-bold text-gray-900 dark:text-white">
                  <AnimatedNumber value={handedOverThisMonth} duration={1500} delay={600} />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  of {monthTarget} drivers
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${targetProgress >= 100 ? 'text-green-600' : targetProgress >= 50 ? 'text-amber-600' : 'text-gray-400'}`}>
                  <AnimatedNumber value={targetProgress} duration={1500} delay={800} suffix="%" />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">complete</p>
              </div>
            </div>

            <AnimatedProgress
              value={targetProgress}
              duration={1500}
              delay={900}
              className="mt-6 h-4"
              barClassName={
                targetProgress >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                targetProgress >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                'bg-gradient-to-r from-gray-400 to-gray-500'
              }
            />

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  <AnimatedNumber value={handedOverThisMonth} duration={1000} delay={1000} />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Handed Over</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  <AnimatedNumber value={Math.max(0, monthTarget - handedOverThisMonth)} duration={1000} delay={1100} />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  <AnimatedNumber value={now.getDate()} duration={800} delay={1200} />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Days In</p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/analytics"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            View analytics
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Recent Drivers */}
      <div className="animate-on-load animate-fade-in-up group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600" style={{ animationDelay: '750ms' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Drivers</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Latest additions to the pipeline</p>
          </div>
          <Calendar className="h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
        </div>

        {recentDrivers.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-4">
              <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No drivers yet</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding your first driver to the pipeline
            </p>
            <Link
              href="/dashboard/drivers/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add First Driver
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recentDrivers.map((driver) => (
              <Link
                key={driver.id}
                href={`/dashboard/drivers/${driver.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-medium">
                    {driver.first_name[0]}{driver.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {driver.first_name} {driver.last_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{driver.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    driver.status === "handed_over" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                    driver.status === "qualified" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                    driver.status === "screening" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}>
                    {driver.status.replace("_", " ")}
                  </span>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(driver.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
            <Link
              href="/dashboard/drivers"
              className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              View all drivers
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
