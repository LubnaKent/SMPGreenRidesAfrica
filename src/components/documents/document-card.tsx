"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  ExternalLink,
  MoreVertical,
  Loader2,
  Trash2,
} from "lucide-react";
import type { DriverDocument } from "@/types/database";

const documentTypeLabels: Record<DriverDocument["document_type"], string> = {
  national_id: "National ID",
  driving_permit: "Driving Permit",
  photo: "Profile Photo",
  other: "Other Document",
};

interface DocumentCardProps {
  document: DriverDocument;
  onVerify?: (documentId: string, verified: boolean) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  canVerify?: boolean;
}

export function DocumentCard({
  document,
  onVerify,
  onDelete,
  canVerify = false,
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleVerify = async (verified: boolean) => {
    if (!onVerify) return;

    try {
      setVerifying(true);
      await onVerify(document.id, verified);
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setVerifying(false);
      setShowMenu(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      setDeleting(true);
      await onDelete(document.id);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const isImage = document.file_url?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Preview */}
      <div className="aspect-[4/3] bg-gray-100">
        {isImage ? (
          <img
            src={document.file_url}
            alt={document.file_name || "Document"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-16 w-16 text-gray-300" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          {document.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
              <Clock className="h-3 w-3" />
              Pending
            </span>
          )}
        </div>

        {/* Menu Button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg bg-white/90 p-1.5 text-gray-600 shadow-sm hover:bg-white"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
                <a
                  href={document.file_url}
                  download={document.file_name}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>

                {canVerify && onVerify && (
                  <>
                    <hr className="my-1 border-gray-100" />
                    {document.verified ? (
                      <button
                        onClick={() => handleVerify(false)}
                        disabled={verifying}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
                      >
                        {verifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Unverify
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(true)}
                        disabled={verifying}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50 disabled:opacity-50"
                      >
                        {verifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Verify
                      </button>
                    )}
                  </>
                )}

                {onDelete && (
                  <>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {documentTypeLabels[document.document_type]}
        </p>
        <p className="text-xs text-gray-500 truncate">{document.file_name}</p>
        <p className="mt-1 text-xs text-gray-400">
          Uploaded {formatDate(document.uploaded_at)}
        </p>
        {document.verified && document.verified_at && (
          <p className="text-xs text-green-600">
            Verified {formatDate(document.verified_at)}
          </p>
        )}
      </div>
    </div>
  );
}
