export type UserId = string;
export type CohortId = string;
export type ScanId = string;
export type MealId = string;
export type ReflectionId = string;
export type WeightEntryId = string;

export interface User {
  id: UserId;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface UserProfile {
  userId: UserId;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  userId: UserId;
  remindersEnabled: boolean;
  reminderTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOnboarding {
  userId: UserId;
  mainReason?: string;
  challenges: string[];
  eatingPattern?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cohort {
  id: CohortId;
  name: string;
  startsAt: Date;
  endsAt: Date;
}

export interface MealScan {
  id: ScanId;
  userId: UserId;
  label: string;
  createdAt: Date;
}

export interface Meal {
  id: MealId;
  userId: UserId;
  scanId?: ScanId;
  description: string;
  tags: string[];
  score: number;
  consumedAt: Date;
  createdAt: Date;
}

export interface BodyCheckin {
  userId: UserId;
  date: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeightGoal {
  userId: UserId;
  targetWeight: number;
  unit: 'kg' | 'lb';
  updatedAt: Date;
}

export interface WeightEntry {
  id: WeightEntryId;
  userId: UserId;
  weight: number;
  unit: 'kg' | 'lb';
  recordedAt: Date;
}

export interface Reflection {
  id: ReflectionId;
  userId: UserId;
  weekStart: string;
  body: string;
  createdAt: Date;
}

export interface Reaction {
  userId: UserId;
  targetType: 'meal' | 'reflection';
  targetId: string;
  createdAt: Date;
}

