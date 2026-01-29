import { createClient } from "@/lib/supabase/server";
import type { AuditAction, UserRole, AuditLog } from "@/types/database";

interface CreateAuditLogParams {
  userId: string;
  userRole: UserRole;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates an audit log entry
 */
export async function createAuditLog(
  params: CreateAuditLogParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("audit_logs").insert({
      user_id: params.userId,
      user_role: params.userRole,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId || null,
      old_value: params.oldValue || null,
      new_value: params.newValue || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      metadata: params.metadata || null,
    });

    if (error) {
      console.error("Failed to create audit log:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Audit log exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Logs sensitive data access
 */
export async function logSensitiveDataAccess(
  userId: string,
  userRole: UserRole,
  driverId: string,
  accessedFields: string[],
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userRole,
    action: "VIEW_SENSITIVE",
    resourceType: "sensitive_data",
    resourceId: driverId,
    metadata: {
      accessedFields,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Logs data decryption events
 */
export async function logDecryptionEvent(
  userId: string,
  userRole: UserRole,
  driverId: string,
  decryptedFields: string[],
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userRole,
    action: "DECRYPT",
    resourceType: "sensitive_data",
    resourceId: driverId,
    metadata: {
      decryptedFields,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Logs data export events
 */
export async function logDataExport(
  userId: string,
  userRole: UserRole,
  resourceType: string,
  recordCount: number,
  exportFormat: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userRole,
    action: "EXPORT",
    resourceType,
    metadata: {
      recordCount,
      exportFormat,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Logs permission denied events
 */
export async function logPermissionDenied(
  userId: string,
  userRole: UserRole,
  attemptedAction: string,
  resourceType: string,
  resourceId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userRole,
    action: "PERMISSION_DENIED",
    resourceType,
    resourceId,
    metadata: {
      attemptedAction,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Logs user login events
 */
export async function logLogin(
  userId: string,
  userRole: UserRole,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userRole,
    action: "LOGIN",
    resourceType: "auth",
    metadata: {
      timestamp: new Date().toISOString(),
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Logs user logout events
 */
export async function logLogout(
  userId: string,
  userRole: UserRole,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userRole,
    action: "LOGOUT",
    resourceType: "auth",
    metadata: {
      timestamp: new Date().toISOString(),
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Logs CRUD operations on resources
 */
export async function logResourceAction(
  userId: string,
  userRole: UserRole,
  action: "CREATE" | "READ" | "UPDATE" | "DELETE",
  resourceType: string,
  resourceId?: string,
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userRole,
    action,
    resourceType,
    resourceId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
  });
}

/**
 * Retrieves audit logs with filters
 */
export async function getAuditLogs(filters: {
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ data: AuditLog[]; count: number; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters.action) {
      query = query.eq("action", filters.action);
    }
    if (filters.resourceType) {
      query = query.eq("resource_type", filters.resourceType);
    }
    if (filters.resourceId) {
      query = query.eq("resource_id", filters.resourceId);
    }
    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate.toISOString());
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      return { data: [], count: 0, error: error.message };
    }

    return { data: (data as AuditLog[]) || [], count: count || 0 };
  } catch (error) {
    console.error("Get audit logs exception:", error);
    return {
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets audit log statistics for a user
 */
export async function getUserAuditStats(userId: string): Promise<{
  totalActions: number;
  sensitiveDataAccess: number;
  exports: number;
  lastActivity?: string;
}> {
  const supabase = await createClient();

  const { count: totalActions } = await supabase
    .from("audit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: sensitiveDataAccess } = await supabase
    .from("audit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", "VIEW_SENSITIVE");

  const { count: exports } = await supabase
    .from("audit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", "EXPORT");

  const { data: lastActivityData } = await supabase
    .from("audit_logs")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return {
    totalActions: totalActions || 0,
    sensitiveDataAccess: sensitiveDataAccess || 0,
    exports: exports || 0,
    lastActivity: lastActivityData?.created_at,
  };
}
