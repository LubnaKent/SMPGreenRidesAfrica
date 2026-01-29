// Database types for SMP Green Rides Africa

// ============================================
// ENUMS
// ============================================

export type UserRole =
  | "smp_admin"
  | "smp_agent"
  | "partner"
  | "security_officer"
  | "driver";

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
  | "online_application"
  | "other";

export type DocumentType =
  | "national_id"
  | "driving_permit"
  | "photo"
  | "other";

export type HandoverStatus = "scheduled" | "completed" | "cancelled";

export type AuditAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "VIEW_SENSITIVE"
  | "DECRYPT"
  | "EXPORT"
  | "LOGIN"
  | "LOGOUT"
  | "PERMISSION_DENIED";

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "requires_info";

export type ThreadStatus = "open" | "closed" | "pending";

export type EnrollmentStatus = "enrolled" | "attended" | "no_show" | "cancelled";

// ============================================
// CORE MODELS
// ============================================

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

// ============================================
// SECURITY & AUDIT MODELS
// ============================================

export interface SensitiveData {
  id: string;
  driver_id: string;
  national_id_hash: string | null;
  national_id_encrypted: string | null;
  permit_hash: string | null;
  permit_encrypted: string | null;
  phone_hash: string;
  phone_encrypted: string;
  encryption_key_id: string;
  iv: string;
  auth_tag: string;
  created_at: string;
  updated_at: string;
}

export interface EncryptionKey {
  id: string;
  key_version: number;
  is_active: boolean;
  created_at: string;
  rotated_at: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_role: UserRole;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============================================
// DRIVER APPLICATION MODELS
// ============================================

export interface DriverApplication {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  location: string | null;
  source_channel: SourceChannel;
  status: ApplicationStatus;
  driver_id: string | null;
  notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_type: DocumentType;
  file_url: string;
  file_name: string | null;
  verified: boolean;
  uploaded_at: string;
}

export interface ApplicationScreening {
  id: string;
  application_id: string;
  question_key: string;
  question_text: string;
  response: string;
  score_contribution: number;
  created_at: string;
}

// ============================================
// MESSAGING MODELS
// ============================================

export interface MessageThread {
  id: string;
  driver_id: string;
  agent_id: string | null;
  subject: string | null;
  status: ThreadStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_role: UserRole;
  content: string;
  is_read: boolean;
  created_at: string;
}

// ============================================
// TRAINING MODELS
// ============================================

export interface TrainingSession {
  id: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  location: string | null;
  max_capacity: number;
  created_by: string | null;
  created_at: string;
}

export interface TrainingEnrollment {
  id: string;
  session_id: string;
  driver_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  attended_at: string | null;
}

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================

export interface DriverWithRelations extends Driver {
  assigned_agent?: User;
  documents?: DriverDocument[];
  status_history?: StatusHistory[];
  sensitive_data?: SensitiveData;
}

export interface DriverApplicationWithRelations extends DriverApplication {
  documents?: ApplicationDocument[];
  screening_data?: ApplicationScreening[];
  reviewed_by_user?: User;
}

export interface MessageThreadWithRelations extends MessageThread {
  messages?: Message[];
  driver?: Driver;
  agent?: User;
}

export interface TrainingSessionWithRelations extends TrainingSession {
  enrollments?: TrainingEnrollment[];
  created_by_user?: User;
}

export interface AuditLogWithRelations extends AuditLog {
  user?: User;
}

// ============================================
// MASKED DATA TYPES
// ============================================

export interface MaskedDriver extends Omit<Driver, 'phone' | 'national_id' | 'driving_permit_number'> {
  phone: string;
  national_id: string | null;
  driving_permit_number: string | null;
  _isMasked: boolean;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateDriverApplicationRequest {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  location?: string;
  source_channel?: SourceChannel;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  notes?: string;
}

export interface SendMessageRequest {
  thread_id?: string;
  driver_id?: string;
  subject?: string;
  content: string;
}

export interface CreateAuditLogRequest {
  action: AuditAction;
  resource_type: string;
  resource_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
