import { useState, useCallback, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/Dashboard/shared';
import TemplateFilters from '../components/Templates/TemplateFilters';
import TemplateGallery from '../components/Templates/TemplateGallery';
import TemplatePreviewModal from '../components/Templates/TemplatePreviewModal';
import CreateWebsiteModal from '../components/Templates/CreateWebsiteModal';
import { usePlanSummary } from '../hooks/usePlanSummary';
import { type TemplateSummary } from '../templates/templateApi';
import { getFrontendWebsiteTemplates } from '../templates/frontendTemplateCatalog';
import type { TemplateFilters as TemplateFiltersState } from '../components/Templates/TemplateFilters';

interface TemplatesPageProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

const TemplatesPage = ({
  pageTitle = 'Template Gallery',
  pageSubtitle = 'Browse and preview website templates',
}: TemplatesPageProps) => {
  const navigate = useNavigate();
  const { planSummary } = usePlanSummary();
  const [filters, setFilters] = useState<TemplateFiltersState>({
    search: '',
    category: '',
    type: '',
  });

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSummary | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [createTemplate, setCreateTemplate] = useState<TemplateSummary | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const templates = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return getFrontendWebsiteTemplates()
      .filter((template) => {
        const matchesSearch =
          search.length === 0
            ? true
            : `${template.name} ${template.description} ${template.category}`
                .toLowerCase()
                .includes(search);
        const matchesCategory = filters.category ? template.category === filters.category : true;
        const matchesType = filters.type ? template.type === filters.type : true;
        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filters]);

  const onPreviewTemplate = useCallback((template: TemplateSummary) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  }, []);

  const onSelectTemplate = useCallback(
    (template: TemplateSummary) => {
      onPreviewTemplate(template);
    },
    [onPreviewTemplate]
  );

  const onClosePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const onPreviewNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (!selectedTemplate || templates.length === 0) return;

      const currentIndex = templates.findIndex((t) => t.id === selectedTemplate.id);
      if (currentIndex === -1) return;

      let newIndex: number;
      if (direction === 'prev') {
        newIndex = currentIndex === 0 ? templates.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === templates.length - 1 ? 0 : currentIndex + 1;
      }

      setSelectedTemplate(templates[newIndex]);
    },
    [selectedTemplate, templates]
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
      setSuccessMessage('Website created successfully!');
      // Navigate to website editor after short delay for snackbar visibility
      setTimeout(() => {
        navigate(`/dashboard/websites/${websiteId}/manage/overview`);
      }, 1200);
    },
    [navigate]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      <Box sx={{ mb: 3 }}>
        <TemplateFilters filters={filters} onFiltersChange={setFilters} />
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Website creation now uses the frontend landing template catalog so dashboard selection
        matches the live landing previews.
      </Alert>

      <TemplateGallery
        templates={templates}
        loading={false}
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
        planCode={planSummary?.websitePlan?.code || 'website_free'}
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TemplatesPage;
