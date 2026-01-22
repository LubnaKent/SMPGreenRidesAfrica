"use client";

import { useState, useEffect } from "react";
import { Filter, RefreshCw, Loader2 } from "lucide-react";
import { PipelineBoard } from "@/components/pipeline";
import type { Driver, DriverStatus } from "@/types/database";
import { getDrivers, updateDriverStatus, subscribeToDrivers, unsubscribeFromChannel } from "@/lib/supabase/database";

export default function PipelinePage() {
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
    try {
      // Optimistic update
      setDrivers((prev) =>
        prev.map((driver) =>
          driver.id === driverId
            ? { ...driver, status: newStatus, updated_at: new Date().toISOString() }
            : driver
        )
      );

      // Update in database
      await updateDriverStatus(driverId, newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
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
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500">
            Drag and drop drivers between stages to update their status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Sourced", count: drivers.filter((d) => d.status === "sourced").length, color: "bg-gray-100 text-gray-800" },
          { label: "Screening", count: drivers.filter((d) => d.status === "screening").length, color: "bg-yellow-100 text-yellow-800" },
          { label: "Qualified", count: drivers.filter((d) => d.status === "qualified").length, color: "bg-blue-100 text-blue-800" },
          { label: "Onboarding", count: drivers.filter((d) => d.status === "onboarding").length, color: "bg-purple-100 text-purple-800" },
          { label: "Handed Over", count: drivers.filter((d) => d.status === "handed_over").length, color: "bg-green-100 text-green-800" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Board */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <PipelineBoard
          drivers={drivers}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
