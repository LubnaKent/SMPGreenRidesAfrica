"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, Phone, MapPin, Loader2, Download } from "lucide-react";
import type { Driver, DriverStatus, SourceChannel } from "@/types/database";
import { PIPELINE_STAGES } from "@/constants";
import { cn } from "@/lib/utils";
import { getDrivers } from "@/lib/supabase/database";
import { exportDriversToCSV } from "@/lib/export";
import { PermissionGate } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";

const statusColors: Record<DriverStatus, string> = {
  sourced: "bg-gray-100 text-gray-800",
  screening: "bg-yellow-100 text-yellow-800",
  qualified: "bg-blue-100 text-blue-800",
  onboarding: "bg-purple-100 text-purple-800",
  handed_over: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const sourceLabels: Record<SourceChannel, string> = {
  social_media: "Social Media",
  referral: "Referral",
  roadshow: "Roadshow",
  boda_stage: "Boda Stage",
  whatsapp: "WhatsApp",
  online_application: "Online Application",
  other: "Other",
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error("Error loading drivers:", err);
      setError("Failed to load drivers. Please check your Supabase connection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const driversToExport = filteredDrivers.length > 0 ? filteredDrivers : drivers;
    exportDriversToCSV(driversToExport);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500">
            {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? "s" : ""} in total
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="EXPORT_DATA">
            <button
              onClick={handleExport}
              disabled={drivers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </PermissionGate>
          <PermissionGate permission="CREATE_DRIVER">
            <Link
              href="/dashboard/drivers/new"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add Driver
            </Link>
          </PermissionGate>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button
            onClick={loadDrivers}
            className="ml-2 font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            showFilters
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                statusFilter === "all"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All
            </button>
            {PIPELINE_STAGES.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setStatusFilter(stage.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  statusFilter === stage.id
                    ? statusColors[stage.id]
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drivers Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        {filteredDrivers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? "No drivers match your filters"
                : "No drivers found. Add your first driver to get started."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link
                href="/dashboard/drivers/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Add First Driver
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/drivers/${driver.id}`}
                        className="font-medium text-gray-900 hover:text-green-600"
                      >
                        {driver.first_name} {driver.last_name}
                      </Link>
                      {driver.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {driver.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5" />
                        {driver.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {sourceLabels[driver.source_channel]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                          statusColors[driver.status]
                        )}
                      >
                        {PIPELINE_STAGES.find((s) => s.id === driver.status)?.label || driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(driver.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/drivers/${driver.id}`}
                        className="text-green-600 hover:text-green-700"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
