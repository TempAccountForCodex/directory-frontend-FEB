/**
 * InlineTextEditor — Step 9.16.2
 *
 * A positioned contentEditable overlay that appears above the iframe
 * at the exact coordinates of the element being edited. Provides WYSIWYG
 * inline text editing for preview blocks.
 *
 * Save triggers: Enter (single-line), click-outside, Tab.
 * Cancel: Escape restores original value.
 * Disabled on mobile (viewport < 768px).
 *
 * Security: Sanitizes HTML tags from contentEditable output on save.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Portal from "@mui/material/Portal";
import Tooltip from "@mui/material/Tooltip";
import { AnimatePresence, motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InlineTextEditorProps {
  /** Whether the editor is open */
  open: boolean;
  /** Initial text value */
  initialValue: string;
  /** Content field path (e.g., 'heading', 'subtitle') */
  fieldPath: string;
  /** Edit type: single-line or multi-line */
  editType: "single" | "multi";
  /** Bounding rect of the target element relative to the iframe viewport */
  rect: { top: number; left: number; width: number; height: number };
  /** Called with the new text value on save */
  onSave: (value: string) => void;
  /** Called when editing is cancelled */
  onCancel: () => void;
  /** Reference to the iframe element for coordinate calculation */
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  /** Optional maximum character length for validation */
  maxLength?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Strip HTML tags from user content to prevent XSS on save */
function sanitizeText(html: string): string {
  // Use a temporary element to extract plain text safely
  if (typeof document !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  // Fallback: strip tags with regex (less safe, used in SSR context)
  return html.replace(/<[^>]*>/g, "");
}

/** Mobile detection: viewport width < 768px */
function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const InlineTextEditor = React.memo(function InlineTextEditor({
  open,
  initialValue,
  fieldPath,
  editType,
  rect,
  onSave,
  onCancel,
  iframeRef,
  maxLength,
}: InlineTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [hasValidationError, setHasValidationError] = useState(false);
  const initialValueRef = useRef(initialValue);
  const savedRef = useRef(false);
  const initializedRef = useRef(false);

  // Determine if we should render — all hooks called above this
  const isMobile = isMobileViewport();
  const shouldRender = open && !isMobile;

  // Calculate absolute position relative to the page
  const getAbsoluteRect = useCallback(() => {
    if (iframeRef.current) {
      const iframeRect = iframeRef.current.getBoundingClientRect();
      return {
        top: iframeRect.top + rect.top,
        left: iframeRect.left + rect.left,
        width: rect.width,
        height: rect.height,
      };
    }
    // Fallback: use rect as-is (parent container offset)
    return rect;
  }, [iframeRef, rect]);

  // Validate text length
  const validateText = useCallback(
    (text: string): boolean => {
      if (maxLength && text.length > maxLength) {
        setHasValidationError(true);
        return false;
      }
      setHasValidationError(false);
      return true;
    },
    [maxLength],
  );

  // Get current text from the editor
  const getCurrentText = useCallback((): string => {
    if (!editorRef.current) return initialValue || "";
    return sanitizeText(editorRef.current.innerHTML);
  }, [initialValue]);

  // Save handler — validates and calls onSave
  const handleSave = useCallback(() => {
    if (savedRef.current) return;
    const text = getCurrentText();
    if (maxLength && text.length > maxLength) {
      // Don't save invalid text
      return;
    }
    savedRef.current = true;
    onSave(text);
  }, [getCurrentText, maxLength, onSave]);

  // Cancel handler
  const handleCancel = useCallback(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    onCancel();
  }, [onCancel]);

  // Key handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
        return;
      }

      if (e.key === "Enter" && editType === "single") {
        e.preventDefault();
        handleSave();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        handleSave();
        return;
      }
    },
    [editType, handleSave, handleCancel],
  );

  // Input handler — validate on each change
  const handleInput = useCallback(() => {
    const text = getCurrentText();
    validateText(text);
  }, [getCurrentText, validateText]);

  // Click outside handler
  useEffect(() => {
    if (!shouldRender) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    // Use a small delay to avoid capturing the dblclick that opened us
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleMouseDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [shouldRender, handleSave]);

  // Auto-focus and select all text on mount — use ref callback for reliable DOM access
  const editorRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      editorRef.current = node;
      if (!node || !shouldRender) return;
      if (initializedRef.current) return;
      initializedRef.current = true;

      // Reset save guard
      savedRef.current = false;
      initialValueRef.current = initialValue;

      // Set initial content
      node.textContent = initialValue || "";

      // Focus and select all
      node.focus();

      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Validate initial value
      validateText(initialValue || "");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shouldRender, initialValue],
  );

  // Reset initialization flag when editor closes
  useEffect(() => {
    if (!shouldRender) {
      initializedRef.current = false;
    }
  }, [shouldRender]);

  // Early return AFTER all hooks
  if (!shouldRender) {
    return null;
  }

  const absRect = getAbsoluteRect();

  const editorContent = (
    <Tooltip
      open={hasValidationError}
      title={`Text exceeds maximum length${maxLength ? ` (${maxLength} characters)` : ""}`}
      placement="top"
      arrow
    >
      <Box
        ref={editorRefCallback}
        role="textbox"
        contentEditable
        suppressContentEditableWarning
        data-testid="inline-text-editor"
        data-field-path={fieldPath}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        sx={{
          position: "fixed",
          top: absRect.top,
          left: absRect.left,
          width: Math.max(absRect.width, 100),
          minHeight: Math.max(absRect.height, 24),
          padding: "2px 4px",
          margin: 0,
          backgroundColor: "rgba(255, 255, 255, 0.97)",
          border: hasValidationError
            ? "2px solid #d32f2f"
            : "2px solid #1976d2",
          borderRadius: "2px",
          outline: "none",
          zIndex: 9999,
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "inherit",
          color: "#111",
          whiteSpace: editType === "single" ? "nowrap" : "pre-wrap",
          overflow: editType === "single" ? "hidden" : "auto",
          maxHeight: editType === "multi" ? 200 : undefined,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          "&:focus": {
            borderColor: hasValidationError ? "#d32f2f" : "#1565c0",
          },
        }}
      />
    </Tooltip>
  );

  return (
    <Portal>
      <AnimatePresence>
        {shouldRender && (
          <motion.div
            key="inline-text-editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              zIndex: 9998,
            }}
          >
            {editorContent}
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
});

export default InlineTextEditor;
