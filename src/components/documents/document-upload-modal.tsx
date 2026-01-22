"use client";

import { useState, useRef } from "react";
import { X, Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import type { DriverDocument } from "@/types/database";

const DOCUMENT_TYPES: { id: DriverDocument["document_type"]; label: string }[] = [
  { id: "national_id", label: "National ID" },
  { id: "driving_permit", label: "Driving Permit" },
  { id: "photo", label: "Profile Photo" },
  { id: "other", label: "Other Document" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, documentType: DriverDocument["document_type"]) => Promise<void>;
}

export function DocumentUploadModal({ isOpen, onClose, onUpload }: DocumentUploadModalProps) {
  const [selectedType, setSelectedType] = useState<DriverDocument["document_type"]>("national_id");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, WebP, or PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await onUpload(selectedFile, selectedType);
      onClose();
      setSelectedFile(null);
      setSelectedType("national_id");
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
      setSelectedFile(null);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Document Type Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Document Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DriverDocument["document_type"])}
            disabled={uploading}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Drop Zone */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            File
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
              dragActive
                ? "border-green-500 bg-green-50"
                : selectedFile
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
              disabled={uploading}
            />

            {selectedFile ? (
              <>
                <FileText className="h-10 w-10 text-green-500" />
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="mt-2 text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-green-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WebP, or PDF up to 5MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
