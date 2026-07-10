/**
 * AIQuestionnairePage — Step 3 of Website Creation Wizard
 *
 * Orchestrates the AIQuestionnaire form and QuestionnaireNavigation.
 * Handles website creation (POST /api/websites/from-template).
 * Step 3.17 + 4.16 (AI Intake Restructuring).
 */

import React, { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import axios from "axios";
// @ts-ignore
import { getDashboardColors } from "../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import AIQuestionnaire from "../components/WebsiteCreation/AIQuestionnaire";
import QuestionnaireNavigation from "../components/WebsiteCreation/QuestionnaireNavigation";
import {
  useAIQuestionnaire,
  type QuestionnaireData,
  type ValidationErrors,
} from "../hooks/useAIQuestionnaire";
import { API_URL } from "@/config/api";

/** sessionStorage key the editor reads to run the AI draft for a website. */
export const aiDraftQuestionnaireKey = (websiteId: number | string) =>
  `ai_website_draft_questionnaire_${websiteId}`;

/** Map the questionnaire form fields into the generate-website-draft payload. */
function buildDraftQuestionnaire(data: QuestionnaireData) {
  const contactParts: string[] = [];
  if (data.email) contactParts.push(data.email);
  if (data.phone) contactParts.push(data.phone);
  if (data.address) contactParts.push(data.address);

  const servicesArray = data.services
    ? data.services.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return {
    businessName: data.websiteName,
    category: data.businessType,
    primaryGoal: "leads",
    contactInfo: contactParts.length ? contactParts.join(' / ') : undefined,
    location: data.serviceArea || undefined,
    shortDescription: data.usp || undefined,
    targetAudience: data.targetAudience || undefined,
    servicesOrProducts: servicesArray.length ? servicesArray : undefined,
    tone: data.brandPersonality || undefined,
  };
}

interface AIQuestionnairePageProps {
  embedded?: boolean;
}

export default function AIQuestionnairePage({
  embedded,
}: AIQuestionnairePageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template") || "";
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const {
    data,
    updateField,
    updateSocialLink,
    validateRequired,
    optionalFieldsFilled,
    isComplete,
    reset,
    copyToWebsiteKey,
  } = useAIQuestionnaire(templateId);

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleBack = useCallback(() => {
    navigate(`/dashboard/websites/create/customize?template=${templateId}`);
  }, [navigate, templateId]);

  /**
   * Create the website from the template, then either route into the editor to
   * run the AI draft (`useAI`) or drop the user on the website list (skip path).
   * Nothing AI-related is persisted here — the draft runs preview-only in the
   * editor and only sticks if the user saves.
   */
  const createWebsite = useCallback(
    async (useAI: boolean) => {
      setSubmitting(true);
      setSubmitError("");
      try {
        // Step 1: Create website via the correct from-template endpoint
        const websitePayload = {
          name: data.websiteName || "My Website",
          templateId: templateId || undefined, // Pass as-is (UUID string), not Number()
          // Category hint for backends that accept it at creation time.
          businessCategory: data.businessType || undefined,
          category: data.businessType || undefined,
        };

        const createResponse = await axios.post(
          `${API_URL}/websites/from-template`,
          websitePayload,
        );

        if (!createResponse.data.success) {
          throw new Error(
            createResponse.data.message || "Failed to create website",
          );
        }

        const website = createResponse.data.data || createResponse.data.website;
        const websiteId = website?.id;

        if (!websiteId) {
          throw new Error("Website created but no ID returned");
        }

        // Copy questionnaire data to website key so the editor can find it later
        copyToWebsiteKey(websiteId);

        if (useAI) {
          // Stash the draft questionnaire so the editor can run the AI draft,
          // then hand off to the editor with the aiDraft marker. The draft is
          // preview-only; nothing persists until the user saves.
          const questionnaireData = buildDraftQuestionnaire(data);
          try {
            sessionStorage.setItem(
              aiDraftQuestionnaireKey(websiteId),
              JSON.stringify(questionnaireData),
            );
          } catch {
            // Non-fatal: the editor also receives the questionnaire via route state.
          }

          // Clean up the template-scoped questionnaire draft.
          reset();

          navigate(`/dashboard/websites/${websiteId}/editor?aiDraft=1`, {
            state: { aiDraftQuestionnaire: questionnaireData },
          });
          return;
        }

        // Clean up sessionStorage
        reset();

        // Navigate to the website list
        navigate("/dashboard/websites");
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate("/auth");
          return;
        }
        setSubmitError(
          err.response?.data?.message ||
            err.message ||
            "Failed to create website",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      data,
      templateId,
      navigate,
      reset,
      copyToWebsiteKey,
    ],
  );

  const handleGenerate = useCallback(async () => {
    setSubmitError("");
    const { valid, errors: validationErrors } = validateRequired();
    setErrors(validationErrors);
    if (!valid) return;
    await createWebsite(true);
  }, [validateRequired, createWebsite]);

  const handleSkip = useCallback(async () => {
    setSubmitError("");
    await createWebsite(false);
  }, [createWebsite]);

  const content = (
    <Box sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: colors.text, fontWeight: 700, mb: 0.5 }}
        >
          Tell Us About Your Business
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          This information helps set up your website. Generate with AI to draft
          your content, then review and save it inside the editor — or skip and
          start from the template defaults.
        </Typography>
      </Box>

      <AIQuestionnaire
        data={data}
        errors={errors}
        updateField={updateField}
        updateSocialLink={updateSocialLink}
        optionalFieldsFilled={optionalFieldsFilled()}
      />

      <QuestionnaireNavigation
        isComplete={isComplete()}
        onBack={handleBack}
        onGenerate={handleGenerate}
        onSkip={handleSkip}
        errorMessage={submitError}
        onClearError={() => setSubmitError("")}
        submitting={submitting}
      />
    </Box>
  );

  if (embedded) {
    return content;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.bgDefault, py: 4 }}>
      <Box sx={{ maxWidth: "xl", mx: "auto", px: { xs: 2, md: 3 } }}>
        {content}
      </Box>
    </Box>
  );
}
