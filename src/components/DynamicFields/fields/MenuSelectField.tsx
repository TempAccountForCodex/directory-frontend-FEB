import React, { useEffect, useState } from "react";
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
} from "@mui/material";
import { apiClient } from "../../../api/client";
import type { FieldRendererProps } from "../types";
import { registerFieldComponent } from "../registry";
import { FieldType } from "../types";

interface MenuOption {
  id: string | number;
  name: string;
  handle?: string;
}

const MenuSelectField: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled,
  allValues,
}) => {
  const websiteId = allValues?._websiteId as string | number | undefined;

  const [menus, setMenus] = useState<MenuOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!websiteId) return;
    let cancelled = false;
    setLoading(true);
    apiClient
      .get(`/websites/${websiteId}/menus`)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        setMenus(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {
        if (!cancelled) setMenus([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  const currentVal = (value as string) ?? "";

  return (
    <Box sx={{ mt: 0.5 }}>
      <FormControl fullWidth size="small" disabled={disabled || loading}>
        <InputLabel
          shrink
          sx={{ fontSize: "0.78rem", fontWeight: 600, color: "text.secondary" }}
        >
          {field.label}
        </InputLabel>
        <Select
          value={currentVal}
          onChange={(e) => onChange(e.target.value)}
          label={field.label}
          displayEmpty
          renderValue={(val) => {
            if (!val) {
              return (
                <Typography sx={{ color: "text.disabled", fontSize: "0.88rem" }}>
                  {loading ? "Loading menus…" : "Select a menu"}
                </Typography>
              );
            }
            const found = menus.find(
              (m) => String(m.id) === String(val) || m.handle === val,
            );
            return found?.name ?? String(val);
          }}
          sx={{
            fontSize: "0.88rem",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": { borderRadius: 2 },
          }}
          endAdornment={
            loading ? (
              <CircularProgress size={14} sx={{ mr: 3 }} />
            ) : undefined
          }
        >
          <MenuItem value="">
            <Typography sx={{ color: "text.disabled", fontSize: "0.88rem" }}>
              — None —
            </Typography>
          </MenuItem>
          {menus.map((menu) => (
            <MenuItem key={menu.id} value={String(menu.id)}>
              {menu.name}
              {menu.handle && (
                <Typography
                  component="span"
                  sx={{ ml: 1, fontSize: "0.75rem", color: "text.secondary" }}
                >
                  ({menu.handle})
                </Typography>
              )}
            </MenuItem>
          ))}
          {!loading && menus.length === 0 && (
            <MenuItem disabled>
              <Typography sx={{ fontSize: "0.82rem", color: "text.disabled" }}>
                No menus yet — create one in the Menus tab
              </Typography>
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

MenuSelectField.displayName = "MenuSelectField";

// Self-register
registerFieldComponent(FieldType.MENU_SELECT, MenuSelectField);

export default MenuSelectField;
