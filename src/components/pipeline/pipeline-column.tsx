"use client";

import { Plus } from "lucide-react";
import type { Driver, DriverStatus } from "@/types/database";
import { DriverCard } from "./driver-card";
import { cn } from "@/lib/utils";

interface PipelineColumnProps {
  id: DriverStatus;
  title: string;
  description: string;
  color: string;
  drivers: Driver[];
  onAddDriver?: () => void;
  onDriverClick?: (driver: Driver) => void;
  onDrop?: (driverId: string, newStatus: DriverStatus) => void;
}

export function PipelineColumn({
  id,
  title,
  description,
  color,
  drivers,
  onAddDriver,
  onDriverClick,
  onDrop,
}: PipelineColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-gray-100");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-gray-100");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-gray-100");
    const driverId = e.dataTransfer.getData("driverId");
    if (driverId && onDrop) {
      onDrop(driverId, id);
    }
  };

  const handleDragStart = (e: React.DragEvent, driverId: string) => {
    e.dataTransfer.setData("driverId", driverId);
  };

  return (
    <div className="flex w-80 flex-shrink-0 flex-col rounded-lg bg-gray-50">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className={cn("h-3 w-3 rounded-full", color)} />
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
          {drivers.length}
        </span>
      </div>

      {/* Column Content */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 space-y-3 overflow-y-auto p-3 pt-0 transition-colors"
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        {drivers.map((driver) => (
          <div
            key={driver.id}
            draggable
            onDragStart={(e) => handleDragStart(e, driver.id)}
            className="cursor-grab active:cursor-grabbing"
          >
            <DriverCard
              driver={driver}
              onClick={() => onDriverClick?.(driver)}
            />
          </div>
        ))}

        {drivers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-gray-400">No drivers</p>
            <p className="text-xs text-gray-300">Drag drivers here</p>
          </div>
        )}
      </div>

      {/* Add Driver Button (only for first column) */}
      {id === "sourced" && onAddDriver && (
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={onAddDriver}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-green-500 hover:text-green-600"
          >
            <Plus className="h-4 w-4" />
            Add Driver
          </button>
        </div>
      )}
    </div>
  );
}
