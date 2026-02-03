"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarCheck,
  BarChart3,
  Settings,
  LogOut,
  Leaf,
  Shield,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";

export function Sidebar() {
  const pathname = usePathname();
  const { role, hasPermission } = useAuth();
  const t = useTranslations("sidebar");
  const brand = useTranslations("brand");
  const nav = useTranslations("nav");

  const isAdmin = role === "smp_admin";

  const navigation = [
    { name: t("overview"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("pipeline"), href: "/dashboard/pipeline", icon: Kanban },
    { name: t("drivers"), href: "/dashboard/drivers", icon: Users },
    { name: t("handovers"), href: "/dashboard/handovers", icon: CalendarCheck },
    { name: t("analytics"), href: "/dashboard/analytics", icon: BarChart3 },
  ];

  const adminNavigation = [
    { name: t("userManagement"), href: "/admin/users", icon: UserCog },
    { name: t("auditLogs"), href: "/admin/audit", icon: Shield },
  ];

  const secondaryNavigation = [
    { name: t("settings"), href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 dark:bg-gray-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-800 dark:border-gray-800/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">{brand("name")}</span>
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">{brand("tagline")}</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {t("main")}
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-400 border border-emerald-500/20"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-emerald-400")} />
                {item.name}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="space-y-1 pt-4">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t("admin")}
            </p>
            {adminNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-400 border border-violet-500/20"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-violet-400")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-gray-800 dark:border-gray-800/50 px-3 py-4">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        <Link
          href="/logout"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400 mt-1"
        >
          <LogOut className="h-5 w-5" />
          {nav("signOut")}
        </Link>
      </div>

      {/* Version/Branding */}
      <div className="px-6 py-3 border-t border-gray-800 dark:border-gray-800/50">
        <p className="text-[10px] text-gray-600">
          {t("version")} • © {t("copyright")}
        </p>
      </div>
    </div>
  );
}
