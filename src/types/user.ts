import type { Role } from "../constants/roles";

/**
 * Canonical User type definition
 * This is the single source of truth for the User interface
 * Import this type instead of defining local User interfaces
 *
 * Note: This type matches the Prisma User model schema
 * Backend uses Int for id, which is sent to frontend as number
 */
export interface User {
  id: number;
  email: string;
  emailVerified: boolean;
  password?: string;
  name: string;
  displayImage?: string;
  title?: string;
  biography?: string;
  googleId?: string;
  role: Role | string; // Role enum preferred, string for backward compat with API responses
  blocked?: boolean;
  websitePlan?: string;
  storePlan?: string;
  createdAt?: string; // ISO date string from backend

  // Billing fields
  billingName?: string;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingZipCode?: string;
  cardLast4?: string;
  cardBrand?: string;
}

/**
 * Billing details interface for account billing endpoints
 */
export interface BillingDetails {
  name: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zipCode: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  currentPlan: string;
}

/**
 * Display plan information for UI
 */
export interface DisplayPlan {
  code: string;
  displayName: string;
  priceMonthly: number;
  tierLevel: number;
}

/**
 * Payment method interface for multi-card support
 */
export interface PaymentMethod {
  id: number;
  cardBrand: string;
  cardLast4: string;
  cardExpMonth: number;
  cardExpYear: number;
  cardholderName: string | null;
  isDefault: boolean;
  createdAt: string;
}
