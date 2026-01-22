"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Upload,
  Edit2,
  Clock,
  CheckCircle2,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Driver, DriverStatus, SourceChannel, StatusHistory, DriverDocument } from "@/types/database";
import { PIPELINE_STAGES, SOURCE_CHANNELS } from "@/constants";
import { cn } from "@/lib/utils";
import {
  getDriverById,
  getStatusHistory,
  getDriverDocuments,
  updateDriverStatus,
  uploadDriverDocument,
  verifyDocument,
  deleteDocument,
} from "@/lib/supabase/database";
import { DocumentUploadModal, DocumentCard } from "@/components/documents";
import { PermissionGate } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";

const statusColors: Record<DriverStatus, string> = {
  sourced: "bg-gray-100 text-gray-800 border-gray-300",
  screening: "bg-yellow-100 text-yellow-800 border-yellow-300",
  qualified: "bg-blue-100 text-blue-800 border-blue-300",
  onboarding: "bg-purple-100 text-purple-800 border-purple-300",
  handed_over: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

const sourceLabels: Record<SourceChannel, string> = {
  social_media: "Social Media",
  referral: "Referral",
  roadshow: "Roadshow",
  boda_stage: "Boda Stage",
  whatsapp: "WhatsApp",
  other: "Other",
};

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;
  const { hasPermission } = useAuth();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "documents" | "history">("details");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    async function fetchDriverData() {
      try {
        setLoading(true);
        setError(null);

        const [driverData, historyData, docsData] = await Promise.all([
          getDriverById(driverId),
          getStatusHistory(driverId),
          getDriverDocuments(driverId),
        ]);

        setDriver(driverData);
        setStatusHistory(historyData);
        setDocuments(docsData);
      } catch (err) {
        console.error("Error fetching driver:", err);
        setError("Failed to load driver details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (driverId) {
      fetchDriverData();
    }
  }, [driverId]);

  const handleStatusUpdate = async (newStatus: DriverStatus) => {
    if (!driver || newStatus === driver.status) return;

    try {
      setUpdatingStatus(true);
      const updatedDriver = await updateDriverStatus(driver.id, newStatus);
      setDriver(updatedDriver);

      // Refresh status history
      const historyData = await getStatusHistory(driverId);
      setStatusHistory(historyData);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update driver status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: DriverDocument["document_type"]) => {
    const newDoc = await uploadDriverDocument(driverId, file, documentType);
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDocumentVerify = async (documentId: string, verified: boolean) => {
    const updatedDoc = await verifyDocument(documentId, verified);
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === documentId ? updatedDoc : doc))
    );
  };

  const handleDocumentDelete = async (documentId: string) => {
    await deleteDocument(documentId);
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">{error || "Driver not found"}</p>
        <Link
          href="/dashboard/drivers"
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Drivers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/drivers"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {driver.first_name} {driver.last_name}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex rounded-full border px-3 py-1 text-sm font-medium",
                  statusColors[driver.status]
                )}
              >
                {PIPELINE_STAGES.find((s) => s.id === driver.status)?.label}
              </span>
              {driver.screening_score !== null && (
                <span className="text-sm text-gray-500">
                  Score: <strong>{driver.screening_score}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <PermissionGate permission="CONDUCT_SCREENING">
            {(driver.status === "sourced" || driver.status === "screening") &&
              (driver.screening_score === null || driver.screening_score === 0) && (
                <Link
                  href={`/dashboard/drivers/${driver.id}/screening`}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Start Screening
                </Link>
              )}
          </PermissionGate>
          <PermissionGate permission="EDIT_DRIVER">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{driver.phone}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium text-gray-900">{driver.location || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Source</p>
              <p className="font-medium text-gray-900">{sourceLabels[driver.source_channel]}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Added</p>
              <p className="font-medium text-gray-900">{formatShortDate(driver.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: "details", label: "Details" },
            { id: "documents", label: "Documents" },
            { id: "history", label: "History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "border-b-2 pb-4 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Full Name</span>
                <span className="text-sm font-medium text-gray-900">
                  {driver.first_name} {driver.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Phone Number</span>
                <span className="text-sm font-medium text-gray-900">{driver.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Location</span>
                <span className="text-sm font-medium text-gray-900">
                  {driver.location || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">National ID</span>
                <span className="text-sm font-medium text-gray-900">
                  {driver.national_id || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Driving Permit</span>
                <span className="text-sm font-medium text-gray-900">
                  {driver.driving_permit_number || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">Update Status</h2>
            <p className="text-sm text-gray-500">Move driver to the next stage</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  disabled={stage.id === driver.status || updatingStatus}
                  onClick={() => handleStatusUpdate(stage.id)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    stage.id === driver.status
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  {updatingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    stage.label
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
              <p className="text-sm text-gray-500">Upload and manage driver documents</p>
            </div>
            <PermissionGate permission="UPLOAD_DOCUMENTS">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </button>
            </PermissionGate>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center sm:col-span-2 lg:col-span-3">
                <FileText className="h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No documents uploaded</p>
                <PermissionGate permission="UPLOAD_DOCUMENTS">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-2 text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    Upload first document
                  </button>
                </PermissionGate>
              </div>
            ) : (
              documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onVerify={hasPermission("VERIFY_DOCUMENTS") ? handleDocumentVerify : undefined}
                  onDelete={hasPermission("DELETE_DOCUMENTS") ? handleDocumentDelete : undefined}
                  canVerify={hasPermission("VERIFY_DOCUMENTS")}
                />
              ))
            )}
          </div>

          <DocumentUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUpload={handleDocumentUpload}
          />
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Status History</h2>
          <p className="text-sm text-gray-500">Track all status changes</p>

          <div className="mt-6 space-y-4">
            {statusHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No status changes recorded yet</p>
              </div>
            ) : (
              statusHistory.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      {index === 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {index < statusHistory.length - 1 && (
                      <div className="h-full w-0.5 bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          statusColors[item.to_status as DriverStatus]
                        )}
                      >
                        {PIPELINE_STAGES.find((s) => s.id === item.to_status)?.label}
                      </span>
                      {item.from_status && (
                        <>
                          <span className="text-xs text-gray-400">from</span>
                          <span className="text-xs text-gray-500">
                            {PIPELINE_STAGES.find((s) => s.id === item.from_status)?.label}
                          </span>
                        </>
                      )}
                    </div>
                    {item.notes && <p className="mt-1 text-sm text-gray-600">{item.notes}</p>}
                    <p className="mt-1 text-xs text-gray-400">{formatDate(item.changed_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
