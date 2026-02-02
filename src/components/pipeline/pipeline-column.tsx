"use client";

import { useState } from "react";
import { Plus, GripVertical } from "lucide-react";
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
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set to false if we're actually leaving the column
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const driverId = e.dataTransfer.getData("driverId");
    if (driverId && onDrop) {
      onDrop(driverId, id);
    }
  };

  const handleDragStart = (e: React.DragEvent, driverId: string) => {
    e.dataTransfer.setData("driverId", driverId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={cn(
        "flex w-80 flex-shrink-0 flex-col rounded-xl transition-all duration-200",
        "bg-gray-50 dark:bg-gray-900/50",
        isDragOver && "ring-2 ring-green-400 ring-offset-2 dark:ring-offset-gray-800 bg-green-50/50 dark:bg-green-900/20"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={cn("h-3 w-3 rounded-full shadow-sm", color)} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <span className={cn(
          "flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold transition-colors",
          drivers.length > 0
            ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
        )}>
          {drivers.length}
        </span>
      </div>

      {/* Column Content */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 space-y-3 overflow-y-auto p-3 pt-0 transition-all duration-200",
          isDragOver && "scale-[1.02]"
        )}
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        {drivers.map((driver, index) => (
          <div
            key={driver.id}
            draggable
            onDragStart={(e) => handleDragStart(e, driver.id)}
            className="cursor-grab active:cursor-grabbing group/drag"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600" />
              </div>
              <DriverCard
                driver={driver}
                onClick={() => onDriverClick?.(driver)}
              />
            </div>
          </div>
        ))}

        {drivers.length === 0 && (
          <div className={cn(
            "flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed transition-colors",
            isDragOver
              ? "border-green-400 bg-green-50/50 dark:bg-green-900/10"
              : "border-gray-200 dark:border-gray-700"
          )}>
            <div className={cn(
              "rounded-full p-3 mb-2",
              isDragOver
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-gray-100 dark:bg-gray-800"
            )}>
              <Plus className={cn(
                "h-5 w-5",
                isDragOver
                  ? "text-green-500"
                  : "text-gray-400 dark:text-gray-500"
              )} />
            </div>
            <p className={cn(
              "text-sm font-medium",
              isDragOver
                ? "text-green-600 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500"
            )}>
              {isDragOver ? "Drop here" : "No drivers"}
            </p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
              Drag drivers here
            </p>
          </div>
        )}
      </div>

      {/* Add Driver Button (only for first column) */}
      {id === "sourced" && onAddDriver && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <button
            onClick={onAddDriver}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all",
              "border-2 border-dashed border-gray-300 dark:border-gray-600",
              "text-gray-500 dark:text-gray-400",
              "hover:border-green-500 hover:text-green-600 dark:hover:border-green-500 dark:hover:text-green-400",
              "hover:bg-green-50/50 dark:hover:bg-green-900/20"
            )}
          >
            <Plus className="h-4 w-4" />
            Add Driver
          </button>
        </div>
      )}
    </div>
  );
}
