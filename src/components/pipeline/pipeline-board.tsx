"use client";

import { useRouter } from "next/navigation";
import type { Driver, DriverStatus } from "@/types/database";
import { PipelineColumn } from "./pipeline-column";
import { PIPELINE_STAGES } from "@/constants";

interface PipelineBoardProps {
  drivers: Driver[];
  onStatusChange?: (driverId: string, newStatus: DriverStatus) => void;
}

export function PipelineBoard({ drivers, onStatusChange }: PipelineBoardProps) {
  const router = useRouter();

  const getDriversByStatus = (status: DriverStatus) => {
    return drivers.filter((driver) => driver.status === status);
  };

  const handleAddDriver = () => {
    router.push("/dashboard/drivers/new");
  };

  const handleDriverClick = (driver: Driver) => {
    router.push(`/dashboard/drivers/${driver.id}`);
  };

  const handleDrop = (driverId: string, newStatus: DriverStatus) => {
    if (onStatusChange) {
      onStatusChange(driverId, newStatus);
    }
  };

  // Map colors from constants to Tailwind classes
  const colorMap: Record<DriverStatus, string> = {
    sourced: "bg-gray-400",
    screening: "bg-yellow-400",
    qualified: "bg-blue-400",
    onboarding: "bg-purple-400",
    handed_over: "bg-green-400",
    rejected: "bg-red-400",
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => (
        <PipelineColumn
          key={stage.id}
          id={stage.id}
          title={stage.label}
          description={stage.description}
          color={colorMap[stage.id]}
          drivers={getDriversByStatus(stage.id)}
          onAddDriver={stage.id === "sourced" ? handleAddDriver : undefined}
          onDriverClick={handleDriverClick}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
