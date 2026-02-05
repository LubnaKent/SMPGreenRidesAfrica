"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FileText,
  ClipboardList,
  Calendar,
  MessageSquare,
  LogOut,
  Bike,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { name: "My Profile", href: "/portal/profile", icon: User },
  { name: "Documents", href: "/portal/documents", icon: FileText },
  { name: "Application Status", href: "/portal/application", icon: ClipboardList },
  { name: "Training", href: "/portal/training", icon: Calendar },
  { name: "Messages", href: "/portal/messages", icon: MessageSquare },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { profile, getRoleLabel } = useAuth();

  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "DR";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-orange-900 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-orange-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
              <Bike className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Driver Portal</span>
              <span className="text-xs text-orange-300">SMP Green Rides</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-orange-300 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-800 text-white"
                    : "text-orange-200 hover:bg-orange-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-orange-800 px-3 py-4">
          <Link
            href="/logout"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-orange-200 hover:bg-orange-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Driver Portal
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
              >
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getInitials()}
                  </span>
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.name || "Driver"}
                  </p>
                  <p className="text-xs text-gray-500">{getRoleLabel()}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <Link
                      href="/portal/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <Link
                      href="/logout"
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
