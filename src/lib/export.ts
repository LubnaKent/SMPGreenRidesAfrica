import type { Driver, DriverStatus, SourceChannel } from "@/types/database";
import { PIPELINE_STAGES, SOURCE_CHANNELS, MONTHLY_TARGETS_2026, CPA_RATE_UGX } from "@/constants";
import { jsPDF } from "jspdf";

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
  online_application: "Online Application",
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
    online_application: 0,
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

/**
 * Export analytics report to PDF
 */
export function exportAnalyticsPDF(
  summary: DriverSummaryReport,
  monthlyData: Record<string, number>
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: { fontSize?: number; fontStyle?: "normal" | "bold" }) => {
    doc.setFontSize(options?.fontSize || 12);
    doc.setFont("helvetica", options?.fontStyle || "normal");
    doc.text(text, x, y);
  };

  // Helper function to draw a line
  const drawLine = (y: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Title
  addText("SMP Green Rides Africa", margin, yPos, { fontSize: 20, fontStyle: "bold" });
  yPos += 8;
  addText("Driver Acquisition Report", margin, yPos, { fontSize: 14 });
  yPos += 6;
  addText(`Generated: ${new Date().toLocaleDateString("en-UG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })}`, margin, yPos, { fontSize: 10 });
  yPos += 15;

  drawLine(yPos);
  yPos += 10;

  // Overview Section
  addText("Overview", margin, yPos, { fontSize: 16, fontStyle: "bold" });
  yPos += 10;

  const overviewData = [
    ["Total Drivers", summary.totalDrivers.toString()],
    ["Conversion Rate", `${summary.conversionRate.toFixed(1)}%`],
    ["Average Screening Score", summary.averageScreeningScore.toFixed(1)],
    ["Cost per Acquisition", `UGX ${CPA_RATE_UGX.toLocaleString()}`],
    ["Added This Month", summary.thisMonthAdded.toString()],
    ["Handed Over This Month", summary.thisMonthHandedOver.toString()],
  ];

  overviewData.forEach(([label, value]) => {
    addText(label, margin, yPos);
    addText(value, pageWidth - margin - 40, yPos, { fontStyle: "bold" });
    yPos += 7;
  });

  yPos += 10;
  drawLine(yPos);
  yPos += 10;

  // Pipeline Status Section
  addText("Pipeline Status", margin, yPos, { fontSize: 16, fontStyle: "bold" });
  yPos += 10;

  const statusData = [
    ["Sourced", summary.byStatus.sourced],
    ["Screening", summary.byStatus.screening],
    ["Qualified", summary.byStatus.qualified],
    ["Onboarding", summary.byStatus.onboarding],
    ["Handed Over", summary.byStatus.handed_over],
    ["Rejected", summary.byStatus.rejected],
  ];

  statusData.forEach(([label, value]) => {
    addText(label as string, margin, yPos);
    addText((value as number).toString(), pageWidth - margin - 40, yPos, { fontStyle: "bold" });
    yPos += 7;
  });

  yPos += 10;
  drawLine(yPos);
  yPos += 10;

  // Source Performance Section
  addText("Source Performance", margin, yPos, { fontSize: 16, fontStyle: "bold" });
  yPos += 10;

  const sourceData = [
    ["Social Media", summary.bySource.social_media],
    ["Referral", summary.bySource.referral],
    ["Roadshow", summary.bySource.roadshow],
    ["Boda Stage", summary.bySource.boda_stage],
    ["WhatsApp", summary.bySource.whatsapp],
    ["Other", summary.bySource.other],
  ];

  sourceData.forEach(([label, value]) => {
    addText(label as string, margin, yPos);
    addText((value as number).toString(), pageWidth - margin - 40, yPos, { fontStyle: "bold" });
    yPos += 7;
  });

  yPos += 10;
  drawLine(yPos);
  yPos += 10;

  // Monthly Progress Section
  addText("Monthly Progress (2026)", margin, yPos, { fontSize: 16, fontStyle: "bold" });
  yPos += 10;

  // Table header
  addText("Month", margin, yPos, { fontStyle: "bold" });
  addText("Target", margin + 50, yPos, { fontStyle: "bold" });
  addText("Actual", margin + 90, yPos, { fontStyle: "bold" });
  addText("Progress", margin + 130, yPos, { fontStyle: "bold" });
  yPos += 7;

  const monthlyRows = [
    { month: "February", key: "february", target: MONTHLY_TARGETS_2026.february },
    { month: "March", key: "march", target: MONTHLY_TARGETS_2026.march },
    { month: "April", key: "april", target: MONTHLY_TARGETS_2026.april },
    { month: "May", key: "may", target: MONTHLY_TARGETS_2026.may },
    { month: "June", key: "june", target: MONTHLY_TARGETS_2026.june },
    { month: "July", key: "july", target: MONTHLY_TARGETS_2026.july },
  ];

  let totalTarget = 0;
  let totalActual = 0;

  monthlyRows.forEach((row) => {
    const actual = monthlyData[row.key] || 0;
    const progress = row.target > 0 ? ((actual / row.target) * 100).toFixed(0) : "0";
    totalTarget += row.target;
    totalActual += actual;

    addText(row.month, margin, yPos);
    addText(row.target.toString(), margin + 50, yPos);
    addText(actual.toString(), margin + 90, yPos);
    addText(`${progress}%`, margin + 130, yPos);
    yPos += 7;
  });

  // Total row
  yPos += 3;
  addText("Total", margin, yPos, { fontStyle: "bold" });
  addText(totalTarget.toString(), margin + 50, yPos, { fontStyle: "bold" });
  addText(totalActual.toString(), margin + 90, yPos, { fontStyle: "bold" });
  addText(`${totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(0) : 0}%`, margin + 130, yPos, { fontStyle: "bold" });

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("SMP Green Rides Africa - Greenwheels Partnership", margin, yPos);
  doc.text(`Page 1 of 1`, pageWidth - margin - 20, yPos);

  // Save the PDF
  const date = new Date().toISOString().split("T")[0];
  doc.save(`smp-analytics-report-${date}.pdf`);
}
