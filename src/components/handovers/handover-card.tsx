"use client";

import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import { useState } from "react";
import type { Handover } from "@/types/database";

interface HandoverCardProps {
  handover: Handover;
  driverNames: string[];
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  isLoading?: boolean;
}

export function HandoverCard({
  handover,
  driverNames,
  onComplete,
  onCancel,
  isLoading,
}: HandoverCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-700",
  };

  const statusLabels = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const formattedDate = new Date(handover.scheduled_date).toLocaleDateString("en-UG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {handover.driver_ids.length} Driver{handover.driver_ids.length !== 1 ? "s" : ""}
            </p>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[handover.status]}`}>
              {statusLabels[handover.status]}
            </span>
          </div>
        </div>

        {handover.status === "scheduled" && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              disabled={isLoading}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      onComplete(handover.id);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Mark Complete
                  </button>
                  <button
                    onClick={() => {
                      onCancel(handover.id);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
        {handover.scheduled_time && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{handover.scheduled_time}</span>
          </div>
        )}
        {handover.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{handover.location}</span>
          </div>
        )}
      </div>

      {/* Driver Names */}
      {driverNames.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Drivers</p>
          <div className="flex flex-wrap gap-1">
            {driverNames.slice(0, 5).map((name, index) => (
              <span
                key={index}
                className="inline-flex rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >
                {name}
              </span>
            ))}
            {driverNames.length > 5 && (
              <span className="inline-flex rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                +{driverNames.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {handover.notes && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</p>
          <p className="text-sm text-gray-600">{handover.notes}</p>
        </div>
      )}

      {handover.completed_at && (
        <div className="mt-3 text-xs text-gray-400">
          Completed: {new Date(handover.completed_at).toLocaleString("en-UG")}
        </div>
      )}
    </div>
  );
}
