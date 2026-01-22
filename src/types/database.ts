// Database types for SMP Green Rides Africa

export type UserRole = "smp_admin" | "smp_agent" | "partner";

export type DriverStatus =
  | "sourced"
  | "screening"
  | "qualified"
  | "onboarding"
  | "handed_over"
  | "rejected";

export type SourceChannel =
  | "social_media"
  | "referral"
  | "roadshow"
  | "boda_stage"
  | "whatsapp"
  | "other";

export type DocumentType =
  | "national_id"
  | "driving_permit"
  | "photo"
  | "other";

export type HandoverStatus = "scheduled" | "completed" | "cancelled";

// Database table types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  national_id: string | null;
  driving_permit_number: string | null;
  location: string | null;
  source_channel: SourceChannel;
  referred_by: string | null;
  status: DriverStatus;
  screening_score: number | null;
  assigned_agent_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  document_type: DocumentType;
  file_url: string;
  file_name: string | null;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  uploaded_at: string;
}

export interface ScreeningResponse {
  id: string;
  driver_id: string;
  question_key: string;
  question_text: string;
  response: string;
  score_contribution: number;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  driver_id: string;
  from_status: DriverStatus | null;
  to_status: DriverStatus;
  changed_by: string;
  notes: string | null;
  changed_at: string;
}

export interface Handover {
  id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  location: string | null;
  driver_ids: string[];
  status: HandoverStatus;
  notes: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string;
}

// Extended types with relations
export interface DriverWithRelations extends Driver {
  assigned_agent?: User;
  documents?: DriverDocument[];
  status_history?: StatusHistory[];
}
