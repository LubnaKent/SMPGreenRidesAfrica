"use client";

import { useAuth, type Permission } from "@/hooks/use-auth";
import type { UserRole } from "@/types/database";

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission;
  role?: UserRole;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders children based on user permissions.
 *
 * Usage:
 * ```tsx
 * // Check for specific permission
 * <PermissionGate permission="DELETE_DRIVER">
 *   <DeleteButton />
 * </PermissionGate>
 *
 * // Check for minimum role level
 * <PermissionGate role="smp_agent">
 *   <AdminContent />
 * </PermissionGate>
 *
 * // With fallback content
 * <PermissionGate permission="EXPORT_DATA" fallback={<p>No access</p>}>
 *   <ExportButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  children,
  permission,
  role,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasRoleLevel, loading } = useAuth();

  // While loading, don't render anything to prevent flash
  if (loading) {
    return null;
  }

  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check role level if specified
  if (role && !hasRoleLevel(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component to wrap a component with permission checking.
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: Permission
) {
  return function PermissionWrapper(props: P) {
    const { hasPermission, loading } = useAuth();

    if (loading) {
      return null;
    }

    if (!hasPermission(permission)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
