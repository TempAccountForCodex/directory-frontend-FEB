/**
 * BlogArticleBlock — BLOG_ARTICLE
 *
 * Full blog-post detail view, visually mirroring the public /blogdetail
 * (InsightsDetailsNew) design: full-bleed dark hero header (breadcrumb, category
 * badge, read time, title, author, tags + share), a two-column body with a
 * sticky sidebar (scroll-spy Table of Contents + Author Bio + Related Articles),
 * styled section/quote/keyTakeaway/code blocks, a "You might also like" grid,
 * and article footer actions (share, copy link, helpful vote).
 *
 * All accent colors derive from the website's theme `primaryColor`, so the block
 * behaves identically on any template. Data, SEO and comments plumbing is
 * unchanged — the post is fetched website-scoped and normalized to the shared
 * insights model (blocks[] + format{}) so the renderer is source-agnostic.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
  createContext,
} from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Divider, Skeleton, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
import ThumbUpOffAltOutlinedIcon from "@mui/icons-material/ThumbUpOffAltOutlined";
import XIcon from "@mui/icons-material/X";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DOMPurify from "dompurify";
import useTenantUrl from "../../../hooks/useTenantUrl";
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";
import type { BlogPost } from "./BlogCard";
import BlogComments from "./BlogComments";
import { normalizeInsight } from "../../../utils/insightsNormalizer";
import { API_URL } from "@/config/api";
import {
  blogStaticProps,
  blogHeroFont,
  hexToRgba,
  normalizeHex,
  resolveBlogHeroGlow,
  resolveBlogImage,
} from "./blogSectionShared";

/* ===================== SEO Context ===================== */

export interface BlogArticleSeoData {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  publishedAt?: string;
  authorName?: string;
  canonicalUrl?: string;
  category?: string;
  slug?: string;
  noindex?: boolean;
}

export interface BlogArticleSeoContextType {
  seoData: BlogArticleSeoData | null;
  setSeoData: (data: BlogArticleSeoData | null) => void;
}

export const BlogArticleSeoContext =
  createContext<BlogArticleSeoContextType | null>(null);

/* ===================== Types ===================== */

interface ArticleHeading {
  heading: string;
  description?: string[];
}

interface InsightBlock {
  id?: string;
  type: "section" | "quote" | "keyTakeaway" | "conclusion" | "code";
  anchorId?: string;
  heading?: string;
  paragraphs?: string[];
  text?: string;
  attribution?: string | null;
  title?: string;
  language?: string;
  code?: string;
}

interface ArticleFormat {
  version?: number;
  readTimeMinutes?: number;
  excerpt?: string;
  tags?: string[];
}

interface ArticlePost {
  id: number | string;
  title: string;
  slug: string;
  image?: string | null;
  category?: string | null;
  description?: string | null;
  content?: string | null;
  headings?: ArticleHeading[];
  blocks?: InsightBlock[];
  format?: ArticleFormat;
  author?: {
    id?: number | string;
    name?: string;
    displayName?: string;
    avatar?: string;
    bio?: string;
    role?: string;
  } | null;
  authorName?: string | null;
  authorRole?: string | null;
  authorBio?: string | null;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
}

interface Block {
  id: number;
  blockType: string;
  content: BlogArticleContent;
  sortOrder: number;
}

interface BlogArticleContent {
  postIdentifier?: string;
  showRelated?: boolean;
  showTableOfContents?: boolean;
  backButtonLink?: string;
  post?: ArticlePost;
  relatedPosts?: BlogPost[];
}

interface BlogArticleBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
  websiteId?: string | number;
}

/* ===================== Constants ===================== */

const WORDS_PER_MINUTE = 200;
const FADE_IN_CLASS = "blog-article-fade-in";
const HELPFUL_STORAGE_KEY = "website-blog-helpful-votes";
const star = "/assets/publicAssets/images/common/star.svg";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80";

/**
 * A fully-structured sample article used as the editor/template preview when the
 * site has no published posts yet — so every element (hero, sections, quote, key
 * takeaway, sidebar, related) is present and stylable in the editor.
 */
const PLACEHOLDER_POST: ArticlePost = {
  id: "preview",
  title: "Your article title will appear here",
  slug: "preview-article",
  category: "Category",
  image: PLACEHOLDER_IMAGE,
  description:
    "This is a live preview of how your published articles will look. Publish a post and it appears here automatically — the content comes from your posts; here you only style the layout.",
  publishedAt: new Date().toISOString(),
  author: {
    name: "Author name",
    role: "Editorial",
    bio: "A short author biography shows here, pulled from the post's author. Style this panel however you like.",
  },
  format: {
    readTimeMinutes: 5,
    excerpt:
      "This is a live preview of how your published articles will look on this template.",
    tags: ["Preview", "Sample", "Template"],
  },
  blocks: [
    {
      id: "s1",
      type: "section",
      anchorId: "section-one",
      heading: "A section heading",
      paragraphs: [
        "Body paragraphs render here with the typography and colors you choose. Select any element in the editor to change its size, color, spacing, or alignment.",
        "Each published article fills this layout with its own content, while the styling you set here applies to every article.",
      ],
    },
    {
      id: "q1",
      type: "quote",
      text: "A pull-quote from the article renders in this styled panel.",
      attribution: "Attribution",
    },
    {
      id: "k1",
      type: "keyTakeaway",
      title: "Key Takeaway",
      text: "Highlighted takeaways appear in this accented callout box.",
    },
    {
      id: "s2",
      type: "conclusion",
      anchorId: "conclusion",
      heading: "Conclusion",
      paragraphs: [
        "The closing section wraps up the article. Everything you see is stylable per element.",
      ],
    },
  ],
};

/* ===================== Helpers ===================== */

function safeUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("javascript:")) return fallback;
  return url;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

const slugify = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const hasRichArticleBody = (post?: ArticlePost | null) =>
  Boolean(
    post &&
      ((Array.isArray(post.blocks) && post.blocks.length > 0) ||
        (Array.isArray(post.headings) && post.headings.length > 0)),
  );

const stripHeadingNumber = (text = "") =>
  String(text).replace(/^\s*\d+\.\s+/, "");

function formatAuthorRole(
  role: string | null | undefined,
  category: string | null | undefined,
): string {
  const rawRole = String(role || "").trim();
  if (!rawRole || /^[A-Z_]+$/.test(rawRole)) {
    return `${category || "Editorial"} Team`;
  }
  return rawRole;
}

function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

function calcReadingTime(
  headings: ArticleHeading[] | undefined,
  description: string | null | undefined,
): number {
  let wordCount = 0;
  if (Array.isArray(headings)) {
    for (const h of headings) {
      if (h.heading)
        wordCount += h.heading.trim().split(/\s+/).filter(Boolean).length;
      if (Array.isArray(h.description))
        for (const d of h.description)
          if (d) wordCount += d.trim().split(/\s+/).filter(Boolean).length;
    }
  }
  if (description)
    wordCount += description.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / WORDS_PER_MINUTE) || 1;
}

/* ===================== Main Component ===================== */

const BlogArticleBlockBase: React.FC<BlogArticleBlockProps> = ({
  block,
  primaryColor = "#378C92",
  headingColor = "#16283a",
  bodyColor = "#27435e",
  onCtaClick,
  websiteId,
}) => {
  const { content } = block;
  const navigate = useNavigate();
  const { buildUrl } = useTenantUrl();
  const seoContext = useContext(BlogArticleSeoContext);

  const {
    postIdentifier: configPostIdentifier = "",
    showRelated = true,
    showTableOfContents = true,
    backButtonLink = "/blog",
  } = content;

  /* ---- Theme-derived palette (all accents follow website primaryColor) ---- */
  const accent = normalizeHex(primaryColor) || "#378C92";
  const heroGlow = useMemo(() => resolveBlogHeroGlow(accent), [accent]);
  const ui = useMemo(
    () => ({
      accent,
      mutedText: "#5e7a93",
      panelBg: alpha("#ffffff", 0.95),
      panelBorder: "rgba(215,226,236,1)",
      divider: hexToRgba(accent, 0.26),
      headingText: headingColor || "#16283a",
      bodyText: bodyColor || "#27435e",
      quoteText: "#1f3042",
      avatarBg: hexToRgba(accent, 0.1),
      avatarIcon: "#466884",
      badgeBg: accent,
      badgeText: "#ffffff",
      chipText: "#355670",
      chipBorder: hexToRgba(accent, 0.34),
      iconBtnBorder: hexToRgba(accent, 0.34),
      iconBtnText: "#3f5f78",
      stickyInactive: "#5b7995",
      keyTakeawayBorder: hexToRgba(accent, 0.52),
      keyTakeawayBg: hexToRgba(accent, 0.1),
      caption: "#5e7a93",
    }),
    [accent, headingColor, bodyColor],
  );

  const subtleTextSx = useMemo(
    () => ({ fontFamily: blogHeroFont, color: ui.mutedText }),
    [ui.mutedText],
  );
  const panelSx = useMemo(
    () => ({
      borderRadius: "14px",
      border: `1px solid ${ui.panelBorder}`,
      background: ui.panelBg,
    }),
    [ui.panelBg, ui.panelBorder],
  );
  const badgeSx = useMemo(
    () => ({
      display: "inline-flex",
      px: 1.3,
      py: 0.45,
      borderRadius: "8px",
      fontSize: "0.78rem",
      fontFamily: blogHeroFont,
      backgroundColor: ui.badgeBg,
      color: ui.badgeText,
      fontWeight: 600,
      letterSpacing: 1.5,
    }),
    [ui.badgeBg, ui.badgeText],
  );
  const chipSx = useMemo(
    () => ({
      borderRadius: "999px",
      px: 1.05,
      py: 0.45,
      fontFamily: blogHeroFont,
      fontSize: "0.82rem",
      border: `1px solid ${ui.chipBorder}`,
      color: ui.chipText,
    }),
    [ui.chipBorder, ui.chipText],
  );
  const iconBtnSx = useMemo(
    () => ({
      width: 34,
      height: 34,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: `1px solid ${ui.iconBtnBorder}`,
      color: ui.iconBtnText,
    }),
    [ui.iconBtnBorder, ui.iconBtnText],
  );

  /* ---- Post identifier. The public detail page always sets `postIdentifier`
     (PublicWebsite injects the visited slug); when it's absent the block is in
     template mode (the editor Blog-Detail page) and previews the latest post.
     URL params are intentionally not used — on tenant routes they carry the
     website slug/id, not the post's. ---- */
  const resolvedIdentifier = configPostIdentifier || "";

  /* ---- Template mode: no specific article (editor/Blog-Detail page) ---- */
  const isTemplateMode = !resolvedIdentifier;

  /* ---- Fetch article data. With a slug → that article; without one (template
     mode) → the latest published post as a live preview to style against. ---- */
  const dataSource = useMemo(() => {
    if (resolvedIdentifier)
      return `blog-article?identifier=${encodeURIComponent(resolvedIdentifier)}`;
    return `blog?page=1&limit=1&sortBy=publishedAt&sortOrder=desc`;
  }, [resolvedIdentifier]);

  const { data, loading } = useDynamicBlockData(
    block.id,
    block.blockType,
    dataSource,
    { websiteId },
  );

  const fetchedPost: ArticlePost | null = useMemo(() => {
    if (data?.blog) return data.blog as ArticlePost;
    if (data?.post) return data.post as ArticlePost;
    if (Array.isArray(data?.blogs) && data.blogs.length)
      return data.blogs[0] as ArticlePost;
    if (Array.isArray(data?.insights) && data.insights.length)
      return data.insights[0] as ArticlePost;
    if (content.post) return content.post as ArticlePost;
    return null;
  }, [data, content.post]);

  const [templateDetailPost, setTemplateDetailPost] =
    useState<ArticlePost | null>(null);

  useEffect(() => {
    if (!isTemplateMode || !fetchedPost?.slug || hasRichArticleBody(fetchedPost)) {
      setTemplateDetailPost(null);
      return undefined;
    }

    let cancelled = false;
    const url = websiteId
      ? `${API_URL}/websites/${websiteId}/blogs/public/${encodeURIComponent(
          fetchedPost.slug,
        )}`
      : `${API_URL}/blogs/public/${encodeURIComponent(fetchedPost.slug)}`;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        const detail = json.blog || json.post || json.data || null;
        if (!cancelled && detail) {
          setTemplateDetailPost(detail as ArticlePost);
        }
      } catch {
        if (!cancelled) setTemplateDetailPost(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchedPost, isTemplateMode, websiteId]);

  /* In template mode with no posts yet, fall back to a structured placeholder so
     every element stays present and stylable in the editor. */
  const post: ArticlePost | null = useMemo(() => {
    if (templateDetailPost) return templateDetailPost;
    if (fetchedPost) return fetchedPost;
    if (isTemplateMode && !loading) return PLACEHOLDER_POST;
    return null;
  }, [fetchedPost, isTemplateMode, loading, templateDetailPost]);

  const normalized = useMemo(
    () => (post ? (normalizeInsight(post) as ArticlePost) : null),
    [post],
  );

  const blocks: InsightBlock[] = useMemo(
    () => (Array.isArray(normalized?.blocks) ? normalized!.blocks : []),
    [normalized],
  );

  const readingTime = useMemo(() => {
    if (normalized?.format?.readTimeMinutes)
      return normalized.format.readTimeMinutes;
    if (!post) return 1;
    return calcReadingTime(post.headings, post.description);
  }, [normalized, post]);

  const tags = useMemo(
    () => (Array.isArray(normalized?.format?.tags) ? normalized!.format!.tags! : []),
    [normalized],
  );

  const authorName = useMemo(
    () =>
      normalized?.author?.displayName ||
      normalized?.author?.name ||
      normalized?.authorName ||
      `${normalized?.category || "Editorial"} Team`,
    [normalized],
  );
  const authorRole = useMemo(
    () =>
      formatAuthorRole(
        normalized?.authorRole || normalized?.author?.role,
        normalized?.category,
      ),
    [normalized],
  );
  const authorBio = useMemo(
    () =>
      normalized?.author?.bio ||
      normalized?.authorBio ||
      normalized?.description ||
      normalized?.content ||
      "",
    [normalized],
  );
  const leadText = useMemo(() => {
    const text =
      normalized?.format?.excerpt ||
      normalized?.description ||
      normalized?.content ||
      "";
    return text.length > 350 ? `${text.slice(0, 350).trim()}...` : text;
  }, [normalized]);
  const captionText = useMemo(
    () => normalized?.content || leadText,
    [normalized, leadText],
  );

  /* ---- TOC sections (heading-bearing blocks) ---- */
  const tocSections = useMemo(
    () =>
      blocks
        .filter((b) => b.type === "section" || b.type === "conclusion")
        .map((b) => ({
          id: b.anchorId || slugify(b.heading || ""),
          heading: stripHeadingNumber(sanitizeText(b.heading || "")),
        })),
    [blocks],
  );

  const [activeSection, setActiveSection] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [helpfulVote, setHelpfulVote] = useState("");
  const articleRootRef = useRef<HTMLElement | null>(null);
  const tocScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveSection(tocSections[0]?.id || "");
  }, [tocSections]);

  useEffect(() => {
    if (!copiedLink) return undefined;
    const id = window.setTimeout(() => setCopiedLink(false), 1800);
    return () => window.clearTimeout(id);
  }, [copiedLink]);

  /* ---- Related posts (fetch enough for sidebar + recommendations) ---- */
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const relatedFetchedRef = useRef<string>("");
  useEffect(() => {
    if (!showRelated || !post) return;
    const bundled = data?.relatedPosts ?? content.relatedPosts;
    if (Array.isArray(bundled)) {
      setRelatedPosts(
        bundled
          .filter(
            (p: BlogPost) =>
              String(p.id) !== String(post.id) && p.slug !== post.slug,
          )
          .slice(0, 6),
      );
      return;
    }
    if (!post.category) return;
    const fetchKey = `${websiteId}:${post.category}`;
    if (relatedFetchedRef.current === fetchKey) return;
    relatedFetchedRef.current = fetchKey;

    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          category: post.category!,
          limit: "7",
        });
        const url = websiteId
          ? `${API_URL}/websites/${websiteId}/blogs/public?${params.toString()}`
          : `${API_URL}/insights/public?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        const rows = json.blogs ?? json.insights;
        if (!cancelled && Array.isArray(rows)) {
          setRelatedPosts(
            rows
              .filter(
                (p: BlogPost) =>
                  String(p.id) !== String(post.id) && p.slug !== post.slug,
              )
              .slice(0, 6),
          );
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data?.relatedPosts, content.relatedPosts, post, showRelated, websiteId]);

  const sidebarArticles = relatedPosts.slice(0, 3);
  const recommendationArticles = relatedPosts.slice(3, 6);

  /* ---- SEO (real posts only — never the placeholder preview) ---- */
  useEffect(() => {
    if (!seoContext || !fetchedPost) return;
    const post = fetchedPost;
    seoContext.setSeoData({
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.description || undefined,
      image: post.image || undefined,
      keywords: post.keywords || undefined,
      publishedAt: post.publishedAt || undefined,
      authorName: post.author?.displayName || post.author?.name,
      canonicalUrl: post.canonicalUrl || undefined,
      category: post.category || undefined,
      slug: post.slug,
      noindex: post.noindex || undefined,
    });
    return () => seoContext.setSeoData(null);
  }, [fetchedPost, seoContext]);

  /* ---- Scroll-spy for the sticky TOC ---- */
  useEffect(() => {
    if (!tocSections.length || typeof window === "undefined") return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const activeLine = Math.max(140, window.innerHeight * 0.5);
      const scrollBottom = window.innerHeight + window.scrollY;
      const nearBottom =
        scrollBottom >= document.documentElement.scrollHeight - 4;
      let current = tocSections[0]?.id || "";
      for (const section of tocSections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - activeLine <= 0) current = section.id;
        else break;
      }
      if (nearBottom) current = tocSections[tocSections.length - 1].id;
      setActiveSection(current);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [tocSections]);

  /* ---- Keep the active TOC item scrolled into view ---- */
  useEffect(() => {
    const container = tocScrollRef.current;
    if (!activeSection || !container) return;
    const item = container.querySelector<HTMLElement>(
      `[data-toc-section="${activeSection}"]`,
    );
    if (!item) return;
    const target =
      item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2;
    const max = container.scrollHeight - container.clientHeight;
    container.scrollTo({
      top: Math.max(0, Math.min(target, max)),
      behavior: "smooth",
    });
  }, [activeSection]);

  /* ---- Fade-in-on-view ---- */
  useEffect(() => {
    const root = articleRootRef.current;
    const ownerWindow = root?.ownerDocument?.defaultView;
    if (!root || !ownerWindow) return undefined;
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(`.${FADE_IN_CLASS}`),
    );
    if (!nodes.length) return undefined;
    const observer = new ownerWindow.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px 32% 0px" },
    );
    nodes.forEach((node, index) => {
      node.style.setProperty("--fade-delay", `${Math.min((index % 6) * 24, 120)}ms`);
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, [blocks, normalized?.id, loading]);

  /* ---- Helpful votes (localStorage) ---- */
  useEffect(() => {
    if (typeof window === "undefined" || !post) return;
    try {
      const raw = window.localStorage.getItem(HELPFUL_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      setHelpfulVote(parsed[String(post.id)] || "");
    } catch {
      setHelpfulVote("");
    }
  }, [post]);

  const handleHelpfulVote = useCallback(
    (vote: string) => {
      setHelpfulVote(vote);
      if (typeof window === "undefined" || !post) return;
      try {
        const raw = window.localStorage.getItem(HELPFUL_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed[String(post.id)] = vote;
        window.localStorage.setItem(HELPFUL_STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        /* ignore */
      }
    },
    [post],
  );

  /* ---- Navigation + share ---- */
  const goToBlog = useCallback(() => {
    if (onCtaClick) onCtaClick(block.blockType, "Back to Blog");
    const link = safeUrl(backButtonLink, "/blog");
    if (link.startsWith("http")) window.location.href = link;
    else navigate(buildUrl(link));
  }, [onCtaClick, block.blockType, backButtonLink, navigate, buildUrl]);

  const openArticle = useCallback(
    (article: BlogPost) => {
      navigate(buildUrl(`/blog/${encodeURIComponent(article.slug)}`));
    },
    [navigate, buildUrl],
  );

  const pageUrl =
    typeof window !== "undefined" ? window.location.href : "";
  const shareText = useMemo(() => {
    if (!post) return "";
    const summary = post.description || "";
    const trimmed =
      summary.length > 140 ? `${summary.slice(0, 140).trim()}...` : summary;
    return trimmed ? `${post.title} - ${trimmed}` : post.title;
  }, [post]);

  const openShareWindow = (url: string) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer,width=640,height=680");
  };
  const handleShareX = () =>
    openShareWindow(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`,
    );
  const handleShareLinkedIn = () =>
    openShareWindow(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
    );
  const handleCopyLink = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl);
        setCopiedLink(true);
        return;
      }
      window.prompt("Copy this link:", pageUrl);
    } catch {
      window.prompt("Copy this link:", pageUrl);
    }
  }, [pageUrl]);
  const handleNativeShare = useCallback(async () => {
    if (typeof window === "undefined" || !post) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: shareText, url: pageUrl });
        return;
      } catch {
        /* fall through */
      }
    }
    await handleCopyLink();
  }, [post, shareText, pageUrl, handleCopyLink]);

  const onTocClick = (id: string) => {
    const ownerDocument = articleRootRef.current?.ownerDocument || document;
    const el = ownerDocument.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isLoading = loading && !post;

  /* ---- Not found ---- */
  if (!isLoading && !post) {
    return (
      <Box sx={{ py: 10, textAlign: "center", fontFamily: blogHeroFont }}>
        <Typography variant="h6" sx={{ color: ui.mutedText }}>
          {resolvedIdentifier ? "Article not found." : "No article selected."}
        </Typography>
        <Box
          onClick={goToBlog}
          sx={{
            mt: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.7,
            color: accent,
            cursor: "pointer",
          }}
        >
          <span>Back to Blog</span>
          <ArrowForwardIcon sx={{ fontSize: "1rem" }} />
        </Box>
      </Box>
    );
  }

  const shareBtnHover = {
    "&:hover": {
      color: accent,
      borderColor: hexToRgba(accent, 0.52),
      backgroundColor: hexToRgba(accent, 0.12),
    },
  };

  const renderShareRow = (variant: "hero" | "footer") => {
    const base =
      variant === "hero"
        ? {
            border: `1px solid ${hexToRgba(accent, 0.3)}`,
            color: hexToRgba(accent, 0.85),
          }
        : {};
    return (
      <>
        <Box
          {...blogStaticProps(block.id, `article-${variant}-share-x`, "Share X button", "icon")}
          onClick={handleShareX}
          role="button"
          aria-label="Share on X"
          sx={{ ...iconBtnSx, ...base, cursor: "pointer", transition: "all .2s ease", ...shareBtnHover }}
        >
          <XIcon sx={{ fontSize: "1rem" }} />
        </Box>
        <Box
          {...blogStaticProps(block.id, `article-${variant}-share-linkedin`, "Share LinkedIn button", "icon")}
          onClick={handleShareLinkedIn}
          role="button"
          aria-label="Share on LinkedIn"
          sx={{ ...iconBtnSx, ...base, cursor: "pointer", transition: "all .2s ease", ...shareBtnHover }}
        >
          <LinkedInIcon sx={{ fontSize: "1rem" }} />
        </Box>
        <Box
          {...blogStaticProps(block.id, `article-${variant}-copy-link`, "Copy link button", "icon")}
          onClick={handleCopyLink}
          role="button"
          aria-label="Copy article link"
          sx={{
            ...iconBtnSx,
            ...base,
            position: "relative",
            cursor: "pointer",
            transition: "all .2s ease",
            ...shareBtnHover,
            "&:hover .copy-link-icon": { transform: "rotate(-45deg)" },
          }}
        >
          {copiedLink && (
            <Box
              sx={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                px: 1,
                py: 0.45,
                borderRadius: "999px",
                backgroundColor: "rgba(8, 22, 34, 0.92)",
                color: "#e9f7ff",
                fontFamily: blogHeroFont,
                fontSize: "0.72rem",
                lineHeight: 1,
                whiteSpace: "nowrap",
                border: `1px solid ${hexToRgba(accent, 0.28)}`,
                pointerEvents: "none",
              }}
            >
              Link copied
            </Box>
          )}
          {copiedLink ? (
            <CheckOutlinedIcon sx={{ fontSize: "1rem" }} />
          ) : (
            <LinkOutlinedIcon
              className="copy-link-icon"
              sx={{ fontSize: "1rem", transition: "transform 0.2s ease" }}
            />
          )}
        </Box>
        {variant === "footer" && (
          <Box
            {...blogStaticProps(block.id, "article-footer-native-share", "Native share button", "icon")}
            onClick={handleNativeShare}
            role="button"
            aria-label="Share article"
            sx={{ ...iconBtnSx, cursor: "pointer", transition: "all .2s ease", ...shareBtnHover }}
          >
            <ShareOutlinedIcon sx={{ fontSize: "1rem" }} />
          </Box>
        )}
      </>
    );
  };

  return (
    <Box
      {...blogStaticProps(block.id, "blog-article-root", "Blog article", "container")}
      ref={articleRootRef}
      component="main"
      className="website-blog-article"
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "visible",
        px: { xs: 2, sm: 3, md: 4, lg: 14, xl: 18 },
        color: ui.headingText,
        fontFamily: blogHeroFont,
        "& .MuiTypography-root": { fontFamily: blogHeroFont },
        [`& .${FADE_IN_CLASS}`]: {
          opacity: 0,
          transform: "translateY(12px)",
          transition: "opacity 420ms ease, transform 420ms ease",
          transitionDelay: "var(--fade-delay, 0ms)",
          willChange: "opacity, transform",
        },
        [`& .${FADE_IN_CLASS}.in-view`]: {
          opacity: 1,
          transform: "translateY(0)",
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 3 }}>
        <Box sx={{ mx: "auto" }}>
          {/* ---------- Full-bleed dark hero ---------- */}
          <Box
            {...blogStaticProps(block.id, "article-hero", "Article hero", "container")}
            className={FADE_IN_CLASS}
            sx={{
              borderRadius: 0,
              border: "1px solid rgba(255,255,255,0.12)",
              width: "100vw",
              ml: "calc(50% - 50vw)",
              mr: "calc(50% - 50vw)",
              px: { xs: 2, sm: 3, md: 5, lg: 20, xl: 24 },
              pt: { xs: 13, sm: 14, md: 15 },
              pb: { xs: 3.2, md: 4.2 },
              mb: { xs: 3, md: 3.8 },
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 18px 34px rgba(2,12,21,0.24)",
              bgcolor: "#020303",
              backgroundImage: `
                radial-gradient(circle at 20% 30%, ${heroGlow.primary} 0%, rgba(2,3,3,0) 45%),
                radial-gradient(circle at 80% 70%, ${heroGlow.highlight} 0%, rgba(2,3,3,0) 42%),
                url(${star})
              `,
              backgroundSize: "cover",
              backgroundPosition: "center",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                zIndex: 1,
              },
            }}
          >
            {/* Breadcrumb */}
            <Box
              {...blogStaticProps(block.id, "article-breadcrumb", "Article breadcrumb")}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                color: "rgba(232,242,247,0.82)",
                fontSize: { xs: "0.9rem", md: "0.98rem" },
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box component="span" sx={{ cursor: "pointer" }} onClick={goToBlog}>
                Blog
              </Box>
              <ChevronRightOutlinedIcon sx={{ fontSize: "1rem" }} />
              {isLoading ? (
                <Skeleton variant="text" width={96} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
              ) : (
                <span>{sanitizeText(post!.category || "")}</span>
              )}
            </Box>

            {/* Meta */}
            <Box sx={{ mt: 2.6, display: "flex", alignItems: "center", gap: 1.2, position: "relative", zIndex: 1 }}>
              {isLoading ? (
                <>
                  <Skeleton variant="rounded" width={110} height={28} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
                  <Skeleton variant="text" width={92} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
                </>
              ) : (
                <>
                  {post!.category && (
                    <Typography
                      {...blogStaticProps(block.id, "article-category", "Article category")}
                      sx={badgeSx}
                    >
                      {sanitizeText(post!.category)}
                    </Typography>
                  )}
                  <Box
                    {...blogStaticProps(block.id, "article-read-time", "Article read time")}
                    sx={{ display: "flex", alignItems: "center", gap: 0.7, color: "rgba(232,242,247,0.82)" }}
                  >
                    <AccessTimeOutlinedIcon sx={{ fontSize: "1rem" }} />
                    <span>{readingTime} min read</span>
                  </Box>
                </>
              )}
            </Box>

            {/* Title */}
            <Typography
              {...blogStaticProps(block.id, "article-title", "Article title")}
              sx={{
                mt: 2,
                maxWidth: "1280px",
                fontWeight: 800,
                color: "#ffffff",
                fontSize: { xs: "1.95rem", sm: "2.45rem", md: "3.2rem", lg: "4rem" },
                lineHeight: { xs: 1.14, md: 1.1, lg: 1.08 },
                letterSpacing: { xs: "-0.25px", md: "-0.55px", lg: "-0.9px" },
                position: "relative",
                zIndex: 1,
              }}
            >
              {isLoading ? (
                <>
                  <Skeleton variant="text" width="82%" sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
                  <Skeleton variant="text" width="58%" sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
                </>
              ) : (
                sanitizeText(post!.title)
              )}
            </Typography>

            <Divider sx={{ my: { xs: 2.6, md: 3.2 }, borderColor: "rgba(255,255,255,0.14)", position: "relative", zIndex: 1 }} />

            {/* Author + date */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, position: "relative", zIndex: 1 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  backgroundColor: hexToRgba(accent, 0.18),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${hexToRgba(accent, 0.25)}`,
                }}
              >
                <PersonOutlineOutlinedIcon sx={{ color: "#ffffff", fontSize: "1.2rem" }} />
              </Box>
              <Box>
                <Typography
                  {...blogStaticProps(block.id, "article-author-name", "Article author name")}
                  sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#ffffff" }}
                >
                  {isLoading ? (
                    <Skeleton variant="text" width={160} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
                  ) : (
                    authorName
                  )}
                </Typography>
                <Box
                  {...blogStaticProps(block.id, "article-date", "Article date")}
                  sx={{ display: "flex", alignItems: "center", gap: 0.7, color: "rgba(232,242,247,0.82)" }}
                >
                  <CalendarTodayOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                  {isLoading ? (
                    <Skeleton variant="text" width={132} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
                  ) : (
                    <span>{formatDate(post!.publishedAt)}</span>
                  )}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2.4, borderColor: "rgba(255,255,255,0.14)", position: "relative", zIndex: 1 }} />

            {/* Tags + share */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: { xs: 1.2, md: 2 },
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.1 }}>
                {tags.map((tag) => (
                  <Box
                    key={tag}
                    {...blogStaticProps(block.id, `article-tag-${slugify(tag)}`, "Article tag")}
                    sx={{
                      ...chipSx,
                      border: `1px solid ${hexToRgba(accent, 0.35)}`,
                      color: hexToRgba(accent, 0.85),
                    }}
                  >
                    {tag}
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography
                  {...blogStaticProps(block.id, "article-share-label", "Article share label")}
                  sx={{ color: "rgba(232,242,247,0.82)" }}
                >
                  Share:
                </Typography>
                {renderShareRow("hero")}
              </Box>
            </Box>
          </Box>

          {/* ---------- Main content ---------- */}
          <Box
            sx={{
              mt: { xs: 2, md: 2.4 },
              pb: { xs: 6, sm: 7, md: 10, lg: 15 },
              borderRadius: { xs: 0, md: "16px" },
              position: "relative",
              isolation: "isolate",
              overflow: "visible",
              backgroundColor: "#f7f5f3",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "calc(50% - 50vw)",
                right: "calc(50% - 50vw)",
                backgroundColor: "#f7f5f3",
                backgroundImage: "url('/assets/images/insights/bg-1.webp')",
                backgroundPosition: "left top",
                backgroundRepeat: "repeat",
                backgroundSize: "auto",
                zIndex: 0,
                pointerEvents: "none",
              },
              "& > *": { position: "relative", zIndex: 1 },
            }}
          >
            {/* Content grid */}
            <Box
              className={FADE_IN_CLASS}
              sx={{
                mt: { xs: 4, md: 5.5 },
                maxWidth: "1300px",
                mx: "auto",
                display: "grid",
                gap: { xs: 2.4, sm: 2.8, md: 3.4, lg: 4 },
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 330px" },
                alignItems: "start",
              }}
            >
              {/* Main article column */}
              <Box>
                {isLoading ? (
                  <>
                    <Skeleton variant="rectangular" sx={{ width: "100%", height: { xs: 230, md: 420, lg: 520 }, borderRadius: "16px", mb: 1.5 }} />
                    <Skeleton variant="text" width="64%" sx={{ mx: "auto", mb: { xs: 4, md: 5.8 } }} />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Box key={i} sx={{ mb: 5.8 }}>
                        <Skeleton variant="text" width={i % 2 === 0 ? "72%" : "58%"} height={56} />
                        <Skeleton variant="text" width="100%" height={24} />
                        <Skeleton variant="text" width="96%" height={24} />
                        <Skeleton variant="text" width="88%" height={24} />
                      </Box>
                    ))}
                  </>
                ) : (
                  <>
                    {post!.image && (
                      <Box
                        {...blogStaticProps(block.id, "article-featured-image", "Article featured image", "media")}
                        className={FADE_IN_CLASS}
                        component="img"
                        src={resolveBlogImage(post!.image)}
                        alt={sanitizeText(post!.title)}
                        loading="eager"
                        decoding="async"
                        sx={{
                          width: "100%",
                          borderRadius: "16px",
                          objectFit: "cover",
                          maxHeight: { xs: 230, sm: 310, md: 420, lg: 750 },
                          display: "block",
                        }}
                      />
                    )}
                    {captionText && (
                      <Typography
                        {...blogStaticProps(block.id, "article-image-caption", "Article image caption")}
                        className={FADE_IN_CLASS}
                        sx={{
                          mt: 1.5,
                          mb: { xs: 4, md: 5.8 },
                          mx: "auto",
                          maxWidth: "95%",
                          textAlign: "center",
                          color: ui.caption,
                          fontStyle: "italic",
                        }}
                      >
                        {sanitizeText(captionText)}
                      </Typography>
                    )}

                    {blocks.map((b, index) => {
                      const blockStaticBase =
                        b.type === "conclusion"
                          ? "article-conclusion"
                          : `${b.type}-${index + 1}`;
                      if (b.type === "section" || b.type === "conclusion") {
                        if (!b.heading && !b.paragraphs?.length) return null;
                        const anchorId = b.anchorId || slugify(b.heading || "");
                        return (
                          <Box
                            {...blogStaticProps(
                              block.id,
                              `${blockStaticBase}-container`,
                              b.type === "conclusion" ? "Conclusion section" : "Article section",
                              "container",
                            )}
                            key={b.id || index}
                            id={anchorId}
                            className={FADE_IN_CLASS}
                            sx={{ scrollMarginTop: "120px", mb: { xs: 5.2, md: 6.8 } }}
                          >
                            {b.heading && (
                              <Typography
                                {...blogStaticProps(
                                  block.id,
                                  `${blockStaticBase}-heading`,
                                  b.type === "conclusion" ? "Conclusion heading" : "Section heading",
                                )}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: { xs: "1.35rem", sm: "1.6rem", md: "1.85rem", lg: "2.05rem" },
                                  lineHeight: 1.18,
                                  borderLeft: `3px solid ${accent}`,
                                  color: ui.headingText,
                                  pl: 1.5,
                                  mb: 2.1,
                                }}
                              >
                                {stripHeadingNumber(sanitizeText(b.heading))}
                              </Typography>
                            )}
                            {(b.paragraphs || []).map((para, pIdx) => (
                              <Typography
                                {...blogStaticProps(
                                  block.id,
                                  `${blockStaticBase}-paragraph-${pIdx + 1}`,
                                  b.type === "conclusion" ? "Conclusion paragraph" : "Section paragraph",
                                )}
                                key={pIdx}
                                sx={{
                                  mb: 2,
                                  color: ui.bodyText,
                                  fontSize: { xs: "0.92rem", md: "0.9rem" },
                                  lineHeight: { xs: 1.78, md: 1.82, lg: 1.84 },
                                }}
                              >
                                {sanitizeText(para)}
                              </Typography>
                            ))}
                          </Box>
                        );
                      }
                      if (b.type === "quote") {
                        if (!b.text) return null;
                        return (
                          <Box
                            {...blogStaticProps(block.id, `${blockStaticBase}-container`, "Quote block", "container")}
                            key={b.id || index}
                            className={FADE_IN_CLASS}
                            sx={{
                              mb: { xs: 5.2, md: 6.8 },
                              ...panelSx,
                              borderLeft: `3px solid ${accent}`,
                              px: 2.5,
                              py: 2.25,
                              fontSize: { xs: "0.96rem", md: "0.98rem" },
                              color: ui.quoteText,
                              fontStyle: "italic",
                            }}
                          >
                            &quot;{sanitizeText(b.text)}&quot;
                            {b.attribution && (
                              <Typography
                                {...blogStaticProps(block.id, `${blockStaticBase}-attribution`, "Quote attribution")}
                                sx={{ mt: 1.5, fontSize: { xs: "0.9rem", md: "0.95rem" }, color: ui.mutedText, fontStyle: "normal" }}
                              >
                                — {sanitizeText(b.attribution)}
                              </Typography>
                            )}
                          </Box>
                        );
                      }
                      if (b.type === "keyTakeaway") {
                        if (!b.text) return null;
                        return (
                          <Box
                            {...blogStaticProps(block.id, `${blockStaticBase}-container`, "Key takeaway block", "container")}
                            key={b.id || index}
                            className={FADE_IN_CLASS}
                            sx={{
                              mb: { xs: 5.2, md: 6.8 },
                              border: `1px solid ${ui.keyTakeawayBorder}`,
                              background: ui.keyTakeawayBg,
                              borderRadius: "12px",
                              px: 2.3,
                              py: 2.1,
                            }}
                          >
                            <Typography
                              {...blogStaticProps(block.id, `${blockStaticBase}-title`, "Key takeaway title")}
                              sx={{ color: accent, fontWeight: 700 }}
                            >
                              {sanitizeText(b.title || "Key Takeaway")}
                            </Typography>
                            <Typography
                              {...blogStaticProps(block.id, `${blockStaticBase}-text`, "Key takeaway text")}
                              sx={{ mt: 0.6, color: ui.bodyText, lineHeight: 1.68, fontSize: { xs: "0.92rem", md: "0.9rem" } }}
                            >
                              {sanitizeText(b.text)}
                            </Typography>
                          </Box>
                        );
                      }
                      if (b.type === "code") {
                        if (!b.code) return null;
                        return (
                          <Box
                            {...blogStaticProps(block.id, `${blockStaticBase}-container`, "Code block", "container")}
                            key={b.id || index}
                            className={FADE_IN_CLASS}
                            sx={{
                              mb: { xs: 5.2, md: 6.8 },
                              ...panelSx,
                              px: 2.5,
                              py: 2.4,
                              fontFamily: "Consolas, monospace",
                              color: accent,
                              fontSize: { xs: "0.88rem", md: "0.95rem" },
                              lineHeight: 1.8,
                              whiteSpace: "pre-wrap",
                              overflowX: "auto",
                            }}
                          >
                            {b.code}
                          </Box>
                        );
                      }
                      return null;
                    })}

                    {/* Fallback body when no authored blocks */}
                    {blocks.length === 0 && post!.description && (
                      <Typography
                        {...blogStaticProps(block.id, "article-fallback-description", "Article description")}
                        sx={{ color: ui.bodyText, lineHeight: 1.84, mb: 4 }}
                      >
                        {sanitizeText(post!.description)}
                      </Typography>
                    )}

                    <Divider className={FADE_IN_CLASS} sx={{ my: 3.2, borderColor: ui.divider }} />

                    {/* Bottom tags */}
                    {tags.length > 0 && (
                      <Box className={FADE_IN_CLASS} sx={{ display: "flex", flexWrap: "wrap", gap: 1.1 }}>
                        {tags.map((tag) => (
                          <Box
                            key={`bottom-${tag}`}
                            {...blogStaticProps(block.id, `article-bottom-tag-${slugify(tag)}`, "Article bottom tag")}
                            sx={chipSx}
                          >
                            {tag}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Footer actions */}
                    <Box
                      className={FADE_IN_CLASS}
                      sx={{ mt: 3, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 2 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          {...blogStaticProps(block.id, "article-footer-share-label", "Footer share label")}
                          sx={subtleTextSx}
                        >
                          Share this article:
                        </Typography>
                        {renderShareRow("footer")}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          {...blogStaticProps(block.id, "article-helpful-label", "Helpful vote label")}
                          sx={subtleTextSx}
                        >
                          Was this helpful?
                        </Typography>
                        <Box
                          {...blogStaticProps(block.id, "article-helpful-yes", "Helpful yes button", "container")}
                          onClick={() => handleHelpfulVote("yes")}
                          role="button"
                          aria-label="Mark article as helpful"
                          sx={{
                            ...iconBtnSx,
                            width: "auto",
                            px: 1.4,
                            gap: 0.8,
                            cursor: "pointer",
                            borderColor: helpfulVote === "yes" ? hexToRgba(accent, 0.55) : undefined,
                            backgroundColor: helpfulVote === "yes" ? hexToRgba(accent, 0.12) : "transparent",
                            color: helpfulVote === "yes" ? accent : undefined,
                            transition: "all .2s ease",
                            ...shareBtnHover,
                          }}
                        >
                          <ThumbUpOffAltOutlinedIcon sx={{ fontSize: "1rem" }} />
                          <span>Yes</span>
                        </Box>
                        <Box
                          {...blogStaticProps(block.id, "article-helpful-no", "Helpful no button", "container")}
                          onClick={() => handleHelpfulVote("no")}
                          role="button"
                          aria-label="Mark article as not helpful"
                          sx={{
                            ...iconBtnSx,
                            width: "auto",
                            px: 1.4,
                            gap: 0.8,
                            cursor: "pointer",
                            borderColor: helpfulVote === "no" ? hexToRgba(accent, 0.55) : undefined,
                            backgroundColor: helpfulVote === "no" ? hexToRgba(accent, 0.12) : "transparent",
                            color: helpfulVote === "no" ? accent : undefined,
                            transition: "all .2s ease",
                            ...shareBtnHover,
                          }}
                        >
                          <ThumbDownOffAltOutlinedIcon sx={{ fontSize: "1rem" }} />
                          <span>No</span>
                        </Box>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>

              {/* Sidebar */}
              <Box sx={{ position: { lg: "sticky" }, top: { lg: 105 }, alignSelf: "start", display: "grid", gap: 2.2 }}>
                {isLoading ? (
                  <>
                    <Box sx={{ ...panelSx, p: { xs: 2, md: 3 } }}>
                      <Skeleton variant="text" width="70%" height={36} />
                      <Skeleton variant="text" width="100%" height={24} />
                      <Skeleton variant="text" width="86%" height={24} />
                    </Box>
                    <Box sx={{ ...panelSx, p: { xs: 2, md: 3 } }}>
                      <Skeleton variant="text" width="68%" height={36} />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mt: 1.2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="70%" height={22} />
                          <Skeleton variant="text" width="52%" height={18} />
                        </Box>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <>
                    {/* TOC */}
                    {showTableOfContents && tocSections.length > 0 && (
                      <Box
                        {...blogStaticProps(block.id, "article-toc-card", "Table of contents card", "container")}
                        className={FADE_IN_CLASS}
                        sx={{ ...panelSx, p: { xs: 2, md: 3 } }}
                      >
                        <Typography
                          {...blogStaticProps(block.id, "article-toc-title", "Table of contents heading")}
                          sx={{ fontWeight: 700, mb: 1.1, fontSize: "1.45rem" }}
                        >
                          Table of Contents
                        </Typography>
                        <Box
                          ref={tocScrollRef}
                          sx={{
                            maxHeight: { xs: 260, lg: 330 },
                            overflowY: "auto",
                            pr: 0.8,
                            mr: -0.8,
                            scrollBehavior: "smooth",
                            overscrollBehavior: "contain",
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                          }}
                        >
                          {tocSections.map((section, index) => (
                            <Box
                              key={`toc-${section.id}`}
                              {...blogStaticProps(block.id, `article-toc-item-${index + 1}`, "Table of contents item")}
                              data-toc-section={section.id}
                              onClick={() => onTocClick(section.id)}
                              sx={{
                                display: "flex",
                                gap: 1,
                                py: 0.8,
                                cursor: "pointer",
                                color: activeSection === section.id ? accent : ui.stickyInactive,
                                fontWeight: activeSection === section.id ? 700 : 400,
                                fontSize: { xs: "0.92rem", md: "0.98rem" },
                              }}
                            >
                              <span style={{ opacity: 0.9 }}>{String(index + 1).padStart(2, "0")}</span>
                              <span>{section.heading}</span>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Author bio */}
                    <Box
                      {...blogStaticProps(block.id, "article-author-card", "Author card", "container")}
                      className={FADE_IN_CLASS}
                      sx={{ ...panelSx, p: { xs: 2, md: 3 } }}
                    >
                      <Typography
                        {...blogStaticProps(block.id, "article-author-card-title", "Author card heading")}
                        sx={{ fontWeight: 700, mb: 1.4, fontSize: "1.45rem" }}
                      >
                        About the Author
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: ui.avatarBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `1px solid ${ui.panelBorder}`,
                          }}
                        >
                          <PersonOutlineOutlinedIcon sx={{ color: ui.avatarIcon, fontSize: "1.1rem" }} />
                        </Box>
                        <Box>
                          <Typography
                            {...blogStaticProps(block.id, "article-author-card-name", "Author name")}
                            sx={{ fontWeight: 700 }}
                          >
                            {authorName}
                          </Typography>
                          <Typography
                            {...blogStaticProps(block.id, "article-author-card-role", "Author role")}
                            sx={{ color: accent, fontSize: "0.9rem" }}
                          >
                            {authorRole}
                          </Typography>
                        </Box>
                      </Box>
                      {authorBio && (
                        <Typography
                          {...blogStaticProps(block.id, "article-author-bio", "Author bio")}
                          sx={{
                            mt: 1.6,
                            ...subtleTextSx,
                            lineHeight: 1.7,
                            display: "-webkit-box",
                            WebkitLineClamp: 7,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {sanitizeText(authorBio)}
                        </Typography>
                      )}
                    </Box>

                    {/* Related articles */}
                    {sidebarArticles.length > 0 && (
                      <Box
                        {...blogStaticProps(block.id, "article-related-card", "Related articles card", "container")}
                        className={FADE_IN_CLASS}
                        sx={{ ...panelSx, p: { xs: 2, md: 3 } }}
                      >
                        <Typography
                          {...blogStaticProps(block.id, "article-related-title", "Related articles heading")}
                          sx={{ fontWeight: 700, mb: 1.2, fontSize: "1.45rem" }}
                        >
                          Related Articles
                        </Typography>
                        {sidebarArticles.map((article, index) => (
                          <Box
                            key={article.id}
                            {...blogStaticProps(block.id, `article-related-item-${index + 1}`, "Related article item", "container")}
                            onClick={() => openArticle(article)}
                            sx={{ display: "flex", gap: 1.1, mb: 1.2, cursor: "pointer", alignItems: "flex-start" }}
                          >
                            <Box
                              {...blogStaticProps(block.id, `article-related-image-${index + 1}`, "Related article image", "media")}
                              component="img"
                              src={resolveBlogImage(article.image)}
                              alt={article.title}
                              loading="lazy"
                              decoding="async"
                              sx={{
                                width: { xs: 66, md: 72 },
                                height: { xs: 50, md: 54 },
                                minWidth: { xs: 66, md: 72 },
                                borderRadius: "8px",
                                objectFit: "cover",
                                display: "block",
                                mt: 0.2,
                                bgcolor: "#0a1825",
                              }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              {article.category && (
                                <Typography
                                  {...blogStaticProps(block.id, `article-related-category-${index + 1}`, "Related article category")}
                                  sx={{ ...badgeSx, fontSize: "0.72rem", py: 0.35, px: 1.05 }}
                                >
                                  {article.category}
                                </Typography>
                              )}
                              <Typography
                                {...blogStaticProps(block.id, `article-related-heading-${index + 1}`, "Related article title")}
                                sx={{
                                  mt: 0.5,
                                  fontWeight: 600,
                                  lineHeight: 1.2,
                                  fontSize: "1rem",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {article.title}
                              </Typography>
                              <Typography
                                {...blogStaticProps(block.id, `article-related-date-${index + 1}`, "Related article date")}
                                sx={{ mt: 0.45, ...subtleTextSx, fontSize: "0.84rem" }}
                              >
                                {formatDate(article.publishedAt)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>

            {/* You might also like */}
            {!isLoading && recommendationArticles.length > 0 && (
              <>
                <Divider className={FADE_IN_CLASS} sx={{ my: { xs: 3.2, md: 4.4 }, borderColor: ui.divider }} />
                <Box className={FADE_IN_CLASS} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.4, mb: 2.2 }}>
                  <Typography
                    {...blogStaticProps(block.id, "article-recommendations-title", "Recommendations heading")}
                    sx={{ fontWeight: 700, fontSize: { xs: "1.6rem", md: "2.2rem" } }}
                  >
                    You might also <Box component="span" sx={{ color: accent }}>like</Box>
                  </Typography>
                  <Box
                    {...blogStaticProps(block.id, "article-view-all-link", "View all link")}
                    onClick={goToBlog}
                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.7, color: accent, cursor: "pointer" }}
                  >
                    <span>View All</span>
                    <ArrowForwardIcon sx={{ fontSize: "1rem" }} />
                  </Box>
                </Box>
                <Box
                  className={FADE_IN_CLASS}
                  sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" } }}
                >
                  {recommendationArticles.map((article, index) => (
                    <Box
                      key={`like-${article.id}`}
                      {...blogStaticProps(block.id, `article-recommendation-card-${index + 1}`, "Recommendation card", "container")}
                      onClick={() => openArticle(article)}
                      sx={{
                        cursor: "pointer",
                        borderRadius: "12px",
                        border: `1px solid ${ui.panelBorder}`,
                        background: alpha("#ffffff", 0.92),
                        p: 1.2,
                        transition: "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: `0 16px 28px rgba(21, 45, 66, 0.2), 0 0 0 1px ${hexToRgba(accent, 0.24)}`,
                          borderColor: hexToRgba(accent, 0.42),
                        },
                      }}
                    >
                      <Box
                        {...blogStaticProps(block.id, `article-recommendation-image-${index + 1}`, "Recommendation image", "media")}
                        component="img"
                        src={resolveBlogImage(article.image)}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        sx={{ width: "100%", height: { xs: 190, md: 200 }, borderRadius: "12px", objectFit: "cover", bgcolor: "#0a1825" }}
                      />
                      <Box sx={{ mt: 1.2, px: 0.2, pb: 0.4 }}>
                        {article.category && (
                          <Typography
                            {...blogStaticProps(block.id, `article-recommendation-category-${index + 1}`, "Recommendation category")}
                            sx={badgeSx}
                          >
                            {article.category}
                          </Typography>
                        )}
                        <Typography
                          {...blogStaticProps(block.id, `article-recommendation-heading-${index + 1}`, "Recommendation title")}
                          sx={{ mt: 0.8, fontWeight: 700, fontSize: { xs: "1.05rem", md: "1.24rem" }, lineHeight: 1.24 }}
                        >
                          {article.title}
                        </Typography>
                        <Box sx={{ mt: 1.1, display: "flex", alignItems: "center", gap: 1 }}>
                          <PersonOutlineOutlinedIcon sx={{ fontSize: "1rem", color: ui.avatarIcon }} />
                          <Typography
                            {...blogStaticProps(block.id, `article-recommendation-author-${index + 1}`, "Recommendation author")}
                            sx={subtleTextSx}
                          >
                            {authorName}
                          </Typography>
                        </Box>
                        <Typography
                          {...blogStaticProps(block.id, `article-recommendation-date-${index + 1}`, "Recommendation date")}
                          sx={{ mt: 0.4, ...subtleTextSx, fontSize: "0.9rem" }}
                        >
                          {formatDate(article.publishedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {/* Comments (real website-scoped posts only — never in template mode) */}
            {!isLoading && !isTemplateMode && websiteId && post!.id != null && (
              <Box sx={{ maxWidth: "1300px", mx: "auto", mt: { xs: 4, md: 6 } }}>
                <BlogComments
                  websiteId={websiteId}
                  blogId={post!.id}
                  postAuthorId={post!.author?.id}
                  primaryColor={accent}
                  headingColor={ui.headingText}
                  bodyColor={ui.bodyText}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

BlogArticleBlockBase.displayName = "BlogArticleBlock";

const BlogArticleBlock = React.memo(BlogArticleBlockBase);
BlogArticleBlock.displayName = "BlogArticleBlock";

export default BlogArticleBlock;
