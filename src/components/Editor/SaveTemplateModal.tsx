/**
 * SaveTemplateModal — Step 9.3.4
 *
 * Modal for saving a configured block as a reusable template.
 *
 * Features:
 * - DashboardInput for template name (required, max 50 chars)
 * - Textarea for optional description (max 500 chars)
 * - Save / Cancel buttons
 * - Loading spinner during API call
 * - Error alert on failure
 * - Calls POST /api/blocks/templates
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo on SaveTemplateModal
 * - useCallback on handlers
 */

import React, { useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5001/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  blockType: string;
  blockContent: Record<string, unknown>;
  variant?: string;
  onSaveSuccess: (template: {
    id: number;
    name: string;
    blockType: string;
  }) => void;
}

// ---------------------------------------------------------------------------
// SaveTemplateModal
// ---------------------------------------------------------------------------

const SaveTemplateModal = React.memo<SaveTemplateModalProps>(
  function SaveTemplateModal({
    open,
    onClose,
    blockType,
    blockContent,
    variant,
    onSaveSuccess,
  }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value.slice(0, 50));
        setError(null);
      },
      [],
    );

    const handleDescriptionChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value.slice(0, 500));
      },
      [],
    );

    const handleSave = useCallback(async () => {
      if (!name.trim()) {
        setError("Template name is required.");
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const token =
          typeof localStorage !== "undefined"
            ? localStorage.getItem("token")
            : null;
        const res = await fetch(`${API_URL}/blocks/templates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            blockType,
            variant: variant || undefined,
            content: blockContent,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        onSaveSuccess(data.data);
        setName("");
        setDescription("");
        onClose();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save template. Please try again.",
        );
      } finally {
        setSaving(false);
      }
    }, [
      name,
      description,
      blockType,
      variant,
      blockContent,
      onSaveSuccess,
      onClose,
    ]);

    const handleClose = useCallback(() => {
      if (!saving) {
        setName("");
        setDescription("");
        setError(null);
        onClose();
      }
    }, [saving, onClose]);

    const isValid = name.trim().length > 0;

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="save-template-dialog-title"
      >
        <DialogTitle id="save-template-dialog-title">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Save as Template
            <Chip
              label={blockType}
              size="small"
              color="primary"
              sx={{ fontSize: "0.7rem" }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            label="Template Name"
            id="template-name"
            inputProps={{ "aria-label": "Template name", maxLength: 50 }}
            fullWidth
            value={name}
            onChange={handleNameChange}
            disabled={saving}
            required
            error={error !== null && !name.trim()}
            helperText={`${name.length}/50 characters`}
            sx={{ mb: 2, mt: 1 }}
            size="small"
          />

          <TextField
            label="Description"
            id="template-description"
            inputProps={{ "aria-label": "Description", maxLength: 500 }}
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            value={description}
            onChange={handleDescriptionChange}
            disabled={saving}
            helperText={`${description.length}/500 characters (optional)`}
            size="small"
          />

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 1, display: "block" }}
          >
            This template will appear in the "My Templates" tab of the block
            library.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={saving} aria-label="Cancel">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isValid || saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            aria-label="Save template"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);

SaveTemplateModal.displayName = "SaveTemplateModal";

export default SaveTemplateModal;
