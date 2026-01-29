"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  totalUsers: number;
  securityOfficers: number;
  agents: number;
  drivers: number;
  recentAuditLogs: number;
  pendingApplications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    securityOfficers: 0,
    agents: 0,
    drivers: 0,
    recentAuditLogs: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      // Fetch user counts by role
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: securityOfficers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "security_officer");

      const { count: agents } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "smp_agent");

      const { count: drivers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "driver");

      // Fetch recent audit logs (last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { count: recentAuditLogs } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneDayAgo.toISOString());

      // Fetch pending applications
      const { count: pendingApplications } = await supabase
        .from("driver_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setStats({
        totalUsers: totalUsers || 0,
        securityOfficers: securityOfficers || 0,
        agents: agents || 0,
        drivers: drivers || 0,
        recentAuditLogs: recentAuditLogs || 0,
        pendingApplications: pendingApplications || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/users",
    },
    {
      name: "Security Officers",
      value: stats.securityOfficers,
      icon: Shield,
      color: "bg-purple-500",
      href: "/admin/users?role=security_officer",
    },
    {
      name: "SMP Agents",
      value: stats.agents,
      icon: Activity,
      color: "bg-green-500",
      href: "/admin/users?role=smp_agent",
    },
    {
      name: "Registered Drivers",
      value: stats.drivers,
      icon: Users,
      color: "bg-orange-500",
      href: "/admin/users?role=driver",
    },
  ];

  const quickActions = [
    {
      name: "Manage Users",
      description: "Add, edit, or remove user accounts",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "View Audit Logs",
      description: "Review system activity and access logs",
      icon: FileText,
      href: "/admin/audit",
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: "Security Settings",
      description: "Configure security policies",
      icon: Shield,
      href: "/admin/security",
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          System overview and management
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
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

      {/* Alerts section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pending items */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Items
          </h2>
          <div className="space-y-3">
            {stats.pendingApplications > 0 ? (
              <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      Pending Applications
                    </p>
                    <p className="text-sm text-yellow-600">
                      {stats.pendingApplications} applications need review
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/drivers"
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-green-800">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
            <Link
              href="/admin/audit"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-800">
                {stats.recentAuditLogs} events in last 24h
              </p>
              <p className="text-sm text-gray-500">
                View audit logs for details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
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
