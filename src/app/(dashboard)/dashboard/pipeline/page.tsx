"use client";

import { useState, useEffect } from "react";
import { Filter, RefreshCw } from "lucide-react";
import { PipelineBoard } from "@/components/pipeline";
import { SkeletonPipeline } from "@/components/ui/skeleton";
import type { Driver, DriverStatus } from "@/types/database";
import { getDrivers, updateDriverStatus, subscribeToDrivers, unsubscribeFromChannel } from "@/lib/supabase/database";
import { useToast } from "@/components/ui/toast";
import { PIPELINE_STAGES } from "@/constants";

export default function PipelinePage() {
  const { addToast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4" />
            Filter
          </button>
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
          { label: "Sourced", count: drivers.filter((d) => d.status === "sourced").length, color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200" },
          { label: "Screening", count: drivers.filter((d) => d.status === "screening").length, color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" },
          { label: "Qualified", count: drivers.filter((d) => d.status === "qualified").length, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" },
          { label: "Onboarding", count: drivers.filter((d) => d.status === "onboarding").length, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300" },
          { label: "Handed Over", count: drivers.filter((d) => d.status === "handed_over").length, color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Board */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <PipelineBoard
          drivers={drivers}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
