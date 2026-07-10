/**
 * CategorySelect — business/website category picker for the creation modal.
 *
 * Loads template-used + user-created categories from /api/website-categories,
 * and lets the user add a brand-new category inline (PRD "Category Selection").
 * Styled to match DashboardInput.
 */

import React, { useMemo, useState } from "react";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import { Plus } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { useWebsiteCategories } from "../../hooks/useWebsiteCategories";
import type { WebsiteCategory } from "../../api/websiteAI";

interface CategoryOption extends WebsiteCategory {
  /** Set on the synthetic "Add ..." option. */
  inputValue?: string;
}

const filter = createFilterOptions<CategoryOption>();

interface CategorySelectProps {
  value: string;
  onChange: (value: string, option: WebsiteCategory | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  error,
  helperText,
  disabled,
  required = false,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isLight = actualTheme === "light";
  const {
    categories,
    loading,
    error: categoryError,
    addCategory,
    adding,
  } = useWebsiteCategories();
  const [localError, setLocalError] = useState<string | null>(null);

  const options: CategoryOption[] = useMemo(
    () => categories.map((c) => ({ ...c })),
    [categories],
  );

  const selectedOption =
    options.find((o) => o.value === value || o.label === value) ||
    (value
      ? ({ value, label: value, source: "user" } as CategoryOption)
      : null);

  const palette = {
    fill: isLight ? "#ffffff" : alpha("#ffffff", 0.04),
    border: isLight ? alpha("#111827", 0.16) : alpha("#ffffff", 0.16),
    text: isLight ? "#111827" : colors.text,
    accent: colors.primary,
    danger: colors.error,
  };

  const handleChange = async (
    _e: React.SyntheticEvent,
    newValue: string | CategoryOption | null,
  ) => {
    setLocalError(null);
    if (newValue == null) {
      onChange("", null);
      return;
    }
    // Free typed string (rare; Enter on freeSolo)
    if (typeof newValue === "string") {
      const created = await addCategory(newValue);
      if (created) onChange(created.value, created);
      else {
        onChange(newValue, {
          value: newValue,
          label: newValue,
          source: "user",
        });
        setLocalError(
          categoryError ||
            "This category will be used for the website but could not be added to the shared list.",
        );
      }
      return;
    }
    // "Add new" synthetic option
    if (newValue.inputValue) {
      const created = await addCategory(newValue.inputValue);
      if (created) {
        onChange(created.value, created);
      } else {
        onChange(newValue.inputValue, {
          value: newValue.inputValue,
          label: newValue.inputValue,
          source: "user",
        });
        setLocalError(
          categoryError ||
            "This category will be used for the website but could not be added to the shared list.",
        );
      }
      return;
    }
    onChange(newValue.value, newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Typography
        component="label"
        sx={{
          color: palette.text,
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        Business / Website Category
        {required && (
          <Box component="span" sx={{ color: "#ff6b6b", ml: 0.5 }}>
            *
          </Box>
        )}
      </Typography>
      <Autocomplete<CategoryOption, false, false, true>
        value={selectedOption}
        onChange={handleChange}
        disabled={disabled || adding}
        loading={loading}
        options={options}
        freeSolo
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        componentsProps={{
          paper: {
            sx: {
              mt: 0.75,
              bgcolor: isLight ? "#ffffff" : "#142021",
              backgroundImage: "none",
              border: `1px solid ${palette.border}`,
              borderRadius: "10px",
              color: palette.text,
              "& .MuiAutocomplete-option": {
                minHeight: 40,
                fontSize: "0.92rem",
                "&:hover": { bgcolor: alpha(palette.accent, 0.16) },
                '&[aria-selected="true"]': {
                  bgcolor: alpha(palette.accent, 0.22),
                },
              },
            },
          },
        }}
        groupBy={(o) => (o.source === "user" ? "Your categories" : "Templates")}
        getOptionLabel={(option) =>
          typeof option === "string"
            ? option
            : option.inputValue || option.label
        }
        isOptionEqualToValue={(o, v) => o.value === v.value}
        filterOptions={(opts, params) => {
          const filtered = filter(opts, params);
          const input = params.inputValue.trim();
          const exists = opts.some(
            (o) => o.label.toLowerCase() === input.toLowerCase(),
          );
          if (input !== "" && !exists) {
            filtered.push({
              value: `__add__${input}`,
              label: `Add "${input}"`,
              source: "user",
              inputValue: input,
            });
          }
          return filtered;
        }}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            key={option.value}
            sx={{ display: "flex", gap: 1, alignItems: "center" }}
          >
            {option.inputValue ? (
              <>
                <Plus size={15} color={palette.accent} />
                <span style={{ color: palette.accent }}>{option.label}</span>
              </>
            ) : (
              <>
                <span>{option.label}</span>
                {option.source === "template" && (
                  <Chip
                    label="template"
                    size="small"
                    sx={{
                      ml: "auto",
                      height: 18,
                      fontSize: "0.65rem",
                      bgcolor: alpha(palette.accent, 0.12),
                      color: palette.accent,
                    }}
                  />
                )}
              </>
            )}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Select or type a category"
            error={error || !!localError}
            helperText={localError || helperText}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {(loading || adding) && (
                    <CircularProgress
                      size={16}
                      sx={{ color: palette.accent }}
                    />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: palette.fill,
                borderRadius: "10px",
                color: palette.text,
                "& fieldset": { borderColor: palette.border },
                "&:hover fieldset": { borderColor: palette.accent },
                "&.Mui-focused fieldset": { borderColor: palette.accent },
                "&.Mui-error fieldset": { borderColor: palette.danger },
              },
              "& .MuiFormHelperText-root": {
                marginLeft: 0,
                color:
                  error || localError ? palette.danger : colors.textSecondary,
              },
            }}
          />
        )}
      />
    </Box>
  );
};

export default CategorySelect;
