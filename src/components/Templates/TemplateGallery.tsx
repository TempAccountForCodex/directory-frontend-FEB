import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { LayoutTemplate } from "lucide-react";
import { type TemplateSummary } from "../../templates/templateApi";
import { EmptyState } from "../Dashboard/shared";
import TemplateCard from "./TemplateCard";

interface TemplateGalleryProps {
  templates: TemplateSummary[];
  loading: boolean;
  onSelectTemplate: (template: TemplateSummary) => void;
  onPreviewTemplate: (template: TemplateSummary) => void;
  /** Optional: check if template is favorited */
  isFavorited?: (templateId: string) => boolean;
  /** Optional: called when user toggles favorite on a card */
  onFavoriteToggle?: (templateId: string) => void;
}

const SKELETON_COUNT = 8;

const TemplateGallery = React.memo(function TemplateGallery({
  templates,
  loading,
  onSelectTemplate,
  onPreviewTemplate,
  isFavorited,
  onFavoriteToggle,
}: TemplateGalleryProps) {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Skeleton
              variant="rectangular"
              height={280}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (templates.length === 0) {
    return (
      <Box sx={{ width: "100%" }}>
        <EmptyState
          icon={<LayoutTemplate size={40} color="currentColor" />}
          title="No templates found"
          subtitle="Try adjusting your filters or search query"
        />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
          <TemplateCard
            template={template}
            onClick={onSelectTemplate}
            onPreview={onPreviewTemplate}
            isFavorited={isFavorited?.(template.id)}
            onFavoriteToggle={onFavoriteToggle}
          />
        </Grid>
      ))}
    </Grid>
  );
});

export default TemplateGallery;
