import type { Driver, DriverStatus, SourceChannel } from "@/types/database";
import { PIPELINE_STAGES, SOURCE_CHANNELS } from "@/constants";

// Status and source labels for export
const statusLabels: Record<DriverStatus, string> = {
  sourced: "Sourced",
  screening: "Screening",
  qualified: "Qualified",
  onboarding: "Onboarding",
  handed_over: "Handed Over",
  rejected: "Rejected",
};

const sourceLabels: Record<SourceChannel, string> = {
  social_media: "Social Media",
  referral: "Referral",
  roadshow: "Roadshow",
  boda_stage: "Boda Stage",
  whatsapp: "WhatsApp",
  other: "Other",
};

/**
 * Convert drivers data to CSV format
 */
export function driversToCSV(drivers: Driver[]): string {
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Phone",
    "Location",
    "National ID",
    "Driving Permit",
    "Source",
    "Status",
    "Screening Score",
    "Created At",
    "Updated At",
  ];

  const rows = drivers.map((driver) => [
    driver.id,
    driver.first_name,
    driver.last_name,
    driver.phone,
    driver.location || "",
    driver.national_id || "",
    driver.driving_permit_number || "",
    sourceLabels[driver.source_channel],
    statusLabels[driver.status],
    driver.screening_score?.toString() || "",
    new Date(driver.created_at).toLocaleDateString("en-UG"),
    new Date(driver.updated_at).toLocaleDateString("en-UG"),
  ]);

  // Escape CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Download data as a CSV file
 */
export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export drivers to CSV and trigger download
 */
export function exportDriversToCSV(drivers: Driver[], filename?: string): void {
  const csv = driversToCSV(drivers);
  const date = new Date().toISOString().split("T")[0];
  const defaultFilename = `smp-drivers-${date}.csv`;

  downloadCSV(csv, filename || defaultFilename);
}

/**
 * Generate a summary report of driver statistics
 */
export interface DriverSummaryReport {
  totalDrivers: number;
  byStatus: Record<DriverStatus, number>;
  bySource: Record<SourceChannel, number>;
  averageScreeningScore: number;
  conversionRate: number;
  thisMonthAdded: number;
  thisMonthHandedOver: number;
}

export function generateDriverSummary(drivers: Driver[]): DriverSummaryReport {
  const byStatus: Record<DriverStatus, number> = {
    sourced: 0,
    screening: 0,
    qualified: 0,
    onboarding: 0,
    handed_over: 0,
    rejected: 0,
  };

  const bySource: Record<SourceChannel, number> = {
    social_media: 0,
    referral: 0,
    roadshow: 0,
    boda_stage: 0,
    whatsapp: 0,
    other: 0,
  };

  let totalScore = 0;
  let scoredCount = 0;
  let thisMonthAdded = 0;
  let thisMonthHandedOver = 0;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  for (const driver of drivers) {
    byStatus[driver.status]++;
    bySource[driver.source_channel]++;

    if (driver.screening_score !== null) {
      totalScore += driver.screening_score;
      scoredCount++;
    }

    const createdDate = new Date(driver.created_at);
    if (
      createdDate.getMonth() === thisMonth &&
      createdDate.getFullYear() === thisYear
    ) {
      thisMonthAdded++;
    }

    if (
      driver.status === "handed_over" &&
      createdDate.getMonth() === thisMonth &&
      createdDate.getFullYear() === thisYear
    ) {
      thisMonthHandedOver++;
    }
  }

  const totalDrivers = drivers.length;
  const handedOver = byStatus.handed_over;
  const conversionRate = totalDrivers > 0 ? (handedOver / totalDrivers) * 100 : 0;
  const averageScreeningScore = scoredCount > 0 ? totalScore / scoredCount : 0;

  return {
    totalDrivers,
    byStatus,
    bySource,
    averageScreeningScore,
    conversionRate,
    thisMonthAdded,
    thisMonthHandedOver,
  };
}

/**
 * Export summary report to CSV
 */
export function exportSummaryReport(summary: DriverSummaryReport): void {
  const lines: string[] = [
    "SMP Green Rides Africa - Driver Summary Report",
    `Generated: ${new Date().toLocaleString("en-UG")}`,
    "",
    "OVERVIEW",
    `Total Drivers,${summary.totalDrivers}`,
    `Conversion Rate,${summary.conversionRate.toFixed(1)}%`,
    `Average Screening Score,${summary.averageScreeningScore.toFixed(1)}`,
    `Added This Month,${summary.thisMonthAdded}`,
    `Handed Over This Month,${summary.thisMonthHandedOver}`,
    "",
    "BY STATUS",
    ...Object.entries(summary.byStatus).map(
      ([status, count]) => `${statusLabels[status as DriverStatus]},${count}`
    ),
    "",
    "BY SOURCE",
    ...Object.entries(summary.bySource).map(
      ([source, count]) => `${sourceLabels[source as SourceChannel]},${count}`
    ),
  ];

  const csv = lines.join("\n");
  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `smp-summary-report-${date}.csv`);
}
