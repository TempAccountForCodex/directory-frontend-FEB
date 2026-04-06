/**
 * AIQuestionnairePage — Step 3 of Website Creation Wizard
 *
 * Orchestrates the AIQuestionnaire form and QuestionnaireNavigation.
 * Handles website creation (POST /api/websites/from-template) and AI content generation.
 * After successful creation + AI session, shows AIGenerationProgress inline.
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
import AIGenerationProgress from "../components/WebsiteCreation/AIGenerationProgress";
import {
  useAIQuestionnaire,
  type ValidationErrors,
} from "../hooks/useAIQuestionnaire";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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

  // AI progress state — when set, we show AIGenerationProgress instead of the form
  const [aiSessionId, setAiSessionId] = useState<string | null>(null);
  const [createdWebsiteId, setCreatedWebsiteId] = useState<number | null>(null);

  const handleBack = useCallback(() => {
    navigate(`/dashboard/websites/create/customize?template=${templateId}`);
  }, [navigate, templateId]);

  /** Build questionnaire payload from form data */
  const buildQuestionnairePayload = useCallback(
    () => ({
      businessName: data.websiteName,
      businessType: data.businessType,
      email: data.email,
      phone: data.phone,
      address: data.address,
      services: data.services,
      brandPersonality: data.brandPersonality,
      targetAudience: data.targetAudience,
      usp: data.usp,
      socialLinks: data.socialLinks,
      businessHours: data.businessHours,
      serviceArea: data.serviceArea,
    }),
    [data],
  );

  /** Create website with template defaults, then optionally run AI generation */
  const createWebsite = useCallback(
    async (withAI: boolean) => {
      setSubmitting(true);
      setSubmitError("");
      try {
        // Step 1: Create website via the correct from-template endpoint
        const websitePayload = {
          name: data.websiteName || "My Website",
          templateId: templateId || undefined, // Pass as-is (UUID string), not Number()
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

        if (withAI) {
          // Step 2: Create AI generation session
          const questionnaireData = buildQuestionnairePayload();

          try {
            const aiResponse = await axios.post(
              `${API_URL}/ai/generate-content`,
              {
                websiteId,
                questionnaireData,
              },
            );

            const sessionId =
              aiResponse.data?.data?.sessionId || aiResponse.data?.sessionId;

            if (sessionId) {
              // Show AI progress view instead of navigating away
              setCreatedWebsiteId(websiteId);
              setAiSessionId(sessionId);
              return; // Don't navigate — AIGenerationProgress will handle redirect
            }
          } catch (aiErr) {
            // AI generation session creation failed — website was created, redirect to editor
          }
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
      buildQuestionnairePayload,
    ],
  );

  /** Retry AI generation for the already-created website */
  const handleRetrySession = useCallback(
    async (_resumeMode: boolean): Promise<string | null> => {
      if (!createdWebsiteId) return null;
      try {
        const questionnaireData = buildQuestionnairePayload();
        const aiResponse = await axios.post(`${API_URL}/ai/generate-content`, {
          websiteId: createdWebsiteId,
          questionnaireData,
        });
        return (
          aiResponse.data?.data?.sessionId || aiResponse.data?.sessionId || null
        );
      } catch {
        return null;
      }
    },
    [createdWebsiteId, buildQuestionnairePayload],
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

  // If AI generation is in progress, show the progress component
  if (aiSessionId && createdWebsiteId) {
    const progressContent = (
      <AIGenerationProgress
        sessionId={aiSessionId}
        websiteId={createdWebsiteId}
        websiteName={data.websiteName || "Your Website"}
        questionnaireData={buildQuestionnairePayload()}
        onRetrySession={handleRetrySession}
      />
    );

    if (embedded) {
      return progressContent;
    }

    return (
      <Box sx={{ minHeight: "100vh", bgcolor: colors.bgDefault, py: 4 }}>
        <Box sx={{ maxWidth: "xl", mx: "auto", px: { xs: 2, md: 3 } }}>
          {progressContent}
        </Box>
      </Box>
    );
  }

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
          This information helps our AI generate tailored content for your
          website. You can skip this step and use template defaults instead.
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
