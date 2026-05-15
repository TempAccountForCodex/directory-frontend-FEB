/**
 * useAIQuestionnaire — Custom hook for AI Questionnaire state management
 *
 * Manages form state for the AI content generation questionnaire.
 * Persists to sessionStorage keyed by templateId.
 * Step 3.17
 */

import { useState, useCallback, useEffect, useRef } from "react";

// 15 business types matching BUSINESS_TYPE_PROMPTS keys in promptTemplateService.js
export const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "law-firm", label: "Law Firm" },
  { value: "agency", label: "Agency" },
  { value: "photography", label: "Photography" },
  { value: "fitness", label: "Fitness" },
  { value: "real-estate", label: "Real Estate" },
  { value: "e-commerce", label: "E-Commerce" },
  { value: "portfolio", label: "Portfolio" },
  { value: "blog", label: "Blog" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education" },
  { value: "saas", label: "SaaS" },
  { value: "construction", label: "Construction" },
  { value: "salon", label: "Salon" },
  { value: "accounting", label: "Accounting" },
] as const;

export const BRAND_PERSONALITIES = [
  {
    value: "professional",
    label: "Professional",
    description: "Formal and authoritative tone",
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Warm and approachable tone",
  },
  { value: "bold", label: "Bold", description: "Confident and direct tone" },
  { value: "minimal", label: "Minimal", description: "Clean and concise tone" },
  { value: "luxury", label: "Luxury", description: "Elegant and premium tone" },
  { value: "playful", label: "Playful", description: "Fun and energetic tone" },
] as const;

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
}

export interface QuestionnaireData {
  // Required fields
  websiteName: string;
  businessType: string;
  email: string;
  services: string;
  // Optional fields
  phone: string;
  address: string;
  logoFile: File | null;
  logoFileName: string;
  brandPersonality: string;
  targetAudience: string;
  usp: string;
  socialLinks: SocialLinks;
  businessHours: string;
  serviceArea: string;
}

export interface ValidationErrors {
  websiteName?: string;
  businessType?: string;
  email?: string;
  services?: string;
}

const INITIAL_STATE: QuestionnaireData = {
  websiteName: "",
  businessType: "",
  email: "",
  services: "",
  phone: "",
  address: "",
  logoFile: null,
  logoFileName: "",
  brandPersonality: "",
  targetAudience: "",
  usp: "",
  socialLinks: { facebook: "", instagram: "", twitter: "", linkedin: "" },
  businessHours: "",
  serviceArea: "",
};

const OPTIONAL_FIELDS: (keyof QuestionnaireData)[] = [
  "phone",
  "address",
  "logoFile",
  "brandPersonality",
  "targetAudience",
  "usp",
  "socialLinks",
  "businessHours",
  "serviceArea",
];

function getStorageKey(templateId: string): string {
  return `ai_questionnaire_${templateId}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Serialize state to sessionStorage (File objects excluded) */
function serializeState(data: QuestionnaireData): string {
  const { logoFile, ...rest } = data;
  return JSON.stringify(rest);
}

/** Deserialize from sessionStorage */
function deserializeState(raw: string): Partial<QuestionnaireData> {
  try {
    const parsed = JSON.parse(raw);
    return { ...parsed, logoFile: null };
  } catch {
    return {};
  }
}

export function useAIQuestionnaire(templateId: string) {
  const [data, setData] = useState<QuestionnaireData>(() => {
    if (!templateId) return INITIAL_STATE;
    const stored = sessionStorage.getItem(getStorageKey(templateId));
    if (stored) {
      return { ...INITIAL_STATE, ...deserializeState(stored) };
    }
    return INITIAL_STATE;
  });

  const initializedRef = useRef(false);
  const resettingRef = useRef(false);

  // Persist to sessionStorage on every change (after initial load)
  useEffect(() => {
    if (!templateId) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    if (resettingRef.current) {
      resettingRef.current = false;
      return;
    }
    sessionStorage.setItem(getStorageKey(templateId), serializeState(data));
  }, [data, templateId]);

  const updateField = useCallback(
    <K extends keyof QuestionnaireData>(
      field: K,
      value: QuestionnaireData[K],
    ) => {
      setData((prev) => {
        const next = { ...prev, [field]: value };
        // When logoFile changes, persist fileName
        if (field === "logoFile" && value instanceof File) {
          next.logoFileName = value.name;
        } else if (field === "logoFile" && value === null) {
          next.logoFileName = "";
        }
        return next;
      });
    },
    [],
  );

  const updateSocialLink = useCallback(
    (platform: keyof SocialLinks, value: string) => {
      setData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [platform]: value },
      }));
    },
    [],
  );

  const validateRequired = useCallback((): {
    valid: boolean;
    errors: ValidationErrors;
  } => {
    const errors: ValidationErrors = {};

    if (
      !data.websiteName ||
      data.websiteName.length < 3 ||
      data.websiteName.length > 255
    ) {
      errors.websiteName =
        data.websiteName.length === 0
          ? "Website name is required"
          : data.websiteName.length < 3
            ? "Website name must be at least 3 characters"
            : "Website name must be 255 characters or less";
    }

    if (!data.businessType) {
      errors.businessType = "Business type is required";
    }

    if (!data.email || !isValidEmail(data.email)) {
      errors.email = !data.email
        ? "Email is required"
        : "Please enter a valid email address";
    }

    if (!data.services || data.services.length < 10) {
      errors.services = !data.services
        ? "Services description is required"
        : "Services must be at least 10 characters";
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }, [data.websiteName, data.businessType, data.email, data.services]);

  const getCompletionPercentage = useCallback((): number => {
    let filled = 0;
    for (const field of OPTIONAL_FIELDS) {
      const val = data[field];
      if (field === "socialLinks") {
        const links = val as SocialLinks;
        if (
          links.facebook ||
          links.instagram ||
          links.twitter ||
          links.linkedin
        ) {
          filled++;
        }
      } else if (field === "logoFile") {
        if (data.logoFile || data.logoFileName) filled++;
      } else if (val) {
        filled++;
      }
    }
    return Math.round((filled / OPTIONAL_FIELDS.length) * 100);
  }, [data]);

  const optionalFieldsFilled = useCallback((): number => {
    let filled = 0;
    for (const field of OPTIONAL_FIELDS) {
      const val = data[field];
      if (field === "socialLinks") {
        const links = val as SocialLinks;
        if (
          links.facebook ||
          links.instagram ||
          links.twitter ||
          links.linkedin
        )
          filled++;
      } else if (field === "logoFile") {
        if (data.logoFile || data.logoFileName) filled++;
      } else if (val) {
        filled++;
      }
    }
    return filled;
  }, [data]);

  const isComplete = useCallback((): boolean => {
    const { valid } = validateRequired();
    return valid;
  }, [validateRequired]);

  const reset = useCallback(() => {
    resettingRef.current = true;
    setData(INITIAL_STATE);
    if (templateId) {
      sessionStorage.removeItem(getStorageKey(templateId));
    }
  }, [templateId]);

  /** Copy questionnaire data from template key to website key so the editor can find it */
  const copyToWebsiteKey = useCallback(
    (websiteId: number | string) => {
      if (!templateId) return;
      const stored = sessionStorage.getItem(getStorageKey(templateId));
      if (stored) {
        sessionStorage.setItem(`ai_questionnaire_${websiteId}`, stored);
      } else {
        // Persist current in-memory state to the website key
        sessionStorage.setItem(
          `ai_questionnaire_${websiteId}`,
          serializeState(data),
        );
      }
    },
    [templateId, data],
  );

  return {
    data,
    updateField,
    updateSocialLink,
    validateRequired,
    getCompletionPercentage,
    optionalFieldsFilled,
    isComplete,
    reset,
    copyToWebsiteKey,
  };
}
