"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Loader2, Users, X } from "lucide-react";
import {
  getHandovers,
  createHandover,
  completeHandover,
  cancelHandover,
  getDriversByIds,
} from "@/lib/supabase/database";
import { DriverSelectionModal, HandoverCard } from "@/components/handovers";
import { useToast } from "@/components/ui/toast";
import { PermissionGate } from "@/components/auth";
import type { Handover, Driver } from "@/types/database";
import { useTranslations } from "next-intl";

export default function HandoversPage() {
  const { addToast } = useToast();
  const t = useTranslations("handovers");
  const common = useTranslations("common");
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [driverMap, setDriverMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [selectedDriverNames, setSelectedDriverNames] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    scheduled_date: "",
    scheduled_time: "",
    location: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadHandovers();
  }, []);

  async function loadHandovers() {
    setLoading(true);
    try {
      const data = await getHandovers();
      setHandovers(data);

      // Load driver names for all handovers
      const allDriverIds = data.flatMap((h) => h.driver_ids);
      if (allDriverIds.length > 0) {
        const uniqueIds = [...new Set(allDriverIds)];
        const drivers = await getDriversByIds(uniqueIds);
        const nameMap: Record<string, string> = {};
        drivers.forEach((d) => {
          nameMap[d.id] = `${d.first_name} ${d.last_name}`;
        });
        setDriverMap(nameMap);
      }
    } catch (error) {
      console.error("Error loading handovers:", error);
      addToast({
        type: "error",
        title: t("toast.failed"),
        message: t("toast.failedMessage"),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDriverSelect(driverIds: string[]) {
    setSelectedDriverIds(driverIds);
    // Load driver names
    if (driverIds.length > 0) {
      try {
        const drivers = await getDriversByIds(driverIds);
        setSelectedDriverNames(drivers.map((d) => `${d.first_name} ${d.last_name}`));
      } catch (error) {
        console.error("Error loading driver names:", error);
      }
    } else {
      setSelectedDriverNames([]);
    }
  }

  function removeDriver(index: number) {
    const newIds = [...selectedDriverIds];
    const newNames = [...selectedDriverNames];
    newIds.splice(index, 1);
    newNames.splice(index, 1);
    setSelectedDriverIds(newIds);
    setSelectedDriverNames(newNames);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedDriverIds.length === 0) {
      addToast({
        type: "warning",
        title: t("validation.selectDriver"),
      });
      return;
    }

    if (!formData.scheduled_date) {
      addToast({
        type: "warning",
        title: t("validation.selectDate"),
      });
      return;
    }

    setSubmitting(true);
    try {
      await createHandover({
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time || null,
        location: formData.location || null,
        driver_ids: selectedDriverIds,
        status: "scheduled",
        notes: formData.notes || null,
        created_by: null,
        completed_at: null,
      });

      addToast({
        type: "success",
        title: t("toast.scheduled"),
        message: t("toast.scheduledMessage", { count: selectedDriverIds.length }),
      });

      // Reset form
      setShowForm(false);
      setSelectedDriverIds([]);
      setSelectedDriverNames([]);
      setFormData({
        scheduled_date: "",
        scheduled_time: "",
        location: "",
        notes: "",
      });

      // Reload handovers
      loadHandovers();
    } catch (error) {
      console.error("Error creating handover:", error);
      addToast({
        type: "error",
        title: t("toast.failed"),
        message: t("toast.failedMessage"),
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(handoverId: string) {
    setActionLoading(handoverId);
    try {
      await completeHandover(handoverId);
      addToast({
        type: "success",
        title: t("toast.completed"),
        message: t("toast.completedMessage"),
      });
      loadHandovers();
    } catch (error) {
      console.error("Error completing handover:", error);
      addToast({
        type: "error",
        title: t("toast.failed"),
        message: common("tryAgain"),
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(handoverId: string) {
    setActionLoading(handoverId);
    try {
      await cancelHandover(handoverId);
      addToast({
        type: "info",
        title: common("success"),
      });
      loadHandovers();
    } catch (error) {
      console.error("Error cancelling handover:", error);
      addToast({
        type: "error",
        title: t("toast.failed"),
        message: common("tryAgain"),
      });
    } finally {
      setActionLoading(null);
    }
  }

  // Separate handovers by status
  const scheduledHandovers = handovers.filter((h) => h.status === "scheduled");
  const completedHandovers = handovers.filter((h) => h.status === "completed");
  const cancelledHandovers = handovers.filter((h) => h.status === "cancelled");

  // Get IDs of drivers already in scheduled handovers
  const driversInScheduledHandovers = scheduledHandovers.flatMap((h) => h.driver_ids);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500">
            {t("subtitle")}
          </p>
        </div>
        <PermissionGate permission="MANAGE_HANDOVERS">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            {t("scheduleHandover")}
          </button>
        </PermissionGate>
      </div>

      {/* Schedule Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("scheduleHandover")}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected Drivers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.drivers")} *
              </label>
              {selectedDriverIds.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedDriverNames.map((name, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => removeDriver(index)}
                        className="rounded-full p-0.5 hover:bg-green-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-2">{t("noDrivers")}</p>
              )}
              <button
                type="button"
                onClick={() => setShowDriverModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Users className="h-4 w-4" />
                {t("form.drivers")}
              </button>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="scheduled_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("form.date")} *
                </label>
                <input
                  type="date"
                  id="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="scheduled_time"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("form.time")}
                </label>
                <input
                  type="time"
                  id="scheduled_time"
                  value={formData.scheduled_time}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_time: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("card.location")}
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Greenwheels Training Center"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("form.notes")}
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder={t("form.notesPlaceholder")}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {common("cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting || selectedDriverIds.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("form.schedule")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : handovers.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">{t("noDrivers")}</p>
            <p className="text-sm text-gray-400">
              {t("sections.pendingDescription")}
            </p>
          </div>
        </div>
      ) : (
        /* Handover Lists */
        <div className="space-y-8">
          {/* Scheduled */}
          {scheduledHandovers.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {t("sections.pending")} ({scheduledHandovers.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scheduledHandovers.map((handover) => (
                  <HandoverCard
                    key={handover.id}
                    handover={handover}
                    driverNames={handover.driver_ids.map((id) => driverMap[id] || "-")}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                    isLoading={actionLoading === handover.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedHandovers.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {t("sections.completed")} ({completedHandovers.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedHandovers.map((handover) => (
                  <HandoverCard
                    key={handover.id}
                    handover={handover}
                    driverNames={handover.driver_ids.map((id) => driverMap[id] || "-")}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cancelled */}
          {cancelledHandovers.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-500">
                {common("cancel")} ({cancelledHandovers.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cancelledHandovers.map((handover) => (
                  <HandoverCard
                    key={handover.id}
                    handover={handover}
                    driverNames={handover.driver_ids.map((id) => driverMap[id] || "-")}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Driver Selection Modal */}
      <DriverSelectionModal
        isOpen={showDriverModal}
        onClose={() => setShowDriverModal(false)}
        onSelect={handleDriverSelect}
        excludeDriverIds={[...selectedDriverIds, ...driversInScheduledHandovers]}
      />
    </div>
  );
}
