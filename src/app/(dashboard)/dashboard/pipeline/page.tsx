"use client";

import { useState, useEffect } from "react";
import { Filter, RefreshCw, Search, X, Check, Users, ClipboardCheck, Award, Rocket, CheckCircle2 } from "lucide-react";
import { PipelineBoard } from "@/components/pipeline";
import { SkeletonPipeline } from "@/components/ui/skeleton";
import type { Driver, DriverStatus, SourceChannel } from "@/types/database";
import { getDrivers, updateDriverStatus, subscribeToDrivers, unsubscribeFromChannel } from "@/lib/supabase/database";
import { useToast } from "@/components/ui/toast";
import { PIPELINE_STAGES, SOURCE_CHANNELS } from "@/constants";

export default function PipelinePage() {
  const { addToast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSources, setSelectedSources] = useState<SourceChannel[]>([]);

  useEffect(() => {
    loadDrivers();

    // Subscribe to real-time updates
    const channel = subscribeToDrivers((payload) => {
      if (payload.eventType === "INSERT") {
        setDrivers((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setDrivers((prev) =>
          prev.map((d) => (d.id === payload.new.id ? payload.new : d))
        );
      } else if (payload.eventType === "DELETE") {
        setDrivers((prev) => prev.filter((d) => d.id !== payload.old.id));
      }
    });

    return () => {
      unsubscribeFromChannel(channel);
    };
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error("Error loading drivers:", err);
      setError("Failed to load pipeline. Please check your Supabase connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (driverId: string, newStatus: DriverStatus) => {
    const driver = drivers.find((d) => d.id === driverId);
    const stageName = PIPELINE_STAGES.find((s) => s.id === newStatus)?.label || newStatus;

    try {
      // Optimistic update
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driverId
            ? { ...d, status: newStatus, updated_at: new Date().toISOString() }
            : d
        )
      );

      // Update in database
      await updateDriverStatus(driverId, newStatus);

      addToast({
        type: "success",
        title: "Status updated",
        message: `${driver?.first_name} ${driver?.last_name} moved to ${stageName}`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      addToast({
        type: "error",
        title: "Failed to update status",
        message: "Please try again",
      });
      // Revert on error
      loadDrivers();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDrivers();
    setIsRefreshing(false);
  };

  const toggleSource = (source: SourceChannel) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSources([]);
  };

  const hasActiveFilters = searchQuery.length > 0 || selectedSources.length > 0;

  // Filter drivers based on search and source filters
  const filteredDrivers = drivers.filter((driver) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        driver.first_name.toLowerCase().includes(query) ||
        driver.last_name.toLowerCase().includes(query) ||
        driver.phone.includes(query) ||
        (driver.location?.toLowerCase().includes(query) ?? false);
      if (!matchesSearch) return false;
    }

    // Source filter
    if (selectedSources.length > 0) {
      if (!selectedSources.includes(driver.source_channel)) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading pipeline...</p>
        </div>
        <SkeletonPipeline />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag and drop drivers between stages to update their status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                  {selectedSources.length + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilters && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilters(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-lg">
                  {/* Search */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Name, phone, location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Source Channels */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Source Channel
                    </label>
                    <div className="space-y-1">
                      {SOURCE_CHANNELS.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => toggleSource(source.id)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                            selectedSources.includes(source.id)
                              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {source.label}
                          {selectedSources.includes(source.id) && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                      Clear all filters
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Sourced", count: filteredDrivers.filter((d) => d.status === "sourced").length, icon: Users, iconBg: "bg-gray-100 dark:bg-gray-700", iconColor: "text-gray-600 dark:text-gray-300" },
          { label: "Screening", count: filteredDrivers.filter((d) => d.status === "screening").length, icon: ClipboardCheck, iconBg: "bg-yellow-100 dark:bg-yellow-900/30", iconColor: "text-yellow-600 dark:text-yellow-400" },
          { label: "Qualified", count: filteredDrivers.filter((d) => d.status === "qualified").length, icon: Award, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400" },
          { label: "Onboarding", count: filteredDrivers.filter((d) => d.status === "onboarding").length, icon: Rocket, iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400" },
          { label: "Handed Over", count: filteredDrivers.filter((d) => d.status === "handed_over").length, icon: CheckCircle2, iconBg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600 dark:text-green-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
              </div>
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
            {/* Decorative gradient */}
            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{
              background: stat.iconColor.includes("green") ? "radial-gradient(circle, #22c55e 0%, transparent 70%)" :
                stat.iconColor.includes("purple") ? "radial-gradient(circle, #a855f7 0%, transparent 70%)" :
                stat.iconColor.includes("blue") ? "radial-gradient(circle, #3b82f6 0%, transparent 70%)" :
                stat.iconColor.includes("yellow") ? "radial-gradient(circle, #eab308 0%, transparent 70%)" :
                "radial-gradient(circle, #6b7280 0%, transparent 70%)"
            }} />
          </div>
        ))}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">Showing {filteredDrivers.length} of {drivers.length} drivers:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm text-gray-700 dark:text-gray-200">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-gray-900 dark:hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedSources.map((source) => (
            <span key={source} className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm text-green-700 dark:text-green-300">
              {SOURCE_CHANNELS.find((s) => s.id === source)?.label}
              <button onClick={() => toggleSource(source)} className="ml-1 hover:text-green-900 dark:hover:text-green-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Pipeline Board */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <PipelineBoard
          drivers={filteredDrivers}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
