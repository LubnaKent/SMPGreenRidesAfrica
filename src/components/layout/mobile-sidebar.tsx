"use client";

import { X } from "lucide-react";
import { Sidebar } from "./sidebar";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 flex w-64 flex-col">
        <div className="absolute right-0 top-0 -mr-12 pt-2">
          <button
            onClick={onClose}
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
