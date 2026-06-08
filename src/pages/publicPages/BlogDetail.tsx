import React, { useEffect, useMemo, useState } from "react";
import { Box, Container, Divider, Typography } from "@mui/material";
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
import { alpha, useTheme as useMuiTheme } from "@mui/material/styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import InsightsHeaderBackground from "../../components/publicComponents/insights/InsightsHeaderBackground";
import { SITE_URL } from "../../utils/seo/seoConfig";
import InsightData from "../../utils/data/Insights";

const FADE_IN_CLASS = "fade-in-on-view";
const INSIGHT_HELPFUL_STORAGE_KEY = "insight-helpful-votes";

const LOCAL_INSIGHTS = InsightData.map((item) => ({
  id: item.id,
  slug: item.id,
  title: item.heading,
  category: item.category,
  image: item.image,
  description: item.description,
  content: item.content,
  publishedAt: item.publishDate,
  headings: item.headings || [],
}));

const slugify = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getReadTimeMinutes = (post) => {
  const textParts = [post.title, post.description, post.content];
  (post.headings || []).forEach((section) => {
    textParts.push(section.heading || "");
    (section.description || []).forEach((p) => textParts.push(p || ""));
  });
  const words = textParts.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.round(words / 190));
};

const getTags = (post) => {
  const safeCategory = (post.category || "").replace(/\s+/g, "");
  const words = (post.title || "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3);
  const titleTags = words.map((w) => `#${w}`);
  return [`#${safeCategory}`, ...titleTags].filter((tag) => tag !== "#").slice(0, 4);
};

const styles = {
  page: {
    minHeight: "100vh",
    pt: 0,
    pb: 0,
    px: { xs: 2, sm: 3, md: 4, lg: 14, xl: 18 },
    position: "relative",
    overflow: "visible",
  },
  subtleText: {
    fontFamily: "Questrial",
  },
  panel: {
    borderRadius: "14px",
  },
  badge: {
    display: "inline-flex",
    px: 1.3,
    py: 0.45,
    borderRadius: "8px",
    fontSize: "0.78rem",
    fontFamily: "Barlow",
    backgroundColor: "#378C92",
    color: "#ffffffea",
    fontWeight: 600,
    letterSpacing: 1.5,
  },
  chip: {
    borderRadius: "999px",
    px: 1.05,
    py: 0.45,
    fontFamily: "Questrial",
    fontSize: "0.82rem",
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const InsightsDetailsNew = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const stateInsight = location.state?.insight;

  const ui = useMemo(() => {
    const accent = "#208188ff";
    return {
      accent,
      pageBg: "#f4f7fb",
      pageText: "#16283a",
      mutedText: "#5e7a93",
      softText: "#48647d",
      breadcrumb: "#88a8bf",
      breadcrumbActive: "#e8f4ff",
      panelBg: alpha("#ffffff", 0.95),
      panelBorder: "rgba(215,226,236,1)",
      divider: "rgba(0, 197, 184, 0.26)",
      headingText: "#16283a",
      bodyText: "#27435e",
      quoteText: "#1f3042",
      avatarBg: "#e6f0f3",
      avatarIcon: "#466884",
      badgeBg: "#1c666b",
      badgeText: "#ffffff",
      chipText: "#355670",
      chipBorder: alpha(accent, 0.34),
      iconBtnBorder: alpha(accent, 0.34),
      iconBtnText: "#3f5f78",
      stickyInactive: "#5b7995",
      keyTakeawayBorder: alpha(accent, 0.52),
      keyTakeawayBg: alpha(accent, 0.1),
      caption: "#5e7a93",
    };
  }, [muiTheme.palette]);

  const subtleTextSx = useMemo(
    () => ({ ...styles.subtleText, color: ui.mutedText }),
    [ui.mutedText]
  );
  const panelSx = useMemo(
    () => ({ ...styles.panel, border: `1px solid ${ui.panelBorder}`, background: ui.panelBg }),
    [ui.panelBg, ui.panelBorder]
  );
  const badgeSx = useMemo(
    () => ({ ...styles.badge, backgroundColor: ui.badgeBg, color: ui.badgeText }),
    [ui.badgeBg, ui.badgeText]
  );
  const chipSx = useMemo(
    () => ({ ...styles.chip, border: `1px solid ${ui.chipBorder}`, color: ui.chipText }),
    [ui.chipBorder, ui.chipText]
  );
  const iconBtnSx = useMemo(
    () => ({ ...styles.iconBtn, border: `1px solid ${ui.iconBtnBorder}`, color: ui.iconBtnText }),
    [ui.iconBtnBorder, ui.iconBtnText]
  );

  const selectedInsight = useMemo(() => {
    const localMatch =
      LOCAL_INSIGHTS.find((item) => (item.slug || item.id) === id) || LOCAL_INSIGHTS[0];

    if (stateInsight) {
      const mergedFromState = {
        id: stateInsight.id || stateInsight.slug,
        slug: stateInsight.slug || stateInsight.id,
        title: stateInsight.title || localMatch.title,
        category: stateInsight.category || localMatch.category,
        image: stateInsight.image || localMatch.image,
        description: stateInsight.description || stateInsight.content || localMatch.description,
        content: stateInsight.content || localMatch.content,
        publishedAt: stateInsight.publishedAt || localMatch.publishedAt,
      };
      return {
        ...localMatch,
        ...mergedFromState,
        headings: localMatch.headings || stateInsight.headings || [],
      };
    }
    return localMatch;
  }, [id, stateInsight]);

  const sections = useMemo(
    () =>
      (selectedInsight.headings || []).map((section) => ({
        id: slugify(section.heading),
        heading: section.heading,
        paragraphs: section.description || [],
      })),
    [selectedInsight.headings]
  );

  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [helpfulVote, setHelpfulVote] = useState("");

  useEffect(() => {
    setActiveSection(sections[0]?.id || "");
  }, [sections]);

  useEffect(() => {
    if (!copiedLink) return undefined;
    const timeoutId = window.setTimeout(() => setCopiedLink(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copiedLink]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawVotes = window.localStorage.getItem(INSIGHT_HELPFUL_STORAGE_KEY);
      const parsedVotes = rawVotes ? JSON.parse(rawVotes) : {};
      setHelpfulVote(parsedVotes[selectedInsight.id] || "");
    } catch {
      setHelpfulVote("");
    }
  }, [selectedInsight.id]);

  useEffect(() => {
    if (!sections.length || typeof window === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-22% 0px -58% 0px", threshold: [0.2, 0.4, 0.7] }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const fadeNodes = Array.from(
      document.querySelectorAll<HTMLElement>(`.${FADE_IN_CLASS}`),
    );
    if (!fadeNodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px 32% 0px" }
    );

    fadeNodes.forEach((node, index) => {
      node.style.setProperty("--fade-delay", `${Math.min((index % 6) * 24, 120)}ms`);
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [sections, selectedInsight.id]);

  const relatedArticles = useMemo(
    () => LOCAL_INSIGHTS.filter((item) => item.id !== selectedInsight.id).slice(0, 6),
    [selectedInsight.id]
  );

  const sidebarArticles = relatedArticles.slice(0, 3);
  const recommendationArticles = relatedArticles.slice(3, 6);
  const readTime = getReadTimeMinutes(selectedInsight);
  const tags = getTags(selectedInsight);
  const leadText = useMemo(() => {
    const text = selectedInsight.description || selectedInsight.content || "";
    return text.length > 350 ? `${text.slice(0, 350).trim()}...` : text;
  }, [selectedInsight.description, selectedInsight.content]);
  const captionText = useMemo(
    () => selectedInsight.content || leadText,
    [leadText, selectedInsight.content]
  );
  const quoteText = useMemo(
    () => sections[1]?.paragraphs?.[0] || sections[0]?.paragraphs?.[0] || "",
    [sections]
  );
  const codeSnippet = useMemo(
    () => selectedInsight.codeSnippet || stateInsight?.codeSnippet || "",
    [selectedInsight.codeSnippet, stateInsight?.codeSnippet]
  );
  const keyTakeawayText = useMemo(() => {
    const lastSection = sections[sections.length - 1];
    if (!lastSection?.paragraphs?.length) return "";
    return lastSection.paragraphs[lastSection.paragraphs.length - 1];
  }, [sections]);
  const authorName = useMemo(
    () =>
      selectedInsight.author?.name ||
      selectedInsight.authorName ||
      `${selectedInsight.category} Editorial`,
    [selectedInsight.author?.name, selectedInsight.authorName, selectedInsight.category]
  );
  const authorRole = useMemo(
    () =>
      selectedInsight.author?.role ||
      selectedInsight.authorRole ||
      `${selectedInsight.category} Writers`,
    [selectedInsight.author?.role, selectedInsight.authorRole, selectedInsight.category]
  );
  const authorBio = useMemo(
    () =>
      selectedInsight.author?.bio ||
      selectedInsight.authorBio ||
      selectedInsight.description ||
      selectedInsight.content ||
      "",
    [
      selectedInsight.author?.bio,
      selectedInsight.authorBio,
      selectedInsight.description,
      selectedInsight.content,
    ]
  );

  const onTocClick = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const onOpenArticle = (insight) => {
    navigate(`/blogdetail/${insight.slug || insight.id}`, { state: { insight } });
  };

  const pageUrl = useMemo(() => {
    return `${SITE_URL}/insight-details/${selectedInsight.slug || selectedInsight.id}`;
  }, [selectedInsight.id, selectedInsight.slug]);
  const shareText = useMemo(() => {
    const summary = selectedInsight.description || selectedInsight.content || "";
    const trimmedSummary =
      summary.length > 140 ? `${summary.slice(0, 140).trim()}...` : summary;
    return trimmedSummary
      ? `${selectedInsight.title} - ${trimmedSummary}` 
      : selectedInsight.title;
  }, [selectedInsight.content, selectedInsight.description, selectedInsight.title]);

  const openShareWindow = (url) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer,width=640,height=680");
  };

  const handleShareX = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`;
    openShareWindow(url);
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
    openShareWindow(url);
  };

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl);
        setCopiedLink(true);
        return;
      }
      const textArea = document.createElement("textarea");
      textArea.value = pageUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (copied) {
        setCopiedLink(true);
        return;
      }
      window.prompt("Copy this link:", pageUrl);
    } catch {
      window.prompt("Copy this link:", pageUrl);
    }
  };

  const handleNativeShare = async () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedInsight.title,
          text: shareText,
          url: pageUrl,
        });
        return;
      } catch {
        // no-op fallback
      }
    }
    await handleCopyLink();
  };

  const handleHelpfulVote = (vote) => {
    setHelpfulVote(vote);
    if (typeof window === "undefined") return;
    try {
      const rawVotes = window.localStorage.getItem(INSIGHT_HELPFUL_STORAGE_KEY);
      const parsedVotes = rawVotes ? JSON.parse(rawVotes) : {};
      parsedVotes[selectedInsight.id] = vote;
      window.localStorage.setItem(
        INSIGHT_HELPFUL_STORAGE_KEY,
        JSON.stringify(parsedVotes)
      );
    } catch {
      // no-op until backend wiring exists
    }
  };

  return (
    <Box className="insights-details-page" sx={{ ...styles.page, backgroundColor: "transparent", color: ui.pageText }}>
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 3 }}>
        <Box
          sx={{
            mx: "auto",
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
          <Box
            className={FADE_IN_CLASS}
            sx={{
              borderRadius: 0,
              border: "1px solid rgba(255,255,255,0.12)",
              width: "100vw",
              ml: "calc(50% - 50vw)",
              mr: "calc(50% - 50vw)",
              mt: 0,
              px: { xs: 2, sm: 3, md: 5, lg: 20, xl: 24 },
              pt: { xs: 13, sm: 14, md: 15, lg: 15 },
              pb: { xs: 3.2, md: 4.2 },
              mb: { xs: 3, md: 3.8 },
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 18px 34px rgba(2,12,21,0.24)",
            }}
          >
            <InsightsHeaderBackground idPrefix="insights-details-header" />
            
            {/* Breadcrumb Navigation */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                color: "rgba(168, 197, 218, 0.82)",
                fontFamily: "Questrial",
                fontSize: { xs: "0.9rem", sm: "0.95rem", md: "0.98rem" },
                position: "relative",
                zIndex: 1,
              }}
            >
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/blog")}>Insights</span>
              <ChevronRightOutlinedIcon sx={{ fontSize: "1rem" }} />
              <span>{selectedInsight.category}</span>
              <ChevronRightOutlinedIcon sx={{ fontSize: "1rem" }} />
              <span style={{ color: "#f2fbff" }}>{selectedInsight.title}</span>
            </Box>

            {/* Header Meta */}
            <Box sx={{ mt: 2.6, display: "flex", alignItems: "center", gap: 1.2, position: "relative", zIndex: 1 }}>
              <Typography sx={badgeSx}>{selectedInsight.category}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, color: "rgba(183, 209, 227, 0.85)", fontFamily: "Questrial" }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: "1rem" }} />
                <span>{readTime} min read</span>
              </Box>
            </Box>

            {/* Title */}
            <Typography
              sx={{
                mt: 2,
                maxWidth: "1280px",
                fontFamily: "Barlow",
                fontWeight: 800,
                color: "#ffffff",
                fontSize: { xs: "1.95rem", sm: "2.45rem", md: "3.2rem", lg: "4rem" },
                lineHeight: { xs: 1.14, md: 1.1, lg: 1.08 },
                letterSpacing: { xs: "-0.25px", md: "-0.55px", lg: "-0.9px" },
                position: "relative",
                zIndex: 1,
              }}
            >
              {selectedInsight.title}
            </Typography>

            {/* Description */}
            <Typography
              sx={{
                mt: 2.2,
                maxWidth: "920px",
                fontFamily: "Questrial",
                color: "#89a9c0",
                fontSize: { xs: "0.98rem", sm: "1.02rem", md: "1.05rem", lg: "1.08rem" },
                lineHeight: { xs: 1.75, md: 1.85, lg: 1.92 },
                position: "relative",
                zIndex: 1,
              }}
            >
              {leadText}
            </Typography>

            <Divider sx={{ my: { xs: 2.6, md: 3.2 }, borderColor: "rgba(255,255,255,0.14)", position: "relative", zIndex: 1 }} />

            {/* Author & Date Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, position: "relative", zIndex: 1 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,197,184,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(0,197,184,0.25)",
                }}
              >
                <PersonOutlineOutlinedIcon sx={{ color: "#9fe8e2", fontSize: "1.2rem" }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "Barlow", fontWeight: 700, fontSize: "1.05rem", color: "#e9f7ff" }}>
                  {authorName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, color: "rgba(183, 209, 227, 0.85)", fontFamily: "Questrial" }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                  <span>{formatDate(selectedInsight.publishedAt)}</span>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2.4, borderColor: "rgba(255,255,255,0.14)", position: "relative", zIndex: 1 }} />

            {/* Tags & Share Section */}
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
                  <Box key={tag} sx={{ ...chipSx, border: "1px solid rgba(0,197,184,0.35)", color: "#9fd3cf" }}>{tag}</Box>
                ))}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ color: "rgba(183, 209, 227, 0.85)", fontFamily: "Questrial" }}>
                  Share:
                </Typography>
                <Box
                  onClick={handleShareX}
                  role="button"
                  aria-label="Share on X"
                  sx={{
                    ...iconBtnSx,
                    border: "1px solid rgba(0,197,184,0.3)",
                    color: "#9fd3cf",
                    cursor: "pointer",
                    transition: "color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                    "&:hover": {
                      color: "#00c5b8",
                      borderColor: "rgba(0,197,184,0.52)",
                      backgroundColor: "rgba(0,197,184,0.12)",
                    },
                  }}
                ><XIcon sx={{ fontSize: "1rem" }} /></Box>
                <Box
                  onClick={handleShareLinkedIn}
                  role="button"
                  aria-label="Share on LinkedIn"
                  sx={{
                    ...iconBtnSx,
                    border: "1px solid rgba(0,197,184,0.3)",
                    color: "#9fd3cf",
                    cursor: "pointer",
                    transition: "color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                    "&:hover": {
                      color: "#00c5b8",
                      borderColor: "rgba(0,197,184,0.52)",
                      backgroundColor: "rgba(0,197,184,0.12)",
                    },
                  }}
                ><LinkedInIcon sx={{ fontSize: "1rem" }} /></Box>
                <Box
                  onClick={handleCopyLink}
                  role="button"
                  aria-label="Copy article link"
                  sx={{
                    ...iconBtnSx,
                    position: "relative",
                    border: "1px solid rgba(0,197,184,0.3)",
                    color: "#9fd3cf",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                    "&:hover": {
                      color: "#00c5b8",
                      borderColor: "rgba(0,197,184,0.52)",
                      backgroundColor: "rgba(0,197,184,0.12)",
                    },
                    "&:hover .copy-link-icon": {
                      transform: "rotate(-45deg)",
                    },
                  }}
                >
                  {copiedLink ? (
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
                        fontFamily: "Questrial",
                        fontSize: "0.72rem",
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        border: "1px solid rgba(0,197,184,0.28)",
                        pointerEvents: "none",
                      }}
                    >
                      Link copied
                    </Box>
                  ) : null}
                  {copiedLink ? (
                    <CheckOutlinedIcon sx={{ fontSize: "1rem" }} />
                  ) : (
                    <LinkOutlinedIcon
                      className="copy-link-icon"
                      sx={{
                        fontSize: "1rem",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Main Content Section */}
          <Box
            sx={{
              mt: { xs: 2, md: 2.4 },
              pb: { xs: 6, sm: 7, md: 10, lg: 15 },
              p: { xs: 0, md: 0 },
              borderRadius: { xs: 0, md: "16px" },
              position: "relative",
              isolation: "isolate",
              overflow: "visible",
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
                filter: "brightness(1) hue-rotate(0deg) saturate(1)",
                zIndex: -1,
              },
            }}
          >
            {/* Hero Image */}
            <Box
              className={FADE_IN_CLASS}
              component="img"
              src={selectedInsight.image}
              alt={selectedInsight.title}
              width="1400"
              height="760"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              sizes="(max-width: 1200px) 100vw, 1200px"
              sx={{
                width: "100%",
                borderRadius: "16px",
                objectFit: "cover",
                maxHeight: { xs: 230, sm: 310, md: 420, lg: 520 },
                display: "block",
              }}
            />

            {/* Image Caption */}
            <Typography
              className={FADE_IN_CLASS}
              sx={{
                mt: 1.5,
                textAlign: "center",
                fontFamily: "Questrial",
                color: ui.caption,
                fontStyle: "italic",
              }}
            >
              {captionText}
            </Typography>

            {/* Content Grid */}
            <Box
              className={FADE_IN_CLASS}
              sx={{
                mt: { xs: 4, md: 5.5 },
                display: "grid",
                gap: { xs: 2.4, sm: 2.8, md: 3.4, lg: 4 },
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 330px" },
                alignItems: "start",
              }}
            >
              {/* Main Article Content */}
              <Box>
                {sections.map((section, index) => (
                  <Box
                    key={section.id}
                    id={section.id}
                    className={FADE_IN_CLASS}
                    sx={{ scrollMarginTop: "120px", mb: 5.8 }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Barlow",
                        fontWeight: 700,
                        fontSize: { xs: "1.55rem", sm: "1.9rem", md: "2.2rem", lg: "2.6rem" },
                        lineHeight: 1.2,
                        borderLeft: `3px solid ${ui.accent}`,
                        color: ui.headingText,
                        pl: 1.5,
                        mb: 2.3,
                      }}
                    >
                      {section.heading}
                    </Typography>

                    {(section.paragraphs || []).map((paragraph, pIdx) => (
                      <Typography
                        key={`${section.id}-${pIdx}`}
                        sx={{
                          mb: 2.15,
                          color: ui.bodyText,
                          fontFamily: "Questrial",
                          fontSize: { xs: "0.96rem", md: "0.95rem", lg: "0.96rem" },
                          lineHeight: { xs: 1.82, md: 1.88, lg: 1.9 },
                        }}
                      >
                        {paragraph}
                      </Typography>
                    ))}

                    {index === 1 && quoteText && (
                      <Box
                        sx={{
                          mt: 2.9,
                          ...panelSx,
                          borderLeft: `3px solid ${ui.accent}`,
                          px: 2.5,
                          py: 2.25,
                          fontFamily: "Questrial",
                          fontSize: { xs: "1.02rem", md: "1.05rem" },
                          color: ui.quoteText,
                          fontStyle: "italic",
                        }}
                      >
                        &quot;{quoteText}&quot;
                      </Box>
                    )}

                    {index === 2 && (
                      <Box
                        sx={{
                          mt: 2.9,
                          ...panelSx,
                          px: 2.5,
                          py: 2.4,
                          fontFamily: "Consolas, monospace",
                          color: ui.accent,
                          fontSize: { xs: "0.88rem", md: "0.95rem" },
                          lineHeight: 1.8,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {/* Code snippet placeholder */}
                      </Box>
                    )}

                    {index === 3 && keyTakeawayText && (
                      <Box
                        sx={{
                          mt: 2.9,
                          border: `1px solid ${ui.keyTakeawayBorder}`,
                          background: ui.keyTakeawayBg,
                          borderRadius: "12px",
                          px: 2.3,
                          py: 2.1,
                        }}
                      >
                        <Typography sx={{ color: ui.accent, fontFamily: "Barlow", fontWeight: 700 }}>
                          Key Takeaway
                        </Typography>
                        <Typography sx={{ mt: 0.6, color: ui.bodyText, fontFamily: "Questrial", lineHeight: 1.7, fontSize: { xs: "0.98rem", md: "1rem" } }}>
                          {keyTakeawayText}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}

                <Divider className={FADE_IN_CLASS} sx={{ my: 3.2, borderColor: ui.divider }} />

                {/* Tags at Bottom */}
                <Box className={FADE_IN_CLASS} sx={{ display: "flex", flexWrap: "wrap", gap: 1.1 }}>
                  {tags.map((tag) => (
                    <Box key={`bottom-${tag}`} sx={chipSx}>{tag}</Box>
                  ))}
                </Box>

                {/* Article Footer Actions */}
                <Box
                  className={FADE_IN_CLASS}
                  sx={{
                    mt: 3,
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={subtleTextSx}>Share this article:</Typography>
                    <Box
                      onClick={handleShareX}
                      role="button"
                      aria-label="Share on X"
                      sx={{
                        ...iconBtnSx,
                        cursor: "pointer",
                        transition: "color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                        "&:hover": {
                          color: "#378C92",
                          borderColor: "rgba(55, 140, 146, 0.45)",
                          backgroundColor: "rgba(55, 140, 146, 0.08)",
                        },
                      }}
                    ><XIcon sx={{ fontSize: "1rem" }} /></Box>
                    <Box
                      onClick={handleShareLinkedIn}
                      role="button"
                      aria-label="Share on LinkedIn"
                      sx={{
                        ...iconBtnSx,
                        cursor: "pointer",
                        transition: "color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                        "&:hover": {
                          color: "#378C92",
                          borderColor: "rgba(55, 140, 146, 0.45)",
                          backgroundColor: "rgba(55, 140, 146, 0.08)",
                        },
                      }}
                    ><LinkedInIcon sx={{ fontSize: "1rem" }} /></Box>
                    <Box
                      onClick={handleCopyLink}
                      role="button"
                      aria-label="Copy article link"
                      sx={{
                        ...iconBtnSx,
                        position: "relative",
                        cursor: "pointer",
                        transition: "transform ease 0.1s, color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                        "&:hover": {
                          color: "#378C92",
                          borderColor: "rgba(55, 140, 146, 0.45)",
                          backgroundColor: "rgba(55, 140, 146, 0.08)",
                        },
                        "&:hover .copy-link-icon": {
                          transform: "rotate(-45deg)",
                        },
                      }}
                    >
                      {copiedLink ? (
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
                            fontFamily: "Questrial",
                            fontSize: "0.72rem",
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                            border: "1px solid rgba(55, 140, 146, 0.28)",
                            pointerEvents: "none",
                          }}
                        >
                          Link copied
                        </Box>
                      ) : null}
                      {copiedLink ? (
                        <CheckOutlinedIcon sx={{ fontSize: "1rem" }} />
                      ) : (
                        <LinkOutlinedIcon
                          className="copy-link-icon"
                          sx={{
                            fontSize: "1rem",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      onClick={handleNativeShare}
                      role="button"
                      aria-label="Share article"
                      sx={{
                        ...iconBtnSx,
                        cursor: "pointer",
                        transition: "color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                        "&:hover": {
                          color: "#378C92",
                          borderColor: "rgba(55, 140, 146, 0.45)",
                          backgroundColor: "rgba(55, 140, 146, 0.08)",
                        },
                      }}
                    >
                      <ShareOutlinedIcon sx={{ fontSize: "1rem" }} />
                    </Box>
                  </Box>

                  {/* Helpful Vote Section */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={subtleTextSx}>Was this helpful?</Typography>
                    <Box
                      onClick={() => handleHelpfulVote("yes")}
                      role="button"
                      aria-label="Mark article as helpful"
                      sx={{
                        ...iconBtnSx,
                        width: "auto",
                        px: 1.4,
                        gap: 0.8,
                        cursor: "pointer",
                        borderColor:
                          helpfulVote === "yes"
                            ? "rgba(55, 140, 146, 0.55)"
                            : undefined,
                        backgroundColor:
                          helpfulVote === "yes"
                            ? "rgba(55, 140, 146, 0.12)"
                            : "transparent",
                        color: helpfulVote === "yes" ? "#378C92" : undefined,
                        transition:
                          "color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                        "&:hover": {
                          color: "#378C92",
                          borderColor: "rgba(55, 140, 146, 0.45)",
                          backgroundColor: "rgba(55, 140, 146, 0.08)",
                        },
                      }}
                    >
                      <ThumbUpOffAltOutlinedIcon sx={{ fontSize: "1rem" }} />
                      <span>Yes</span>
                    </Box>
                    <Box
                      onClick={() => handleHelpfulVote("no")}
                      role="button"
                      aria-label="Mark article as not helpful"
                      sx={{
                        ...iconBtnSx,
                        width: "auto",
                        px: 1.4,
                        gap: 0.8,
                        cursor: "pointer",
                        borderColor:
                          helpfulVote === "no"
                            ? "rgba(55, 140, 146, 0.55)"
                            : undefined,
                        backgroundColor:
                          helpfulVote === "no"
                            ? "rgba(55, 140, 146, 0.12)"
                            : "transparent",
                        color: helpfulVote === "no" ? "#378C92" : undefined,
                        transition:
                          "color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                        "&:hover": {
                          color: "#378C92",
                          borderColor: "rgba(55, 140, 146, 0.45)",
                          backgroundColor: "rgba(55, 140, 146, 0.08)",
                        },
                      }}
                    >
                      <ThumbDownOffAltOutlinedIcon sx={{ fontSize: "1rem" }} />
                      <span>No</span>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Sidebar */}
              <Box sx={{ position: { lg: "sticky" }, top: { lg: 105 }, alignSelf: "start", display: "grid", gap: 2.2 }}>
                {/* Table of Contents */}
                <Box className={FADE_IN_CLASS} sx={{ ...panelSx, p: { xs: 2, sm: 2.4, md: 3 } }}>
                  <Typography sx={{ fontFamily: "Barlow", fontWeight: 700, mb: 1.1, fontSize: "1.45rem" }}>
                    Table of Contents
                  </Typography>
                  {sections.slice(0, 5).map((section, index) => (
                    <Box
                      key={`toc-${section.id}`}
                      onClick={() => onTocClick(section.id)}
                      sx={{
                        display: "flex",
                        gap: 1,
                        py: 0.8,
                        cursor: "pointer",
                        color: activeSection === section.id ? ui.accent : ui.stickyInactive,
                        fontFamily: "Questrial",
                        fontWeight: activeSection === section.id ? 700 : 400,
                        fontSize: { xs: "0.92rem", md: "0.98rem" },
                      }}
                    >
                      <span style={{ opacity: 0.9 }}>{`0${index + 1}`}</span>
                      <span>{section.heading}</span>
                    </Box>
                  ))}
                </Box>

                {/* Author Bio Panel */}
                <Box className={FADE_IN_CLASS} sx={{ ...panelSx, p: { xs: 2, sm: 2.4, md: 3 } }}>
                  <Typography sx={{ fontFamily: "Barlow", fontWeight: 700, mb: 1.4, fontSize: "1.45rem" }}>
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
                      <Typography sx={{ fontFamily: "Barlow", fontWeight: 700 }}>{authorName}</Typography>
                      <Typography sx={{ color: ui.accent, fontFamily: "Questrial", fontSize: "0.9rem" }}>
                        {authorRole}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
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
                    {authorBio}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: "flex", gap: 1 }}>
                    <Box sx={iconBtnSx}><XIcon sx={{ fontSize: "1rem" }} /></Box>
                    <Box sx={iconBtnSx}><LinkedInIcon sx={{ fontSize: "1rem" }} /></Box>
                  </Box>
                </Box>

                {/* Related Articles Panel */}
                <Box className={FADE_IN_CLASS} sx={{ ...panelSx, p: { xs: 2, sm: 2.4, md: 3 } }}>
                  <Typography sx={{ fontFamily: "Barlow", fontWeight: 700, mb: 1.2, fontSize: "1.45rem" }}>
                    Related Articles
                  </Typography>
                  {sidebarArticles.map((article) => (
                    <Box
                      key={article.id}
                      onClick={() => onOpenArticle(article)}
                      sx={{
                        display: "flex",
                        gap: 1.1,
                        mb: 1.2,
                        cursor: "pointer",
                        minHeight: { xs: 84, md: 92 },
                        alignItems: "flex-start",
                      }}
                    >
                      <Box
                        component="img"
                        src={article.image}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        sx={{
                          width: { xs: 66, md: 72 },
                          height: { xs: 50, md: 54 },
                          minWidth: { xs: 66, md: 72 },
                          minHeight: { xs: 50, md: 54 },
                          borderRadius: "8px",
                          objectFit: "cover",
                          display: "block",
                          mt: 0.2,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ ...badgeSx, fontSize: "0.72rem", py: 0.35, px: 1.05 }}>
                          {article.category}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.5,
                            fontFamily: "Barlow",
                            fontWeight: 600,
                            lineHeight: 1.2,
                            fontSize: "1rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "2.4em",
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Typography sx={{ mt: 0.45, ...subtleTextSx, fontSize: "0.84rem" }}>
                          {formatDate(article.publishedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <Divider className={FADE_IN_CLASS} sx={{ my: { xs: 3.2, md: 4.4 }, borderColor: ui.divider }} />

            {/* You Might Also Like Section */}
            <Box className={FADE_IN_CLASS} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.4, mb: 2.2 }}>
              <Typography sx={{ fontFamily: "Barlow", fontWeight: 700, fontSize: { xs: "1.8rem", sm: "2.1rem", md: "2.6rem" } }}>
                You might also <span style={{ color: ui.accent }}>like</span>
              </Typography>
              <Box
                onClick={() => navigate("/blog")}
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.7, color: ui.accent, cursor: "pointer", fontFamily: "Questrial" }}
              >
                <span>View All</span>
                <ArrowForwardIcon sx={{ fontSize: "1rem" }} />
              </Box>
            </Box>

            {/* Recommendation Articles Grid */}
            <Box className={FADE_IN_CLASS} sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" } }}>
              {recommendationArticles.map((article) => (
                <Box
                  key={`you-like-${article.id}`}
                  onClick={() => onOpenArticle(article)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: "12px",
                    border: `1px solid ${ui.panelBorder}`,
                    background: alpha("#ffffff", 0.92),
                    p: 1.2,
                    transition: "transform 0.24s ease, box-shadow 0.24s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow:
                        "0 16px 28px rgba(21, 45, 66, 0.2), 0 0 0 1px rgba(55, 140, 146, 0.24)",
                      borderColor: alpha(ui.accent, 0.42),
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    sx={{ width: "100%", height: { xs: 190, sm: 180, md: 190, lg: 200 }, borderRadius: "12px", objectFit: "cover" }}
                  />
                  <Box sx={{ mt: 1.2, px: 0.2, pb: 0.4 }}>
                    <Typography sx={badgeSx}>{article.category}</Typography>
                    <Typography sx={{ mt: 0.8, fontFamily: "Barlow", fontWeight: 700, fontSize: { xs: "1.12rem", sm: "1.2rem", md: "1.6rem" }, lineHeight: 1.22 }}>
                      {article.title}
                    </Typography>
                    <Box sx={{ mt: 1.1, display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonOutlineOutlinedIcon sx={{ fontSize: "1rem", color: ui.avatarIcon }} />
                      <Typography sx={subtleTextSx}>{authorName}</Typography>
                    </Box>
                    <Typography sx={{ mt: 0.4, ...subtleTextSx, fontSize: "0.9rem" }}>
                      {formatDate(article.publishedAt)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default InsightsDetailsNew;
