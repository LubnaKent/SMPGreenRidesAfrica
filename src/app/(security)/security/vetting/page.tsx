"use client";

import { useEffect, useState } from "react";
import {
  FileCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  FileText,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";
import type { DocumentType } from "@/types/database";

interface PendingDocument {
  id: string;
  driver_id: string;
  document_type: DocumentType;
  file_url: string;
  file_name: string | null;
  uploaded_at: string;
  driver: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export default function VettingQueuePage() {
  const { profile } = useAuth();
  const t = useTranslations("security.vetting");

  // Translated document type labels
  const documentTypeLabels: Record<DocumentType, string> = {
    national_id: t("documentTypes.nationalId"),
    driving_permit: t("documentTypes.drivingPermit"),
    photo: t("documentTypes.photo"),
    other: t("documentTypes.other"),
  };
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType | "all">("all");
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PendingDocument | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [selectedType]);

  const fetchDocuments = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("driver_documents")
      .select(
        `
        id,
        driver_id,
        document_type,
        file_url,
        file_name,
        uploaded_at,
        driver:drivers(first_name, last_name, phone)
      `
      )
      .eq("verified", false)
      .order("uploaded_at", { ascending: true });

    if (selectedType !== "all") {
      query = query.eq("document_type", selectedType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error);
    } else {
      setDocuments(data as unknown as PendingDocument[]);
    }
    setLoading(false);
  };

  const verifyDocument = async (documentId: string, approved: boolean) => {
    if (!profile?.id) return;

    setVerifying(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("driver_documents")
      .update({
        verified: approved,
        verified_by: profile.id,
        verified_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (error) {
      console.error("Error verifying document:", error);
      alert(t("toast.verifyFailed"));
    } else {
      // Log the action
      await supabase.from("audit_logs").insert({
        user_id: profile.id,
        user_role: profile.role,
        action: approved ? "UPDATE" : "DELETE",
        resource_type: "driver_document",
        resource_id: documentId,
        metadata: {
          action: approved ? "verified" : "rejected",
        },
      });

      setSelectedDocument(null);
      fetchDocuments();
    }
    setVerifying(false);
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.driver.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.driver.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Document type filter */}
        <div className="relative">
          <button
            onClick={() => setShowTypeFilter(!showTypeFilter)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 text-gray-500" />
            <span>
              {selectedType === "all"
                ? t("allTypes")
                : documentTypeLabels[selectedType]}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {showTypeFilter && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowTypeFilter(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedType("all");
                    setShowTypeFilter(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  {t("allTypes")}
                </button>
                {(Object.keys(documentTypeLabels) as DocumentType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setShowTypeFilter(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      {documentTypeLabels[type]}
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Queue stats */}
      <div className="flex items-center gap-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <Clock className="h-5 w-5 text-yellow-600" />
        <p className="text-sm text-yellow-800">
          {t("pendingCount", { count: filteredDocuments.length })}
        </p>
      </div>

      {/* Documents grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t("loading")}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileCheck className="h-12 w-12 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500">{t("allVerified")}</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              {/* Document preview */}
              <div className="aspect-[4/3] bg-gray-100 relative">
                {doc.file_url ? (
                  <img
                    src={doc.file_url}
                    alt={doc.file_name || "Document"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <span className="absolute top-2 right-2 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                  {documentTypeLabels[doc.document_type]}
                </span>
              </div>

              {/* Document info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">
                    {doc.driver.first_name} {doc.driver.last_name}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {t("uploaded", { date: new Date(doc.uploaded_at).toLocaleDateString() })}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                    {t("review")}
                  </button>
                  <button
                    onClick={() => verifyDocument(doc.id, true)}
                    className="flex items-center justify-center rounded-lg bg-green-600 p-2 text-white hover:bg-green-700"
                    title={t("approve")}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => verifyDocument(doc.id, false)}
                    className="flex items-center justify-center rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                    title={t("reject")}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Review Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("modal.title")}
                </h2>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Driver info */}
              <div className="rounded-lg bg-gray-50 p-4 mb-4">
                <p className="text-sm text-gray-500">{t("modal.driver")}</p>
                <p className="font-medium text-gray-900">
                  {selectedDocument.driver.first_name}{" "}
                  {selectedDocument.driver.last_name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {t("modal.phone")}: {selectedDocument.driver.phone}
                </p>
              </div>

              {/* Document type */}
              <div className="mb-4">
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                  {documentTypeLabels[selectedDocument.document_type]}
                </span>
              </div>

              {/* Document preview */}
              <div className="rounded-lg border border-gray-200 overflow-hidden mb-6">
                {selectedDocument.file_url ? (
                  <img
                    src={selectedDocument.file_url}
                    alt={selectedDocument.file_name || "Document"}
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100">
                    <FileText className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    verifyDocument(selectedDocument.id, false);
                  }}
                  disabled={verifying}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {t("modal.rejectDocument")}
                </button>
                <button
                  onClick={() => {
                    verifyDocument(selectedDocument.id, true);
                  }}
                  disabled={verifying}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {t("modal.verifyDocument")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
