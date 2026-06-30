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
  type ValidationErrors,
} from "../hooks/useAIQuestionnaire";
import { API_URL } from "@/config/api";

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

  /** Create website with template defaults. Creation-time AI generation is disabled for now. */
  const createWebsite = useCallback(
    async () => {
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
    await createWebsite();
  }, [validateRequired, createWebsite]);

  const handleSkip = useCallback(async () => {
    setSubmitError("");
    await createWebsite();
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
          This information helps set up your website. AI generation during
          creation is disabled for now; you can use AI inside the editor.
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
        aiGenerationDisabled
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
