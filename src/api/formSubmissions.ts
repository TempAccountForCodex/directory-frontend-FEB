import { apiClient } from "./client";

/**
 * Public website form submissions.
 *
 * A single place that all public Contact/Form blocks use to persist a
 * submission against a website. The dashboard Forms tab
 * (`FormsTab.jsx`) reads these back from
 * `GET /forms/websites/:websiteId/submissions`, so the shape here must stay in
 * sync with the shape it renders: each field is `{ fieldName, fieldValue,
 * fieldType }`, plus the derived `submitterName` / `submitterEmail` used for the
 * list columns and detail header.
 */

export interface FormFieldPayload {
  fieldName: string;
  fieldValue: string;
  fieldType: string;
}

export interface SubmitWebsiteFormPayload {
  submitterName?: string;
  submitterEmail?: string;
  formData: FormFieldPayload[];
  source?: string;
}

/**
 * POST a submission for a website.
 * Endpoint: POST /api/forms/websites/:websiteId/submissions
 *
 * This is a public, unauthenticated endpoint, so we explicitly opt out of
 * sending credentials to keep the request a simple cross-origin POST from
 * customer subdomains.
 */
export const submitWebsiteFormSubmission = (
  websiteId: string | number,
  payload: SubmitWebsiteFormPayload,
) =>
  apiClient.post(`/forms/websites/${websiteId}/submissions`, payload, {
    withCredentials: false,
  });

/** Coarse classification of a contact field, inferred from its label. */
export type ContactFieldKind = "name" | "email" | "phone" | "message" | "text";

export const classifyContactField = (label: string): ContactFieldKind => {
  const value = (label || "").toLowerCase();
  if (value.includes("mail")) return "email";
  if (
    value.includes("phone") ||
    value.includes("tel") ||
    value.includes("mobile") ||
    value.includes("number")
  ) {
    return "phone";
  }
  if (
    value.includes("message") ||
    value.includes("detail") ||
    value.includes("comment") ||
    value.includes("enquir") ||
    value.includes("inquir") ||
    value.includes("question")
  ) {
    return "message";
  }
  if (value.includes("name")) return "name";
  return "text";
};

/** Map a field kind to the `fieldType` stored on the submission. */
export const fieldTypeForKind = (kind: ContactFieldKind): string => {
  switch (kind) {
    case "email":
      return "email";
    case "phone":
      return "tel";
    case "message":
      return "textarea";
    default:
      return "text";
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean =>
  EMAIL_RE.test((value || "").trim());

/**
 * True when running inside the website editor's preview iframe. Public sites
 * render top-level, so this reliably distinguishes "designing in the editor"
 * from a real visitor and lets blocks skip real submissions while editing.
 * A cross-origin access error also means we are framed, so treat it as editor.
 */
export const isEditorPreviewEnvironment = (): boolean => {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true;
  }
};
