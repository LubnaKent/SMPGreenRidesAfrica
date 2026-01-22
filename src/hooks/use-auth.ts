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

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  smp_admin: 3,
  smp_agent: 2,
  partner: 1,
};

// Role-based permissions
export const PERMISSIONS = {
  // Driver management
  VIEW_DRIVERS: ["smp_admin", "smp_agent", "partner"] as UserRole[],
  CREATE_DRIVER: ["smp_admin", "smp_agent"] as UserRole[],
  EDIT_DRIVER: ["smp_admin", "smp_agent"] as UserRole[],
  DELETE_DRIVER: ["smp_admin"] as UserRole[],

  // Document management
  VIEW_DOCUMENTS: ["smp_admin", "smp_agent", "partner"] as UserRole[],
  UPLOAD_DOCUMENTS: ["smp_admin", "smp_agent"] as UserRole[],
  VERIFY_DOCUMENTS: ["smp_admin", "smp_agent"] as UserRole[],
  DELETE_DOCUMENTS: ["smp_admin"] as UserRole[],

  // Screening
  CONDUCT_SCREENING: ["smp_admin", "smp_agent"] as UserRole[],

  // Handover management
  VIEW_HANDOVERS: ["smp_admin", "smp_agent", "partner"] as UserRole[],
  CREATE_HANDOVER: ["smp_admin", "smp_agent"] as UserRole[],
  COMPLETE_HANDOVER: ["smp_admin"] as UserRole[],

  // Analytics
  VIEW_ANALYTICS: ["smp_admin", "smp_agent", "partner"] as UserRole[],
  EXPORT_DATA: ["smp_admin", "smp_agent"] as UserRole[],

  // Settings
  VIEW_SETTINGS: ["smp_admin", "smp_agent", "partner"] as UserRole[],
  MANAGE_USERS: ["smp_admin"] as UserRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!state.role) return false;
    return PERMISSIONS[permission].includes(state.role);
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

  // Check if user is agent or higher
  const isAgentOrHigher = (): boolean => {
    return hasRoleLevel("smp_agent");
  };

  return {
    user: state.user,
    profile: state.profile,
    role: state.role,
    loading: state.loading,
    signOut,
    hasPermission,
    hasRoleLevel,
    isAdmin,
    isAgentOrHigher,
  };
}
