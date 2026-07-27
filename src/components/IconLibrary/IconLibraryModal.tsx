import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import {
  ICON_LIBRARY_CATEGORIES,
  filterIconCatalog,
  type IconCategoryId,
} from "./iconCatalog";
import {
  parseIconValue,
  resolveLucideIcon,
  serializeIconValue,
} from "./iconValue";

export type IconLibraryModalProps = {
  open: boolean;
  onClose: () => void;
  onInsert: (iconValue: string) => void;
  initialValue?: unknown;
};

/** Always white — same in light and dark app themes. */
const surface = "#ffffff";
const panel = "#ffffff";
const sidebar = "#f8fafc";
const tile = "#ffffff";
const input = "#ffffff";
const border = "rgba(15,23,42,0.12)";
const borderHover = "rgba(15,23,42,0.28)";
const text = "#0f172a";
const textMuted = "rgba(15,23,42,0.55)";
const accent = "#378C92";
const activeBg = "rgba(55,140,146,0.1)";
const selectedBg = "rgba(55,140,146,0.12)";
const hoverBg = "rgba(15,23,42,0.04)";

const MODAL_HEIGHT = { xs: "85vh", md: 620 } as const;

export const IconLibraryModal: React.FC<IconLibraryModalProps> = ({
  open,
  onClose,
  onInsert,
  initialValue,
}) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategoryId>("all");
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCategory("all");
    setSelectedName(parseIconValue(initialValue)?.name || "");
  }, [open, initialValue]);

  const icons = useMemo(
    () => filterIconCatalog(query, category),
    [query, category],
  );

  const activeCategoryLabel =
    ICON_LIBRARY_CATEGORIES.find((item) => item.id === category)?.label ||
    "All Icons";

  const handleInsert = () => {
    if (!selectedName) return;
    onInsert(serializeIconValue({ library: "lucide", name: selectedName }));
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: surface,
          color: text,
          borderRadius: 2.5,
          border: `1px solid ${border}`,
          overflow: "hidden",
          height: MODAL_HEIGHT,
          maxHeight: MODAL_HEIGHT,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.25,
          py: 1.5,
          borderBottom: `1px solid ${border}`,
          bgcolor: sidebar,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            letterSpacing: "0.12em",
            fontSize: "0.82rem",
            color: text,
          }}
        >
          ICON LIBRARY
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: textMuted,
            "&:hover": { color: text, bgcolor: hoverBg },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: 0,
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: { xs: 128, sm: 180 },
            flexShrink: 0,
            bgcolor: sidebar,
            borderRight: `1px solid ${border}`,
            py: 1,
            overflowY: "auto",
          }}
        >
          {ICON_LIBRARY_CATEGORIES.map((item) => {
            const active = item.id === category;
            return (
              <Box
                key={item.id}
                component="button"
                type="button"
                onClick={() => setCategory(item.id)}
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  border: 0,
                  borderLeft: active
                    ? `2px solid ${accent}`
                    : "2px solid transparent",
                  bgcolor: active ? activeBg : "transparent",
                  color: active ? text : textMuted,
                  px: 1.5,
                  py: 1.1,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  "&:hover": {
                    bgcolor: hoverBg,
                    color: text,
                  },
                }}
              >
                {item.id === "all" ? (
                  <FilterListIcon sx={{ fontSize: 16 }} />
                ) : (
                  <FlagOutlinedIcon sx={{ fontSize: 16 }} />
                )}
                {item.label}
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            bgcolor: panel,
          }}
        >
          <Box sx={{ flex: "0 0 auto", px: 2, pt: 2, pb: 1.25 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filter by name..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: textMuted, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: input,
                  color: text,
                  borderRadius: 2,
                  "& fieldset": { borderColor: border },
                  "&:hover fieldset": { borderColor: borderHover },
                  "&.Mui-focused fieldset": { borderColor: accent },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: textMuted,
                  opacity: 1,
                },
              }}
            />
            <Typography
              sx={{
                mt: 1.5,
                fontWeight: 600,
                fontSize: "0.92rem",
                color: text,
              }}
            >
              {activeCategoryLabel}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: "1 1 auto",
              minHeight: 0,
              overflowY: "auto",
              px: 2,
              pb: 2,
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(3, 1fr)",
                sm: "repeat(4, 1fr)",
                md: "repeat(5, 1fr)",
              },
              gap: 1,
              alignContent: "start",
            }}
          >
            {icons.map((entry) => {
              const Icon = resolveLucideIcon(entry.name);
              const selected = selectedName === entry.name;
              return (
                <Box
                  key={entry.name}
                  component="button"
                  type="button"
                  onClick={() => setSelectedName(entry.name)}
                  onDoubleClick={() => {
                    setSelectedName(entry.name);
                    onInsert(
                      serializeIconValue({
                        library: "lucide",
                        name: entry.name,
                      }),
                    );
                    onClose();
                  }}
                  sx={{
                    border: selected
                      ? `1px solid ${accent}`
                      : `1px solid ${border}`,
                    bgcolor: selected ? selectedBg : tile,
                    color: text,
                    borderRadius: 2,
                    minHeight: 84,
                    px: 1,
                    py: 1.2,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.8,
                    boxShadow: selected ? `0 0 0 1px ${accent}` : "none",
                    "&:hover": {
                      borderColor: borderHover,
                      bgcolor: hoverBg,
                    },
                  }}
                >
                  <Icon size={22} />
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      color: textMuted,
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.label}
                  </Typography>
                </Box>
              );
            })}
            {icons.length === 0 ? (
              <Typography
                sx={{ color: textMuted, gridColumn: "1 / -1", py: 4 }}
              >
                No icons match your search.
              </Typography>
            ) : null}
          </Box>
        </Box>
      </DialogContent>

      <Box
        sx={{
          flex: "0 0 auto",
          px: 2.25,
          py: 1.5,
          borderTop: `1px solid ${border}`,
          bgcolor: sidebar,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            minHeight: 40,
            px: 2,
            color: textMuted,
            "&:hover": { color: text, bgcolor: hoverBg },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleInsert}
          disabled={!selectedName}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            minHeight: 40,
            minWidth: 110,
            px: 2.5,
            fontWeight: 700,
            background: "linear-gradient(135deg, #111827 0%, #020617 100%)",
            color: "#ffffff",
            boxShadow: "none",
            border: `1px solid ${border}`,
            "&:hover": {
              background: "linear-gradient(135deg, #0f172a 0%, #000000 100%)",
              boxShadow: "none",
            },
            "&.Mui-disabled": {
              background: "#e5e7eb",
              color: "rgba(15,23,42,0.38)",
              borderColor: border,
            },
          }}
        >
          Insert
        </Button>
      </Box>
    </Dialog>
  );
};

export default IconLibraryModal;
