export type UserId = string;
export type CohortId = string;
export type ScanId = string;
export type MealId = string;
export type ReflectionId = string;

export interface User {
  id: UserId;
  email: string | null;
  authProvider: 'email' | 'apple' | 'google';
  createdAt: Date;
}

export interface UserProfile {
  userId: UserId;
  nickname: string;
  username: string;
  avatarId: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  userId: UserId;
  remindersEnabledMeals: boolean;
  remindersEnabledBodyCheckin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOnboarding {
  userId: UserId;
  mainReasonKey: string;
  mainChallengesKeys: string[];
  eatingPatternKey: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cohort {
  id: CohortId;
  cohortKey: string;
  weekStart: string;
  createdAt: Date;
}

export interface MealScan {
  id: ScanId;
  userId: UserId;
  cohortId: CohortId;
  status: 'uploaded' | 'analyzing' | 'ready' | 'failed';
  imageStorageKey: string;
  metabolicScore?: number;
  tagKeys?: string[];
  explanationShort?: string;
  analysisPayload?: AnalysisPayload;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meal {
  id: MealId;
  userId: UserId;
  cohortId: CohortId;
  mealScanId?: ScanId;
  mealName: string;
  mealDescription?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  eatenAt: Date;
  energyLevel?: 'low' | 'ok' | 'high';
  metabolicScore: number;
  tagKeys: string[];
  explanationShort: string;
  analysisPayload?: AnalysisPayload;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisPayload {
  headline: string;
  getsRight: string[];
  thingsToWatch: string[];
  confidence: number;
  modelVersion: string;
}

export interface BodyCheckin {
  userId: UserId;
  date: string;
  energyLevel: 'low' | 'ok' | 'high';
  createdAt: Date;
}

export interface WeightGoal {
  userId: UserId;
  goalWeightKg: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeightEntry {
  userId: UserId;
  measuredAt: string;
  weightKg: number;
  createdAt: Date;
}

export interface Reflection {
  id: ReflectionId;
  userId: UserId;
  cohortId: CohortId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  id: string;
  cohortId: CohortId;
  actorUserId: UserId;
  targetType: 'meal' | 'reflection';
  targetId: string;
  createdAt: Date;
}

