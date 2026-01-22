import { createClient } from "./client";
import type {
  Driver,
  DriverStatus,
  SourceChannel,
  DriverDocument,
  StatusHistory,
  Handover,
  User,
} from "@/types/database";

// ============================================
// DRIVERS
// ============================================

export async function getDrivers(filters?: {
  status?: DriverStatus;
  source_channel?: SourceChannel;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();

  let query = supabase
    .from("drivers")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.source_channel) {
    query = query.eq("source_channel", filters.source_channel);
  }

  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Driver[];
}

export async function getDriverById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Driver;
}

export async function createDriver(
  driver: Omit<Driver, "id" | "created_at" | "updated_at">
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("drivers")
    .insert(driver)
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

export async function updateDriver(
  id: string,
  updates: Partial<Omit<Driver, "id" | "created_at" | "updated_at">>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("drivers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

export async function updateDriverStatus(id: string, status: DriverStatus, notes?: string) {
  const supabase = createClient();

  // Update driver status (trigger will log to status_history)
  const { data, error } = await supabase
    .from("drivers")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // If notes provided, update the latest status history entry
  if (notes) {
    await supabase
      .from("status_history")
      .update({ notes })
      .eq("driver_id", id)
      .eq("to_status", status)
      .order("changed_at", { ascending: false })
      .limit(1);
  }

  return data as Driver;
}

export async function deleteDriver(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("drivers").delete().eq("id", id);

  if (error) throw error;
}

// ============================================
// DRIVER STATISTICS
// ============================================

export async function getDriverStats() {
  const supabase = createClient();

  const { data, error } = await supabase.from("driver_stats").select("*");

  if (error) throw error;
  return data as { status: DriverStatus; count: number; avg_score: number }[];
}

export async function getDriverCountByStatus() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("drivers")
    .select("status")
    .then(({ data, error }) => {
      if (error) throw error;

      const counts: Record<DriverStatus, number> = {
        sourced: 0,
        screening: 0,
        qualified: 0,
        onboarding: 0,
        handed_over: 0,
        rejected: 0,
      };

      data?.forEach((driver) => {
        counts[driver.status as DriverStatus]++;
      });

      return { data: counts, error: null };
    });

  if (error) throw error;
  return data;
}

// ============================================
// DRIVER DOCUMENTS
// ============================================

export async function getDriverDocuments(driverId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("driver_documents")
    .select("*")
    .eq("driver_id", driverId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return data as DriverDocument[];
}

export async function uploadDriverDocument(
  driverId: string,
  file: File,
  documentType: DriverDocument["document_type"]
) {
  const supabase = createClient();

  // Upload file to storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${driverId}/${documentType}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("driver-documents")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("driver-documents")
    .getPublicUrl(fileName);

  // Create document record
  const { data, error } = await supabase
    .from("driver_documents")
    .insert({
      driver_id: driverId,
      document_type: documentType,
      file_url: urlData.publicUrl,
      file_name: file.name,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DriverDocument;
}

export async function verifyDocument(documentId: string, verified: boolean) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("driver_documents")
    .update({
      verified,
      verified_at: verified ? new Date().toISOString() : null,
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw error;
  return data as DriverDocument;
}

export async function deleteDocument(documentId: string) {
  const supabase = createClient();

  // Get the document first to get the file path
  const { data: doc, error: fetchError } = await supabase
    .from("driver_documents")
    .select("file_url")
    .eq("id", documentId)
    .single();

  if (fetchError) throw fetchError;

  // Extract file path from URL and delete from storage
  if (doc?.file_url) {
    const urlParts = doc.file_url.split("/driver-documents/");
    if (urlParts.length > 1) {
      await supabase.storage
        .from("driver-documents")
        .remove([urlParts[1]]);
    }
  }

  // Delete the document record
  const { error } = await supabase
    .from("driver_documents")
    .delete()
    .eq("id", documentId);

  if (error) throw error;
}

// ============================================
// STATUS HISTORY
// ============================================

export async function getStatusHistory(driverId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("status_history")
    .select("*, changed_by_profile:profiles!status_history_changed_by_fkey(name)")
    .eq("driver_id", driverId)
    .order("changed_at", { ascending: false });

  if (error) throw error;
  return data as (StatusHistory & { changed_by_profile?: { name: string } })[];
}

// ============================================
// SCREENING RESPONSES
// ============================================

export async function saveScreeningResponse(
  driverId: string,
  questionKey: string,
  questionText: string,
  response: string,
  scoreContribution: number
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("screening_responses")
    .insert({
      driver_id: driverId,
      question_key: questionKey,
      question_text: questionText,
      response,
      score_contribution: scoreContribution,
    })
    .select()
    .single();

  if (error) throw error;

  // Update driver's screening score
  const { data: scoreData } = await supabase.rpc("calculate_screening_score", {
    p_driver_id: driverId,
  });

  if (scoreData !== null) {
    await supabase
      .from("drivers")
      .update({ screening_score: scoreData })
      .eq("id", driverId);
  }

  return data;
}

// ============================================
// HANDOVERS
// ============================================

export async function getHandovers(filters?: {
  status?: Handover["status"];
  upcoming?: boolean;
}) {
  const supabase = createClient();

  let query = supabase
    .from("handovers")
    .select("*")
    .order("scheduled_date", { ascending: true });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.upcoming) {
    query = query.gte("scheduled_date", new Date().toISOString().split("T")[0]);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Handover[];
}

export async function createHandover(
  handover: Omit<Handover, "id" | "created_at">
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("handovers")
    .insert(handover)
    .select()
    .single();

  if (error) throw error;
  return data as Handover;
}

export async function completeHandover(handoverId: string) {
  const supabase = createClient();

  // Get handover to get driver IDs
  const { data: handover, error: fetchError } = await supabase
    .from("handovers")
    .select("driver_ids")
    .eq("id", handoverId)
    .single();

  if (fetchError) throw fetchError;

  // Update all drivers to handed_over status
  if (handover?.driver_ids?.length) {
    await supabase
      .from("drivers")
      .update({ status: "handed_over" })
      .in("id", handover.driver_ids);
  }

  // Update handover status
  const { data, error } = await supabase
    .from("handovers")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", handoverId)
    .select()
    .single();

  if (error) throw error;
  return data as Handover;
}

// ============================================
// PROFILES
// ============================================

export async function getCurrentProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data as User;
}

export async function updateProfile(
  updates: Partial<Omit<User, "id" | "email" | "created_at">>
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToDrivers(
  callback: (payload: { eventType: string; new: Driver; old: Driver }) => void
) {
  const supabase = createClient();

  return supabase
    .channel("drivers-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "drivers",
      },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new as Driver,
          old: payload.old as Driver,
        });
      }
    )
    .subscribe();
}

export function unsubscribeFromChannel(channel: ReturnType<typeof subscribeToDrivers>) {
  const supabase = createClient();
  supabase.removeChannel(channel);
}

// ============================================
// ANALYTICS
// ============================================

export async function getAnalyticsData() {
  const supabase = createClient();

  // Get all drivers for analytics
  const { data: drivers, error } = await supabase
    .from("drivers")
    .select("status, source_channel, created_at");

  if (error) throw error;

  // Calculate funnel data (count by status)
  const funnelData: Record<DriverStatus, number> = {
    sourced: 0,
    screening: 0,
    qualified: 0,
    onboarding: 0,
    handed_over: 0,
    rejected: 0,
  };

  // Calculate source performance
  const sourceData: Record<SourceChannel, number> = {
    social_media: 0,
    referral: 0,
    roadshow: 0,
    boda_stage: 0,
    whatsapp: 0,
    other: 0,
  };

  // Calculate monthly progress (for 2026)
  const monthlyData: Record<string, number> = {
    february: 0,
    march: 0,
    april: 0,
    may: 0,
    june: 0,
    july: 0,
  };

  const monthMap: Record<number, string> = {
    1: "february",
    2: "march",
    3: "april",
    4: "may",
    5: "june",
    6: "july",
  };

  drivers?.forEach((driver) => {
    // Count by status
    funnelData[driver.status as DriverStatus]++;

    // Count by source
    sourceData[driver.source_channel as SourceChannel]++;

    // Count handed_over drivers by month
    if (driver.status === "handed_over") {
      const createdDate = new Date(driver.created_at);
      const year = createdDate.getFullYear();
      const month = createdDate.getMonth(); // 0-indexed

      if (year === 2026 && month >= 1 && month <= 6) {
        const monthKey = monthMap[month];
        if (monthKey) {
          monthlyData[monthKey]++;
        }
      }
    }
  });

  // Calculate KPIs
  const totalDrivers = drivers?.length || 0;
  const handedOver = funnelData.handed_over;
  const conversionRate = totalDrivers > 0 ? (handedOver / totalDrivers) * 100 : 0;

  return {
    funnelData,
    sourceData,
    monthlyData,
    totalDrivers,
    handedOver,
    conversionRate,
  };
}
