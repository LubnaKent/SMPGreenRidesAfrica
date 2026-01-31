"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { ScreeningQuestionnaire } from "@/components/screening";
import { getDriverById, updateDriver, saveScreeningResponse, updateDriverStatus } from "@/lib/supabase/database";
import { SCREENING_QUESTIONS, PASSING_SCORE } from "@/constants/screening";
import { useToast } from "@/components/ui/toast";
import type { Driver } from "@/types/database";

export default function ScreeningPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;
  const { addToast } = useToast();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDriver() {
      try {
        const data = await getDriverById(driverId);
        setDriver(data);
      } catch (err) {
        console.error("Error fetching driver:", err);
        setError("Failed to load driver details.");
      } finally {
        setLoading(false);
      }
    }

    fetchDriver();
  }, [driverId]);

  const handleComplete = async (
    score: number,
    responses: { questionId: string; value: string }[]
  ) => {
    try {
      // Save each response
      for (const response of responses) {
        const question = SCREENING_QUESTIONS.find((q) => q.id === response.questionId);
        if (!question) continue;

        const option = question.options?.find((o) => o.value === response.value);
        const scoreContribution = option
          ? Math.round((option.score * question.weight) / 100)
          : 0;

        await saveScreeningResponse(
          driverId,
          question.id,
          question.question,
          response.value,
          scoreContribution
        );
      }

      // Update driver's screening score
      await updateDriver(driverId, { screening_score: score });

      // If passed, update status to qualified
      if (score >= PASSING_SCORE && driver?.status === "screening") {
        await updateDriverStatus(driverId, "qualified", "Passed screening questionnaire");
        addToast({
          type: "success",
          title: "Screening complete",
          message: `${driver.first_name} passed with ${score}% and is now qualified`,
        });
      } else if (score >= PASSING_SCORE) {
        addToast({
          type: "success",
          title: "Screening complete",
          message: `Score: ${score}% - Passed!`,
        });
      } else {
        addToast({
          type: "warning",
          title: "Screening complete",
          message: `Score: ${score}% - Below passing threshold (${PASSING_SCORE}%)`,
        });
      }
    } catch (err) {
      console.error("Error saving screening:", err);
      addToast({
        type: "error",
        title: "Failed to save screening",
        message: "Please try again",
      });
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/drivers/${driverId}`);
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

  // Check if driver already has a screening score
  if (driver.screening_score !== null && driver.screening_score > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/drivers/${driverId}`}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Screening Complete</h1>
            <p className="text-sm text-gray-500">
              {driver.first_name} {driver.last_name}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Previous Screening Score</p>
            <p
              className={`text-4xl font-bold ${
                driver.screening_score >= PASSING_SCORE
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {driver.screening_score}%
            </p>
            <p className="mt-4 text-sm text-gray-500">
              This driver has already been screened. To re-screen, please contact an administrator.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href={`/dashboard/drivers/${driverId}`}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Back to Driver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/drivers/${driverId}`}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Screening</h1>
          <p className="text-sm text-gray-500">
            Evaluate {driver.first_name} {driver.last_name}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ScreeningQuestionnaire
          driverId={driverId}
          driverName={`${driver.first_name} ${driver.last_name}`}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
