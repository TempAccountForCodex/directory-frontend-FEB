/**
 * Step 2.3.1 — ImageUpload Component (fully wired)
 * Drag-and-drop image upload with instant data URL preview, upload progress,
 * error states, and self-registration as FieldType.IMAGE.
 *
 * States:
 * - Empty:    value=null, uploadProgress=undefined -> dropzone with upload icon
 * - Loading:  uploadProgress 0-100               -> dropzone + LinearProgress
 * - Success:  value non-null, no upload in flight -> image preview + remove button
 * - Error:    localError || error prop             -> Alert below current state
 *
 * ARIA:
 * - role="button" + aria-label on dropzone Box
 * - aria-label on remove IconButton
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents re-renders when parent re-renders with same props
 * - useCallback on onDrop to avoid re-creating dropzone on each render
 */
import React, { useState, useCallback, useId } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  FormHelperText,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDropzone } from "react-dropzone";
import type { FileRejection } from "react-dropzone";
import { useParams } from "react-router-dom";
import { apiClient } from "../../../api/client";
import { registerFieldComponent } from "../registry";
import { FieldType } from "../types";
import {
  getMediaLimitSummary,
  IMAGE_DROPZONE_ACCEPT,
  MEDIA_UPLOAD_LIMITS,
  validateWebsiteMediaUpload,
} from "../../../utils/mediaUploadLimits";

/* ------------------------------------------------------------------ */
/* Props interface                                                     */
/* ------------------------------------------------------------------ */

export interface ImageUploadProps {
  /** Current image URL (null = no image) */
  value: string | null;
  /** Callback when image changes — null means remove */
  onChange: (url: string | null) => void;
  /** Whether the field is non-interactive */
  disabled?: boolean;
  /** Maximum file size in bytes (default 5 MB) */
  maxSize?: number;
  /** Validation / upload error message from parent/form */
  error?: string;
  /** Validation error messages from FieldRendererProps (array) */
  errors?: string[];
  /** Field label for accessibility */
  label?: string;
  /** External loading state override */
  isLoading?: boolean;
}

/* ------------------------------------------------------------------ */
/* Default constants                                                   */
/* ------------------------------------------------------------------ */

const DEFAULT_MAX_SIZE = MEDIA_UPLOAD_LIMITS.imageMaxBytes;
const OPEN_MEDIA_LIBRARY_EVENT = "editor:open-media-library";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const ImageUpload: React.FC<ImageUploadProps> = React.memo(
  ({
    value,
    onChange,
    disabled = false,
    maxSize,
    error,
    errors = [],
    label,
    isLoading = false,
  }) => {
    const { websiteId } = useParams();
    const uid = useId();
    const errorId = `${uid}-error`;
    const [uploadProgress, setUploadProgress] = useState<number | undefined>(
      undefined,
    );
    const [localError, setLocalError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const hasErrors = errors.length > 0;

    const maxSizeBytes = maxSize ?? DEFAULT_MAX_SIZE;
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));

    const openMediaLibrary = useCallback(() => {
      if (disabled || isUploading || isLoading || typeof window === "undefined") {
        return;
      }

      window.dispatchEvent(
        new CustomEvent(OPEN_MEDIA_LIBRARY_EVENT, {
          detail: {
            label: label ?? "Image",
            value,
            onSelect: (nextUrl: string | null) => onChange(nextUrl),
          },
        }),
      );
    }, [disabled, isLoading, isUploading, label, onChange, value]);

    const onDrop = useCallback(
      async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        setLocalError(null);

        if (rejectedFiles.length > 0) {
          const rejection = rejectedFiles[0];
          if (rejection.errors[0]?.code === "file-too-large") {
            setLocalError(`File too large (max ${maxSizeMB}MB)`);
          } else if (rejection.errors[0]?.code === "file-invalid-type") {
            setLocalError(
              "Invalid file type. Use JPG, JPEG, PNG, WEBP, GIF, or SVG",
            );
          } else {
            setLocalError(
              "File rejected: " +
                (rejection.errors[0]?.message ?? "unknown error"),
            );
          }
          return;
        }

        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        const validation = await validateWebsiteMediaUpload({
          file,
          websiteId,
          allowedMediaType: "image",
        });
        if (!validation.ok) {
          setLocalError(validation.message);
          return;
        }

        // Show instant data URL preview before server upload completes
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onChange(e.target.result as string);
          }
        };
        reader.onerror = () => {
          setLocalError("Failed to read file — please try again");
        };
        reader.readAsDataURL(file);

        // Upload to server
        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("image", file);
        if (websiteId) {
          formData.append("websiteId", String(websiteId));
        }

        try {
          const response = await apiClient.post("/upload/image", formData, {
            onUploadProgress: (e) => {
              if (e.total) {
                setUploadProgress(Math.round((e.loaded * 100) / e.total));
              }
            },
          });
          onChange(response.data.url as string); // replace data URL with server URL
          setUploadProgress(undefined);
          setIsUploading(false);
        } catch (uploadError: any) {
          if (uploadError?.response?.data?.message) {
            setLocalError(uploadError.response.data.message);
          }
          setLocalError("Upload failed — please try again");
          if (uploadError?.response?.data?.message) {
            setLocalError(uploadError.response.data.message);
          }
          onChange(null); // clear temporary data URL
          setUploadProgress(undefined);
          setIsUploading(false);
        }
      },
      [maxSizeMB, onChange, websiteId],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: IMAGE_DROPZONE_ACCEPT,
      maxSize: maxSizeBytes,
      disabled: disabled || isUploading || isLoading,
      multiple: false,
      noClick: true,
    });

    const isUploadingState =
      uploadProgress !== undefined &&
      uploadProgress >= 0 &&
      uploadProgress <= 100;

    // Success state: has an image URL and no upload in progress
    const hasImage = value !== null && value !== "" && !isUploadingState;

    // Combined error (local takes precedence since it's more specific)
    const displayError = localError ?? error ?? null;

    const handleRemove = useCallback(() => {
      if (!disabled && !isUploading) {
        onChange(null);
        setLocalError(null);
      }
    }, [disabled, isUploading, onChange]);

    return (
      <Box sx={{ width: "100%" }}>
        {/* ----- Success state: image preview ----- */}
        {hasImage ? (
          <Box
            onClick={openMediaLibrary}
            sx={{
              position: "relative",
              width: "100%",
              borderRadius: 1,
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              cursor: disabled ? "default" : "pointer",
            }}
          >
            <Box
              component="img"
              src={value ?? ""}
              alt={label ?? "Uploaded image"}
              sx={{
                display: "block",
                width: "100%",
                maxHeight: 300,
                objectFit: "contain",
                bgcolor: "background.default",
              }}
            />
            <IconButton
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Remove image"
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": {
                  bgcolor: "error.light",
                  color: "error.contrastText",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          /* ----- Empty / Loading state: dropzone ----- */
          <Box
            {...getRootProps()}
            onClick={openMediaLibrary}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={label ? `Upload ${label}` : "Upload image"}
            aria-invalid={hasErrors || !!displayError || undefined}
            aria-describedby={hasErrors ? errorId : undefined}
            sx={{
              width: "100%",
              height: { xs: 120, sm: 170 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              border: "2px dashed",
              borderColor: isDragActive
                ? "primary.main"
                : displayError || hasErrors
                  ? "error.main"
                  : "divider",
              borderRadius: 1,
              bgcolor: isDragActive ? "action.hover" : "background.paper",
              cursor:
                disabled || isUploading || isLoading ? "default" : "pointer",
              transition: "border-color 0.2s ease, background-color 0.2s ease",
              opacity: disabled ? 0.5 : 1,
              "&:hover":
                disabled || isUploading || isLoading
                  ? {}
                  : {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
              "&:focus-visible": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: 2,
              },
            }}
          >
            <input {...getInputProps()} />

            <CloudUploadIcon sx={{ fontSize: 40, color: "text.primary" }} />
            <Typography
              variant="body2"
              sx={{ color: "text.primary", textAlign: "center", px: 2 }}
            >
              {isDragActive
                ? "Drop the image here"
                : "Drag & drop an image or click to choose"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.primary" }}>
              {getMediaLimitSummary("image")}
            </Typography>

            {/* ----- Loading state: progress bar ----- */}
            {isUploadingState && (
              <Box sx={{ width: "80%", mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ borderRadius: 1, height: 6 }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    mt: 0.5,
                    color: "text.secondary",
                  }}
                >
                  {Math.round(uploadProgress ?? 0)}%
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* ----- Error state: alert below ----- */}
        {displayError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {displayError}
          </Alert>
        )}

        {/* ----- Validation errors from FieldRendererProps ----- */}
        {hasErrors &&
          errors.map((err, i) => (
            <FormHelperText key={i} id={`${errorId}-${i}`} error>
              {err}
            </FormHelperText>
          ))}
      </Box>
    );
  },
);

ImageUpload.displayName = "ImageUpload";

/* ------------------------------------------------------------------ */
/* Self-registration                                                   */
/* ------------------------------------------------------------------ */

// Register this component for FieldType.IMAGE in the dynamic field registry.
// This runs once when this module is first imported (e.g. via fields/index.ts barrel).
// Pattern is consistent with TextField, TextArea, NumberInput self-registration.
registerFieldComponent(
  FieldType.IMAGE,
  ImageUpload as React.ComponentType<import("../types").FieldRendererProps>,
);

export { ImageUpload };
export default ImageUpload;
