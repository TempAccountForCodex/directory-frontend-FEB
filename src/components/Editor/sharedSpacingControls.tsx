import React from "react";
import { ButtonBase, Box, TextField, Typography } from "@mui/material";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

export const SPACING_OPTIONS = [
  "0px",
  "16px",
  "24px",
  "32px",
  "48px",
  "64px",
  "96px",
] as const;

export const SPACING_GROUPS = [
  {
    key: "padding",
    label: "Padding",
    fields: [
      ["paddingTop", "Top", ArrowUp],
      ["paddingBottom", "Bottom", ArrowDown],
      ["paddingLeft", "Left", ArrowLeft],
      ["paddingRight", "Right", ArrowRight],
    ],
  },
  {
    key: "margin",
    label: "Margin",
    fields: [
      ["marginTop", "Top", ArrowUp],
      ["marginBottom", "Bottom", ArrowDown],
      ["marginLeft", "Left", ArrowLeft],
      ["marginRight", "Right", ArrowRight],
    ],
  },
] as const;

export const normalizeSpacingValue = (value: string | number | undefined) => {
  if (!value) return "0px";
  const trimmed = String(value).trim();
  return /^\d+px$/i.test(trimmed) ? trimmed.toLowerCase() : "0px";
};

export const rawSpacingNumberValue = (value: string | number | undefined) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  return /^\d+px$/i.test(trimmed) ? trimmed.replace(/px$/i, "") : "";
};

type GenericSpacingStyle = Record<string, unknown>;

type SharedSpacingControlsProps<T extends GenericSpacingStyle> = {
  disabled?: boolean;
  value: T;
  onChange: (patch: Partial<T>) => void;
  groups?: typeof SPACING_GROUPS;
};

export function SharedSpacingControls<T extends GenericSpacingStyle>({
  disabled = false,
  value,
  onChange,
  groups = SPACING_GROUPS,
}: SharedSpacingControlsProps<T>) {
  const renderSpacingField = (
    styleKey: keyof T & string,
    label: string,
    Icon: React.ComponentType<{ size?: number; color?: string }>,
  ) => {
    const fieldValue = value[styleKey] as string | number | undefined;
    const resolvedSpacingValue = normalizeSpacingValue(fieldValue);

    return (
      <Box
        key={styleKey}
        sx={{
          p: 1,
          borderRadius: 2.5,
          border: "1px solid rgba(226,232,240,0.95)",
          backgroundColor: "#ffffff",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mb: 0.85 }}>
          <Icon size={13} color="#64748b" />
          <Typography
            sx={{
              fontSize: "0.76rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            flexWrap: "nowrap",
            gap: 0.75,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.45,
              flexWrap: "nowrap",
              minWidth: 0,
              flexShrink: 0,
            }}
          >
            {SPACING_OPTIONS.slice(0, 4).map((spacing) => {
              const active = resolvedSpacingValue === spacing;

              return (
                <ButtonBase
                  key={`${styleKey}-${spacing}`}
                  disabled={disabled}
                  onClick={() =>
                    onChange({ [styleKey]: spacing } as Partial<T>)
                  }
                  sx={{
                    minWidth: "28px !important",
                    height: 28,
                    px: 0.7,
                    flexShrink: 0,
                    borderRadius: 999,
                    border: active
                      ? "1px solid rgba(59,130,246,0.22)"
                      : "1px solid rgba(203,213,225,0.95)",
                    background: active ? "black" : "white",
                    color: active ? "#ffffff" : "#64748b",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {spacing.replace("px", "")}
                </ButtonBase>
              );
            })}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.55,
              ml: "0px",
              flexShrink: 0,
              width: "20%",
            }}
          >
            <TextField
              size="small"
              disabled={disabled}
              value={rawSpacingNumberValue(fieldValue)}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/[^\d]/g, "");
                onChange({
                  [styleKey]: nextValue ? `${nextValue}px` : "",
                } as Partial<T>);
              }}
              placeholder="0"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              sx={{
                width: 56,
                flexShrink: 0,
                "& .MuiOutlinedInput-root": {
                  height: 34,
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                },
                "& .MuiOutlinedInput-input": {
                  px: 1.2,
                  fontSize: "0.86rem",
                  fontWeight: 600,
                },
              }}
            />
            <Box
              sx={{
                minWidth: 34,
                height: 34,
                px: 0.8,
                borderRadius: 2,
                border: "1px solid rgba(226,232,240,0.95)",
                backgroundColor: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#64748b",
                }}
              >
                px
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {groups.map((group) => (
        <Box
          key={group.key}
          sx={{
            p: 1.1,
            borderRadius: 3,
            border: "1px solid rgba(148,163,184,0.16)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.88)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.86rem",
              fontWeight: 800,
              color: "#111827",
              mb: 1,
            }}
          >
            {group.label}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: 0.8,
            }}
          >
            {group.fields.map((field) => {
              const [styleKey, label, Icon] = field;
              return renderSpacingField(
                styleKey as keyof T & string,
                label,
                Icon,
              );
            })}
          </Box>
        </Box>
      ))}
    </>
  );
}
