// Screening questions for driver qualification
// Based on Greenwheels requirements:
// - Min 75 Uber trips/week OR 50 hours online
// - Min 12 trips/day
// - 24-month lease commitment
// - 90-day minimum commitment

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: "radio" | "number" | "text";
  options?: { value: string; label: string; score: number }[];
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
  weight: number; // How much this question contributes to total score (0-100)
  category: "experience" | "commitment" | "availability" | "eligibility";
}

export const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  // Experience Questions
  {
    id: "current_occupation",
    question: "What is your current occupation?",
    type: "radio",
    options: [
      { value: "boda_driver", label: "Boda boda driver (full-time)", score: 100 },
      { value: "part_time_boda", label: "Boda boda driver (part-time)", score: 70 },
      { value: "uber_driver", label: "Uber/Bolt driver", score: 90 },
      { value: "delivery_rider", label: "Delivery rider (Jumia, Glovo, etc.)", score: 80 },
      { value: "other", label: "Other occupation", score: 40 },
    ],
    weight: 15,
    category: "experience",
  },
  {
    id: "riding_experience",
    question: "How many years of motorcycle riding experience do you have?",
    type: "radio",
    options: [
      { value: "less_1", label: "Less than 1 year", score: 20 },
      { value: "1_2", label: "1-2 years", score: 50 },
      { value: "2_3", label: "2-3 years", score: 70 },
      { value: "3_5", label: "3-5 years", score: 90 },
      { value: "more_5", label: "More than 5 years", score: 100 },
    ],
    weight: 10,
    category: "experience",
  },
  {
    id: "weekly_trips",
    question: "How many trips do you currently complete per week on average?",
    type: "radio",
    options: [
      { value: "less_30", label: "Less than 30 trips", score: 20 },
      { value: "30_50", label: "30-50 trips", score: 40 },
      { value: "50_75", label: "50-75 trips", score: 70 },
      { value: "75_100", label: "75-100 trips", score: 90 },
      { value: "more_100", label: "More than 100 trips", score: 100 },
    ],
    weight: 15,
    category: "experience",
  },

  // Availability Questions
  {
    id: "hours_per_day",
    question: "How many hours per day are you able to work?",
    type: "radio",
    options: [
      { value: "less_4", label: "Less than 4 hours", score: 10 },
      { value: "4_6", label: "4-6 hours", score: 40 },
      { value: "6_8", label: "6-8 hours", score: 70 },
      { value: "8_10", label: "8-10 hours", score: 90 },
      { value: "more_10", label: "More than 10 hours", score: 100 },
    ],
    weight: 15,
    category: "availability",
  },
  {
    id: "days_per_week",
    question: "How many days per week can you work?",
    type: "radio",
    options: [
      { value: "1_2", label: "1-2 days", score: 10 },
      { value: "3_4", label: "3-4 days", score: 40 },
      { value: "5", label: "5 days", score: 70 },
      { value: "6", label: "6 days", score: 90 },
      { value: "7", label: "7 days", score: 100 },
    ],
    weight: 10,
    category: "availability",
  },

  // Commitment Questions
  {
    id: "lease_commitment",
    question: "Are you willing to commit to a 24-month lease agreement?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes, I can commit to 24 months", score: 100 },
      { value: "maybe", label: "I need more information first", score: 50 },
      { value: "no", label: "No, that's too long", score: 0 },
    ],
    weight: 15,
    category: "commitment",
  },
  {
    id: "daily_target",
    question: "Can you commit to completing at least 12 trips per day?",
    type: "radio",
    options: [
      { value: "yes_easily", label: "Yes, easily - I already do more", score: 100 },
      { value: "yes_achievable", label: "Yes, that's achievable", score: 80 },
      { value: "maybe", label: "It might be challenging", score: 40 },
      { value: "no", label: "No, that's too many", score: 0 },
    ],
    weight: 10,
    category: "commitment",
  },

  // Eligibility Questions
  {
    id: "valid_permit",
    question: "Do you have a valid driving permit/license?",
    type: "radio",
    options: [
      { value: "yes_valid", label: "Yes, it's currently valid", score: 100 },
      { value: "expired_renewing", label: "Expired but renewing", score: 50 },
      { value: "no", label: "No", score: 0 },
    ],
    weight: 5,
    category: "eligibility",
  },
  {
    id: "national_id",
    question: "Do you have a valid National ID?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 100 },
      { value: "processing", label: "Applied, waiting for it", score: 50 },
      { value: "no", label: "No", score: 0 },
    ],
    weight: 5,
    category: "eligibility",
  },
];

export const PASSING_SCORE = 65; // Minimum score to qualify

export const CATEGORY_LABELS: Record<ScreeningQuestion["category"], string> = {
  experience: "Experience & Background",
  availability: "Availability",
  commitment: "Commitment",
  eligibility: "Eligibility",
};

export function calculateScreeningScore(
  responses: { questionId: string; value: string }[]
): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const response of responses) {
    const question = SCREENING_QUESTIONS.find((q) => q.id === response.questionId);
    if (!question || !question.options) continue;

    const option = question.options.find((o) => o.value === response.value);
    if (!option) continue;

    totalScore += (option.score * question.weight) / 100;
    totalWeight += question.weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((totalScore / totalWeight) * 100);
}
