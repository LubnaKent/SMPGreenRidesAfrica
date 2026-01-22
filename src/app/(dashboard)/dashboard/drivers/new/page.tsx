"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { SOURCE_CHANNELS } from "@/constants";
import type { SourceChannel } from "@/types/database";
import { createDriver } from "@/lib/supabase/database";
import { useToast } from "@/components/ui/toast";

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  national_id: string;
  driving_permit_number: string;
  location: string;
  source_channel: SourceChannel;
  notes: string;
}

const initialFormData: FormData = {
  first_name: "",
  last_name: "",
  phone: "",
  national_id: "",
  driving_permit_number: "",
  location: "",
  source_channel: "boda_stage",
  notes: "",
};

export default function NewDriverPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.phone) {
      setError("Please fill in all required fields");
      return;
    }

    // Phone validation for Uganda
    const phoneRegex = /^\+?256[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid Ugandan phone number (e.g., +256701234567)");
      return;
    }

    setLoading(true);

    try {
      await createDriver({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        national_id: formData.national_id || null,
        driving_permit_number: formData.driving_permit_number || null,
        location: formData.location || null,
        source_channel: formData.source_channel,
        referred_by: null,
        status: "sourced",
        screening_score: null,
        assigned_agent_id: null,
        notes: formData.notes || null,
      });

      addToast({
        type: "success",
        title: "Driver added successfully",
        message: `${formData.first_name} ${formData.last_name} has been added to the pipeline`,
      });

      // Redirect to drivers list
      router.push("/dashboard/drivers");
    } catch (err) {
      console.error("Error creating driver:", err);
      setError("Failed to save driver. Please try again.");
      addToast({
        type: "error",
        title: "Failed to add driver",
        message: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/drivers"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Driver</h1>
          <p className="text-sm text-gray-500">
            Enter driver information to add them to the pipeline
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Personal Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="text-sm text-gray-500">Basic driver details</p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="+256701234567"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location / Zone
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="e.g., Kampala Central, Ntinda"
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
          <p className="text-sm text-gray-500">Driver identification documents</p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="national_id"
                className="block text-sm font-medium text-gray-700"
              >
                National ID Number
              </label>
              <input
                type="text"
                id="national_id"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="CM12345678ABCDE"
              />
            </div>

            <div>
              <label
                htmlFor="driving_permit_number"
                className="block text-sm font-medium text-gray-700"
              >
                Driving Permit Number
              </label>
              <input
                type="text"
                id="driving_permit_number"
                name="driving_permit_number"
                value={formData.driving_permit_number}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="DL12345678"
              />
            </div>
          </div>
        </div>

        {/* Source Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Source Information
          </h2>
          <p className="text-sm text-gray-500">How was this driver acquired</p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="source_channel"
                className="block text-sm font-medium text-gray-700"
              >
                Source Channel <span className="text-red-500">*</span>
              </label>
              <select
                id="source_channel"
                name="source_channel"
                value={formData.source_channel}
                onChange={handleChange}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                {SOURCE_CHANNELS.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Any additional notes about this driver..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/drivers"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Driver
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
