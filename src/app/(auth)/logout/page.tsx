"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const [error, setError] = useState(false);

  useEffect(() => {
    const logout = async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error:", err);
      }

      // Clear any local storage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Force redirect using window.location (more reliable)
      window.location.href = "/";
    };

    // Add a timeout fallback in case something hangs
    const timeout = setTimeout(() => {
      setError(true);
      window.location.href = "/";
    }, 5000);

    logout().finally(() => {
      clearTimeout(timeout);
    });

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-gray-600">Redirecting...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Signing out...</p>
          </>
        )}
      </div>
    </div>
  );
}
