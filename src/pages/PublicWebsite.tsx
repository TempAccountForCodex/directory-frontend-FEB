/**
 * Public Website Viewer
 * Renders template-generated websites based on slug from subdomain or path
 */

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Box,
  Container,
  CircularProgress,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Alert,
} from "@mui/material";
import axios from "axios";
import BlockRenderer from "../components/PublicWebsite/BlockRenderer";
import BlockErrorBoundary from "../components/PublicWebsite/BlockErrorBoundary";
import ImageWithLoader from "../components/UI/ImageWithLoader";
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics";
import LanguageSelector from "../components/LanguageSelector";

const API_URL = import.meta.env.VITE_API_URL || "/api";

interface Page {
  id: number;
  title: string;
  path: string;
  isHome: boolean;
  blocks: Block[];
}

interface Block {
  id: number;
  blockType: string;
  content: any;
  sortOrder: number;
}

interface Website {
  id: number;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor?: string;
  headingTextColor?: string;
  bodyTextColor?: string;
  faviconUrl?: string;
  logoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  businessName?: string;
  shortDescription?: string;
  gaMeasurementId?: string;
  pages: Page[];
}

const PublicWebsite: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [website, setWebsite] = useState<Website | null>(null);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Analytics if configured
  const { trackClick, trackFormSubmit } = useGoogleAnalytics({
    measurementId: website?.gaMeasurementId || "",
    enabled: !!website?.gaMeasurementId,
    debug: import.meta.env.DEV,
  });

  // Get slug from subdomain or URL parameter
  const getWebsiteSlug = (): string | null => {
    // Try URL parameter first
    if (slug) return slug;

    // Try to extract from subdomain
    const hostname = window.location.hostname;

    // Do not parse IPv4 hosts as subdomains (e.g. 192.168.0.200).
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      return null;
    }

    const parts = hostname.split(".");

    // Reserved subdomains that should NOT be treated as website slugs
    const reservedSubdomains = [
      "www",
      "api",
      "admin",
      "app",
      "dashboard",
      "staging",
      "dev",
      "test",
      "localhost",
    ];

    // Check if it's a subdomain and not a reserved one
    if (parts.length > 1 && parts[0] !== "localhost") {
      const subdomain = parts[0].toLowerCase();
      if (!reservedSubdomains.includes(subdomain)) {
        return subdomain;
      }
    }

    return null;
  };

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        setLoading(true);
        setError(null);

        const websiteSlug = getWebsiteSlug();

        if (!websiteSlug) {
          setError("No website specified");
          setLoading(false);
          return;
        }

        // Fetch website by slug
        const response = await axios.get(
          `${API_URL}/websites/slug/${websiteSlug}`,
        );
        const websiteData = response.data;

        // Sort pages by sortOrder
        const sortedPages = [...websiteData.pages].sort(
          (a, b) => a.sortOrder - b.sortOrder,
        );

        // Sort blocks within each page
        sortedPages.forEach((page) => {
          page.blocks = [...page.blocks].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          );
        });

        websiteData.pages = sortedPages;
        setWebsite(websiteData);

        // Find the current page based on path
        const pathName = location.pathname === "/" ? "/" : location.pathname;
        let page = sortedPages.find((p) => p.path === pathName);

        // If no page found, use home page
        if (!page) {
          page = sortedPages.find((p) => p.isHome) || sortedPages[0];
        }

        setCurrentPage(page || null);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching website:", err);
        setError(err.response?.data?.message || "Failed to load website");
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [slug, location.pathname]);

  if (loading) {
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
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !website || !currentPage) {
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
            {error || "Website not found"}
          </Alert>
          <Typography variant="body1" align="center">
            The website you're looking for doesn't exist or is not published.
          </Typography>
        </Container>
      </Box>
    );
  }

  // Prepare SEO meta values
  const pageTitle = currentPage?.title || "Home";
  const metaTitle = website.metaTitle || `${pageTitle} - ${website.name}`;
  const metaDescription =
    website.metaDescription ||
    website.shortDescription ||
    `${website.name} - ${website.businessName || ""}`.trim();
  const siteUrl = window.location.origin + window.location.pathname;
  const ogImage = website.logoUrl || "";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* SEO Meta Tags */}
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />

        {/* Favicon */}
        {website.faviconUrl && <link rel="icon" href={website.faviconUrl} />}

        {/* Open Graph Tags for Social Sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={siteUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:site_name" content={website.name} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Helmet>

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
          <Box
            sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 2 }}
          >
            {website.logoUrl && (
              <ImageWithLoader
                src={website.logoUrl}
                alt={`${website.name} logo`}
                width={40}
                height={40}
                objectFit="contain"
                borderRadius={4}
                placeholder="pulse"
              />
            )}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: website.primaryColor || "#2563eb",
              }}
            >
              {website.name}
            </Typography>
          </Box>
          {website.pages.map((page) => (
            <Button
              key={page.id}
              component={Link}
              to={`/site/${website.slug}${page.path}`}
              sx={{
                color:
                  currentPage?.id === page.id
                    ? website.primaryColor
                    : "text.secondary",
                fontWeight: currentPage?.id === page.id ? 600 : 400,
                textDecoration: "none",
              }}
            >
              {page.title}
            </Button>
          ))}
          <Box sx={{ ml: 2 }}>
            <LanguageSelector
              variant="standard"
              size="small"
              showIcon={false}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Page Content - Render all blocks */}
      <Box>
        {!currentPage?.blocks || currentPage.blocks.length === 0 ? (
          <Container sx={{ py: 8 }}>
            <Typography variant="h5" align="center" color="text.secondary">
              This page has no content yet.
            </Typography>
          </Container>
        ) : (
          currentPage.blocks.map((block) => (
            <BlockErrorBoundary
              key={block.id}
              blockType={block.blockType}
              blockId={block.id}
            >
              <BlockRenderer
                block={block}
                primaryColor={website.primaryColor || "#378C92"} // Techietribe teal
                secondaryColor={website.secondaryColor || "#D3EB63"} // Techietribe lime accent
                headingColor={website.headingTextColor || "#252525"} // Techietribe dark text
                bodyColor={website.bodyTextColor || "#6A6F78"} // Techietribe gray text
                onCtaClick={(blockType, ctaText) =>
                  trackClick(`${blockType}_CTA`, { cta_text: ctaText })
                }
                onFormSubmit={trackFormSubmit}
              />
            </BlockErrorBoundary>
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
          © {currentYear} {website.name}. All rights reserved.
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, opacity: 0.7 }}>
          Powered by TechieTribe
        </Typography>
      </Box>
    </Box>
  );
};

export default PublicWebsite;
