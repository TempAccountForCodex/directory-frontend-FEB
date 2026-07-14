/**
 * Public Website Viewer
 * Renders template-generated websites based on slug from subdomain or path
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { apiClient } from "../api/client";
import DynamicBlockRenderer from "../components/PublicWebsite/DynamicBlockRenderer";
import BlockErrorBoundary from "../components/PublicWebsite/BlockErrorBoundary";
import PublicWebsiteIntegrations, {
  type WebsiteIntegration,
} from "../components/PublicWebsite/PublicWebsiteIntegrations";
import { DynamicBlockProvider } from "../context/DynamicBlockContext";
import {
  BlogArticleSeoContext,
  type BlogArticleSeoData,
} from "../components/PublicWebsite/dynamic/BlogArticleBlock";
import ImageWithLoader from "../components/UI/ImageWithLoader";
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics";
import LanguageSelector from "../components/LanguageSelector";
import TemplateEngine from "../landingTemplates/templateEngine/TemplateEngine";
import {
  buildTemplatePreviewBusinessData,
  inferFrontendTemplateIdFromPages,
  supportsFrontendTemplateEditor,
  type TemplateEditorPage,
} from "../templates/frontendTemplateEditorSupport";
import {
  buildFrontendTemplateBusinessData,
  hasFrontendTemplateBaseData,
} from "../templates/frontendTemplateSiteData";
import { getStoredWebsiteFrontendTemplateId } from "../templates/frontendTemplatePersistence";

interface Page {
  id: number;
  title: string;
  path: string;
  isHome: boolean;
  isPublished?: boolean;
  blocks: Block[];
  pageType?: string;
}

interface Block {
  id: number;
  blockType: string;
  type?: string;
  content: any;
  sortOrder: number;
  isVisible?: boolean;
}

// ---------------------------------------------------------------------------
// Font preset definitions (Step 12.1) — mirrors backend/constants/fontPresets.js
// ---------------------------------------------------------------------------
const FONT_PRESETS_MAP: Record<
  string,
  { headingFont: string; bodyFont: string; googleFontsUrl: string | null }
> = {
  system: {
    headingFont: "Inter, system-ui, sans-serif",
    bodyFont: "Inter, system-ui, sans-serif",
    googleFontsUrl: null,
  },
  serif: {
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'Lora', Georgia, serif",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:wght@400;500&display=swap",
  },
  modern: {
    headingFont: "'Poppins', sans-serif",
    bodyFont: "'Poppins', sans-serif",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap",
  },
  editorial: {
    headingFont: "'Cormorant Garamond', Georgia, serif",
    bodyFont: "'Montserrat', sans-serif",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;600&display=swap",
  },
};

interface Website {
  id: number;
  name: string;
  slug: string;
  integrations?: WebsiteIntegration[];
  frontendTemplateId?: string | null;
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
  fullAddress?: string;
  tags?: string[];
  gaMeasurementId?: string;
  fontPreset?: string;
  headingLetterSpacing?: string;
  headingTextTransform?: string;
  templateSnapshot?: {
    themeSettings?: {
      primaryColor?: string;
      secondaryColor?: string;
      headingFont?: string;
      bodyFont?: string;
      paletteId?: string;
      fontPackId?: string;
    };
    pages?: Array<{
      id?: string | number;
      title?: string;
      path?: string;
      isHome?: boolean;
      isPublished?: boolean;
      sortOrder?: number;
      blocks?: Array<{
        id?: string | number;
        blockType?: string;
        type?: string;
        content?: any;
        sortOrder?: number;
        isVisible?: boolean;
      }>;
    }>;
  };
  pages: Page[];
}

const PublicWebsite: React.FC = () => {
  const { slug, "*": splatPath } = useParams<{ slug: string; "*": string }>();
  const location = useLocation();
  const [website, setWebsite] = useState<Website | null>(null);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Blog article SEO override — populated by BlogArticleBlock via context
  const [blogSeoData, setBlogSeoData] = useState<BlogArticleSeoData | null>(
    null,
  );
  const resolvedFrontendTemplateId =
    website?.frontendTemplateId ||
    getStoredWebsiteFrontendTemplateId(website?.id) ||
    null;

  const handleSetBlogSeoData = useCallback(
    (data: BlogArticleSeoData | null) => {
      setBlogSeoData(data);
    },
    [],
  );

  const blogArticleSeoContextValue = useMemo(
    () => ({ seoData: blogSeoData, setSeoData: handleSetBlogSeoData }),
    [blogSeoData, handleSetBlogSeoData],
  );

  const activeIntegrations = useMemo(
    () => (website?.integrations || []).filter((integration) => integration?.isActive),
    [website?.integrations],
  );
  const hasActiveGaIntegration = useMemo(
    () =>
      activeIntegrations.some(
        (integration) =>
          integration.integrationType === "GOOGLE_ANALYTICS" &&
          integration.config?.measurementId,
      ),
    [activeIntegrations],
  );

  // Initialize Google Analytics if configured
  const { trackClick, trackFormSubmit } = useGoogleAnalytics({
    measurementId: website?.gaMeasurementId || "",
    enabled: !!website?.gaMeasurementId && !hasActiveGaIntegration,
    debug: import.meta.env.DEV,
  });

  // Get slug from subdomain or URL parameter
  const getWebsiteSlug = (): string | null => {
    // Try URL parameter first
    if (slug) return slug;

    // Try to extract from subdomain
    const hostname = window.location.hostname;
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
        const response = await apiClient.get(`/websites/slug/${websiteSlug}`);
        const websiteData = response.data;

        // Sort pages by sortOrder
        let rawPages = Array.isArray(websiteData.pages)
          ? websiteData.pages
          : Array.isArray(websiteData.blocks)
            ? [
                {
                  id: websiteData.id ?? websiteData.pageId ?? "page-0",
                  title: websiteData.title || "Home",
                  path: websiteData.path || "/",
                  isHome: websiteData.isHome ?? true,
                  sortOrder: websiteData.sortOrder ?? 0,
                  isPublished: websiteData.isPublished ?? true,
                  blocks: websiteData.blocks,
                },
              ]
            : [];
        let sortedPages = [...rawPages].sort(
          (a, b) => a.sortOrder - b.sortOrder,
        );
        let inferredFrontendTemplateId =
          inferFrontendTemplateIdFromPages(sortedPages);

        const resolvedTemplateId =
          websiteData.frontendTemplateId ||
          inferredFrontendTemplateId ||
          getStoredWebsiteFrontendTemplateId(
            websiteData.id || websiteData.websiteId,
          ) ||
          null;

        if (
          websiteData.id &&
          resolvedTemplateId &&
          supportsFrontendTemplateEditor(resolvedTemplateId)
        ) {
          try {
            const pagesRes = await apiClient.get(
              `/websites/${websiteData.id}/pages`,
            );
            const persistedPages = Array.isArray(pagesRes.data?.data)
              ? pagesRes.data.data
              : [];

            if (persistedPages.length > 0) {
              const persistedPagesWithBlocks = await Promise.all(
                persistedPages.map(async (page: any) => {
                  try {
                    const blocksRes = await apiClient.get(
                      `/pages/${page.id}/blocks`,
                    );
                    return {
                      ...page,
                      blocks: Array.isArray(blocksRes.data?.data)
                        ? blocksRes.data.data
                        : [],
                    };
                  } catch {
                    return {
                      ...page,
                      blocks: [],
                    };
                  }
                }),
              );

              rawPages = persistedPagesWithBlocks;
              sortedPages = [...rawPages].sort(
                (a, b) => a.sortOrder - b.sortOrder,
              );
              inferredFrontendTemplateId =
                inferFrontendTemplateIdFromPages(sortedPages);
            }
          } catch {
            // Fall back to slug payload pages below.
          }
        }

        // Sort blocks within each page
        sortedPages.forEach((page) => {
          page.blocks = Array.isArray(page.blocks)
            ? [...page.blocks].sort((a, b) => a.sortOrder - b.sortOrder)
            : [];
        });

        let scopedIntegrations = Array.isArray(websiteData.integrations)
          ? websiteData.integrations
          : [];

        if (websiteData.id) {
          try {
            const integrationsRes = await apiClient.get(
              `/websites/${websiteData.id}/integrations`,
            );
            const fetchedIntegrations = Array.isArray(integrationsRes.data?.data)
              ? integrationsRes.data.data
              : [];

            if (fetchedIntegrations.length > 0 || scopedIntegrations.length === 0) {
              scopedIntegrations = fetchedIntegrations;
            }
          } catch {
            // Public pages can still use any integrations already present in the slug payload.
          }
        }

        scopedIntegrations = scopedIntegrations.filter(
          (integration: WebsiteIntegration) =>
            integration &&
            integration.isActive &&
            String(integration.websiteId ?? websiteData.id ?? "") ===
              String(websiteData.id ?? integration.websiteId ?? ""),
        );

        websiteData.pages = sortedPages;
        const normalizedWebsiteData = {
          ...websiteData,
          pages: sortedPages,
          integrations: scopedIntegrations,
          frontendTemplateId:
            websiteData.frontendTemplateId ||
            inferredFrontendTemplateId ||
            getStoredWebsiteFrontendTemplateId(
              websiteData.id || websiteData.websiteId,
            ) ||
            null,
        };
        setWebsite(normalizedWebsiteData);

        // Find the current page based on path.
        // When accessed via /site/:slug/*, extract the sub-path after the slug
        // so it matches page.path (e.g. "/about"). For subdomain/custom domain
        // access (no slug in URL), location.pathname is used directly.
        let pagePath: string;
        if (slug && splatPath) {
          // /site/my-site/about → "/about"
          pagePath = `/${splatPath}`;
        } else if (slug) {
          // /site/my-site (no sub-path) → home page
          pagePath = "/";
        } else {
          // Subdomain or custom domain access — pathname is the page path directly
          pagePath = location.pathname === "/" ? "/" : location.pathname;
        }
        // Precedence: an exact real page always wins.
        let page = sortedPages.find((p) => p.path === pagePath);

        // Blog detail: a path under the blog-index page (e.g. /blog/:slug) with no exact
        // page renders a synthetic BLOG_ARTICLE page for that slug. The blog index is
        // identified by pageType, the /blog path, or containing a BLOG_FEED block.
        if (!page) {
          const blogIndex = sortedPages.find(
            (p) =>
              p.pageType === "BLOG_INDEX" ||
              p.path === "/blog" ||
              (Array.isArray(p.blocks) &&
                p.blocks.some((b: any) => b.blockType === "BLOG_FEED")),
          );
          if (blogIndex) {
            const indexPath = blogIndex.path || "/blog";
            const prefix = indexPath.endsWith("/")
              ? indexPath
              : `${indexPath}/`;
            if (pagePath.startsWith(prefix) && pagePath.length > prefix.length) {
              const postSlug = pagePath.slice(prefix.length).replace(/\/+$/, "");
              if (postSlug) {
                // Synthetic page — BlogArticleBlock resolves the post by postIdentifier
                // (not the website slug in the URL) and shows its own not-found state.
                page = {
                  id: -2,
                  title: "Blog",
                  path: pagePath,
                  isHome: false,
                  blocks: [
                    {
                      id: -1,
                      blockType: "BLOG_ARTICLE",
                      sortOrder: 0,
                      content: {
                        postIdentifier: decodeURIComponent(postSlug),
                        backButtonLink: indexPath,
                      },
                    },
                  ],
                };
              }
            }
          }
        }

        // If still no page, use home page.
        if (!page) {
          page = sortedPages.find((p) => p.isHome) || sortedPages[0];
        }

        const websiteFrontendTemplateId =
          normalizedWebsiteData.frontendTemplateId;

        if (
          !page &&
          websiteFrontendTemplateId &&
          hasFrontendTemplateBaseData(websiteFrontendTemplateId)
        ) {
          setCurrentPage({
            id: -1,
            title: "Home",
            path: "/",
            isHome: true,
            blocks: [],
          });
        } else {
          setCurrentPage(page || null);
        }
        setLoading(false);
      } catch (err: any) {
        // Log to the error boundary / monitoring layer rather than console
        // in production. console.error is silenced in prod builds.
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("[PublicWebsite] Error fetching website:", err);
        }
        setError(err.response?.data?.message || "Failed to load website");
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [slug, splatPath, location.pathname]);

  // ---------------------------------------------------------------------------
  // Step 12.1 — Font preset injection
  // Injects a Google Fonts <link> tag and a <style> block with CSS custom
  // properties whenever the website's fontPreset changes.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const presetKey = website?.fontPreset || "system";
    const preset = FONT_PRESETS_MAP[presetKey] ?? FONT_PRESETS_MAP.system;

    const LINK_ID = "tt-google-fonts-link";
    const STYLE_ID = "tt-font-preset-style";

    // Manage Google Fonts <link>
    let linkEl = document.getElementById(LINK_ID) as HTMLLinkElement | null;
    if (preset.googleFontsUrl) {
      if (!linkEl) {
        linkEl = document.createElement("link");
        linkEl.id = LINK_ID;
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
      }
      linkEl.href = preset.googleFontsUrl;
    } else {
      linkEl?.remove();
    }

    // Manage CSS custom properties <style>
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
:root {
  --font-heading: ${preset.headingFont};
  --font-body: ${preset.bodyFont};
}
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
body, p, span, div { font-family: var(--font-body); }
    `.trim();

    return () => {
      // Clean up when the component unmounts to avoid leaking styles
      document.getElementById(LINK_ID)?.remove();
      document.getElementById(STYLE_ID)?.remove();
    };
  }, [website?.fontPreset]);

  // ---------------------------------------------------------------------------
  // Step 12.2 — Heading letter-spacing and text-transform injection
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const STYLE_ID = "tt-heading-typography-style";

    // Map preset keys to CSS values
    const letterSpacingMap: Record<string, string> = {
      normal: "normal",
      wide: "0.05em",
      wider: "0.1em",
    };
    const textTransformMap: Record<string, string> = {
      none: "none",
      uppercase: "uppercase",
    };

    const spacingKey = website?.headingLetterSpacing || "normal";
    const transformKey = website?.headingTextTransform || "none";
    const letterSpacing = letterSpacingMap[spacingKey] ?? "normal";
    const textTransform = textTransformMap[transformKey] ?? "none";

    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
:root {
  --heading-letter-spacing: ${letterSpacing};
  --heading-text-transform: ${textTransform};
}
h1, h2, h3, h4, h5, h6 {
  letter-spacing: var(--heading-letter-spacing);
  text-transform: var(--heading-text-transform);
}
    `.trim();

    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, [website?.headingLetterSpacing, website?.headingTextTransform]);

  // Prepare SEO meta values (must be computed before early returns so the
  // blogPostingJsonLd useMemo below never violates React hooks ordering)
  const pageTitle = currentPage?.title || "Home";
  const baseMetaTitle =
    website?.metaTitle || `${pageTitle} - ${website?.name || ""}`;
  const baseMetaDescription =
    website?.metaDescription ||
    website?.shortDescription ||
    `${website?.name || ""} - ${website?.businessName || ""}`.trim();
  const siteUrl = window.location.origin + window.location.pathname;
  const baseOgImage = website?.logoUrl || "";

  // Blog article SEO overrides (set by BlogArticleBlock when it loads a post)
  const isBlogArticle = !!blogSeoData;
  const metaTitle = isBlogArticle
    ? blogSeoData!.title || baseMetaTitle
    : baseMetaTitle;
  const metaDescription = isBlogArticle
    ? blogSeoData!.description || baseMetaDescription
    : baseMetaDescription;
  const ogImage = isBlogArticle
    ? blogSeoData!.image || baseOgImage
    : baseOgImage;
  const canonicalUrl = isBlogArticle
    ? blogSeoData!.canonicalUrl || siteUrl
    : siteUrl;

  // Build schema.org BlogPosting JSON-LD when a blog article is present
  const blogPostingJsonLd = useMemo(() => {
    if (!isBlogArticle || !blogSeoData) return null;
    const data: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blogSeoData.title || metaTitle,
      description: blogSeoData.description || metaDescription,
      url: blogSeoData.canonicalUrl || siteUrl,
    };
    if (blogSeoData.image) data.image = blogSeoData.image;
    if (blogSeoData.publishedAt) data.datePublished = blogSeoData.publishedAt;
    if (blogSeoData.authorName) {
      data.author = { "@type": "Person", name: blogSeoData.authorName };
    }
    if (blogSeoData.keywords) data.keywords = blogSeoData.keywords;
    if (website?.name)
      data.publisher = { "@type": "Organization", name: website.name };
    // Escape </script to prevent injection
    return JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
  }, [
    isBlogArticle,
    blogSeoData,
    metaTitle,
    metaDescription,
    siteUrl,
    website?.name,
  ]);

  const persistedTemplatePages = useMemo<TemplateEditorPage[]>(() => {
    if (
      !website ||
      !resolvedFrontendTemplateId ||
      !supportsFrontendTemplateEditor(resolvedFrontendTemplateId)
    ) {
      return [];
    }

    const sourcePages = website.pages?.length
      ? website.pages
      : website.templateSnapshot?.pages || [];

    return sourcePages.map((page: any, pageIndex: number) => ({
      id: String(page.id ?? `page-${pageIndex}`),
      title: page.title || `Page ${pageIndex + 1}`,
      path: page.path || "/",
      isHome: !!page.isHome,
      sortOrder: page.sortOrder ?? pageIndex,
      isPublished: page.isPublished ?? true,
      blocks: Array.isArray(page.blocks)
        ? page.blocks.map((block: any, blockIndex: number) => ({
            id: String(
              block.id ?? `${page.id ?? pageIndex}-block-${blockIndex}`,
            ),
            blockType: block.blockType || block.type || "",
            content: block.content || {},
            sortOrder: block.sortOrder ?? blockIndex,
            isVisible: block.isVisible ?? true,
          }))
        : [],
    }));
  }, [website, resolvedFrontendTemplateId]);

  const frontendTemplateData = useMemo(() => {
    if (!resolvedFrontendTemplateId || !website) {
      return null;
    }

    if (
      supportsFrontendTemplateEditor(resolvedFrontendTemplateId) &&
      persistedTemplatePages.length > 0
    ) {
      return buildTemplatePreviewBusinessData(
        resolvedFrontendTemplateId,
        {
          id: website.id,
          name: website.name,
          businessName: website.businessName,
          primaryColor: website.primaryColor,
          secondaryColor: website.secondaryColor,
          themeSettings: website.templateSnapshot?.themeSettings,
          metaDescription: website.metaDescription,
          shortDescription: website.shortDescription,
          logoUrl: website.logoUrl,
          fullAddress: website.fullAddress,
          tags: website.tags as string[] | null | undefined,
        },
        persistedTemplatePages,
      );
    }

    return buildFrontendTemplateBusinessData(resolvedFrontendTemplateId, {
      websiteId: website.id,
      name: website.name,
      businessName: website.businessName,
      primaryColor: website.primaryColor,
      secondaryColor: website.secondaryColor,
      themeSettings: website.templateSnapshot?.themeSettings,
      metaDescription: website.metaDescription,
      shortDescription: website.shortDescription,
      logoUrl: website.logoUrl,
      fullAddress: website.fullAddress,
      tags: website.tags as string[] | null | undefined,
      pages: website.pages?.map((page) => ({
        id: page.id,
        title: page.title,
        path: page.path,
        isHome: page.isHome,
        isPublished: page.isPublished,
      })),
    });
  }, [website, persistedTemplatePages, resolvedFrontendTemplateId]);

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

  if (
    resolvedFrontendTemplateId &&
    hasFrontendTemplateBaseData(resolvedFrontendTemplateId) &&
    frontendTemplateData &&
    currentPage?.isHome
  ) {
    // Only the Home page renders the single-page frontend template. Additional
    // pages fall through to the shared block layout below (shared nav header +
    // their own blocks + footer) so they never inherit the Home page body.
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
          {website.faviconUrl && <link rel="icon" href={website.faviconUrl} />}
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:url" content={canonicalUrl} />
          {ogImage && <meta property="og:image" content={ogImage} />}
          <meta property="og:site_name" content={website.name} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaTitle} />
          <meta name="twitter:description" content={metaDescription} />
          {ogImage && <meta name="twitter:image" content={ogImage} />}
        </Helmet>
        <PublicWebsiteIntegrations
          websiteId={website.id}
          integrations={website.integrations}
        />
        <TemplateEngine
          templateId={resolvedFrontendTemplateId}
          data={frontendTemplateData}
        />
      </Box>
    );
  }

  const hasWebsiteHeader = currentPage?.blocks?.some(
    (b: any) =>
      b.blockType === "WEBSITE_HEADER" ||
      (b.blockType === "NAVBAR" && b.content?._subType === "website_header"),
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <DynamicBlockProvider>
        <BlogArticleSeoContext.Provider value={blogArticleSeoContextValue}>
          <PublicWebsiteIntegrations
            websiteId={website.id}
            integrations={website.integrations}
          />
          {/* SEO Meta Tags */}
          <Helmet>
            {/* Basic Meta Tags */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            {isBlogArticle && blogSeoData?.keywords && (
              <meta name="keywords" content={blogSeoData.keywords} />
            )}

            {/* Favicon */}
            {website.faviconUrl && (
              <link rel="icon" href={website.faviconUrl} />
            )}

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph Tags for Social Sharing */}
            <meta
              property="og:type"
              content={isBlogArticle ? "article" : "website"}
            />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={canonicalUrl} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            <meta property="og:site_name" content={website.name} />

            {/* Article-specific Open Graph tags */}
            {isBlogArticle && blogSeoData?.publishedAt && (
              <meta
                property="article:published_time"
                content={blogSeoData.publishedAt}
              />
            )}
            {isBlogArticle && blogSeoData?.authorName && (
              <meta
                property="article:author"
                content={blogSeoData.authorName}
              />
            )}

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* Schema.org BlogPosting JSON-LD */}
            {blogPostingJsonLd && (
              <script type="application/ld+json">{blogPostingJsonLd}</script>
            )}

            {/* Keep unpublished/preview posts out of search indexes */}
            {isBlogArticle && blogSeoData?.noindex && (
              <meta name="robots" content="noindex, nofollow" />
            )}
          </Helmet>

          {/* Navigation Bar — hidden when page has a WEBSITE_HEADER block */}
          {!hasWebsiteHeader && (
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
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexGrow: 1,
                    gap: 2,
                  }}
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
          )}

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
                  <DynamicBlockRenderer
                    block={block}
                    primaryColor={website.primaryColor || "#378C92"} // Techietribe teal
                    secondaryColor={website.secondaryColor || "#D3EB63"} // Techietribe lime accent
                    headingColor={website.headingTextColor || "#252525"} // Techietribe dark text
                    bodyColor={website.bodyTextColor || "#6A6F78"} // Techietribe gray text
                    websiteId={website.id}
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
        </BlogArticleSeoContext.Provider>
      </DynamicBlockProvider>
    </Box>
  );
};

export default PublicWebsite;
