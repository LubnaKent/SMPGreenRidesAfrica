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
import {
  sanitizeSearchInput,
  sanitizeUUID,
  sanitizeUUIDArray,
  sanitizeEnum,
  sanitizeNumber,
  sanitizeText,
} from "@/lib/security/sanitize";

// Valid enum values for sanitization
const VALID_STATUSES: readonly DriverStatus[] = [
  'sourced', 'screening', 'qualified', 'onboarding', 'handed_over', 'rejected'
] as const;

const VALID_SOURCES: readonly SourceChannel[] = [
  'social_media', 'referral', 'roadshow', 'boda_stage', 'whatsapp', 'online_application', 'other'
] as const;

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

  // Sanitize and validate status filter
  if (filters?.status) {
    const sanitizedStatus = sanitizeEnum(filters.status, VALID_STATUSES);
    if (sanitizedStatus) {
      query = query.eq("status", sanitizedStatus);
    }
  }

  // Sanitize and validate source_channel filter
  if (filters?.source_channel) {
    const sanitizedSource = sanitizeEnum(filters.source_channel, VALID_SOURCES);
    if (sanitizedSource) {
      query = query.eq("source_channel", sanitizedSource);
    }
  }

  // Sanitize search input to prevent injection
  if (filters?.search) {
    const sanitizedSearch = sanitizeSearchInput(filters.search);
    if (sanitizedSearch.length > 0) {
      query = query.or(
        `first_name.ilike.%${sanitizedSearch}%,last_name.ilike.%${sanitizedSearch}%,phone.ilike.%${sanitizedSearch}%`
      );
    }
  }

  // Sanitize numeric values
  const limit = sanitizeNumber(filters?.limit || 0, { min: 1, max: 100 }) || 10;
  const offset = sanitizeNumber(filters?.offset || 0, { min: 0 }) || 0;

  if (filters?.limit) {
    query = query.limit(limit);
  }

  if (filters?.offset) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Driver[];
}

export async function getDriverById(id: string) {
  // Validate UUID format
  const sanitizedId = sanitizeUUID(id);
  if (!sanitizedId) {
    throw new Error("Invalid driver ID format");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", sanitizedId)
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
  // Validate UUID format
  const sanitizedId = sanitizeUUID(id);
  if (!sanitizedId) {
    throw new Error("Invalid driver ID format");
  }

  // Sanitize text fields in updates
  const sanitizedUpdates = { ...updates };
  if (sanitizedUpdates.first_name) {
    sanitizedUpdates.first_name = sanitizeText(sanitizedUpdates.first_name, 100);
  }
  if (sanitizedUpdates.last_name) {
    sanitizedUpdates.last_name = sanitizeText(sanitizedUpdates.last_name, 100);
  }
  if (sanitizedUpdates.notes) {
    sanitizedUpdates.notes = sanitizeText(sanitizedUpdates.notes, 2000);
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("drivers")
    .update(sanitizedUpdates)
    .eq("id", sanitizedId)
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

export async function updateDriverStatus(id: string, status: DriverStatus, notes?: string) {
  // Validate UUID format
  const sanitizedId = sanitizeUUID(id);
  if (!sanitizedId) {
    throw new Error("Invalid driver ID format");
  }

  // Validate status enum
  const sanitizedStatus = sanitizeEnum(status, VALID_STATUSES);
  if (!sanitizedStatus) {
    throw new Error("Invalid status value");
  }

  const supabase = createClient();

  // Update driver status (trigger will log to status_history)
  const { data, error } = await supabase
    .from("drivers")
    .update({ status: sanitizedStatus })
    .eq("id", sanitizedId)
    .select()
    .single();

  if (error) throw error;

  // If notes provided, update the latest status history entry
  if (notes) {
    const sanitizedNotes = sanitizeText(notes, 2000);
    await supabase
      .from("status_history")
      .update({ notes: sanitizedNotes })
      .eq("driver_id", sanitizedId)
      .eq("to_status", sanitizedStatus)
      .order("changed_at", { ascending: false })
      .limit(1);
  }

  return data as Driver;
}

export async function deleteDriver(id: string) {
  // Validate UUID format
  const sanitizedId = sanitizeUUID(id);
  if (!sanitizedId) {
    throw new Error("Invalid driver ID format");
  }

  const supabase = createClient();

  const { error } = await supabase.from("drivers").delete().eq("id", sanitizedId);

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
  // Validate UUID format
  const sanitizedId = sanitizeUUID(driverId);
  if (!sanitizedId) {
    throw new Error("Invalid driver ID format");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("driver_documents")
    .select("*")
    .eq("driver_id", sanitizedId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return data as DriverDocument[];
}

export async function uploadDriverDocument(
  driverId: string,
  file: File,
  documentType: DriverDocument["document_type"]
) {
  // Validate UUID format
  const sanitizedId = sanitizeUUID(driverId);
  if (!sanitizedId) {
    throw new Error("Invalid driver ID format");
  }

  // Validate file type (allow only specific document types)
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf'
  ];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only images and PDFs are allowed.");
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 10MB.");
  }

  const supabase = createClient();

  // Sanitize file extension
  const fileExt = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
  if (!allowedExtensions.includes(fileExt)) {
    throw new Error("Invalid file extension");
  }

  const fileName = `${sanitizedId}/${documentType}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("driver-documents")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("driver-documents")
    .getPublicUrl(fileName);

  // Sanitize file name for display
  const sanitizedFileName = sanitizeText(file.name, 255);

  // Create document record
  const { data, error } = await supabase
    .from("driver_documents")
    .insert({
      driver_id: sanitizedId,
      document_type: documentType,
      file_url: urlData.publicUrl,
      file_name: sanitizedFileName,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DriverDocument;
}

export async function verifyDocument(documentId: string, verified: boolean) {
  // Validate UUID format
  const sanitizedId = sanitizeUUID(documentId);
  if (!sanitizedId) {
    throw new Error("Invalid document ID format");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("driver_documents")
    .update({
      verified,
      verified_at: verified ? new Date().toISOString() : null,
    })
    .eq("id", sanitizedId)
    .select()
    .single();

  if (error) throw error;
  return data as DriverDocument;
}

export async function deleteDocument(documentId: string) {
  // Validate UUID format
  const sanitizedId = sanitizeUUID(documentId);
  if (!sanitizedId) {
    throw new Error("Invalid document ID format");
  }

  const supabase = createClient();

  // Get the document first to get the file path
  const { data: doc, error: fetchError } = await supabase
    .from("driver_documents")
    .select("file_url")
    .eq("id", sanitizedId)
    .single();

  if (fetchError) throw fetchError;

  // Extract file path from URL and delete from storage
  if (doc?.file_url) {
    const urlParts = doc.file_url.split("/driver-documents/");
    if (urlParts.length > 1) {
      // Sanitize the path to prevent directory traversal
      const filePath = urlParts[1].replace(/\.\./g, '');
      await supabase.storage
        .from("driver-documents")
        .remove([filePath]);
    }
  }

  // Delete the document record
  const { error } = await supabase
    .from("driver_documents")
    .delete()
    .eq("id", sanitizedId);

  if (error) throw error;
}

// ============================================
// STATUS HISTORY
// ============================================

export async function getStatusHistory(driverId: string) {
  // Validate UUID format
  const sanitizedId = sanitizeUUID(driverId);
  if (!sanitizedId) {
    throw new Error("Invalid driver ID format");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("status_history")
    .select("*, changed_by_profile:profiles!status_history_changed_by_fkey(name)")
    .eq("driver_id", sanitizedId)
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
  // Validate UUID format
  const sanitizedId = sanitizeUUID(driverId);
  if (!sanitizedId) {
    throw new Error("Invalid driver ID format");
  }

  // Sanitize text inputs
  const sanitizedQuestionKey = sanitizeText(questionKey, 100);
  const sanitizedQuestionText = sanitizeText(questionText, 500);
  const sanitizedResponse = sanitizeText(response, 2000);

  // Validate score contribution
  const sanitizedScore = sanitizeNumber(scoreContribution, { min: 0, max: 100, allowFloat: true });
  if (sanitizedScore === null) {
    throw new Error("Invalid score contribution");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("screening_responses")
    .insert({
      driver_id: sanitizedId,
      question_key: sanitizedQuestionKey,
      question_text: sanitizedQuestionText,
      response: sanitizedResponse,
      score_contribution: sanitizedScore,
    })
    .select()
    .single();

  if (error) throw error;

  // Update driver's screening score
  const { data: scoreData } = await supabase.rpc("calculate_screening_score", {
    p_driver_id: sanitizedId,
  });

  if (scoreData !== null) {
    await supabase
      .from("drivers")
      .update({ screening_score: scoreData })
      .eq("id", sanitizedId);
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
  // Validate UUID format
  const sanitizedId = sanitizeUUID(handoverId);
  if (!sanitizedId) {
    throw new Error("Invalid handover ID format");
  }

  const supabase = createClient();

  // Get handover to get driver IDs
  const { data: handover, error: fetchError } = await supabase
    .from("handovers")
    .select("driver_ids")
    .eq("id", sanitizedId)
    .single();

  if (fetchError) throw fetchError;

  // Update all drivers to handed_over status
  if (handover?.driver_ids?.length) {
    // Sanitize all driver IDs
    const sanitizedDriverIds = sanitizeUUIDArray(handover.driver_ids);
    if (sanitizedDriverIds.length > 0) {
      await supabase
        .from("drivers")
        .update({ status: "handed_over" })
        .in("id", sanitizedDriverIds);
    }
  }

  // Update handover status
  const { data, error } = await supabase
    .from("handovers")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sanitizedId)
    .select()
    .single();

  if (error) throw error;
  return data as Handover;
}

export async function cancelHandover(handoverId: string) {
  // Validate UUID format
  const sanitizedId = sanitizeUUID(handoverId);
  if (!sanitizedId) {
    throw new Error("Invalid handover ID format");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("handovers")
    .update({ status: "cancelled" })
    .eq("id", sanitizedId)
    .select()
    .single();

  if (error) throw error;
  return data as Handover;
}

export async function getDriversByIds(ids: string[]) {
  // Sanitize all IDs
  const sanitizedIds = sanitizeUUIDArray(ids);
  if (sanitizedIds.length === 0) return [];

  const supabase = createClient();

  const { data, error } = await supabase
    .from("drivers")
    .select("id, first_name, last_name")
    .in("id", sanitizedIds);

  if (error) throw error;
  return data as Pick<Driver, "id" | "first_name" | "last_name">[];
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
    online_application: 0,
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
