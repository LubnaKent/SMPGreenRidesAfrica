"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: "default" | "compact";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  const ActionButton = actionHref ? (
    <Link
      href={actionHref}
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
    >
      {actionLabel}
    </Link>
  ) : onAction ? (
    <button
      onClick={onAction}
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
    >
      {actionLabel}
    </button>
  ) : null;

  if (isCompact) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3">
          <Icon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {actionLabel && <div className="mt-3">{ActionButton}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Decorative background */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 blur-xl opacity-60" />
        <div className="relative rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 p-6 shadow-sm">
          <Icon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>

      {actionLabel && <div className="mt-6">{ActionButton}</div>}
    </div>
  );
}
