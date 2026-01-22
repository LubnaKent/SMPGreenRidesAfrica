"use client";

import { useState, useEffect } from "react";
import { X, Search, Check, Loader2, User } from "lucide-react";
import { getDrivers } from "@/lib/supabase/database";
import type { Driver } from "@/types/database";

interface DriverSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (driverIds: string[]) => void;
  excludeDriverIds?: string[];
}

export function DriverSelectionModal({
  isOpen,
  onClose,
  onSelect,
  excludeDriverIds = [],
}: DriverSelectionModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadDrivers();
      setSelectedIds(new Set());
      setSearch("");
    }
  }, [isOpen]);

  async function loadDrivers() {
    setLoading(true);
    try {
      // Get drivers that are qualified or in onboarding (ready for handover)
      const [qualified, onboarding] = await Promise.all([
        getDrivers({ status: "qualified" }),
        getDrivers({ status: "onboarding" }),
      ]);
      const allEligible = [...qualified, ...onboarding].filter(
        (d) => !excludeDriverIds.includes(d.id)
      );
      setDrivers(allEligible);
    } catch (error) {
      console.error("Error loading drivers:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDrivers = drivers.filter((driver) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      driver.first_name.toLowerCase().includes(searchLower) ||
      driver.last_name.toLowerCase().includes(searchLower) ||
      driver.phone.includes(search)
    );
  });

  const toggleDriver = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredDrivers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDrivers.map((d) => d.id)));
    }
  };

  const handleConfirm = () => {
    onSelect(Array.from(selectedIds));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[80vh] rounded-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Select Drivers for Handover
            </h2>
            <p className="text-sm text-gray-500">
              Choose qualified drivers to include in this handover batch
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Driver List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">No eligible drivers found</p>
              <p className="text-sm text-gray-400">
                Drivers must be in &quot;Qualified&quot; or &quot;Onboarding&quot; status
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={toggleAll}
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                >
                  {selectedIds.size === filteredDrivers.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedIds.size} of {filteredDrivers.length} selected
                </span>
              </div>

              {/* Driver Cards */}
              <div className="space-y-2">
                {filteredDrivers.map((driver) => {
                  const isSelected = selectedIds.has(driver.id);
                  return (
                    <div
                      key={driver.id}
                      onClick={() => toggleDriver(driver.id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          isSelected
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {driver.first_name} {driver.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{driver.phone}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            driver.status === "qualified"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {driver.status === "qualified" ? "Qualified" : "Onboarding"}
                        </span>
                        {driver.screening_score !== null && (
                          <p className="mt-1 text-xs text-gray-400">
                            Score: {driver.screening_score}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add {selectedIds.size} Driver{selectedIds.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
