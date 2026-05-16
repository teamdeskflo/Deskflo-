'use client';

import { createContext, useContext, ReactNode } from 'react';

export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired';

export type User = {
  name: string;
  email: string;
  company_name?: string;
  logo_url?: string;
  brand_color?: string;
  subscription_status?: SubscriptionStatus;
  /** Exact date this user's trial started (set once at signup) */
  trial_starts_at?: Date;
  /** Exact date this user's trial ends (set once at signup, e.g. +14 days) */
  trial_ends_at?: Date;
  /** If paying, the date of next recurring charge */
  next_billing_date?: Date;
  /** Monthly or annual */
  billing_plan?: 'monthly' | 'annual';
};

// Simulates a user who signed up 9 days ago on a 14-day trial.
// TODO: Replace with real Supabase session data via NextAuth/server component.
const TRIAL_START = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000);  // 9 days ago
const TRIAL_END   = new Date(TRIAL_START.getTime() + 14 * 24 * 60 * 60 * 1000); // 14-day trial

const MOCK_USER: User = {
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  company_name: 'Rahul Creative',
  brand_color: '#5A7350',
  subscription_status: 'trial',
  trial_starts_at: TRIAL_START,
  trial_ends_at:   TRIAL_END,
  billing_plan: 'monthly',
};

const UserContext = createContext<User>(MOCK_USER);

export function UserProvider({ children, user = MOCK_USER }: { children: ReactNode; user?: User }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

/** Returns initials from a full name, e.g. "Rahul Sharma" → "RS" */
export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Days remaining in trial. Returns 0 if expired or no trial date. */
export function trialDaysRemaining(trial_ends_at?: Date): number {
  if (!trial_ends_at) return 0;
  const diff = trial_ends_at.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Returns how far through the trial the user is, as a 0–100 percentage.
 * e.g. day 9 of 14 = ~64%
 */
export function trialProgressPercent(trial_starts_at?: Date, trial_ends_at?: Date): number {
  if (!trial_starts_at || !trial_ends_at) return 0;
  const totalMs  = trial_ends_at.getTime() - trial_starts_at.getTime();
  const usedMs   = Date.now()          - trial_starts_at.getTime();
  if (totalMs <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((usedMs / totalMs) * 100)));
}
