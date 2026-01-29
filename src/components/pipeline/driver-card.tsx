"use client";

import { Phone, MapPin, Calendar } from "lucide-react";
import type { Driver, SourceChannel } from "@/types/database";

interface DriverCardProps {
  driver: Driver;
  onClick?: () => void;
}

const sourceLabels: Record<SourceChannel, string> = {
  social_media: "Social Media",
  referral: "Referral",
  roadshow: "Roadshow",
  boda_stage: "Boda Stage",
  whatsapp: "WhatsApp",
  online_application: "Online Application",
  other: "Other",
};

export function DriverCard({ driver, onClick }: DriverCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Driver Name */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">
            {driver.first_name} {driver.last_name}
          </h3>
          <span className="inline-block mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {sourceLabels[driver.source_channel]}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Phone className="h-3.5 w-3.5" />
          <span>{driver.phone}</span>
        </div>
        {driver.location && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            <span>{driver.location}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(driver.created_at)}</span>
        </div>
        {driver.screening_score !== null && (
          <span className="text-xs font-medium text-green-600">
            Score: {driver.screening_score}
          </span>
        )}
      </div>
    </div>
  );
}
