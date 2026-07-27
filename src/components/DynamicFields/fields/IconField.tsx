/**
 * IconField — DynamicFields ICON type.
 * Opens Icon Library modal; persists lucide:<name> strings.
 */
import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import type { FieldRendererProps } from "../types";
import { FieldType } from "../types";
import { registerFieldComponent } from "../registry";
import IconLibraryModal from "../../IconLibrary/IconLibraryModal";
import {
  getIconLabel,
  parseIconValue,
  renderSavedIcon,
  serializeIconValue,
} from "../../IconLibrary/iconValue";

const IconField: React.FC<FieldRendererProps> = React.memo(
  ({ field, value, onChange, disabled = false, errors = [] }) => {
    const [open, setOpen] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const parsed = parseIconValue(localValue);
    const label = getIconLabel(localValue) || "No icon selected";
    const hasErrors = errors.length > 0;

    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 1.25,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: hasErrors ? "error.main" : "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.hover",
              color: "text.primary",
              flexShrink: 0,
            }}
          >
            {renderSavedIcon({ value: localValue, size: 18 })}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, lineHeight: 1.2 }}
              noWrap
            >
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {parsed ? serializeIconValue(parsed) : "Choose an icon"}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            disabled={disabled}
            onClick={() => setOpen(true)}
            sx={{ textTransform: "none", flexShrink: 0 }}
          >
            Choose Icon
          </Button>
        </Box>
        {hasErrors ? (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
            {errors[0]}
          </Typography>
        ) : null}

        <IconLibraryModal
          open={open}
          initialValue={localValue}
          onClose={() => setOpen(false)}
          onInsert={(next) => {
            setLocalValue(next);
            onChange(next);
          }}
        />
      </Box>
    );
  },
);

IconField.displayName = "IconField";

registerFieldComponent(FieldType.ICON, IconField);

export default IconField;
