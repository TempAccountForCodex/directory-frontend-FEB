/**
 * Template Preview - Demo Mode
 *
 * Renders a template preview without creating a database entry.
 * Opens in new tab when user clicks "Demo" on a template card.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Typography,
  AppBar,
  Toolbar,
  Alert,
  Chip,
} from "@mui/material";
import {
  getTemplateById,
  CATEGORY_LABELS,
  type Template,
} from "../templates/templateApi";
import BlockRenderer from "../components/PublicWebsite/BlockRenderer";
import { processTemplatePlaceholders } from "../utils/templatePlaceholderText";

const TemplatePreview: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!templateId) {
      setTemplate(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getTemplateById(templateId)
      .then((data) => {
        if (isMounted) {
          setTemplate(data || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTemplate(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [templateId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!template) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 2 }}>
            Template not found
          </Alert>
          <Typography variant="body1" align="center">
            The template you're looking for doesn't exist.
          </Typography>
        </Container>
      </Box>
    );
  }

  // Get home page (first page or page marked as home)
  const homePage =
    template.defaultPages.find((p) => p.isHome) || template.defaultPages[0];

  if (!homePage) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Preview Header - Shows this is a demo */}
      <Box
        sx={{
          bgcolor: "warning.light",
          borderBottom: "2px solid",
          borderColor: "warning.main",
          py: 1.5,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Template Preview
            </Typography>
            <Chip label={template.name} size="small" color="primary" />
            <Chip
              label={CATEGORY_LABELS[template.category]}
              size="small"
              variant="outlined"
            />
            <Typography
              variant="caption"
              sx={{ ml: "auto", display: { xs: "none", sm: "block" } }}
            >
              This is a preview. No data will be saved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          bgcolor: "white",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: template.defaultWebsiteConfig?.primaryColor || "inherit",
            }}
          >
            {template.name}
          </Typography>
          {template.defaultPages.map((page, idx) => (
            <Typography
              key={idx}
              variant="body2"
              sx={{
                mx: 1,
                color: page.isHome
                  ? template.defaultWebsiteConfig?.primaryColor || "inherit"
                  : "text.secondary",
                fontWeight: page.isHome ? 600 : 400,
              }}
            >
              {page.title}
            </Typography>
          ))}
        </Toolbar>
      </AppBar>

      {/* Page Content - Render all blocks from home page */}
      <Box>
        {homePage.blocks.length === 0 ? (
          <Container sx={{ py: 8 }}>
            <Typography variant="h5" align="center" color="text.secondary">
              This template has no content blocks yet.
            </Typography>
          </Container>
        ) : (
          homePage.blocks.map((block, idx) => (
            <BlockRenderer
              key={idx}
              block={{
                id: idx,
                blockType: block.type,
                content: processTemplatePlaceholders(block.content, new Date()),
                sortOrder: block.sortOrder,
              }}
              primaryColor={
                template.defaultWebsiteConfig?.primaryColor || "#378C92"
              }
            />
          ))
        )}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          mt: "auto",
          bgcolor: "grey.900",
          color: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} {template.name}. All rights reserved.
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, opacity: 0.7 }}>
          Powered by TechieTribe
        </Typography>
      </Box>
    </Box>
  );
};

export default TemplatePreview;
