"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User, UserRole } from "@/types/database";

interface AuthState {
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  role: UserRole | null;
}

// Role hierarchy for permission checking (higher number = more privileges)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  smp_admin: 5,
  security_officer: 4,
  smp_agent: 3,
  partner: 2,
  driver: 1,
};

// Role-based permissions
export const PERMISSIONS = {
  // ============================================
  // DRIVER MANAGEMENT
  // ============================================
  VIEW_DRIVERS: ["smp_admin", "smp_agent", "partner", "security_officer"] as UserRole[],
  CREATE_DRIVER: ["smp_admin", "smp_agent"] as UserRole[],
  EDIT_DRIVER: ["smp_admin", "smp_agent"] as UserRole[],
  DELETE_DRIVER: ["smp_admin"] as UserRole[],

  // ============================================
  // DOCUMENT MANAGEMENT
  // ============================================
  VIEW_DOCUMENTS: ["smp_admin", "smp_agent", "partner", "security_officer"] as UserRole[],
  UPLOAD_DOCUMENTS: ["smp_admin", "smp_agent", "driver"] as UserRole[],
  VERIFY_DOCUMENTS: ["smp_admin", "smp_agent", "security_officer"] as UserRole[],
  DELETE_DOCUMENTS: ["smp_admin"] as UserRole[],

  // ============================================
  // SCREENING
  // ============================================
  CONDUCT_SCREENING: ["smp_admin", "smp_agent"] as UserRole[],

  // ============================================
  // HANDOVER MANAGEMENT
  // ============================================
  VIEW_HANDOVERS: ["smp_admin", "smp_agent", "partner"] as UserRole[],
  CREATE_HANDOVER: ["smp_admin", "smp_agent"] as UserRole[],
  MANAGE_HANDOVERS: ["smp_admin", "smp_agent"] as UserRole[],
  COMPLETE_HANDOVER: ["smp_admin"] as UserRole[],

  // ============================================
  // ANALYTICS
  // ============================================
  VIEW_ANALYTICS: ["smp_admin", "smp_agent", "partner"] as UserRole[],
  EXPORT_DATA: ["smp_admin", "smp_agent"] as UserRole[],

  // ============================================
  // SETTINGS & USER MANAGEMENT
  // ============================================
  VIEW_SETTINGS: ["smp_admin", "smp_agent", "partner", "security_officer", "driver"] as UserRole[],
  MANAGE_USERS: ["smp_admin"] as UserRole[],
  MANAGE_SECURITY_OFFICERS: ["smp_admin"] as UserRole[],

  // ============================================
  // SECURITY & SENSITIVE DATA
  // ============================================
  VIEW_SENSITIVE_DATA: ["smp_admin", "security_officer"] as UserRole[],
  VET_DOCUMENTS: ["smp_admin", "security_officer"] as UserRole[],
  ACCESS_AUDIT_LOGS: ["smp_admin", "security_officer"] as UserRole[],
  VIEW_ALL_AUDIT_LOGS: ["smp_admin"] as UserRole[],
  DECRYPT_DATA: ["smp_admin", "security_officer"] as UserRole[],

  // ============================================
  // DRIVER PORTAL (Self-service)
  // ============================================
  VIEW_OWN_PROFILE: ["driver"] as UserRole[],
  UPDATE_OWN_PROFILE: ["driver"] as UserRole[],
  UPLOAD_OWN_DOCUMENTS: ["driver"] as UserRole[],
  VIEW_APPLICATION_STATUS: ["driver"] as UserRole[],
  VIEW_TRAINING_SCHEDULE: ["driver", "smp_admin", "smp_agent"] as UserRole[],

  // ============================================
  // MESSAGING
  // ============================================
  SEND_MESSAGES: ["driver", "smp_agent", "smp_admin"] as UserRole[],
  VIEW_ALL_MESSAGES: ["smp_admin", "smp_agent"] as UserRole[],
  VIEW_OWN_MESSAGES: ["driver"] as UserRole[],

  // ============================================
  // ADMIN INTERFACE
  // ============================================
  ACCESS_ADMIN_DASHBOARD: ["smp_admin"] as UserRole[],
  MANAGE_SYSTEM_SETTINGS: ["smp_admin"] as UserRole[],

  // ============================================
  // SECURITY INTERFACE
  // ============================================
  ACCESS_SECURITY_DASHBOARD: ["smp_admin", "security_officer"] as UserRole[],
  ACCESS_VETTING_QUEUE: ["smp_admin", "security_officer"] as UserRole[],

  // ============================================
  // DRIVER PORTAL INTERFACE
  // ============================================
  ACCESS_DRIVER_PORTAL: ["driver"] as UserRole[],

  // ============================================
  // AGENT DASHBOARD
  // ============================================
  ACCESS_AGENT_DASHBOARD: ["smp_admin", "smp_agent", "partner"] as UserRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Default dashboard for each role
export const ROLE_DEFAULT_DASHBOARD: Record<UserRole, string> = {
  smp_admin: "/admin",
  security_officer: "/security",
  smp_agent: "/dashboard",
  partner: "/dashboard",
  driver: "/portal",
};

// Role display labels
export const ROLE_LABELS: Record<UserRole, string> = {
  smp_admin: "Administrator",
  security_officer: "Security Officer",
  smp_agent: "SMP Agent",
  partner: "Partner",
  driver: "Driver",
};

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    role: null,
  });

  useEffect(() => {
    const supabase = createClient();

    // Get initial user and profile
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch user profile with role
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setState({
          user,
          profile: profile as User | null,
          role: profile?.role as UserRole | null,
          loading: false,
        });
      } else {
        setState({
          user: null,
          profile: null,
          role: null,
          loading: false,
        });
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setState({
          user: session.user,
          profile: profile as User | null,
          role: profile?.role as UserRole | null,
          loading: false,
        });
      } else {
        setState({
          user: null,
          profile: null,
          role: null,
          loading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      }
      // Clear state immediately
      setState({
        user: null,
        profile: null,
        role: null,
        loading: false,
      });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out exception:", err);
      // Force redirect even on error
      router.push("/login");
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!state.role) return false;
    return PERMISSIONS[permission].includes(state.role);
  };

  // Check if user has ANY of the specified permissions
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!state.role) return false;
    return permissions.some((permission) =>
      PERMISSIONS[permission].includes(state.role!)
    );
  };

  // Check if user has ALL of the specified permissions
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!state.role) return false;
    return permissions.every((permission) =>
      PERMISSIONS[permission].includes(state.role!)
    );
  };

  // Check if user has at least the specified role level
  const hasRoleLevel = (requiredRole: UserRole): boolean => {
    if (!state.role) return false;
    return ROLE_HIERARCHY[state.role] >= ROLE_HIERARCHY[requiredRole];
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return state.role === "smp_admin";
  };

  // Check if user is security officer
  const isSecurityOfficer = (): boolean => {
    return state.role === "security_officer";
  };

  // Check if user is a driver
  const isDriver = (): boolean => {
    return state.role === "driver";
  };

  // Check if user is agent or higher
  const isAgentOrHigher = (): boolean => {
    return hasRoleLevel("smp_agent");
  };

  // Check if user can view sensitive data
  const canViewSensitiveData = (): boolean => {
    return hasPermission("VIEW_SENSITIVE_DATA");
  };

  // Get the default dashboard for the current user's role
  const getDefaultDashboard = (): string => {
    if (!state.role) return "/login";
    return ROLE_DEFAULT_DASHBOARD[state.role];
  };

  // Get role label for display
  const getRoleLabel = (): string => {
    if (!state.role) return "Unknown";
    return ROLE_LABELS[state.role];
  };

  return {
    user: state.user,
    profile: state.profile,
    role: state.role,
    loading: state.loading,
    signOut,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRoleLevel,
    isAdmin,
    isSecurityOfficer,
    isDriver,
    isAgentOrHigher,
    canViewSensitiveData,
    getDefaultDashboard,
    getRoleLabel,
  };
}
