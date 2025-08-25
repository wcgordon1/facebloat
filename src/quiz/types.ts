import { z } from "zod";

// Core letter type
export type Letter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

// Gender routing
export type GenderRoute = "male" | "female";

// Quiz validation schemas
const letterSchema = z.enum(["A", "B", "C", "D", "E", "F", "G", "H"]);

const optionSchema = z.object({
  letter: letterSchema,
  title: z.string(),
  points: z.number(),
  context: z.string(),
});

const questionSchema = z.object({
  id: z.string(),
  appliesTo: z.enum(["all", "male", "female"]),
  categoryId: z.string(),
  text: z.string(),
  acute: z.boolean(),
  withinCategoryWeight: z.record(z.number()).optional(),
  options: z.array(optionSchema),
});

const categorySchema = z.object({
  id: z.string(),
  label: z.string(),
});

const scoreBandSchema = z.object({
  min: z.number(),
  max: z.number(),
  band: z.string(),
  label: z.string(),
  blurb: z.string(),
});

const profileFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

const profileFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["select", "input"]),
  options: z.array(profileFieldOptionSchema).optional(),
});

const profileSchema = z.object({
  fields: z.array(profileFieldSchema),
});

export const quizSchema = z.object({
  version: z.string(),
  letterPoints: z.record(letterSchema, z.number()),
  scoreBands: z.array(scoreBandSchema),
  categories: z.array(categorySchema),
  categoryWeights: z.object({
    male: z.record(z.string(), z.number()),
    female: z.record(z.string(), z.number()),
  }),
  profile: profileSchema,
  questions: z.array(questionSchema),
});

// Exported types
export type Quiz = z.infer<typeof quizSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Option = z.infer<typeof optionSchema>;
export type Category = z.infer<typeof categorySchema>;
export type ScoreBand = z.infer<typeof scoreBandSchema>;
export type ProfileField = z.infer<typeof profileFieldSchema>;

// State types
export type Answers = Record<string, Letter>;

export interface ProfileState {
  age?: string;
  menstruates?: string;
  height?: number;
  weight?: number;
  heightUnit?: "cm" | "ft";
  weightUnit?: "kg" | "lbs";
  waist?: number;
  waistUnit?: "cm" | "in";
  weightChange?: string;
}

export interface DerivedProfile {
  route: GenderRoute;
  metrics: {
    bmi?: number;
    waistToHeight?: number;
  };
}

export interface AnswerContext {
  questionId: string;
  questionText: string;
  categoryId: string;
  choice: Letter;
  choiceTitle: string;
  context: string;
}

export interface TopDriver {
  categoryId: string;
  label: string;
  pct: number;
}

export interface ScoreResult {
  score: number; // 0-100
  band: ScoreBand;
  topDrivers: TopDriver[]; // highest weighted contributions
  answerContexts: AnswerContext[];
}

// Validation function
export function validateQuiz(data: unknown): Quiz {
  try {
    return quizSchema.parse(data);
  } catch (error) {
    throw new Error(`Invalid quiz data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
