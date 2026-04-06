import { useState, useCallback } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/Dashboard/shared";
import TemplateFilters from "../components/Templates/TemplateFilters";
import TemplateGallery from "../components/Templates/TemplateGallery";
import TemplatePreviewModal from "../components/Templates/TemplatePreviewModal";
import CreateWebsiteModal from "../components/Templates/CreateWebsiteModal";
import { useTemplates } from "../hooks/useTemplates";
import { type TemplateSummary } from "../templates/templateApi";

interface TemplatesPageProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

const TemplatesPage = ({
  pageTitle = "Template Gallery",
  pageSubtitle = "Browse and preview website templates",
}: TemplatesPageProps) => {
  const navigate = useNavigate();
  const { templates, loading, error, filters, setFilters } = useTemplates();

  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateSummary | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [createTemplate, setCreateTemplate] = useState<TemplateSummary | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState("");

  const onPreviewTemplate = useCallback((template: TemplateSummary) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  }, []);

  const onSelectTemplate = useCallback(
    (template: TemplateSummary) => {
      onPreviewTemplate(template);
    },
    [onPreviewTemplate],
  );

  const onClosePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const onPreviewNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (!selectedTemplate || templates.length === 0) return;

      const currentIndex = templates.findIndex(
        (t) => t.id === selectedTemplate.id,
      );
      if (currentIndex === -1) return;

      let newIndex: number;
      if (direction === "prev") {
        newIndex = currentIndex === 0 ? templates.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === templates.length - 1 ? 0 : currentIndex + 1;
      }

      setSelectedTemplate(templates[newIndex]);
    },
    [selectedTemplate, templates],
  );

  const onUseTemplate = useCallback((template: TemplateSummary) => {
    setPreviewOpen(false);
    setCreateTemplate(template);
    setCreateOpen(true);
  }, []);

  const onCloseCreate = useCallback(() => {
    setCreateOpen(false);
    setCreateTemplate(null);
  }, []);

  const onCreateSuccess = useCallback(
    (websiteId: number) => {
      setCreateOpen(false);
      setCreateTemplate(null);
      setSuccessMessage("Website created successfully!");
      // Navigate to website editor after short delay for snackbar visibility
      setTimeout(() => {
        navigate(`/dashboard/websites/${websiteId}/manage/overview`);
      }, 1200);
    },
    [navigate],
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      <Box sx={{ mb: 3 }}>
        <TemplateFilters filters={filters} onFiltersChange={setFilters} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TemplateGallery
        templates={templates}
        loading={loading}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />

      <TemplatePreviewModal
        open={previewOpen}
        template={selectedTemplate}
        templates={templates}
        onClose={onClosePreview}
        onUseTemplate={onUseTemplate}
        onNavigate={onPreviewNavigate}
      />

      <CreateWebsiteModal
        open={createOpen}
        template={createTemplate}
        onClose={onCloseCreate}
        onSuccess={onCreateSuccess}
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMessage("")}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TemplatesPage;
