import React from "react";
import { Select, MenuItem, FormControl, Box } from "@mui/material";
import { useI18nContext } from "../hooks/useI18n";
import { languageInfo } from "../i18n/translations";
import LanguageIcon from "@mui/icons-material/Language";

interface LanguageSelectorProps {
  variant?: "standard" | "outlined" | "filled";
  size?: "small" | "medium";
  showIcon?: boolean;
}

/**
 * Language Selector Component
 * Dropdown to select and switch between available languages
 *
 * @example
 * ```tsx
 * <LanguageSelector variant="outlined" size="small" showIcon />
 * ```
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = "standard",
  size = "small",
  showIcon = true,
}) => {
  const { language, setLanguage, languages } = useI18nContext();

  return (
    <FormControl variant={variant} size={size}>
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        startAdornment={
          showIcon ? (
            <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
              <LanguageIcon fontSize="small" />
            </Box>
          ) : undefined
        }
        sx={{
          minWidth: 120,
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            gap: 1,
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem key={lang} value={lang}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Box component="span" sx={{ fontSize: "0.875rem" }}>
                {languageInfo[lang].nativeName}
              </Box>
              <Box
                component="span"
                sx={{ fontSize: "0.75rem", color: "text.secondary" }}
              >
                {languageInfo[lang].name}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
