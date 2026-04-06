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
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
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
          const resp = await axios.get(`${API_URL}/docs/search`, {
            params: { q: query },
          });
          const articles: SearchResult[] =
            resp.data?.articles ?? resp.data ?? [];
          const limited = articles.slice(0, MAX_RESULTS);
          setResults(limited);
          setOpen(true);
          setNoResults(limited.length === 0);
        } catch {
          setResults([]);
          setNoResults(true);
          setOpen(true);
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
                  <CircularProgress size={16} />
                ) : (
                  <SearchIcon size={18} />
                )}
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          }}
        />

        {open && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 1400,
              borderRadius: "10px",
              overflow: "hidden",
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            {noResults && (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
                  "&:hover": { bgcolor: "action.hover" },
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <ArticleIcon size={16} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
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
                        color: "text.secondary",
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
                  sx={{ fontSize: "0.65rem", height: 20 }}
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
