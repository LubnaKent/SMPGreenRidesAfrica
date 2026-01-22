import { DriverStatus, SourceChannel } from "@/types/database";

export const PIPELINE_STAGES: {
  id: DriverStatus;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    id: "sourced",
    label: "Sourced",
    description: "Initial lead captured",
    color: "bg-gray-100 text-gray-800",
  },
  {
    id: "screening",
    label: "Screening",
    description: "Pre-qualification in progress",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "qualified",
    label: "Qualified",
    description: "Passed all screening criteria",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "onboarding",
    label: "Onboarding",
    description: "Document verification & profile",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "handed_over",
    label: "Handed Over",
    description: "Ready for Greenwheels training",
    color: "bg-green-100 text-green-800",
  },
];

export const SOURCE_CHANNELS: {
  id: SourceChannel;
  label: string;
}[] = [
  { id: "social_media", label: "Social Media" },
  { id: "referral", label: "Referral" },
  { id: "roadshow", label: "Roadshow" },
  { id: "boda_stage", label: "Boda Stage" },
  { id: "whatsapp", label: "WhatsApp Community" },
  { id: "other", label: "Other" },
];

export const MONTHLY_TARGETS_2026 = {
  february: 40,
  march: 40,
  april: 60,
  may: 60,
  june: 60,
  july: 60,
} as const;

export const DRIVER_REQUIREMENTS = {
  minTripsPerWeek: 75,
  minHoursOnline: 50,
  minTripsPerDay: 12,
  leaseMonths: 24,
  commitmentDays: 90,
} as const;

export const CPA_RATE_UGX = 90000; // Cost per acquisition in UGX
