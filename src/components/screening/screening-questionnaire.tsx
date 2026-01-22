"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  SCREENING_QUESTIONS,
  CATEGORY_LABELS,
  PASSING_SCORE,
  calculateScreeningScore,
  type ScreeningQuestion,
} from "@/constants/screening";
import { cn } from "@/lib/utils";

interface ScreeningQuestionnaireProps {
  driverId: string;
  driverName: string;
  onComplete: (score: number, responses: { questionId: string; value: string }[]) => Promise<void>;
  onCancel: () => void;
}

export function ScreeningQuestionnaire({
  driverId,
  driverName,
  onComplete,
  onCancel,
}: ScreeningQuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentQuestion = SCREENING_QUESTIONS[currentIndex];
  const totalQuestions = SCREENING_QUESTIONS.length;
  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / totalQuestions) * 100;

  // Group questions by category for the progress indicator
  const categories = [...new Set(SCREENING_QUESTIONS.map((q) => q.category))];

  const handleAnswer = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const responseArray = Object.entries(responses).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    const score = calculateScreeningScore(responseArray);
    setFinalScore(score);

    try {
      setSubmitting(true);
      await onComplete(score, responseArray);
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting screening:", error);
      alert("Failed to save screening results. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isCurrentAnswered = responses[currentQuestion?.id] !== undefined;
  const allAnswered = answeredCount === totalQuestions;

  if (showResults) {
    const passed = finalScore >= PASSING_SCORE;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={cn(
              "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
              passed ? "bg-green-100" : "bg-yellow-100"
            )}
          >
            {passed ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            )}
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Screening Complete
          </h2>
          <p className="mt-1 text-gray-500">
            Results for {driverName}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Screening Score</p>
            <p
              className={cn(
                "text-4xl font-bold",
                finalScore >= PASSING_SCORE ? "text-green-600" : "text-yellow-600"
              )}
            >
              {finalScore}%
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Passing score: {PASSING_SCORE}%
            </p>
          </div>

          <div className="mt-6">
            {passed ? (
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  This driver has passed the screening and can proceed to the qualification stage.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="text-sm font-medium text-yellow-800">
                  This driver did not meet the minimum requirements. Consider reviewing their responses or discussing concerns with them.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Screening Questionnaire
        </h2>
        <p className="text-sm text-gray-500">
          Evaluating: {driverName}
        </p>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-900">
            {answeredCount} of {totalQuestions} questions
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category Indicator */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const categoryQuestions = SCREENING_QUESTIONS.filter(
            (q) => q.category === category
          );
          const categoryAnswered = categoryQuestions.filter(
            (q) => responses[q.id] !== undefined
          ).length;
          const isComplete = categoryAnswered === categoryQuestions.length;
          const isCurrent = currentQuestion.category === category;

          return (
            <span
              key={category}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                isComplete
                  ? "bg-green-100 text-green-700"
                  : isCurrent
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {CATEGORY_LABELS[category]}
              {isComplete && <CheckCircle2 className="ml-1 inline h-3 w-3" />}
            </span>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {CATEGORY_LABELS[currentQuestion.category]}
          </span>
        </div>

        <h3 className="text-lg font-medium text-gray-900">
          {currentQuestion.question}
        </h3>

        <div className="mt-4 space-y-3">
          {currentQuestion.options?.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                responses[currentQuestion.id] === option.value
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                name={currentQuestion.id}
                value={option.value}
                checked={responses[currentQuestion.id] === option.value}
                onChange={() => handleAnswer(option.value)}
                className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrevious}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          {currentIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Screening
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!isCurrentAnswered}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
