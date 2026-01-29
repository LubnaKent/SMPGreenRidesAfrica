"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Download,
  Shield,
  User,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AuditLog, AuditAction, UserRole } from "@/types/database";
import { ROLE_LABELS } from "@/hooks/use-auth";

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Created",
  READ: "Viewed",
  UPDATE: "Updated",
  DELETE: "Deleted",
  VIEW_SENSITIVE: "Viewed Sensitive Data",
  DECRYPT: "Decrypted Data",
  EXPORT: "Exported Data",
  LOGIN: "Logged In",
  LOGOUT: "Logged Out",
  PERMISSION_DENIED: "Permission Denied",
};

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: "bg-green-100 text-green-700",
  READ: "bg-blue-100 text-blue-700",
  UPDATE: "bg-yellow-100 text-yellow-700",
  DELETE: "bg-red-100 text-red-700",
  VIEW_SENSITIVE: "bg-purple-100 text-purple-700",
  DECRYPT: "bg-purple-100 text-purple-700",
  EXPORT: "bg-orange-100 text-orange-700",
  LOGIN: "bg-gray-100 text-gray-700",
  LOGOUT: "bg-gray-100 text-gray-700",
  PERMISSION_DENIED: "bg-red-100 text-red-700",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<AuditAction | "all">(
    "all"
  );
  const [showActionFilter, setShowActionFilter] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchLogs();
  }, [selectedAction, page]);

  const fetchLogs = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (selectedAction !== "all") {
      query = query.eq("action", selectedAction);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching audit logs:", error);
    } else {
      setLogs(data as AuditLog[]);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.resource_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "Action", "Resource Type", "Resource ID", "User ID", "User Role", "IP Address"].join(","),
      ...filteredLogs.map((log) =>
        [
          log.created_at,
          log.action,
          log.resource_type,
          log.resource_id || "",
          log.user_id,
          log.user_role,
          log.ip_address || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            View system activity and security events
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* Action filter */}
        <div className="relative">
          <button
            onClick={() => setShowActionFilter(!showActionFilter)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 text-gray-500" />
            <span>
              {selectedAction === "all"
                ? "All Actions"
                : ACTION_LABELS[selectedAction]}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {showActionFilter && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActionFilter(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedAction("all");
                    setShowActionFilter(false);
                    setPage(0);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  All Actions
                </button>
                {(Object.keys(ACTION_LABELS) as AuditAction[]).map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setSelectedAction(action);
                      setShowActionFilter(false);
                      setPage(0);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {ACTION_LABELS[action]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logs table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Loading audit logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No audit logs found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ACTION_COLORS[log.action]
                      }`}
                    >
                      {ACTION_LABELS[log.action]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.resource_type}
                      </p>
                      {log.resource_id && (
                        <p className="text-xs text-gray-500 font-mono">
                          {log.resource_id.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      {log.user_role === "security_officer" && (
                        <Shield className="h-3 w-3" />
                      )}
                      {log.user_role === "driver" && <User className="h-3 w-3" />}
                      {ROLE_LABELS[log.user_role as UserRole] || log.user_role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
            <p className="text-sm text-gray-500">
              Showing {page * pageSize + 1} to{" "}
              {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} logs
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * pageSize >= totalCount}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Audit Log Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase">
                  Timestamp
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase">Action</label>
                <p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ACTION_COLORS[selectedLog.action]
                    }`}
                  >
                    {ACTION_LABELS[selectedLog.action]}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase">
                  Resource
                </label>
                <p className="text-sm text-gray-900">
                  {selectedLog.resource_type}
                </p>
                {selectedLog.resource_id && (
                  <p className="text-xs text-gray-500 font-mono">
                    ID: {selectedLog.resource_id}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase">User</label>
                <p className="text-sm text-gray-900">
                  {ROLE_LABELS[selectedLog.user_role as UserRole] ||
                    selectedLog.user_role}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  ID: {selectedLog.user_id}
                </p>
              </div>

              {selectedLog.ip_address && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">
                    IP Address
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedLog.ip_address}
                  </p>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">
                    Metadata
                  </label>
                  <pre className="mt-1 rounded-lg bg-gray-100 p-3 text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.old_value && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">
                    Old Value
                  </label>
                  <pre className="mt-1 rounded-lg bg-red-50 p-3 text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.old_value, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_value && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">
                    New Value
                  </label>
                  <pre className="mt-1 rounded-lg bg-green-50 p-3 text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.new_value, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
