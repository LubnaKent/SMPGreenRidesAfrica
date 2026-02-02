"use client";

import { Phone, MapPin, Calendar, Star, ChevronRight } from "lucide-react";
import type { Driver, SourceChannel } from "@/types/database";
import { cn } from "@/lib/utils";

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

const sourceColors: Record<SourceChannel, string> = {
  social_media: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  referral: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  roadshow: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  boda_stage: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  whatsapp: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  online_application: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  other: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
};

export function DriverCard({ driver, onClick }: DriverCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-xl border bg-white dark:bg-gray-800 p-4 transition-all duration-200",
        "border-gray-200 dark:border-gray-700",
        "shadow-sm hover:shadow-lg hover:border-green-300 dark:hover:border-green-600",
        "hover:-translate-y-0.5 active:translate-y-0"
      )}
    >
      {/* Driver Name & Score */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {driver.first_name} {driver.last_name}
          </h3>
          <span className={cn(
            "inline-flex items-center mt-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
            sourceColors[driver.source_channel]
          )}>
            {sourceLabels[driver.source_channel]}
          </span>
        </div>

        {driver.screening_score !== null && (
          <div className={cn(
            "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold",
            getScoreColor(driver.screening_score)
          )}>
            <Star className="h-3 w-3" />
            {driver.screening_score}
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{driver.phone}</span>
        </div>
        {driver.location && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{driver.location}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(driver.created_at)}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}
