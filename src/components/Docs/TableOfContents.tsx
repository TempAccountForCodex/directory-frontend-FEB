/**
 * TableOfContents — Auto-generated sticky TOC from markdown headings (Step 10.9.7)
 *
 * Extracts h2/h3 headings from markdown content and renders anchor links.
 * Highlights current section using IntersectionObserver on scroll.
 */

import React, {
  memo,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  content: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert heading text to a URL-safe anchor id */
const slugifyHeading = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

/** Extract h2 and h3 headings from raw markdown */
const extractHeadings = (markdown: string): TocEntry[] => {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const entries: TocEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = slugifyHeading(text);
    entries.push({ id, text, level });
  }

  return entries;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TableOfContents = memo<TableOfContentsProps>(({ content }) => {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const headings = useMemo(() => extractHeadings(content), [content]);

  // IntersectionObserver: highlight current section on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0% -60% 0%", threshold: 0 },
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  const handleClick = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(id);
      }
    },
    [],
  );

  if (headings.length === 0) {
    return <Box data-testid="toc" />;
  }

  return (
    <Box
      data-testid="toc"
      sx={{
        position: { md: "sticky" },
        top: { md: 88 },
        maxHeight: { md: "calc(100vh - 120px)" },
        overflowY: "auto",
        pr: 1,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: 1.2,
          mb: 1.5,
          display: "block",
        }}
      >
        On This Page
      </Typography>

      <Box component="nav" aria-label="Table of contents">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <Box
              key={heading.id}
              component="a"
              href={`#${heading.id}`}
              onClick={handleClick(heading.id)}
              aria-current={isActive ? "location" : undefined}
              sx={{
                display: "block",
                py: 0.5,
                textDecoration: "none",
                fontSize: heading.level === 3 ? "0.8rem" : "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "primary.main" : "text.secondary",
                borderLeft: isActive ? "2px solid" : "2px solid transparent",
                borderColor: isActive ? "primary.main" : "transparent",
                pl: heading.level === 3 ? 2.5 : 1,
                transition: "all 0.15s ease",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              {heading.text}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

TableOfContents.displayName = "TableOfContents";

export default TableOfContents;
