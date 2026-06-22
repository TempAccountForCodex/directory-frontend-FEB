/**
 * DocSearch — Debounced search with autocomplete dropdown (Step 10.9.7)
 *
 * On type (debounced 300ms), calls GET /api/docs/search?q=keyword,
 * shows top 5 results. Click navigates to article.
 */

import React, {
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { Search as SearchIcon, FileText as ArticleIcon } from "lucide-react";
import { apiClient } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { searchSeedArticles } from "../../data/docs";
import { DOCS } from "./docsTheme";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
}

interface DocSearchProps {
  placeholder?: string;
  fullWidth?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 5;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DocSearch = memo<DocSearchProps>(
  ({ placeholder = "Search documentation...", fullWidth = true }) => {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [noResults, setNoResults] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ---------------------------------------------------------------------------
    // Debounced search
    // ---------------------------------------------------------------------------
    useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (query.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setOpen(false);
        setNoResults(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        setNoResults(false);
        try {
          const resp = await apiClient.get(`/docs/search`, {
            params: { q: query },
          });
          const articles: SearchResult[] =
            resp.data?.articles ?? resp.data ?? [];
          const limited = articles.slice(0, MAX_RESULTS);
          setResults(limited);
          setOpen(true);
          setNoResults(limited.length === 0);
        } catch {
          // No backend reachable — search the compiled-in static seed so the
          // search box still works offline when the backend is unavailable.
          const seed = searchSeedArticles(query, MAX_RESULTS);
          setResults(seed);
          setOpen(true);
          setNoResults(seed.length === 0);
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);

      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ---------------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------------
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
      },
      [],
    );

    const handleResultClick = useCallback(
      (result: SearchResult) => {
        navigate(`/docs/${result.slug}`);
        setOpen(false);
        setQuery("");
      },
      [navigate],
    );

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }, []);

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
      <Box
        ref={containerRef}
        sx={{ position: "relative", width: fullWidth ? "100%" : "auto" }}
      >
        <TextField
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          fullWidth={fullWidth}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {loading ? (
                  <CircularProgress size={16} sx={{ color: DOCS.textFaint }} />
                ) : (
                  <SearchIcon size={18} color={DOCS.textFaint} />
                )}
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: DOCS.surface,
              color: DOCS.text,
              fontSize: "0.875rem",
              "& fieldset": { borderColor: DOCS.border },
              "&:hover fieldset": { borderColor: DOCS.borderStrong },
              "&.Mui-focused fieldset": { borderColor: DOCS.accent },
            },
            "& .MuiOutlinedInput-input::placeholder": {
              color: DOCS.textFaint,
              opacity: 1,
            },
          }}
        />

        {open && (
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 1400,
              borderRadius: "12px",
              overflow: "hidden",
              maxHeight: 360,
              overflowY: "auto",
              bgcolor: DOCS.surface,
              border: `1px solid ${DOCS.border}`,
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            }}
          >
            {noResults && (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: DOCS.textMuted }}>
                  No articles match your search.
                </Typography>
              </Box>
            )}

            {results.map((result) => (
              <Box
                key={result.id}
                onClick={() => handleResultClick(result)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  color: DOCS.textMuted,
                  "&:hover": { bgcolor: DOCS.surfaceHover },
                  borderBottom: `1px solid ${DOCS.border}`,
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <ArticleIcon size={16} color={DOCS.accent} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: DOCS.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {result.title}
                  </Typography>
                  {result.excerpt && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: DOCS.textMuted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {result.excerpt}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={result.category}
                  size="small"
                  sx={{
                    fontSize: "0.65rem",
                    height: 20,
                    color: DOCS.textMuted,
                    bgcolor: DOCS.accentSoftBg,
                    border: `1px solid ${DOCS.border}`,
                  }}
                />
              </Box>
            ))}
          </Paper>
        )}
      </Box>
    );
  },
);

DocSearch.displayName = "DocSearch";

export default DocSearch;
