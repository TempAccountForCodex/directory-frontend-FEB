import { useEffect, useState } from "react";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";

const COMPANY_TEMPLATE_IDS = new Set([
  "company",
  "company-premium",
  "company-executive",
  "company-pro",
  "education-pro",
]);
const THEME_EDITOR_FONT = '"Poppins", "Inter", sans-serif';

const COMPANY_PALETTES = [
  {
    id: "executive-teal",
    name: "Executive Teal",
    primary: "#1d5f5f",
    secondary: "#3aa7a7",
    swatches: ["#f4efe2", "#1d5f5f", "#3aa7a7", "#101514"],
  },
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    primary: "#234569",
    secondary: "#7aa7d9",
    swatches: ["#f5f7fb", "#234569", "#7aa7d9", "#11151b"],
  },
  {
    id: "boardroom",
    name: "Boardroom",
    primary: "#303743",
    secondary: "#9ca3af",
    swatches: ["#f7f7f7", "#303743", "#9ca3af", "#16191f"],
  },
  {
    id: "modern-green",
    name: "Modern Green",
    primary: "#275f54",
    secondary: "#86b4a2",
    swatches: ["#f4f8f6", "#275f54", "#86b4a2", "#131918"],
  },
  {
    id: "executive-plum",
    name: "Executive Plum",
    primary: "#5f3577",
    secondary: "#a47dc6",
    swatches: ["#faf7fc", "#5f3577", "#a47dc6", "#1f1825"],
  },
  {
    id: "oxblood",
    name: "Oxblood",
    primary: "#7e3941",
    secondary: "#c58a93",
    swatches: ["#fbf8f8", "#7e3941", "#c58a93", "#22191b"],
  },
  {
    id: "bronze",
    name: "Bronze",
    primary: "#7c5836",
    secondary: "#cb9763",
    swatches: ["#fbf9f6", "#7c5836", "#cb9763", "#1d1714"],
  },
  {
    id: "slate-blue",
    name: "Slate Blue",
    primary: "#415a77",
    secondary: "#88a3c4",
    swatches: ["#f5f8fc", "#415a77", "#88a3c4", "#1a2027"],
  },
  {
    id: "graphite-mint",
    name: "Graphite Mint",
    primary: "#2e4344",
    secondary: "#7db1ab",
    swatches: ["#f8fbfa", "#2e4344", "#7db1ab", "#101617"],
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    primary: "#3b4e9e",
    secondary: "#8c97db",
    swatches: ["#f6f7fc", "#3b4e9e", "#8c97db", "#1a1c31"],
  },
];

const COMPANY_FONT_PACKS = [
  {
    id: "dm-sans",
    name: "Modern Sans",
    headingFont: '"DM Sans", "Inter", sans-serif',
    bodyFont: '"Inter", "Segoe UI", sans-serif',
  },
  {
    id: "questrial",
    name: "Minimal Grotesk",
    headingFont: '"Questrial", "Inter", sans-serif',
    bodyFont: '"Inter", "Segoe UI", sans-serif',
  },
  {
    id: "kanit",
    name: "Tech Sans",
    headingFont: '"Kanit", "Inter", sans-serif',
    bodyFont: '"DM Sans", "Inter", sans-serif',
  },
  {
    id: "montserrat-dm",
    name: "Corporate Sharp",
    headingFont: '"Montserrat", "Inter", sans-serif',
    bodyFont: '"DM Sans", "Inter", sans-serif',
  },
  {
    id: "poppins-dm",
    name: "Soft Corporate",
    headingFont: '"Poppins", "Inter", sans-serif',
    bodyFont: '"DM Sans", "Inter", sans-serif',
  },
  {
    id: "jakarta-mono",
    name: "Modern Contrast",
    headingFont: '"Plus Jakarta Sans", "Inter", sans-serif',
    bodyFont: '"Space Mono", monospace',
  },
  {
    id: "playfair-inter",
    name: "Editorial Serif",
    headingFont: '"Playfair Display", "Times New Roman", serif',
    bodyFont: '"Inter", "Segoe UI", sans-serif',
  },
  {
    id: "lora-source",
    name: "Classic Story",
    headingFont: '"Lora", Georgia, serif',
    bodyFont: '"Source Sans 3", "Segoe UI", sans-serif',
  },
  {
    id: "oswald-open",
    name: "Bold Campaign",
    headingFont: '"Oswald", "Arial Narrow", sans-serif',
    bodyFont: '"Open Sans", "Segoe UI", sans-serif',
  },
  {
    id: "manrope-inter",
    name: "Clean Modern",
    headingFont: '"Manrope", "Inter", sans-serif',
    bodyFont: '"Inter", "Segoe UI", sans-serif',
  },
  {
    id: "merriweather-lato",
    name: "Professional Serif",
    headingFont: '"Merriweather", Georgia, serif',
    bodyFont: '"Lato", "Segoe UI", sans-serif',
  },
  {
    id: "archivo-work",
    name: "Agency Grid",
    headingFont: '"Archivo", "Inter", sans-serif',
    bodyFont: '"Work Sans", "Segoe UI", sans-serif',
  },
];

const FONT_PACKS_PAGE_SIZE = 4;
const FONT_PACK_PREVIEW_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Questrial&family=Kanit:wght@400;500;700&family=Montserrat:wght@400;500;700&family=Poppins:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=Source+Sans+3:wght@400;600;700&family=Oswald:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Manrope:wght@400;500;700&family=Merriweather:wght@400;700&family=Lato:wght@400;700&family=Archivo:wght@400;500;700&family=Work+Sans:wght@400;500;700&display=swap";

export const supportsTemplateThemeCustomization = (templateId) =>
  COMPANY_TEMPLATE_IDS.has(templateId || "");

export const getTemplateThemeSettings = (selection) => {
  const { palette, fontPack } = resolveTemplateThemeSelection(selection);

  return {
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    headingFont: fontPack.headingFont,
    bodyFont: fontPack.bodyFont,
    paletteId: palette.id,
    fontPackId: fontPack.id,
  };
};

export const getDefaultTemplateThemeSelection = (templateId, website) => {
  if (!supportsTemplateThemeCustomization(templateId)) {
    return null;
  }

  const savedThemeSettings =
    website?.templateThemeSettings ||
    website?.templateSnapshot?.themeSettings ||
    {};
  const matchedPalette = COMPANY_PALETTES.find(
    (palette) =>
      palette.id === savedThemeSettings.paletteId ||
      palette.primary === savedThemeSettings.primaryColor ||
      palette.primary === website?.primaryColor,
  );
  const matchedFontPack = COMPANY_FONT_PACKS.find(
    (fontPack) =>
      fontPack.id === savedThemeSettings.fontPackId ||
      (fontPack.headingFont === savedThemeSettings.headingFont &&
        fontPack.bodyFont === savedThemeSettings.bodyFont),
  );

  return {
    paletteId: matchedPalette?.id || COMPANY_PALETTES[0].id,
    fontPackId: matchedFontPack?.id || COMPANY_FONT_PACKS[0].id,
  };
};

export const resolveTemplateThemeSelection = (selection) => {
  const palette =
    COMPANY_PALETTES.find((item) => item.id === selection?.paletteId) ||
    COMPANY_PALETTES[0];
  const fontPack =
    COMPANY_FONT_PACKS.find((item) => item.id === selection?.fontPackId) ||
    COMPANY_FONT_PACKS[0];

  return { palette, fontPack };
};

const cardButtonSx = (selected) => ({
  fontFamily: THEME_EDITOR_FONT,
  border: selected ? "1px solid #111827" : "1px solid #e5e7eb",
  bgcolor: selected ? "rgba(17,24,39,0.04)" : "#fff",
  borderRadius: "16px",
  p: 1.05,
  cursor: "pointer",
  textAlign: "left",
  transition: "all 180ms ease",
  boxShadow: selected ? "0 10px 24px rgba(15,23,42,0.08)" : "none",
  "&:hover": {
    transform: "translateY(-1px)",
    borderColor: "rgba(17,24,39,0.3)",
  },
});

const FrontendTemplateThemePanel = ({ templateId, selection, onChange }) => {
  const [visibleFontPackCount, setVisibleFontPackCount] =
    useState(FONT_PACKS_PAGE_SIZE);

  useEffect(() => {
    const linkId = "frontend-template-theme-font-pack-previews";
    let link = document.getElementById(linkId);

    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = FONT_PACK_PREVIEW_STYLESHEET;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    setVisibleFontPackCount(FONT_PACKS_PAGE_SIZE);
  }, [templateId]);

  if (!supportsTemplateThemeCustomization(templateId)) {
    return (
      <Box
        sx={{
          fontFamily: THEME_EDITOR_FONT,
          p: 1.75,
          borderRadius: 3,
          border: "1px solid rgba(15,23,42,0.08)",
          bgcolor: "rgba(255,255,255,0.72)",
        }}
      >
        <Typography
          sx={{
            fontFamily: THEME_EDITOR_FONT,
            fontWeight: 800,
            color: "#111827",
            mb: 0.4,
          }}
        >
          Theme controls unavailable
        </Typography>
        <Typography
          sx={{
            fontFamily: THEME_EDITOR_FONT,
            color: "#64748b",
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          Palette and font packs are currently wired for the company template
          family.
        </Typography>
      </Box>
    );
  }

  const { palette, fontPack } = resolveTemplateThemeSelection(selection);
  const visibleFontPacks = COMPANY_FONT_PACKS.slice(0, visibleFontPackCount);
  const hasMoreFontPacks = visibleFontPackCount < COMPANY_FONT_PACKS.length;

  return (
    <Box>
      <Box
        sx={{
          fontFamily: THEME_EDITOR_FONT,
          p: 1.5,
          borderRadius: "18px",
          bgcolor: "rgba(248,250,252,0.9)",
          border: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Typography
          sx={{
            fontFamily: THEME_EDITOR_FONT,
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#64748b",
            mb: 0.8,
          }}
        >
          Current selection
        </Typography>
        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
          <Chip
            label={palette.name}
            size="small"
            sx={{
              bgcolor: "#fff",
              border: "1px solid rgba(15,23,42,0.08)",
              color: "#111827",
              fontWeight: 600,
              fontFamily: THEME_EDITOR_FONT,
              "& .MuiChip-label": { fontFamily: THEME_EDITOR_FONT },
            }}
          />
          <Chip
            label={fontPack.name}
            size="small"
            sx={{
              bgcolor: "#fff",
              border: "1px solid rgba(15,23,42,0.08)",
              color: "#111827",
              fontWeight: 600,
              fontFamily: THEME_EDITOR_FONT,
              "& .MuiChip-label": { fontFamily: THEME_EDITOR_FONT },
            }}
          />
        </Stack>
      </Box>

      <Box
        sx={{
          fontFamily: THEME_EDITOR_FONT,
          mt: 2,
          p: 1.5,
          borderRadius: "20px",
          bgcolor: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Typography
          sx={{
            fontFamily: THEME_EDITOR_FONT,
            fontWeight: 800,
            color: "#111827",
            mb: 0.3,
          }}
        >
          Color palettes
        </Typography>
        <Typography
          sx={{
            fontFamily: THEME_EDITOR_FONT,
            color: "#64748b",
            fontSize: "0.85rem",
            mb: 1.2,
          }}
        >
          Pick the tone for accents, dark sections, and tinted surfaces.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1.1,
          }}
        >
          {COMPANY_PALETTES.map((item) => (
            <Box
              key={item.id}
              component="button"
              type="button"
              onClick={() => onChange({ ...selection, paletteId: item.id })}
              sx={cardButtonSx(palette.id === item.id)}
            >
              <Stack direction="row" spacing={0.6} sx={{ mb: 0.8 }}>
                {item.swatches.map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "8px",
                      bgcolor: color,
                      border: "1px solid rgba(15,23,42,0.08)",
                    }}
                  />
                ))}
              </Stack>
              <Typography
                sx={{
                  fontFamily: THEME_EDITOR_FONT,
                  fontSize: "0.82rem",
                  color: "#334155",
                  fontWeight: palette.id === item.id ? 700 : 500,
                }}
              >
                {item.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          fontFamily: THEME_EDITOR_FONT,
          mt: 2,
          p: 1.5,
          borderRadius: "20px",
          bgcolor: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Typography
          sx={{
            fontFamily: THEME_EDITOR_FONT,
            fontWeight: 800,
            color: "#111827",
            mb: 0.3,
          }}
        >
          Font packs
        </Typography>
        <Typography
          sx={{
            fontFamily: THEME_EDITOR_FONT,
            color: "#64748b",
            fontSize: "0.85rem",
            mb: 1.2,
          }}
        >
          Switch the tone between sharp, editorial, and modern styles.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1.1,
          }}
        >
          {visibleFontPacks.map((item) => (
            <Box
              key={item.id}
              component="button"
              type="button"
              onClick={() => onChange({ ...selection, fontPackId: item.id })}
              sx={{
                ...cardButtonSx(fontPack.id === item.id),
                minHeight: 96,
                p: 1.1,
                "--font-pack-heading": item.headingFont,
                "--font-pack-body": item.bodyFont,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-pack-heading) !important",
                  fontWeight: "400 !important",
                  fontSize: "1.2rem",
                  lineHeight: 1,
                  color: "#111827",
                }}
              >
                Heading
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-pack-body) !important",
                  fontWeight: "400 !important",
                  mt: 0.45,
                  color: "#475569",
                  fontSize: "0.82rem",
                }}
              >
                Paragraph text
              </Typography>
            </Box>
          ))}
        </Box>
        {hasMoreFontPacks && (
          <Box sx={{ mt: 1.35, display: "flex", justifyContent: "center" }}>
            <Button
              type="button"
              onClick={() =>
                setVisibleFontPackCount((count) =>
                  Math.min(
                    count + FONT_PACKS_PAGE_SIZE,
                    COMPANY_FONT_PACKS.length,
                  ),
                )
              }
              sx={{
                fontFamily: THEME_EDITOR_FONT,
                textTransform: "none",
                color: "#111827",
                borderRadius: "999px",
                px: 2,
                py: 0.75,
                border: "1px solid rgba(15,23,42,0.12)",
                bgcolor: "#fff",
              }}
            >
              Load more
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />
    </Box>
  );
};

export default FrontendTemplateThemePanel;
