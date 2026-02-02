"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, Phone, MapPin, Download, X, Calendar, ChevronDown, Check, Loader2 } from "lucide-react";
import { SkeletonTable } from "@/components/ui/skeleton";
import type { Driver, DriverStatus, SourceChannel } from "@/types/database";
import { PIPELINE_STAGES, SOURCE_CHANNELS } from "@/constants";
import { cn } from "@/lib/utils";
import { getDrivers, updateDriver } from "@/lib/supabase/database";
import { exportDriversToCSV } from "@/lib/export";
import { PermissionGate } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

const statusColors: Record<DriverStatus, string> = {
  sourced: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
  screening: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
  qualified: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  onboarding: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
  handed_over: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
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
  const [sourceFilter, setSourceFilter] = useState<SourceChannel | "all">("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkStatusMenu, setShowBulkStatusMenu] = useState(false);
  const { hasPermission } = useAuth();
  const { addToast } = useToast();

  // Count active filters
  const activeFilterCount = [
    statusFilter !== "all",
    sourceFilter !== "all",
    dateFrom !== "",
    dateTo !== "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setStatusFilter("all");
    setSourceFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDrivers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDrivers.map((d) => d.id)));
    }
  };

  const toggleSelectDriver = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setShowBulkStatusMenu(false);
  };

  const handleBulkStatusChange = async (newStatus: DriverStatus) => {
    if (selectedIds.size === 0) return;

    setBulkActionLoading(true);
    setShowBulkStatusMenu(false);

    try {
      const updatePromises = Array.from(selectedIds).map((id) =>
        updateDriver(id, { status: newStatus })
      );
      await Promise.all(updatePromises);

      // Reload drivers to get fresh data
      await loadDrivers();

      addToast({
        type: "success",
        title: "Status updated",
        message: `${selectedIds.size} driver${selectedIds.size !== 1 ? "s" : ""} moved to ${PIPELINE_STAGES.find((s) => s.id === newStatus)?.label}`,
      });

      clearSelection();
    } catch (err) {
      console.error("Error updating drivers:", err);
      addToast({
        type: "error",
        title: "Update failed",
        message: "Failed to update some drivers. Please try again.",
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

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

    const matchesSource =
      sourceFilter === "all" || driver.source_channel === sourceFilter;

    const driverDate = new Date(driver.created_at);
    const matchesDateFrom = !dateFrom || driverDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || driverDate <= new Date(dateTo + "T23:59:59");

    return matchesSearch && matchesStatus && matchesSource && matchesDateFrom && matchesDateTo;
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
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading drivers...</p>
          </div>
        </div>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? "s" : ""} in total
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="EXPORT_DATA">
            <button
              onClick={handleExport}
              disabled={drivers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            showFilters || activeFilterCount > 0
              ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-800 dark:text-green-300">
              Status: {PIPELINE_STAGES.find((s) => s.id === statusFilter)?.label}
              <button
                onClick={() => setStatusFilter("all")}
                className="ml-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {sourceFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-300">
              Source: {SOURCE_CHANNELS.find((s) => s.id === sourceFilter)?.label}
              <button
                onClick={() => setSourceFilter("all")}
                className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {dateFrom && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs font-medium text-purple-800 dark:text-purple-300">
              From: {new Date(dateFrom).toLocaleDateString()}
              <button
                onClick={() => setDateFrom("")}
                className="ml-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {dateTo && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs font-medium text-purple-800 dark:text-purple-300">
              To: {new Date(dateTo).toLocaleDateString()}
              <button
                onClick={() => setDateTo("")}
                className="ml-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Options */}
      {showFilters && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  statusFilter === "all"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Source Channel Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Source Channel
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSourceFilter("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  sourceFilter === "all"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                All
              </button>
              {SOURCE_CHANNELS.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSourceFilter(channel.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    sourceFilter === channel.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  {channel.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Date Added
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="From"
                />
              </div>
              <span className="text-gray-400">to</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drivers Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {filteredDrivers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
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
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <button
                      onClick={toggleSelectAll}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                        selectedIds.size === filteredDrivers.length && filteredDrivers.length > 0
                          ? "border-green-600 bg-green-600 text-white"
                          : selectedIds.size > 0
                          ? "border-green-600 bg-green-100 dark:bg-green-900/30"
                          : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                      )}
                    >
                      {selectedIds.size === filteredDrivers.length && filteredDrivers.length > 0 && (
                        <Check className="h-3 w-3" />
                      )}
                      {selectedIds.size > 0 && selectedIds.size < filteredDrivers.length && (
                        <div className="h-2 w-2 rounded-sm bg-green-600" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className={cn(
                      "transition-colors",
                      selectedIds.has(driver.id)
                        ? "bg-green-50 dark:bg-green-900/10"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                  >
                    <td className="w-12 px-4 py-4">
                      <button
                        onClick={() => toggleSelectDriver(driver.id)}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                          selectedIds.has(driver.id)
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                        )}
                      >
                        {selectedIds.has(driver.id) && <Check className="h-3 w-3" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/drivers/${driver.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400"
                      >
                        {driver.first_name} {driver.last_name}
                      </Link>
                      {driver.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {driver.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="h-3.5 w-3.5" />
                        {driver.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
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
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(driver.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/drivers/${driver.id}`}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
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

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 rounded-xl bg-gray-900 dark:bg-gray-800 px-4 py-3 shadow-2xl ring-1 ring-white/10">
            <span className="text-sm font-medium text-white">
              {selectedIds.size} selected
            </span>
            <div className="h-4 w-px bg-gray-600" />

            {/* Change Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBulkStatusMenu(!showBulkStatusMenu)}
                disabled={bulkActionLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {bulkActionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    Change Status
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>

              {showBulkStatusMenu && !bulkActionLoading && (
                <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                  {PIPELINE_STAGES.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => handleBulkStatusChange(stage.id)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          stage.id === "sourced" && "bg-gray-400",
                          stage.id === "screening" && "bg-yellow-400",
                          stage.id === "qualified" && "bg-blue-400",
                          stage.id === "onboarding" && "bg-purple-400",
                          stage.id === "handed_over" && "bg-green-400",
                          stage.id === "rejected" && "bg-red-400"
                        )}
                      />
                      {stage.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={clearSelection}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
