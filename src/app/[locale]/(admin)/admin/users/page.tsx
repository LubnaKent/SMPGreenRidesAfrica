"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";
import type { User, UserRole } from "@/types/database";
import { ROLE_LABELS } from "@/hooks/use-auth";

const ROLE_COLORS: Record<UserRole, string> = {
  smp_admin: "bg-red-100 text-red-700",
  security_officer: "bg-purple-100 text-purple-700",
  smp_agent: "bg-green-100 text-green-700",
  partner: "bg-blue-100 text-blue-700",
  driver: "bg-orange-100 text-orange-700",
};

function UserManagementContent() {
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get("role") as UserRole | null;
  const { addToast } = useToast();
  const t = useTranslations("admin.users");
  const common = useTranslations("common");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">(
    roleFilter || "all"
  );
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

    if (selectedRole !== "all") {
      query = query.eq("role", selectedRole);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data as User[]);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const user = users.find((u) => u.id === userId);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Error updating role:", error);
      addToast({
        type: "error",
        title: t("toast.roleUpdateFailed"),
        message: common("tryAgain"),
      });
    } else {
      addToast({
        type: "success",
        title: t("toast.roleUpdated"),
        message: t("toast.roleUpdatedMessage", { name: user?.name || "User", role: ROLE_LABELS[newRole] }),
      });
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm(t("confirmDelete"))) return;

    const user = users.find((u) => u.id === userId);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      console.error("Error deleting user:", error);
      addToast({
        type: "error",
        title: t("toast.userDeleteFailed"),
        message: common("tryAgain"),
      });
    } else {
      addToast({
        type: "success",
        title: t("toast.userDeleted"),
        message: t("toast.userDeletedMessage", { name: user?.name || "User" }),
      });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <Plus className="h-4 w-4" />
          {t("addUser")}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <button
            onClick={() => setShowRoleFilter(!showRoleFilter)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 text-gray-500" />
            <span>
              {selectedRole === "all" ? t("allRoles") : ROLE_LABELS[selectedRole]}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {showRoleFilter && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowRoleFilter(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedRole("all");
                    setShowRoleFilter(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  {t("allRoles")}
                </button>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setShowRoleFilter(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.user")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.role")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.joined")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  {t("loading")}
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  {t("noUsers")}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ROLE_COLORS[user.role]
                      }`}
                    >
                      {user.role === "security_officer" && (
                        <Shield className="h-3 w-3" />
                      )}
                      {user.role === "smp_admin" && (
                        <UserCheck className="h-3 w-3" />
                      )}
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-100 hover:text-red-600"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("editRole.title")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("editRole.changeRoleFor")}{" "}
              <span className="font-medium">{editingUser.name}</span>
            </p>

            <div className="space-y-2 mb-6">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    updateUserRole(editingUser.id, role);
                    setEditingUser(null);
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    editingUser.role === role
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role]}`}
                  >
                    {ROLE_LABELS[role]}
                  </span>
                  {editingUser.role === role && (
                    <span className="text-xs text-red-600">{t("editRole.current")}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {common("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      }
    >
      <UserManagementContent />
    </Suspense>
  );
}
