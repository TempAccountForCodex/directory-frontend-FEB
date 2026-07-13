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
  /**
   * Stable identifier of the form the submission came from — the source block's
   * id. Lets the dashboard Forms tab attribute each submission to a specific
   * form and filter by it (multiple Contact/Form blocks per site are otherwise
   * indistinguishable, since `source` is only a coarse category). Optional and
   * backward-compatible: legacy submissions simply have no `formId`.
   */
  formId?: string;
  /** Human-readable label for the form (its heading), shown in the dashboard. */
  formName?: string;
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
 * A single, fully-configurable field on a Contact/Form block. This is the
 * canonical shape every Contact/Form block renders from, so field config is
 * managed in one place (the editor's "Form Fields" repeater) and consumed
 * identically everywhere.
 */
export interface ContactFormField {
  /** Stable key for value storage (repeater `_id`, or derived). */
  key: string;
  label: string;
  placeholder: string;
  /** text | email | tel | textarea | number | select | checkbox | radio | date */
  fieldType: string;
  required: boolean;
  /** Choices for select / radio. */
  options: string[];
}

export const CONTACT_FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "textarea",
  "number",
  "select",
  "checkbox",
  "radio",
  "date",
] as const;

const CONTACT_FIELD_TYPE_SET = new Set<string>(CONTACT_FIELD_TYPES);

/** The default fields a Contact block ships with (removable/editable). */
export const DEFAULT_CONTACT_FORM_FIELDS: ContactFormField[] = [
  { key: "full-name", label: "Full name", placeholder: "Full name", fieldType: "text", required: true, options: [] },
  { key: "email-address", label: "Email address", placeholder: "Email address", fieldType: "email", required: true, options: [] },
  { key: "message", label: "Message", placeholder: "Message", fieldType: "textarea", required: true, options: [] },
];

const parseFieldOptions = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.map((o) => String(o).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,\n]/)
      .map((o) => o.trim())
      .filter(Boolean);
  }
  return [];
};

const parseRequiredFlag = (raw: unknown): boolean => {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw !== 0;
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return false;
    return !["false", "0", "off", "no"].includes(normalized);
  }
  return false;
};

/**
 * Normalize whatever a Contact block has stored into a clean ContactFormField[].
 * Precedence: the editor's `formFields` repeater → a legacy `fields` array →
 * legacy `*Placeholder` strings → the built-in defaults. This keeps every older
 * saved block rendering correctly while new blocks are fully managed.
 */
export const normalizeContactFormFields = (
  formFields: unknown,
  legacy?: {
    fields?: unknown;
    fullNamePlaceholder?: unknown;
    emailPlaceholder?: unknown;
    messagePlaceholder?: unknown;
  },
): ContactFormField[] => {
  const source =
    Array.isArray(formFields) && formFields.length
      ? formFields
      : Array.isArray(legacy?.fields) && legacy!.fields!.length
        ? (legacy!.fields as unknown[])
        : null;

  if (!source) {
    const hasLegacyPlaceholders =
      legacy &&
      (legacy.fullNamePlaceholder ||
        legacy.emailPlaceholder ||
        legacy.messagePlaceholder);
    if (hasLegacyPlaceholders) {
      const name = String(legacy!.fullNamePlaceholder || "Full name");
      const email = String(legacy!.emailPlaceholder || "Email address");
      const message = String(legacy!.messagePlaceholder || "Message");
      return [
        { key: "full-name", label: name, placeholder: name, fieldType: "text", required: true, options: [] },
        { key: "email-address", label: email, placeholder: email, fieldType: "email", required: true, options: [] },
        { key: "message", label: message, placeholder: message, fieldType: "textarea", required: true, options: [] },
      ];
    }
    return DEFAULT_CONTACT_FORM_FIELDS;
  }

  const normalized = source
    .map((item, index): ContactFormField | null => {
      if (typeof item === "string") {
        const label = item.trim();
        if (!label) return null;
        const kind = classifyContactField(label);
        return {
          key: `${label}-${index}`,
          label,
          placeholder: label,
          fieldType: fieldTypeForKind(kind),
          required: kind === "name" || kind === "email" || kind === "message",
          options: [],
        };
      }
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        const label = String(rec.label ?? rec.placeholder ?? "").trim();
        if (!label) return null;
        const rawType = String(rec.fieldType ?? "").trim().toLowerCase();
        const fieldType = CONTACT_FIELD_TYPE_SET.has(rawType)
          ? rawType
          : fieldTypeForKind(classifyContactField(label));
        const key =
          typeof rec._id === "string" && rec._id
            ? rec._id
            : `${label}-${index}`;
        return {
          key,
          label,
          placeholder: String(rec.placeholder ?? label),
          fieldType,
          required: parseRequiredFlag(rec.required),
          options: parseFieldOptions(rec.options),
        };
      }
      return null;
    })
    .filter((f): f is ContactFormField => f !== null);

  return normalized.length ? normalized : DEFAULT_CONTACT_FORM_FIELDS;
};

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
