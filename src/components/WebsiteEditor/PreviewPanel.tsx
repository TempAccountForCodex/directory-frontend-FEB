/**
 * PreviewPanel — Steps 4.6.4 + 5.1.1 + 5.1.4 + 5.1.5
 *
 * Iframe-based preview panel for the website editor.
 * Supports two modes:
 * - Live: srcdoc-based, zero-network preview from editor state (default)
 * - Static: API URL-based iframe with token auth (fallback)
 *
 * Features: viewport toggle, zoom controls, rotation, device frame,
 * postMessage bridge, error handling with auto-fallback.
 */
import React from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Maximize2,
  Minimize2,
  RotateCw,
  ChevronDown,
} from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { usePreviewIframe } from "../../hooks/usePreviewApi";
import {
  PreviewImageError,
  PreviewNetworkError,
} from "../Templates/PreviewSkeleton";
import { usePreview } from "../../context/PreviewContext";
import { generateLivePreview } from "../../utils/previewInjector";
import TemplateEngine from "../../landingTemplates/templateEngine/TemplateEngine";
import muiTheme from "../../styles/theme";
import {
  buildFrontendTemplateBusinessData,
  hasFrontendTemplateBaseData,
} from "../../templates/frontendTemplateSiteData";
import type { BusinessData } from "../../landingTemplates/types/BusinessData";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Viewport = "desktop" | "tablet" | "mobile";
type PreviewMode = "live" | "static";
type ZoomLevel = 0.5 | 0.75 | 1;
type AskAIButtonStatus = "idle" | "open" | "loading" | "success" | "error";

const VIEWPORT_WIDTHS: Record<Viewport, number> = {
  desktop: 1920,
  tablet: 768,
  mobile: 375,
};

const VIEWPORT_HEIGHTS: Record<Viewport, number> = {
  desktop: 1080,
  tablet: 1024,
  mobile: 812,
};

const TIMEOUT_MS = 10_000;

const getNonce = (): string | undefined => {
  const value = document
    .querySelector('meta[name="csp-nonce"]')
    ?.getAttribute("content");
  return value && !value.startsWith("__") ? value : undefined;
};

const copyParentHeadStyles = (targetDocument: Document) => {
  const head = targetDocument.head;
  const marker = "data-preview-cloned";

  Array.from(head.querySelectorAll(`[${marker}]`)).forEach((node) =>
    node.remove(),
  );

  Array.from(
    document.head.querySelectorAll('link[rel="stylesheet"], style'),
  ).forEach((node) => {
    if (
      node instanceof HTMLStyleElement &&
      node.textContent?.includes("data-emotion")
    ) {
      return;
    }

    const clone = node.cloneNode(true);
    if (clone instanceof HTMLElement) {
      clone.setAttribute(marker, "true");
    }
    head.appendChild(clone);
  });
};

interface FrontendTemplateIframeProps {
  title: string;
  width: number;
  minHeight: number;
  templateId: string;
  pageId: string | number;
  data: BusinessData;
  onReady?: () => void;
  onEditableElementSelected?: (data: EditableElementSelectionData) => void;
  onImageSelected?: (data: ImageSelectionData) => void;
  onImageDoubleClick?: (data: ImageSelectionData) => void;
  onSectionSelected?: (data: SectionSelectionData | null) => void;
  onSectionAddRequest?: (
    data: SectionSelectionData,
    position: "before" | "after",
  ) => void;
  /** Called when the selected section supports adding inner blocks */
  onSectionInnerAddRequest?: (data: SectionSelectionData) => void;
  onPreviewContextMenu?: (data: PreviewContextMenuData | null) => void;
  onEditableTextSave?: (
    blockId: string,
    fieldPath: string,
    value: string,
  ) => void;
  onElementTransform?: (
    target: PreviewSelectionTarget,
    patch: PreviewElementTransformPatch,
  ) => void;
  saveSignal?: number;
  iframeRefCallback?: (ref: React.RefObject<HTMLIFrameElement | null>) => void;
  selectedPreviewTarget?: PreviewSelectionTarget | null;
  askAIButtonStatus?: AskAIButtonStatus;
}

const FrontendTemplateIframePreview = React.memo(
  function FrontendTemplateIframePreview({
    title,
    width,
    minHeight,
    templateId,
    pageId,
    data,
    onReady,
    onEditableElementSelected,
    onImageSelected,
    onImageDoubleClick,
    onSectionSelected,
    onSectionAddRequest,
    onSectionInnerAddRequest,
    onPreviewContextMenu,
    onEditableTextSave,
    onElementTransform,
    saveSignal,
    iframeRefCallback,
    selectedPreviewTarget,
    askAIButtonStatus = "idle",
  }: FrontendTemplateIframeProps) {
    const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
    const [mountNode, setMountNode] = React.useState<HTMLElement | null>(null);
    const cacheRef = React.useRef<ReturnType<typeof createCache> | null>(null);
    const onReadyRef = React.useRef(onReady);
    const onEditableElementSelectedRef = React.useRef(
      onEditableElementSelected,
    );
    const onImageSelectedRef = React.useRef(onImageSelected);
    const onImageDoubleClickRef = React.useRef(onImageDoubleClick);
    const onSectionSelectedRef = React.useRef(onSectionSelected);
    const onSectionAddRequestRef = React.useRef(onSectionAddRequest);
    const onSectionInnerAddRequestRef = React.useRef(onSectionInnerAddRequest);
    const onPreviewContextMenuRef = React.useRef(onPreviewContextMenu);
    const onEditableTextSaveRef = React.useRef(onEditableTextSave);
    const onElementTransformRef = React.useRef(onElementTransform);
    const activeEditableRef = React.useRef<HTMLElement | null>(null);
    const activeEditableMetaRef = React.useRef<{
      blockId: string;
      fieldPath: string;
      initialValue: string;
    } | null>(null);
    const activeEditableInputCleanupRef = React.useRef<(() => void) | null>(
      null,
    );
    const activeSectionRef = React.useRef<HTMLElement | null>(null);
    const iframeDocumentRef = React.useRef<Document | null>(null);
    const activeSelectionTargetRef =
      React.useRef<PreviewSelectionTarget | null>(null);
    const showSelectionOverlayRef = React.useRef(
      (
        _target: HTMLElement | null,
        _label: string,
        _kind: "editable" | "image" | "section",
      ) => {},
    );
    const hideSelectionOverlayRef = React.useRef(() => {});
    const applyAskAIButtonStatusRef = React.useRef(
      (_status: AskAIButtonStatus) => {},
    );
    const inferEditableLabelRef = React.useRef<
      (editableEl: HTMLElement, fieldPath: string) => string
    >(() => "Text");

    React.useEffect(() => {
      onReadyRef.current = onReady;
    }, [onReady]);

    React.useEffect(() => {
      onEditableElementSelectedRef.current = onEditableElementSelected;
    }, [onEditableElementSelected]);

    React.useEffect(() => {
      onImageSelectedRef.current = onImageSelected;
    }, [onImageSelected]);

    React.useEffect(() => {
      onImageDoubleClickRef.current = onImageDoubleClick;
    }, [onImageDoubleClick]);

    React.useEffect(() => {
      onSectionSelectedRef.current = onSectionSelected;
    }, [onSectionSelected]);

    React.useEffect(() => {
      onSectionAddRequestRef.current = onSectionAddRequest;
    }, [onSectionAddRequest]);

    React.useEffect(() => {
      onSectionInnerAddRequestRef.current = onSectionInnerAddRequest;
    }, [onSectionInnerAddRequest]);

    React.useEffect(() => {
      onPreviewContextMenuRef.current = onPreviewContextMenu;
    }, [onPreviewContextMenu]);

    React.useEffect(() => {
      onEditableTextSaveRef.current = onEditableTextSave;
    }, [onEditableTextSave]);

    React.useEffect(() => {
      onElementTransformRef.current = onElementTransform;
    }, [onElementTransform]);

    React.useEffect(() => {
      if (!saveSignal) {
        return;
      }

      const doc = iframeDocumentRef.current;
      if (!doc) {
        return;
      }

      const activeEditable = activeEditableRef.current;
      if (!activeEditable) {
        return;
      }

      activeEditable.blur();
    }, [saveSignal]);

    React.useEffect(() => {
      iframeRefCallback?.(iframeRef);
    }, [iframeRefCallback]);

    React.useEffect(() => {
      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;
      const win = iframe?.contentWindow;

      if (!iframe || !doc || !win) {
        return;
      }

      win.scrollTo(0, 0);
      doc.documentElement.scrollTop = 0;
      doc.body.scrollTop = 0;
    }, [pageId, templateId]);

    React.useEffect(() => {
      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;
      const win = iframe?.contentWindow;

      if (!iframe || !doc || !win) {
        return undefined;
      }

      doc.open();
      doc.write(
        '<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body><div id="preview-root"></div></body></html>',
      );
      doc.close();
      iframeDocumentRef.current = doc;

      copyParentHeadStyles(doc);

      doc.body.style.margin = "0";
      doc.body.style.background = "#ffffff";
      doc.body.style.overflowX = "hidden";

      const placeCaretAtEnd = (element: HTMLElement) => {
        const selection = doc.defaultView?.getSelection?.();
        if (!selection) return;
        const range = doc.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      };

      const finishEditing = (commit: boolean) => {
        const activeEditable = activeEditableRef.current;
        const activeMeta = activeEditableMetaRef.current;

        if (!activeEditable || !activeMeta) {
          return;
        }

        activeEditableInputCleanupRef.current?.();
        activeEditableInputCleanupRef.current = null;

        const nextValue = activeEditable.textContent || "";
        activeEditable.contentEditable = "false";
        activeEditable.removeAttribute("data-inline-editing");

        if (commit && nextValue !== activeMeta.initialValue) {
          onEditableTextSaveRef.current?.(
            activeMeta.blockId,
            activeMeta.fieldPath,
            nextValue,
          );
        } else if (!commit) {
          activeEditable.textContent = activeMeta.initialValue;
        }

        activeEditable.classList.add("tt-editable-selected");
        showSelectionOverlay(
          activeEditable,
          inferEditableLabel(activeEditable, activeMeta.fieldPath),
          "editable",
        );

        activeEditableRef.current = null;
        activeEditableMetaRef.current = null;
      };

      const overlayEl = doc.createElement("div");
      overlayEl.className = "tt-selection-overlay";
      overlayEl.setAttribute("aria-hidden", "true");
      overlayEl.innerHTML = `
      <div class="tt-selection-label"></div>
      <button type="button" class="tt-selection-ai-button" aria-label="Ask AI">
        <span class="tt-selection-ai-liquid" aria-hidden="true">
          <span class="tt-selection-ai-bubble tt-selection-ai-bubble--one"></span>
          <span class="tt-selection-ai-bubble tt-selection-ai-bubble--two"></span>
          <span class="tt-selection-ai-bubble tt-selection-ai-bubble--three"></span>
        </span>
        <span class="tt-selection-ai-result-bg" aria-hidden="true"></span>
        <span class="tt-selection-ai-content">
          <span class="tt-selection-ai-mark" aria-hidden="true">✦</span>
          <span class="tt-selection-ai-text">Ask AI</span>
        </span>
      </button>
      <button type="button" class="tt-section-inner-add-button">Add block</button>
      <button type="button" class="tt-section-add-button tt-section-add-button--top" data-insert-position="before">Add section</button>
      <button type="button" class="tt-section-add-button tt-section-add-button--bottom" data-insert-position="after">Add section</button>
      <div class="tt-selection-handle tt-selection-handle--top-left"></div>
      <div class="tt-selection-handle tt-selection-handle--top"></div>
      <div class="tt-selection-handle tt-selection-handle--top-right"></div>
      <div class="tt-selection-handle tt-selection-handle--right"></div>
      <div class="tt-selection-handle tt-selection-handle--bottom-right"></div>
      <div class="tt-selection-handle tt-selection-handle--bottom"></div>
      <div class="tt-selection-handle tt-selection-handle--bottom-left"></div>
      <div class="tt-selection-handle tt-selection-handle--left"></div>
    `;
      doc.body.appendChild(overlayEl);

      let overlayTarget: HTMLElement | null = null;
      let overlayLabel = "";
      let overlayKind: "editable" | "image" | "section" | null = null;
      let overlayFrame: number | null = null;
      let currentAskAIButtonStatus: AskAIButtonStatus = askAIButtonStatus;
      let interactionCleanup: (() => void) | null = null;

      const applyAskAIButtonStatus = (status: AskAIButtonStatus) => {
        currentAskAIButtonStatus = status;
        overlayEl.setAttribute("data-ai-button-status", status);
        const aiButton = overlayEl.querySelector(
          ".tt-selection-ai-button",
        ) as HTMLButtonElement | null;
        const aiText = overlayEl.querySelector(
          ".tt-selection-ai-text",
        ) as HTMLElement | null;
        const aiMark = overlayEl.querySelector(
          ".tt-selection-ai-mark",
        ) as HTMLElement | null;
        if (aiText) {
          aiText.textContent =
            status === "loading"
              ? "AI request in progress"
              : status === "success"
                ? "AI changes applied"
                : status === "error"
                  ? "AI request failed"
                  : "Ask AI";
        }
        if (aiMark) {
          aiMark.textContent =
            status === "success" ? "✓" : status === "error" ? "×" : "✦";
        }
        if (aiButton) {
          aiButton.disabled = status === "open" || status === "loading";
          aiButton.setAttribute("aria-label", aiText?.textContent || "Ask AI");
        }
      };

      applyAskAIButtonStatusRef.current = applyAskAIButtonStatus;
      applyAskAIButtonStatus(askAIButtonStatus);

      const queueOverlayUpdate = () => {
        if (overlayFrame !== null) {
          return;
        }

        overlayFrame = win.requestAnimationFrame(() => {
          overlayFrame = null;

          if (!overlayTarget || !doc.body.contains(overlayTarget)) {
            overlayEl.classList.remove("tt-selection-overlay--visible");
            return;
          }

          const rect = overlayTarget.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) {
            overlayEl.classList.remove("tt-selection-overlay--visible");
            return;
          }

          overlayEl.classList.add("tt-selection-overlay--visible");
          overlayEl.setAttribute(
            "data-selected-kind",
            overlayKind || "section",
          );
          const scrollTop =
            win.scrollY ||
            doc.documentElement.scrollTop ||
            doc.body.scrollTop ||
            0;
          const scrollLeft =
            win.scrollX ||
            doc.documentElement.scrollLeft ||
            doc.body.scrollLeft ||
            0;

          overlayEl.style.top = `${Math.max(rect.top + scrollTop - 1, 0)}px`;
          overlayEl.style.left = `${Math.max(rect.left + scrollLeft - 1, 0)}px`;
          overlayEl.style.width = `${Math.max(rect.width, 10)}px`;
          overlayEl.style.height = `${Math.max(rect.height, 10)}px`;

          const labelEl = overlayEl.querySelector(".tt-selection-label");
          if (labelEl) {
            labelEl.textContent = overlayLabel || "Element";
          }

          overlayEl
            .querySelectorAll(".tt-section-add-button")
            .forEach((button) => {
              (button as HTMLButtonElement).style.display =
                overlayKind === "section" ? "inline-flex" : "none";
            });
          const innerAddButton = overlayEl.querySelector(
            ".tt-section-inner-add-button",
          ) as HTMLButtonElement | null;
          if (innerAddButton) {
            innerAddButton.style.display =
              overlayKind === "section" &&
              overlayTarget.getAttribute(
                "data-preview-accepts-inner-blocks",
              ) === "true"
                ? "inline-flex"
                : "none";
          }
          const aiButton = overlayEl.querySelector(
            ".tt-selection-ai-button",
          ) as HTMLButtonElement | null;
          if (aiButton) {
            aiButton.style.display =
              overlayKind === "editable" || overlayKind === "section"
                ? "inline-flex"
                : "none";
            applyAskAIButtonStatus(currentAskAIButtonStatus);
          }
        });
      };

      const hideSelectionOverlay = () => {
        overlayTarget = null;
        overlayKind = null;
        overlayLabel = "";

        if (overlayFrame !== null) {
          win.cancelAnimationFrame(overlayFrame);
          overlayFrame = null;
        }

        overlayEl.classList.remove("tt-selection-overlay--visible");
      };

      const showSelectionOverlay = (
        target: HTMLElement | null,
        label: string,
        kind: "editable" | "image" | "section",
      ) => {
        overlayTarget = target;
        overlayLabel = label;
        overlayKind = kind;
        queueOverlayUpdate();
      };

      const inferEditableLabel = (
        editableEl: HTMLElement,
        fieldPath: string,
      ) => {
        const explicitLabel =
          editableEl.getAttribute("data-preview-label") ||
          editableEl.getAttribute("data-element-label") ||
          editableEl.getAttribute("aria-label");
        if (explicitLabel) {
          return explicitLabel;
        }

        const lowerFieldPath = fieldPath.toLowerCase();
        const tagName = editableEl.tagName.toLowerCase();

        if (
          tagName === "button" ||
          tagName === "a" ||
          lowerFieldPath.includes("button") ||
          lowerFieldPath.includes("cta") ||
          lowerFieldPath.includes("link")
        ) {
          return "Button";
        }

        if (
          lowerFieldPath.includes("title") ||
          lowerFieldPath.includes("heading") ||
          lowerFieldPath.includes("headline") ||
          lowerFieldPath.includes("brandname")
        ) {
          return "Heading";
        }

        return "Text";
      };

      const normalizeSize = (value: number) =>
        `${Math.max(24, Math.round(value))}px`;

      const parseTranslate = (transformValue: string) => {
        const match =
          /translate\(\s*(-?\d+(?:\.\d+)?)px(?:,\s*|\s+)(-?\d+(?:\.\d+)?)px\s*\)/.exec(
            transformValue,
          );
        return {
          x: match ? Number(match[1]) : 0,
          y: match ? Number(match[2]) : 0,
        };
      };

      const stripTranslate = (transformValue: string) =>
        transformValue
          .replace(
            /translate\(\s*-?\d+(?:\.\d+)?px(?:,\s*|\s+)-?\d+(?:\.\d+)?px\s*\)/g,
            "",
          )
          .trim();

      const buildTransformValue = (
        baseTransform: string,
        x: number,
        y: number,
      ) => {
        const translate = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
        return baseTransform ? `${baseTransform} ${translate}` : translate;
      };

      const startInteraction = (
        event: MouseEvent,
        target: HTMLElement,
        selectionTarget: PreviewSelectionTarget,
        mode: "move" | "resize",
        handle?: string,
      ) => {
        interactionCleanup?.();
        finishEditing(true);
        event.preventDefault();
        event.stopPropagation();
        overlayEl.classList.add("tt-selection-overlay--dragging");
        if (mode === "move") {
          target.style.cursor = "grabbing";
        }

        const startRect = target.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const computed = win.getComputedStyle(target);
        const inlineWidth = target.style.width || computed.width;
        const inlineHeight = target.style.height || computed.height;
        const existingTransform =
          target.style.transform ||
          (computed.transform && computed.transform !== "none"
            ? computed.transform
            : "");
        const translateStart = parseTranslate(existingTransform);
        const baseTransform = stripTranslate(existingTransform);

        const handleMove = (moveEvent: MouseEvent) => {
          moveEvent.preventDefault();
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;

          if (mode === "move") {
            target.style.transform = buildTransformValue(
              baseTransform,
              translateStart.x + deltaX,
              translateStart.y + deltaY,
            );
            queueOverlayUpdate();
            return;
          }

          let nextWidth = startRect.width;
          let nextHeight = startRect.height;

          if (handle?.includes("right")) {
            nextWidth = startRect.width + deltaX;
          }
          if (handle?.includes("left")) {
            nextWidth = startRect.width - deltaX;
          }
          if (handle?.includes("bottom")) {
            nextHeight = startRect.height + deltaY;
          }
          if (handle?.includes("top")) {
            nextHeight = startRect.height - deltaY;
          }

          target.style.width = normalizeSize(nextWidth);
          target.style.height = normalizeSize(nextHeight);
          queueOverlayUpdate();
        };

        const handleUp = (upEvent: MouseEvent) => {
          upEvent.preventDefault();
          doc.removeEventListener("mousemove", handleMove, true);
          doc.removeEventListener("mouseup", handleUp, true);
          interactionCleanup = null;
          overlayEl.classList.remove("tt-selection-overlay--dragging");
          if (mode === "move") {
            target.style.cursor = "grab";
          }

          const patch =
            mode === "move"
              ? {
                  transform:
                    target.style.transform ||
                    buildTransformValue(
                      baseTransform,
                      translateStart.x,
                      translateStart.y,
                    ),
                }
              : {
                  width: target.style.width || inlineWidth,
                  height: target.style.height || inlineHeight,
                };

          onElementTransformRef.current?.(
            selectionTarget,
            patch as PreviewElementTransformPatch,
          );

          // Clear temporary inline drag styles so React-rendered state remains
          // the single source of truth for placement/size and undo can revert it.
          win.requestAnimationFrame(() => {
            if (mode === "move") {
              target.style.removeProperty("transform");
            } else {
              target.style.removeProperty("width");
              target.style.removeProperty("height");
            }
          });
          queueOverlayUpdate();
        };

        doc.addEventListener("mousemove", handleMove, true);
        doc.addEventListener("mouseup", handleUp, true);
        interactionCleanup = () => {
          doc.removeEventListener("mousemove", handleMove, true);
          doc.removeEventListener("mouseup", handleUp, true);
          interactionCleanup = null;
          overlayEl.classList.remove("tt-selection-overlay--dragging");
          if (mode === "move") {
            target.style.cursor = "grab";
          }
        };
      };

      showSelectionOverlayRef.current = showSelectionOverlay;
      hideSelectionOverlayRef.current = hideSelectionOverlay;
      inferEditableLabelRef.current = inferEditableLabel;

      const clearVisualSelections = () => {
        Array.from(doc.querySelectorAll(".tt-editable-selected")).forEach(
          (node) => {
            node.classList.remove("tt-editable-selected");
          },
        );
        Array.from(doc.querySelectorAll(".tt-image-selected")).forEach(
          (node) => {
            node.classList.remove("tt-image-selected");
          },
        );
        Array.from(doc.querySelectorAll(".tt-section-selected")).forEach(
          (node) => {
            node.classList.remove("tt-section-selected");
          },
        );
        activeSelectionTargetRef.current = null;
        hideSelectionOverlay();
      };

      const getSectionChain = (sectionEl: HTMLElement | null) => {
        const chain: HTMLElement[] = [];
        let currentSection = sectionEl;
        while (currentSection) {
          chain.push(currentSection);
          currentSection = currentSection.parentElement?.closest?.(
            '[data-preview-section="true"]',
          ) as HTMLElement | null;
        }
        return chain;
      };

      const buildSectionSelection = (
        sectionEl: HTMLElement | null,
      ): SectionSelectionData | null => {
        if (!sectionEl) {
          return null;
        }

        const blockId = sectionEl.getAttribute("data-preview-block-id");
        if (!blockId) {
          return null;
        }

        const label = sectionEl.getAttribute("data-preview-label") || "Section";
        const styleKey =
          (sectionEl.getAttribute("data-preview-style-key") as
            | "sectionStyle"
            | "outerSectionStyle"
            | null) || "sectionStyle";
        const rect = sectionEl.getBoundingClientRect();

        return {
          blockId,
          label,
          styleKey,
          supportsInnerBlocks:
            sectionEl.getAttribute("data-preview-accepts-inner-blocks") ===
            "true",
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        };
      };

      const humanizeFieldPath = (fieldPath: string) =>
        fieldPath
          .split(".")
          .slice(-1)[0]
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (char) => char.toUpperCase())
          .trim();

      const buildEditableSelection = (
        editableEl: HTMLElement | null,
      ): EditableElementSelectionData | null => {
        if (!editableEl) {
          return null;
        }

        const blockId = editableEl.getAttribute("data-block-id");
        const fieldPath = editableEl.getAttribute("data-editable");
        if (!blockId || !fieldPath) {
          return null;
        }

        const editType =
          (editableEl.getAttribute("data-edit-type") as
            | "single"
            | "multi"
            | null) || "single";
        const rect = editableEl.getBoundingClientRect();
        const computedStyle = doc.defaultView?.getComputedStyle(editableEl);

        return {
          blockId,
          fieldPath,
          value: editableEl.textContent || "",
          editType,
          label: inferEditableLabel(editableEl, fieldPath),
          computedStyle: computedStyle
            ? {
                color: computedStyle.color,
                backgroundColor: computedStyle.backgroundColor,
                fontSize: computedStyle.fontSize,
                fontWeight: computedStyle.fontWeight,
                textAlign: computedStyle.textAlign,
                textShadow: computedStyle.textShadow,
              }
            : undefined,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        };
      };

      const buildImageSelection = (
        imageEl: HTMLElement | null,
      ): ImageSelectionData | null => {
        if (!imageEl) {
          return null;
        }

        const blockId = imageEl.getAttribute("data-block-id");
        const fieldPath = imageEl.getAttribute("data-edit-image");
        if (!blockId || !fieldPath) {
          return null;
        }

        const rect = imageEl.getBoundingClientRect();
        return {
          blockId,
          fieldPath,
          src:
            imageEl.getAttribute("src") ||
            imageEl.getAttribute("data-image-src") ||
            "",
          label: imageEl.getAttribute("data-image-label") || "Image",
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        };
      };

      const applySectionSelection = (sectionEl: HTMLElement | null) => {
        const selection = buildSectionSelection(sectionEl);
        if (!selection || !sectionEl) {
          return null;
        }

        finishEditing(true);
        clearVisualSelections();
        sectionEl.classList.add("tt-section-selected");
        showSelectionOverlay(
          sectionEl,
          selection.label || "Section",
          "section",
        );
        activeSelectionTargetRef.current = {
          kind: "section",
          blockId: selection.blockId,
          styleKey: selection.styleKey || "sectionStyle",
          nonce: Date.now(),
        };
        activeSectionRef.current = sectionEl;
        onSectionSelectedRef.current?.(selection);
        return selection;
      };

      const applyEditableSelection = (
        editableEl: HTMLElement | null,
        options?: { startEditing?: boolean },
      ) => {
        const selection = buildEditableSelection(editableEl);
        if (!selection || !editableEl) {
          return null;
        }

        clearVisualSelections();
        activeSectionRef.current = null;
        editableEl.classList.add("tt-editable-selected");
        showSelectionOverlay(editableEl, selection.label || "Text", "editable");
        activeSelectionTargetRef.current = {
          kind: "editable",
          blockId: selection.blockId,
          fieldPath: selection.fieldPath,
          nonce: Date.now(),
        };
        onEditableElementSelectedRef.current?.(selection);
        onSectionSelectedRef.current?.(null);

        const isFallbackEditable = selection.fieldPath.startsWith("__fallback.");

        if (options?.startEditing === false || isFallbackEditable) {
          activeEditableRef.current = null;
          activeEditableMetaRef.current = null;
          return selection;
        }

        if (
          activeEditableRef.current &&
          activeEditableRef.current !== editableEl
        ) {
          finishEditing(true);
        }

        if (activeEditableRef.current !== editableEl) {
          activeEditableRef.current = editableEl;
          activeEditableMetaRef.current = {
            blockId: selection.blockId,
            fieldPath: selection.fieldPath,
            initialValue: editableEl.textContent || "",
          };
        }

        hideSelectionOverlay();
        editableEl.contentEditable = "true";
        editableEl.setAttribute("data-inline-editing", "true");
        editableEl.focus();
        placeCaretAtEnd(editableEl);
        return selection;
      };

      const applyImageSelection = (imageEl: HTMLElement | null) => {
        const selection = buildImageSelection(imageEl);
        if (!selection || !imageEl) {
          return null;
        }

        finishEditing(true);
        clearVisualSelections();
        activeSectionRef.current = null;
        imageEl.classList.add("tt-image-selected");
        showSelectionOverlay(imageEl, selection.label || "Image", "image");
        activeSelectionTargetRef.current = {
          kind: "image",
          blockId: selection.blockId,
          fieldPath: selection.fieldPath,
          nonce: Date.now(),
        };
        onImageSelectedRef.current?.(selection);
        onSectionSelectedRef.current?.(null);
        return selection;
      };

      const buildLayerItems = (
        editableEl: HTMLElement | null,
        imageEl: HTMLElement | null,
        sectionEl: HTMLElement | null,
      ): PreviewLayerNodeData[] => {
        const sectionLayers = getSectionChain(sectionEl)
          .reverse()
          .flatMap((node, index) => {
            const selection = buildSectionSelection(node);
            if (!selection) {
              return [];
            }

            return [
              {
                id: `section:${selection.blockId}:${selection.styleKey || "sectionStyle"}:${index}`,
                kind: "section" as const,
                label: selection.label,
                depth: index,
                section: selection,
              },
            ];
          });

        const imageSelection = buildImageSelection(imageEl);
        if (imageSelection) {
          return [
            ...sectionLayers,
            {
              id: `image:${imageSelection.blockId}:${imageSelection.fieldPath}`,
              kind: "image" as const,
              label: imageSelection.label,
              depth: sectionLayers.length,
              image: imageSelection,
            },
          ];
        }

        const editableSelection = buildEditableSelection(editableEl);
        if (!editableSelection) {
          return sectionLayers;
        }

        return [
          ...sectionLayers,
          {
            id: `editable:${editableSelection.blockId}:${editableSelection.fieldPath}`,
            kind: "editable" as const,
            label:
              editableSelection.label ||
              humanizeFieldPath(editableSelection.fieldPath),
            depth: sectionLayers.length,
            editable: editableSelection,
          },
        ];
      };

      const styleEl = doc.createElement("style");
      styleEl.textContent = `
      [data-editable] {
        cursor: text;
        transition: box-shadow 0.15s ease, outline-color 0.15s ease;
      }
      [data-editable]:hover {
        outline: 1px dashed rgba(25, 118, 210, 0.45);
        outline-offset: 2px;
      }
      .tt-editable-selected {
        outline: 1px solid rgba(37, 99, 235, 0.18);
        outline-offset: 0;
        border-radius: 4px;
        cursor: grab !important;
        user-select: none;
      }
      [data-edit-image] {
        cursor: pointer;
        transition: box-shadow 0.15s ease, outline-color 0.15s ease;
      }
      [data-edit-image]:hover {
        outline: 2px dashed rgba(37, 99, 235, 0.42);
        outline-offset: 3px;
      }
      .tt-image-selected {
        outline: 1px solid rgba(37, 99, 235, 0.18);
        outline-offset: 0;
        box-shadow: none;
        cursor: grab !important;
        user-select: none;
      }
      [data-preview-section="true"] {
        transition: outline-color 0.15s ease, box-shadow 0.15s ease;
      }
      [data-preview-section="true"]:hover {
        outline: 2px dashed rgba(37, 99, 235, 0.42);
        outline-offset: 3px;
      }
      .tt-section-selected {
        outline: 1px solid rgba(37, 99, 235, 0.18);
        outline-offset: 0;
        box-shadow: none;
        cursor: grab !important;
        user-select: none;
      }
      [data-inline-editing="true"] {
        cursor: text;
        outline: none !important;
      }
      .tt-selection-overlay {
        position: absolute;
        z-index: 2147483647;
        display: none;
        box-sizing: border-box;
        border: 2px solid #2563eb;
        border-radius: 4px;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.92);
        pointer-events: auto;
        cursor: grab;
      }
      .tt-selection-overlay--visible {
        display: block;
      }
      .tt-selection-overlay--dragging {
        cursor: grabbing;
      }
      .tt-selection-label {
        position: absolute;
        top: -24px;
        left: -2px;
        max-width: calc(100% + 4px);
        padding: 3px 8px;
        border-radius: 6px 6px 6px 0;
        background: #2563eb;
        color: #ffffff;
        font-family: Inter, "Segoe UI", sans-serif;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tt-selection-ai-button {
        position: absolute;
        top: -34px;
        right: -2px;
        z-index: 10;
        display: none;
        align-items: center;
        justify-content: center;
        height: 28px;
        min-width: 58px;
        max-width: 190px;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: 999px;
        background: linear-gradient(135deg, #378c92, #2d7479);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
        color: #ffffff;
        font-family: Inter, "Segoe UI", sans-serif;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
        pointer-events: auto;
        cursor: pointer;
        overflow: hidden;
        transform: translate3d(0, 0, 0);
        transition:
          opacity 180ms ease,
          transform 180ms ease,
          min-width 240ms ease,
          background 220ms ease,
          box-shadow 220ms ease;
      }
      .tt-selection-ai-button:hover {
        background: linear-gradient(135deg, #3fa0a7, #378c92);
      }
      .tt-selection-ai-button:disabled {
        cursor: default;
      }
      .tt-selection-ai-content {
        position: relative;
        z-index: 3;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        white-space: nowrap;
      }
      .tt-selection-ai-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 13px;
        height: 13px;
        font-size: 14px;
        line-height: 1;
      }
      .tt-selection-ai-text {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tt-selection-ai-liquid,
      .tt-selection-ai-result-bg {
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: inherit;
        pointer-events: none;
      }
      .tt-selection-ai-liquid {
        background: #3d9b8f;
        transform: translateX(calc(-100% - 14px));
        overflow: hidden;
      }
      .tt-selection-ai-liquid::after {
        content: "";
        position: absolute;
        top: -3px;
        right: -9px;
        width: 18px;
        height: calc(100% + 6px);
        background: #3d9b8f;
        border-radius: 50%;
        animation: tt-ai-button-wave 0.9s linear infinite;
      }
      .tt-selection-ai-bubble {
        position: absolute;
        bottom: -8px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        animation: tt-ai-button-bubble 1.8s linear infinite;
      }
      .tt-selection-ai-bubble--one {
        left: 18%;
        animation-delay: 0s;
      }
      .tt-selection-ai-bubble--two {
        left: 48%;
        width: 6px;
        height: 6px;
        animation-delay: 0.45s;
      }
      .tt-selection-ai-bubble--three {
        left: 76%;
        animation-delay: 0.85s;
      }
      .tt-selection-ai-result-bg {
        opacity: 0;
        z-index: 2;
      }
      .tt-selection-overlay[data-ai-button-status="open"] .tt-selection-ai-button {
        opacity: 0;
        transform: translateY(-2px) scale(0.92);
        pointer-events: none;
      }
      .tt-selection-overlay[data-ai-button-status="loading"] .tt-selection-ai-button {
        min-width: 176px;
        background: rgba(15, 23, 42, 0.92);
      }
      .tt-selection-overlay[data-ai-button-status="loading"] .tt-selection-ai-liquid {
        animation: tt-ai-button-fill 5s linear forwards;
      }
      .tt-selection-overlay[data-ai-button-status="success"] .tt-selection-ai-button,
      .tt-selection-overlay[data-ai-button-status="error"] .tt-selection-ai-button {
        min-width: 154px;
        color: #111827;
        background: #ffffff;
      }
      .tt-selection-overlay[data-ai-button-status="success"] .tt-selection-ai-result-bg {
        opacity: 1;
        background:
          radial-gradient(circle at 8% 20%, rgba(48, 173, 104, 0.2) 0 18px, transparent 19px),
          radial-gradient(circle at 32% 110%, rgba(48, 173, 104, 0.12) 0 22px, transparent 23px),
          linear-gradient(135deg, #a9efbf 0%, #cdf7dc 58%, #baf1cd 100%);
      }
      .tt-selection-overlay[data-ai-button-status="error"] .tt-selection-ai-result-bg {
        opacity: 1;
        background:
          radial-gradient(circle at 8% 20%, rgba(216, 88, 108, 0.2) 0 18px, transparent 19px),
          radial-gradient(circle at 32% 110%, rgba(216, 88, 108, 0.12) 0 22px, transparent 23px),
          linear-gradient(135deg, #f2a6b4 0%, #f9ccd5 58%, #f4bdc8 100%);
      }
      .tt-selection-overlay[data-ai-button-status="success"] .tt-selection-ai-mark,
      .tt-selection-overlay[data-ai-button-status="error"] .tt-selection-ai-mark {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: #ffffff;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.14);
      }
      .tt-selection-overlay[data-ai-button-status="success"] .tt-selection-ai-mark {
        color: #4eaf75;
      }
      .tt-selection-overlay[data-ai-button-status="error"] .tt-selection-ai-mark {
        color: #d66073;
      }
      @keyframes tt-ai-button-fill {
        0% { transform: translateX(calc(-100% - 14px)); }
        100% { transform: translateX(0%); }
      }
      @keyframes tt-ai-button-bubble {
        0% { transform: translateY(0) scale(0.8); opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateY(-36px) scale(1.15); opacity: 0; }
      }
      @keyframes tt-ai-button-wave {
        0% { transform: translateY(0); }
        100% { transform: translateY(-12px); }
      }
      .tt-section-inner-add-button {
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 9;
        display: none;
        align-items: center;
        justify-content: center;
        min-width: 118px;
        height: 36px;
        padding: 0 14px;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 12px;
        background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%);
        box-shadow: 0 12px 30px rgba(15,23,42,0.12);
        color: #111827;
        font-family: Inter, "Segoe UI", sans-serif;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
        pointer-events: auto;
        cursor: pointer;
      }
      .tt-section-inner-add-button:hover {
        background: #ffffff;
        border-color: rgba(37, 99, 235, 0.24);
      }
      .tt-section-add-button {
      z-index: 9;
        position: absolute;
        left: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        min-width: 108px;
        height: 34px;
        padding: 0 14px;
        border: 1px solid rgba(15, 23, 42, 0.16);
        border-radius: 9px;
        background: #ffffff;
        box-shadow: 0 8px 22px rgba(15, 23, 42, 0.22);
        color: #111111;
        font-family: Inter, "Segoe UI", sans-serif;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
        pointer-events: auto;
        cursor: pointer;
        transform: translateX(-50%);
      }
      .tt-section-add-button:hover {
        background: #f8fafc;
      }
      .tt-section-add-button--top {
        top: -20px;
      }
      .tt-section-add-button--bottom {
        bottom: -20px;
      }
      .tt-selection-handle {
        position: absolute;
        width: 8px;
        height: 8px;
        border: 1.5px solid #2563eb;
        border-radius: 999px;
        background: #ffffff;
        box-sizing: border-box;
        pointer-events: auto;
        cursor: nwse-resize;
      }
      .tt-selection-handle--top-left {
        top: -5px;
        left: -5px;
      }
      .tt-selection-handle--top {
        top: -5px;
        left: calc(50% - 4px);
        cursor: ns-resize;
      }
      .tt-selection-handle--top-right {
        top: -5px;
        right: -5px;
        cursor: nesw-resize;
      }
      .tt-selection-handle--right {
        top: calc(50% - 4px);
        right: -5px;
        cursor: ew-resize;
      }
      .tt-selection-handle--bottom-right {
        right: -5px;
        bottom: -5px;
      }
      .tt-selection-handle--bottom {
        bottom: -5px;
        left: calc(50% - 4px);
        cursor: ns-resize;
      }
      .tt-selection-handle--bottom-left {
        bottom: -5px;
        left: -5px;
        cursor: nesw-resize;
      }
      .tt-selection-handle--left {
        top: calc(50% - 4px);
        left: -5px;
        cursor: ew-resize;
      }
    `;
      doc.head.appendChild(styleEl);

      win.addEventListener("scroll", queueOverlayUpdate, { passive: true });
      win.addEventListener("resize", queueOverlayUpdate);

      const root = doc.getElementById("preview-root");
      if (!root) {
        return undefined;
      }

      cacheRef.current = createCache({
        key: "preview-mui",
        container: doc.head,
        nonce: getNonce(),
        prepend: true,
      });

      setMountNode(root);
      onReadyRef.current?.();

      const handleClick = (event: MouseEvent) => {
        const overlayAIButton = (event.target as HTMLElement | null)?.closest?.(
          ".tt-selection-ai-button",
        ) as HTMLButtonElement | null;
        if (overlayAIButton) {
          event.preventDefault();
          event.stopPropagation();
          const buttonRect = overlayAIButton.getBoundingClientRect();
          const frameRect = (
            win.frameElement as HTMLIFrameElement | null
          )?.getBoundingClientRect();
          const scaleX =
            frameRect && win.innerWidth
              ? frameRect.width / Math.max(1, win.innerWidth)
              : 1;
          const scaleY =
            frameRect && win.innerHeight
              ? frameRect.height / Math.max(1, win.innerHeight)
              : 1;
          const viewportAnchorRect = frameRect
            ? {
                top: frameRect.top + buttonRect.top * scaleY,
                left: frameRect.left + buttonRect.left * scaleX,
                width: buttonRect.width * scaleX,
                height: buttonRect.height * scaleY,
              }
            : null;
          win.parent.postMessage(
            {
              type: "ASK_AI_REQUEST",
              anchorRect: {
                top: buttonRect.top,
                left: buttonRect.left,
                width: buttonRect.width,
                height: buttonRect.height,
              },
              viewportAnchorRect,
            },
            window.location.origin,
          );
          return;
        }

        const overlayInnerButton = (
          event.target as HTMLElement | null
        )?.closest?.(
          ".tt-section-inner-add-button",
        ) as HTMLButtonElement | null;
        if (overlayInnerButton) {
          event.preventDefault();
          event.stopPropagation();
          if (overlayTarget && overlayKind === "section") {
            const selection = buildSectionSelection(overlayTarget);
            if (selection?.supportsInnerBlocks) {
              onSectionInnerAddRequestRef.current?.(selection);
            }
          }
          return;
        }

        const overlayButton = (event.target as HTMLElement | null)?.closest?.(
          ".tt-section-add-button",
        ) as HTMLButtonElement | null;
        if (overlayButton) {
          event.preventDefault();
          event.stopPropagation();
          if (overlayTarget && overlayKind === "section") {
            const selection = buildSectionSelection(overlayTarget);
            const position =
              overlayButton.getAttribute("data-insert-position") === "before"
                ? "before"
                : "after";
            if (selection) {
              onSectionAddRequestRef.current?.(selection, position);
            }
          }
          return;
        }

        if (
          (event.target as HTMLElement | null)?.closest?.(
            ".tt-selection-handle",
          )
        ) {
          return;
        }

        const target = event.target as HTMLElement | null;
        const editableEl = target?.closest?.(
          "[data-editable]",
        ) as HTMLElement | null;
        const cardEditableEl = target?.closest?.(
          '[data-editable$=".__card"], [data-editable$=".__container"]',
        ) as HTMLElement | null;
        const imageEl = target?.closest?.(
          "[data-edit-image]",
        ) as HTMLElement | null;
        const fallbackMediaEl = target?.closest?.(
          "[data-fallback-media='true']",
        ) as HTMLElement | null;
        const sectionEl = target?.closest?.(
          '[data-preview-section="true"]',
        ) as HTMLElement | null;
        const shouldPreferImageSelection =
          !!imageEl &&
          (!editableEl ||
            editableEl === imageEl ||
            editableEl.contains(imageEl));

        if (!editableEl && !imageEl && !fallbackMediaEl && !sectionEl) {
          finishEditing(true);
          clearVisualSelections();
          activeSectionRef.current = null;
          onSectionSelectedRef.current?.(null);
          onPreviewContextMenuRef.current?.(null);
          return;
        }

        if (shouldPreferImageSelection) {
          event.preventDefault();
          event.stopPropagation();
          applyImageSelection(imageEl);
          onPreviewContextMenuRef.current?.(null);
          return;
        }

        if (!editableEl && !imageEl && fallbackMediaEl) {
          event.preventDefault();
          event.stopPropagation();
          applySectionSelection(fallbackMediaEl);
          onPreviewContextMenuRef.current?.(null);
          return;
        }

        if (!editableEl && !imageEl && sectionEl) {
          const sectionChain = getSectionChain(sectionEl);
          let resolvedSectionEl = sectionChain[0];
          if (activeSectionRef.current) {
            const activeIndex = sectionChain.findIndex(
              (node) => node === activeSectionRef.current,
            );
            if (activeIndex >= 0) {
              resolvedSectionEl =
                sectionChain[
                  Math.min(activeIndex + 1, sectionChain.length - 1)
                ];
            }
          }
          applySectionSelection(resolvedSectionEl);
          onPreviewContextMenuRef.current?.(null);
          return;
        }

        if (
          cardEditableEl &&
          editableEl === cardEditableEl &&
          sectionEl &&
          sectionEl === cardEditableEl
        ) {
          event.preventDefault();
          event.stopPropagation();
          applySectionSelection(sectionEl);
          onPreviewContextMenuRef.current?.(null);
          return;
        }

        if (cardEditableEl && editableEl === cardEditableEl) {
          event.preventDefault();
          event.stopPropagation();
          applyEditableSelection(cardEditableEl, { startEditing: false });
          onPreviewContextMenuRef.current?.(null);
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        applyEditableSelection(editableEl, { startEditing: false });
        onPreviewContextMenuRef.current?.(null);
      };

      const handleDoubleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const imageEl = target?.closest?.(
          "[data-edit-image]",
        ) as HTMLElement | null;
        const fallbackMediaEl = target?.closest?.(
          "[data-fallback-media='true']",
        ) as HTMLElement | null;
        const editableEl = target?.closest?.(
          "[data-editable]",
        ) as HTMLElement | null;
        const shouldPreferImageSelection =
          !!imageEl &&
          (!editableEl ||
            editableEl === imageEl ||
            editableEl.contains(imageEl));
        if (!editableEl && !imageEl && !fallbackMediaEl) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        if (shouldPreferImageSelection) {
          const selection = applyImageSelection(imageEl);
          if (selection) {
            onImageDoubleClickRef.current?.(selection);
          }
          onPreviewContextMenuRef.current?.(null);
          return;
        }
        if (!editableEl && !imageEl && fallbackMediaEl) {
          applySectionSelection(fallbackMediaEl);
          onPreviewContextMenuRef.current?.(null);
          return;
        }
        applyEditableSelection(editableEl);
        onPreviewContextMenuRef.current?.(null);
      };

      const handleContextMenu = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        event.preventDefault();
        event.stopPropagation();
        const clickedInsideOverlay = !!target?.closest?.(
          ".tt-selection-overlay",
        );
        const resolvedOverlayTarget =
          clickedInsideOverlay && overlayTarget ? overlayTarget : null;
        const editableEl =
          (resolvedOverlayTarget?.matches?.("[data-editable]")
            ? resolvedOverlayTarget
            : null) ||
          (target?.closest?.("[data-editable]") as HTMLElement | null);
        const cardEditableEl =
          (resolvedOverlayTarget?.matches?.(
            '[data-editable$=".__card"], [data-editable$=".__container"]',
          )
            ? resolvedOverlayTarget
            : null) ||
          (target?.closest?.(
            '[data-editable$=".__card"], [data-editable$=".__container"]',
          ) as HTMLElement | null);
        const imageEl =
          (resolvedOverlayTarget?.matches?.("[data-edit-image]")
            ? resolvedOverlayTarget
            : null) ||
          (target?.closest?.("[data-edit-image]") as HTMLElement | null);
        const fallbackMediaEl =
          (resolvedOverlayTarget?.matches?.("[data-fallback-media='true']")
            ? resolvedOverlayTarget
            : null) ||
          (target?.closest?.(
            "[data-fallback-media='true']",
          ) as HTMLElement | null);
        const directSectionEl =
          (resolvedOverlayTarget?.matches?.('[data-preview-section="true"]')
            ? resolvedOverlayTarget
            : null) ||
          (target?.closest?.(
            '[data-preview-section="true"]',
          ) as HTMLElement | null);
        const resolvedSectionEl =
          editableEl || imageEl || fallbackMediaEl
            ? ((editableEl || imageEl || fallbackMediaEl)?.closest(
                '[data-preview-section="true"]',
              ) as HTMLElement | null)
            : directSectionEl || activeSectionRef.current;
        const shouldPreferImageSelection =
          !!imageEl &&
          (!editableEl ||
            editableEl === imageEl ||
            editableEl.contains(imageEl));

        if (!editableEl && !imageEl && !fallbackMediaEl && !resolvedSectionEl) {
          onPreviewContextMenuRef.current?.(null);
          return;
        }

        if (
          cardEditableEl &&
          editableEl === cardEditableEl &&
          directSectionEl &&
          directSectionEl === cardEditableEl
        ) {
          const sectionSelection = applySectionSelection(directSectionEl);
          const layers = buildLayerItems(null, null, directSectionEl);
          onPreviewContextMenuRef.current?.({
            x: event.clientX,
            y: event.clientY,
            layers,
            target: layers.find((layer) => layer.kind === "section") || null,
            targetLayer:
              layers.find((layer) => layer.kind === "section") || null,
            section: sectionSelection,
            editable: null,
            image: null,
          });
          return;
        }

        if (cardEditableEl && editableEl === cardEditableEl) {
          const editableSelection = applyEditableSelection(cardEditableEl, {
            startEditing: false,
          });
          const resolvedSectionEl =
            (cardEditableEl.closest(
              '[data-preview-section="true"]',
            ) as HTMLElement | null) || directSectionEl;
          const sectionSelection = resolvedSectionEl
            ? buildSectionSelection(resolvedSectionEl)
            : null;
          const layers = buildLayerItems(null, null, directSectionEl);
          onPreviewContextMenuRef.current?.({
            x: event.clientX,
            y: event.clientY,
            layers,
            target:
              layers.find(
                (layer) =>
                  layer.kind === "editable" &&
                  layer.editable?.fieldPath === editableSelection?.fieldPath &&
                  String(layer.editable?.blockId) ===
                    String(editableSelection?.blockId),
              ) || null,
            targetLayer:
              layers.find(
                (layer) =>
                  layer.kind === "editable" &&
                  layer.editable?.fieldPath === editableSelection?.fieldPath &&
                  String(layer.editable?.blockId) ===
                    String(editableSelection?.blockId),
              ) || null,
            section: sectionSelection,
            editable: editableSelection,
            image: null,
          });
          return;
        }

        const sectionSelection = resolvedSectionEl
          ? applySectionSelection(resolvedSectionEl)
          : null;
        const imageSelection = shouldPreferImageSelection
          ? applyImageSelection(imageEl)
          : null;
        const editableSelection = editableEl
          ? shouldPreferImageSelection
            ? null
            : applyEditableSelection(editableEl, { startEditing: false })
          : null;
        const layers = buildLayerItems(
          shouldPreferImageSelection ? null : editableEl,
          imageEl,
          resolvedSectionEl,
        );
        const targetLayer = imageSelection
          ? layers.find(
              (layer) =>
                layer.kind === "image" &&
                layer.image?.blockId === imageSelection.blockId &&
                layer.image?.fieldPath === imageSelection.fieldPath,
            ) || null
          : editableSelection
            ? layers.find(
                (layer) =>
                  layer.kind === "editable" &&
                  layer.editable?.blockId === editableSelection.blockId &&
                  layer.editable?.fieldPath === editableSelection.fieldPath,
              ) || null
            : layers.find(
                (layer) =>
                  layer.kind === "section" &&
                  layer.section?.blockId === sectionSelection?.blockId &&
                  layer.section?.styleKey === sectionSelection?.styleKey,
              ) || null;
        const iframeRect = iframe.getBoundingClientRect();

        onPreviewContextMenuRef.current?.({
          x: iframeRect.left + event.clientX,
          y: iframeRect.top + event.clientY,
          target: targetLayer,
          layers,
        });
      };

      const handleFocusOut = (event: FocusEvent) => {
        const activeEditable = activeEditableRef.current;
        if (!activeEditable) {
          return;
        }

        const nextTarget = event.relatedTarget as Node | null;
        if (nextTarget && activeEditable.contains(nextTarget)) {
          return;
        }

        finishEditing(true);
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        const activeEditable = activeEditableRef.current;
        if (!activeEditable || event.target !== activeEditable) {
          return;
        }

        const editType =
          activeEditable.getAttribute("data-edit-type") || "single";

        if (event.key === "Escape") {
          event.preventDefault();
          finishEditing(false);
          return;
        }

        if (event.key === "Enter" && editType === "single") {
          event.preventDefault();
          finishEditing(true);
        }
      };

      const handleFrameMessage = (event: MessageEvent) => {
        if (
          event.origin !== window.location.origin &&
          event.origin !== "null"
        ) {
          return;
        }
        const data = event.data;
        if (!data || typeof data !== "object") {
          return;
        }
        if (data.type !== "ASK_AI_BUTTON_STATUS") {
          return;
        }
        const nextStatus = data.status;
        if (
          nextStatus === "idle" ||
          nextStatus === "open" ||
          nextStatus === "loading" ||
          nextStatus === "success" ||
          nextStatus === "error"
        ) {
          applyAskAIButtonStatus(nextStatus);
        }
      };

      const handleMouseDown = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const clickedInsideOverlay = !!target?.closest?.(
          ".tt-selection-overlay",
        );
        const handleEl = target?.closest?.(
          ".tt-selection-handle",
        ) as HTMLElement | null;

        if (handleEl && overlayTarget && activeSelectionTargetRef.current) {
          const handleName = Array.from(handleEl.classList)
            .find((className) => className.startsWith("tt-selection-handle--"))
            ?.replace("tt-selection-handle--", "");

          if (handleName) {
            startInteraction(
              event,
              overlayTarget,
              activeSelectionTargetRef.current,
              "resize",
              handleName,
            );
          }
          return;
        }

        if (
          event.button !== 0 ||
          !activeSelectionTargetRef.current ||
          !overlayTarget ||
          !target ||
          target.closest(".tt-section-add-button") ||
          target.closest(".tt-section-inner-add-button")
        ) {
          return;
        }

        if (
          ((overlayTarget.contains(target) && !clickedInsideOverlay) ||
            clickedInsideOverlay) &&
          !target.closest(
            '.tt-selection-handle, input, textarea, select, [contenteditable="true"]',
          )
        ) {
          startInteraction(
            event,
            overlayTarget,
            activeSelectionTargetRef.current,
            "move",
          );
        }
      };

      doc.addEventListener("click", handleClick, true);
      doc.addEventListener("dblclick", handleDoubleClick, true);
      doc.addEventListener("mousedown", handleMouseDown, true);
      doc.addEventListener("contextmenu", handleContextMenu, true);
      doc.documentElement.addEventListener(
        "contextmenu",
        handleContextMenu,
        true,
      );
      doc.body.addEventListener("contextmenu", handleContextMenu, true);
      doc.addEventListener("focusout", handleFocusOut, true);
      doc.addEventListener("keydown", handleKeyDown, true);
      win.addEventListener("message", handleFrameMessage);

      return () => {
        finishEditing(true);
        interactionCleanup?.();
        doc.removeEventListener("click", handleClick, true);
        doc.removeEventListener("dblclick", handleDoubleClick, true);
        doc.removeEventListener("mousedown", handleMouseDown, true);
        doc.removeEventListener("contextmenu", handleContextMenu, true);
        doc.documentElement.removeEventListener(
          "contextmenu",
          handleContextMenu,
          true,
        );
        doc.body.removeEventListener("contextmenu", handleContextMenu, true);
        doc.removeEventListener("focusout", handleFocusOut, true);
        doc.removeEventListener("keydown", handleKeyDown, true);
        win.removeEventListener("message", handleFrameMessage);
        win.removeEventListener("scroll", queueOverlayUpdate);
        win.removeEventListener("resize", queueOverlayUpdate);
        hideSelectionOverlay();
        overlayEl.remove();
        styleEl.remove();
        showSelectionOverlayRef.current = () => {};
        hideSelectionOverlayRef.current = () => {};
        applyAskAIButtonStatusRef.current = () => {};
        inferEditableLabelRef.current = () => "Text";
        setMountNode(null);
        cacheRef.current = null;
        iframeDocumentRef.current = null;
      };
    }, [width]);

    React.useEffect(() => {
      applyAskAIButtonStatusRef.current(askAIButtonStatus);
    }, [askAIButtonStatus]);

    React.useEffect(() => {
      const doc = iframeDocumentRef.current;
      const root = mountNode;
      const win = doc?.defaultView;

      if (!doc || !root || !win) {
        return undefined;
      }

      const fallbackSectionAttributes = [
        "data-fallback-section",
        "data-fallback-media",
        "data-preview-section",
        "data-preview-block-id",
        "data-preview-style-key",
        "data-preview-label",
      ];
      const textLikeTags = new Set([
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "span",
        "small",
        "strong",
        "em",
        "label",
        "a",
        "button",
        "li",
        "dt",
        "dd",
        "blockquote",
        "figcaption",
      ]);
      const containerLikeTags = new Set([
        "section",
        "article",
        "aside",
        "nav",
        "footer",
        "header",
        "main",
        "div",
      ]);
      const meaningfulContainerClasses = [
        "MuiCard-root",
        "MuiPaper-root",
        "MuiChip-root",
        "MuiButtonBase-root",
        "MuiAvatar-root",
        "MuiListItem-root",
      ];

      const humanizeTagName = (tagName: string) => {
        switch (tagName) {
          case "a":
            return "Link";
          case "button":
            return "Button";
          case "img":
            return "Image";
          case "video":
            return "Video";
          case "svg":
            return "Icon";
          case "li":
            return "List item";
          case "nav":
            return "Navigation";
          case "footer":
            return "Footer";
          case "section":
            return "Section";
          case "article":
            return "Card";
          default:
            return tagName.charAt(0).toUpperCase() + tagName.slice(1);
        }
      };

      const isMeaningfullyVisible = (element: HTMLElement) => {
        const computed = win.getComputedStyle(element);
        if (
          computed.display === "none" ||
          computed.visibility === "hidden" ||
          computed.opacity === "0"
        ) {
          return false;
        }

        const rect = element.getBoundingClientRect();
        const hasArea = rect.width > 6 && rect.height > 6;
        const hasText = (element.textContent || "").trim().length > 0;
        return hasArea || hasText;
      };

      const getContext = (
        element: HTMLElement,
        fallbackContext: {
          blockId: string;
          styleKey: string;
          sectionLabel: string;
        } | null,
      ) => {
        const contextNode = element.closest(
          "[data-block-id], [data-preview-block-id]",
        ) as HTMLElement | null;
        const blockId =
          contextNode?.getAttribute("data-block-id") ||
          contextNode?.getAttribute("data-preview-block-id") ||
          fallbackContext?.blockId;
        if (!blockId) {
          return null;
        }

        const sectionNode = element.closest(
          '[data-preview-section="true"]',
        ) as HTMLElement | null;

        return {
          blockId,
          styleKey:
            sectionNode?.getAttribute("data-preview-style-key") ||
            fallbackContext?.styleKey ||
            "sectionStyle",
          sectionLabel:
            sectionNode?.getAttribute("data-preview-label") ||
            fallbackContext?.sectionLabel ||
            "Section",
        };
      };

      const clearFallbackMetadata = () => {
        Array.from(
          root.querySelectorAll<HTMLElement>("[data-fallback-section='true']"),
        ).forEach((element) => {
          fallbackSectionAttributes.forEach((attribute) =>
            element.removeAttribute(attribute),
          );
        });
      };

      const annotateFallbackMetadata = () => {
        clearFallbackMetadata();

        let lastContext: {
          blockId: string;
          styleKey: string;
          sectionLabel: string;
        } | null = null;

        Array.from(root.querySelectorAll<HTMLElement>("*")).forEach(
          (element) => {
            if (
              element.id === "preview-root" ||
              element.classList.contains("tt-selection-overlay") ||
              element.closest(".tt-selection-overlay")
            ) {
              return;
            }

            const tagName = element.tagName.toLowerCase();
            if (
              [
                "html",
                "head",
                "body",
                "style",
                "script",
                "path",
                "circle",
                "rect",
                "line",
                "g",
                "defs",
                "clipPath",
              ].includes(tagName)
            ) {
              return;
            }

            if (!isMeaningfullyVisible(element)) {
              return;
            }

            const context = getContext(element, lastContext);
            if (!context) {
              return;
            }
            lastContext = context;

            const hasExplicitEditable = element.hasAttribute("data-editable");
            const hasExplicitImage = element.hasAttribute("data-edit-image");
            const hasExplicitSection = element.getAttribute(
              "data-preview-section",
            ) === "true";

            const textContent = (element.textContent || "").trim();
            const containsDirectText =
              Array.from(element.childNodes).some(
                (node) =>
                  node.nodeType === Node.TEXT_NODE &&
                  (node.textContent || "").trim().length > 0,
              ) || textContent.length > 0;
            const isMediaTag =
              tagName === "img" || tagName === "video" || tagName === "svg";
            const hasMeaningfulClass = meaningfulContainerClasses.some((name) =>
              element.classList.contains(name),
            );
            const isContainerLike =
              containerLikeTags.has(tagName) ||
              hasMeaningfulClass ||
              element.getAttribute("role") === "button";

            if (!hasExplicitSection && isContainerLike) {
              const rect = element.getBoundingClientRect();
              if (
                rect.width > 32 &&
                rect.height > 24 &&
                (element.children.length > 0 ||
                  !!element.getAttribute("aria-label") ||
                  textContent.length > 0)
              ) {
                element.setAttribute("data-fallback-section", "true");
                element.setAttribute("data-preview-section", "true");
                element.setAttribute("data-preview-block-id", context.blockId);
                element.setAttribute(
                  "data-preview-style-key",
                  context.styleKey,
                );
                element.setAttribute(
                  "data-preview-label",
                  element.getAttribute("aria-label") ||
                    humanizeTagName(tagName),
                );
              }
            }

            if (hasExplicitEditable || hasExplicitImage) {
              return;
            }

            if (
              !hasExplicitSection &&
              (isMediaTag || textLikeTags.has(tagName) || containsDirectText)
            ) {
              element.setAttribute("data-fallback-section", "true");
              if (isMediaTag) {
                element.setAttribute("data-fallback-media", "true");
              }
              element.setAttribute("data-preview-section", "true");
              element.setAttribute("data-preview-block-id", context.blockId);
              element.setAttribute(
                "data-preview-style-key",
                context.styleKey,
              );
              element.setAttribute(
                "data-preview-label",
                element.getAttribute("aria-label") ||
                  element.getAttribute("alt") ||
                  humanizeTagName(tagName),
              );
            }
          },
        );

        if (import.meta.env.DEV) {
          const fallbackSectionCount = root.querySelectorAll(
            "[data-fallback-section='true']",
          ).length;

          if (fallbackSectionCount > 0) {
            console.warn(
              `[Template Editability] ${templateId} rendered ${fallbackSectionCount} fallback selectable nodes. Replace them with explicit editable primitives and backend-safe schema mapping.`,
            );
          }
        }
      };

      let frame: number | null = win.requestAnimationFrame(
        annotateFallbackMetadata,
      );
      const observer = new MutationObserver(() => {
        if (frame !== null) {
          win.cancelAnimationFrame(frame);
        }
        frame = win.requestAnimationFrame(annotateFallbackMetadata);
      });

      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => {
        if (frame !== null) {
          win.cancelAnimationFrame(frame);
        }
        observer.disconnect();
      };
    }, [mountNode, data, templateId]);

    React.useEffect(() => {
      const doc = iframeDocumentRef.current;
      if (!doc || !selectedPreviewTarget) {
        return;
      }

      Array.from(doc.querySelectorAll(".tt-editable-selected")).forEach(
        (node) => {
          node.classList.remove("tt-editable-selected");
        },
      );
      Array.from(doc.querySelectorAll(".tt-image-selected")).forEach((node) => {
        node.classList.remove("tt-image-selected");
      });
      Array.from(doc.querySelectorAll(".tt-section-selected")).forEach(
        (node) => {
          node.classList.remove("tt-section-selected");
        },
      );
      hideSelectionOverlayRef.current();

      if (selectedPreviewTarget.kind === "section") {
        const matchingSection = Array.from(
          doc.querySelectorAll('[data-preview-section="true"]'),
        ).find((node) => {
          const element = node as HTMLElement;
          return (
            element.getAttribute("data-preview-block-id") ===
              String(selectedPreviewTarget.blockId) &&
            (element.getAttribute("data-preview-style-key") ||
              "sectionStyle") ===
              (selectedPreviewTarget.styleKey || "sectionStyle")
          );
        }) as HTMLElement | undefined;

        matchingSection?.classList.add("tt-section-selected");
        if (matchingSection) {
          const label =
            matchingSection.getAttribute("data-preview-label") || "Section";
          showSelectionOverlayRef.current(matchingSection, label, "section");
          activeSelectionTargetRef.current = {
            kind: "section",
            blockId: selectedPreviewTarget.blockId,
            styleKey: selectedPreviewTarget.styleKey || "sectionStyle",
            nonce: selectedPreviewTarget.nonce,
          };
        }
        activeSectionRef.current = matchingSection || null;
        return;
      }

      if (selectedPreviewTarget.kind === "image") {
        const matchingImage = Array.from(
          doc.querySelectorAll("[data-edit-image]"),
        ).find((node) => {
          const element = node as HTMLElement;
          return (
            element.getAttribute("data-block-id") ===
              String(selectedPreviewTarget.blockId) &&
            element.getAttribute("data-edit-image") ===
              selectedPreviewTarget.fieldPath
          );
        }) as HTMLElement | undefined;

        matchingImage?.classList.add("tt-image-selected");
        if (matchingImage) {
          const label =
            matchingImage.getAttribute("data-image-label") || "Image";
          showSelectionOverlayRef.current(matchingImage, label, "image");
          activeSelectionTargetRef.current = {
            kind: "image",
            blockId: selectedPreviewTarget.blockId,
            fieldPath: selectedPreviewTarget.fieldPath,
            nonce: selectedPreviewTarget.nonce,
          };
        }
        activeSectionRef.current = null;
        return;
      }

      const matchingEditable = Array.from(
        doc.querySelectorAll("[data-editable]"),
      ).find((node) => {
        const element = node as HTMLElement;
        return (
          element.getAttribute("data-block-id") ===
            String(selectedPreviewTarget.blockId) &&
          element.getAttribute("data-editable") ===
            selectedPreviewTarget.fieldPath
        );
      }) as HTMLElement | undefined;

      matchingEditable?.classList.add("tt-editable-selected");
      if (matchingEditable) {
        const fieldPath = matchingEditable.getAttribute("data-editable") || "";
        showSelectionOverlayRef.current(
          matchingEditable,
          inferEditableLabelRef.current(matchingEditable, fieldPath),
          "editable",
        );
        activeSelectionTargetRef.current = {
          kind: "editable",
          blockId: selectedPreviewTarget.blockId,
          fieldPath: selectedPreviewTarget.fieldPath,
          nonce: selectedPreviewTarget.nonce,
        };
      }
      activeSectionRef.current = null;
    }, [selectedPreviewTarget]);

    const portal =
      mountNode && cacheRef.current
        ? createPortal(
            <CacheProvider value={cacheRef.current}>
              <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                <Box
                  sx={{ width: "100%", minHeight: "100vh", bgcolor: "#fff" }}
                >
                  <TemplateEngine templateId={templateId} data={data} />
                </Box>
              </MuiThemeProvider>
            </CacheProvider>,
            mountNode,
          )
        : null;

    return (
      <>
        <iframe
          ref={iframeRef}
          title={title}
          onContextMenu={(event) => {
            event.preventDefault();
          }}
          style={{
            width: "100%",
            height: "100%",
            minHeight,
            border: "none",
            display: "block",
            backgroundColor: "#fff",
          }}
        />
        {portal}
      </>
    );
  },
);

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

/** Step 9.16.3: Inline edit start data from iframe EDIT_START message */
export interface InlineEditStartData {
  blockId: string;
  fieldPath: string;
  value: string;
  rect: { top: number; left: number; width: number; height: number };
  editType: "single" | "multi";
}

export interface EditableElementSelectionData {
  blockId: string;
  fieldPath: string;
  value: string;
  editType: "single" | "multi";
  label?: string;
  computedStyle?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    textShadow?: string;
  };
  rect?: { top: number; left: number; width: number; height: number };
}

export interface ImageSelectionData {
  blockId: string;
  fieldPath: string;
  src: string;
  label: string;
  rect?: { top: number; left: number; width: number; height: number };
}

export interface SectionSelectionData {
  blockId: string;
  label: string;
  styleKey?: "sectionStyle" | "outerSectionStyle";
  supportsInnerBlocks?: boolean;
  rect?: { top: number; left: number; width: number; height: number };
}

export interface PreviewLayerNodeData {
  id: string;
  kind: "section" | "editable" | "image";
  label: string;
  depth: number;
  section?: SectionSelectionData;
  editable?: EditableElementSelectionData;
  image?: ImageSelectionData;
}

export interface PreviewContextMenuData {
  x: number;
  y: number;
  target: PreviewLayerNodeData | null;
  targetLayer?: PreviewLayerNodeData | null;
  section?: SectionSelectionData | null;
  editable?: EditableElementSelectionData | null;
  image?: ImageSelectionData | null;
  layers: PreviewLayerNodeData[];
}

export interface PreviewSelectionTarget {
  kind: "section" | "editable" | "image";
  blockId: string;
  fieldPath?: string;
  styleKey?: "sectionStyle" | "outerSectionStyle";
  nonce: number;
}

export interface PreviewElementTransformPatch {
  width?: string;
  height?: string;
  transform?: string;
}

interface PreviewPanelProps {
  websiteId: string | number;
  pageId: string | number;
  pageTitle?: string;
  pages?: Array<{ id: string | number; title: string }>;
  onPageChange?: (pageId: string) => void;
  /** Step 9.14.3: Called when a block is clicked in the iframe preview */
  onBlockSelected?: (blockId: string) => void;
  /** Step 9.14.3: Called when a block is hovered/unhovered in the iframe preview */
  onBlockHover?: (blockId: string | null) => void;
  /** Step 9.14.3: Currently selected block ID — synced back to iframe for visual highlight */
  selectedBlockId?: string | null;
  /** Called when an editable text element is selected in the iframe preview */
  onEditableElementSelected?: (data: EditableElementSelectionData) => void;
  /** Called when an editable image element is selected in the iframe preview */
  onImageSelected?: (data: ImageSelectionData) => void;
  /** Called when an editable image element is double-clicked in the iframe preview */
  onImageDoubleClick?: (data: ImageSelectionData) => void;
  /** Called when a section wrapper is selected in the iframe preview */
  onSectionSelected?: (data: SectionSelectionData | null) => void;
  /** Called when the section overlay add button is clicked */
  onSectionAddRequest?: (
    data: SectionSelectionData,
    position: "before" | "after",
  ) => void;
  /** Called when the selected section supports adding inner blocks */
  onSectionInnerAddRequest?: (data: SectionSelectionData) => void;
  /** Called when a custom preview context menu should open */
  onPreviewContextMenu?: (data: PreviewContextMenuData | null) => void;
  /** Called when the selected element overlay Ask AI button is clicked */
  onAskAIRequest?: (data?: {
    anchorRect?: { top: number; left: number; width: number; height: number };
  }) => void;
  /** Called when inline editing starts inside the preview iframe */
  onInlineEditStart?: (data: InlineEditStartData) => void;
  /** Called when inline text editing inside the preview is saved */
  onEditableTextSave?: (
    blockId: string,
    fieldPath: string,
    value: string,
  ) => void;
  /** Commits drag/resize style changes for the selected preview element */
  onElementTransform?: (
    target: PreviewSelectionTarget,
    patch: PreviewElementTransformPatch,
  ) => void;
  saveSignal?: number;
  /** Step 9.16.3: Exposes the iframe ref for InlineTextEditor positioning */
  iframeRefCallback?: (ref: React.RefObject<HTMLIFrameElement | null>) => void;
  /** Syncs visual selection inside the iframe from the parent editor */
  selectedPreviewTarget?: PreviewSelectionTarget | null;
  /** Mirrors the parent Ask AI request state inside the iframe overlay button */
  askAIButtonStatus?: AskAIButtonStatus;
  draggedLibraryBlock?: { key: string; label: string } | null;
  canDropLibraryBlock?: boolean;
  onLibraryBlockDrop?: () => void;
  frontendTemplateIdOverride?: string | null;
  frontendTemplateDataOverride?: BusinessData | null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const PreviewPanel = React.memo(function PreviewPanel({
  websiteId,
  pageId,
  pageTitle,
  pages = [],
  onPageChange,
  onBlockSelected,
  onBlockHover,
  selectedBlockId,
  onEditableElementSelected,
  onImageSelected,
  onImageDoubleClick,
  onSectionSelected,
  onSectionAddRequest,
  onSectionInnerAddRequest,
  onPreviewContextMenu,
  onAskAIRequest,
  onInlineEditStart,
  onEditableTextSave,
  onElementTransform,
  saveSignal,
  iframeRefCallback,
  selectedPreviewTarget,
  askAIButtonStatus = "idle",
  draggedLibraryBlock,
  canDropLibraryBlock = false,
  onLibraryBlockDrop,
  frontendTemplateIdOverride,
  frontendTemplateDataOverride,
}: PreviewPanelProps) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // Editor-preview state bridge
  const previewCtx = usePreview();
  const selectedPageValue = pages.some(
    (page) => String(page.id) === String(pageId),
  )
    ? String(pageId)
    : "";

  // Local state
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [scaleToFit, setScaleToFit] = React.useState(true);
  const [mode, setMode] = React.useState<PreviewMode>("live");
  const [zoom, setZoom] = React.useState<ZoomLevel>(1);
  const [rotated, setRotated] = React.useState(false);
  const [timedOut, setTimedOut] = React.useState(false);
  const [fallbackActive, setFallbackActive] = React.useState(false);
  const [isLibraryDropActive, setIsLibraryDropActive] = React.useState(false);

  // Refs
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 9.16.3: Expose iframe ref to parent for InlineTextEditor positioning
  React.useEffect(() => {
    iframeRefCallback?.(iframeRef);
  }, [iframeRefCallback]);

  // Static mode hook (existing Step 4.6/4.9 behavior)
  const {
    src,
    iframeLoading,
    iframeError,
    tokenExpired,
    onLoad: staticOnLoad,
    onError: staticOnError,
    refresh,
  } = usePreviewIframe(websiteId, pageId, viewport);
  const isSyntheticTemplatePage =
    typeof pageId === "string" && /^page-\d+$/.test(pageId);
  const allowStaticTemplatePreview = !isSyntheticTemplatePage;

  // Auto-fallback: if previewError is set and we're in live mode, switch to static
  const effectiveMode = React.useMemo(() => {
    if (
      mode === "live" &&
      previewCtx.previewError &&
      allowStaticTemplatePreview
    ) {
      return "static";
    }
    return mode;
  }, [mode, previewCtx.previewError, allowStaticTemplatePreview]);

  // Track fallback state
  React.useEffect(() => {
    if (
      mode === "live" &&
      previewCtx.previewError &&
      allowStaticTemplatePreview
    ) {
      setFallbackActive(true);
    } else if (mode === "live" && !previewCtx.previewError) {
      setFallbackActive(false);
    } else if (!allowStaticTemplatePreview) {
      setFallbackActive(false);
    }
  }, [mode, previewCtx.previewError, allowStaticTemplatePreview]);

  // Generate srcdoc for live mode
  const srcdocHtml = React.useMemo(() => {
    if (effectiveMode !== "live" || !previewCtx.currentPageContent) {
      return null;
    }

    const { blocks, websiteMeta } = previewCtx.currentPageContent;
    const website = {
      name: websiteMeta?.name || "Preview",
      colors: websiteMeta?.colors,
      fonts: websiteMeta?.fonts,
    };
    const page = {
      id: previewCtx.currentPageContent.pageId,
      title: websiteMeta?.name || "Preview",
    };

    return generateLivePreview(website, page, blocks, window.location.origin);
  }, [effectiveMode, previewCtx.currentPageContent, previewCtx.revision]);

  const frontendTemplateId =
    frontendTemplateIdOverride ||
    previewCtx.currentPageContent?.websiteMeta?.frontendTemplateId ||
    null;
  const frontendTemplateData = React.useMemo(() => {
    if (frontendTemplateDataOverride && frontendTemplateId) {
      return frontendTemplateDataOverride;
    }

    const override =
      previewCtx.currentPageContent?.websiteMeta?.templateDataOverride;
    if (override && frontendTemplateId) {
      return override as unknown as BusinessData;
    }

    if (
      !frontendTemplateId ||
      !hasFrontendTemplateBaseData(frontendTemplateId)
    ) {
      return null;
    }

    const websiteMeta = previewCtx.currentPageContent?.websiteMeta;
    if (!websiteMeta) {
      return null;
    }

    return buildFrontendTemplateBusinessData(frontendTemplateId, {
      name: websiteMeta.name || "Preview Website",
      businessName: websiteMeta.businessName,
      primaryColor: websiteMeta.primaryColor,
      secondaryColor: websiteMeta.secondaryColor,
      metaDescription: websiteMeta.metaDescription,
      shortDescription: websiteMeta.shortDescription,
      logoUrl: websiteMeta.logoUrl,
      fullAddress: websiteMeta.fullAddress,
      tags: websiteMeta.tags,
    });
  }, [
    frontendTemplateDataOverride,
    frontendTemplateId,
    previewCtx.currentPageContent,
  ]);

  const isFrontendTemplatePreview =
    effectiveMode === "live" && !!frontendTemplateId && !!frontendTemplateData;

  const handleLibraryDragOver = React.useCallback(
    (event: React.DragEvent) => {
      if (!draggedLibraryBlock) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = canDropLibraryBlock ? "copy" : "none";
      if (!isLibraryDropActive) {
        setIsLibraryDropActive(true);
      }
    },
    [draggedLibraryBlock, canDropLibraryBlock, isLibraryDropActive],
  );

  const handleLibraryDragLeave = React.useCallback((event: React.DragEvent) => {
    if (
      event.currentTarget instanceof Node &&
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }

    setIsLibraryDropActive(false);
  }, []);

  const handleLibraryDrop = React.useCallback(
    (event: React.DragEvent) => {
      if (!draggedLibraryBlock) {
        return;
      }

      event.preventDefault();
      setIsLibraryDropActive(false);
      if (!canDropLibraryBlock) {
        return;
      }
      onLibraryBlockDrop?.();
    },
    [draggedLibraryBlock, canDropLibraryBlock, onLibraryBlockDrop],
  );

  React.useEffect(() => {
    if (!draggedLibraryBlock) {
      setIsLibraryDropActive(false);
    }
  }, [draggedLibraryBlock]);

  // PostMessage: send CONTENT_UPDATE to iframe
  const sendPostMessage = React.useCallback(
    (message: Record<string, unknown>) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          message,
          window.location.origin,
        );
      }
    },
    [],
  );

  // PostMessage listener for messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && event.origin !== "null")
        return;

      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "CSP_VIOLATION") {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("[PreviewPanel] CSP violation in iframe:", data.detail);
        }
      }

      // Step 9.14.3: Relay block selection events to parent
      if (data.type === "BLOCK_SELECTED") {
        onBlockSelected?.(data.blockId as string);
      }

      if (data.type === "BLOCK_HOVER") {
        onBlockHover?.(data.blockId as string | null);
      }

      if (data.type === "ASK_AI_REQUEST") {
        const iframe = iframeRef.current;
        const iframeRect = iframe?.getBoundingClientRect();
        const iframeWindow = iframe?.contentWindow;
        const rawAnchor = data.anchorRect as
          | { top: number; left: number; width: number; height: number }
          | undefined;
        const viewportAnchor = data.viewportAnchorRect as
          | { top: number; left: number; width: number; height: number }
          | null
          | undefined;
        const anchorRect =
          viewportAnchor ||
          (rawAnchor && iframeRect
            ? {
                top:
                  iframeRect.top +
                  rawAnchor.top *
                    (iframeRect.height /
                      Math.max(
                        1,
                        iframeWindow?.innerHeight ?? iframeRect.height,
                      )),
                left:
                  iframeRect.left +
                  rawAnchor.left *
                    (iframeRect.width /
                      Math.max(
                        1,
                        iframeWindow?.innerWidth ?? iframeRect.width,
                      )),
                width:
                  rawAnchor.width *
                  (iframeRect.width /
                    Math.max(1, iframeWindow?.innerWidth ?? iframeRect.width)),
                height:
                  rawAnchor.height *
                  (iframeRect.height /
                    Math.max(
                      1,
                      iframeWindow?.innerHeight ?? iframeRect.height,
                    )),
              }
            : rawAnchor);
        onAskAIRequest?.({ anchorRect });
      }

      // Step 9.16.3: Relay inline edit start from iframe
      if (data.type === "EDIT_START" && data.blockId && data.fieldPath) {
        onInlineEditStart?.({
          blockId: data.blockId as string,
          fieldPath: data.fieldPath as string,
          value: data.value as string,
          rect: data.rect as {
            top: number;
            left: number;
            width: number;
            height: number;
          },
          editType: (data.editType as "single" | "multi") || "single",
        });
      }

      if (data.type === "EDITABLE_SELECTED" && data.blockId && data.fieldPath) {
        onEditableElementSelected?.({
          blockId: data.blockId as string,
          fieldPath: data.fieldPath as string,
          value: String(data.value || ""),
          editType: (data.editType as "single" | "multi") || "single",
          rect: data.rect as
            | { top: number; left: number; width: number; height: number }
            | undefined,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    onAskAIRequest,
    onBlockSelected,
    onBlockHover,
    onEditableElementSelected,
    onInlineEditStart,
  ]);

  // Send VIEWPORT_CHANGE when viewport or zoom changes
  React.useEffect(() => {
    sendPostMessage({
      type: "VIEWPORT_CHANGE",
      viewport,
      zoom,
      rotated,
    });
  }, [viewport, zoom, rotated, sendPostMessage]);

  // Step 9.14.3: Sync selectedBlockId to iframe via postMessage
  React.useEffect(() => {
    if (selectedBlockId) {
      sendPostMessage({ type: "SELECT_BLOCK", blockId: selectedBlockId });
    } else if (selectedBlockId === null) {
      sendPostMessage({ type: "DESELECT_ALL" });
    }
  }, [selectedBlockId, sendPostMessage]);

  // Timeout detection for loading state
  React.useEffect(() => {
    if (iframeLoading && effectiveMode === "static") {
      timeoutRef.current = setTimeout(() => {
        setTimedOut(true);
      }, TIMEOUT_MS);
    } else {
      setTimedOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [iframeLoading, effectiveMode]);

  // Live mode timeout: detect if srcdoc iframe takes too long to load
  const [liveTimedOut, setLiveTimedOut] = React.useState(false);
  const liveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    if (effectiveMode === "live" && srcdocHtml && !isFrontendTemplatePreview) {
      setLiveTimedOut(false);
      liveTimeoutRef.current = setTimeout(() => {
        setLiveTimedOut(true);
      }, TIMEOUT_MS);
    } else {
      setLiveTimedOut(false);
    }
    return () => {
      if (liveTimeoutRef.current) {
        clearTimeout(liveTimeoutRef.current);
        liveTimeoutRef.current = null;
      }
    };
  }, [effectiveMode, srcdocHtml, isFrontendTemplatePreview]);

  // Clear live timeout when iframe loads
  const handleLiveIframeLoad = React.useCallback(() => {
    setLiveTimedOut(false);
    if (liveTimeoutRef.current) {
      clearTimeout(liveTimeoutRef.current);
      liveTimeoutRef.current = null;
    }
  }, []);

  // Viewport change handler
  const handleViewportChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, value: Viewport | null) => {
      if (value) {
        setViewport(value);
        setRotated(false); // Reset rotation on viewport change
      }
    },
    [],
  );

  // Mode change handler
  const handleModeChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, value: PreviewMode | null) => {
      if (value) {
        setMode(value);
        setTimedOut(false);
        setLiveTimedOut(false);
        if (value === "live") {
          setFallbackActive(false);
        }
      }
    },
    [],
  );

  // Zoom change handler
  const handleZoomChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, value: ZoomLevel | null) => {
      if (value !== null) setZoom(value);
    },
    [],
  );

  // Rotation handler
  const handleRotate = React.useCallback(() => {
    setRotated((prev) => !prev);
  }, []);

  // Retry handler
  const handleRetry = React.useCallback(() => {
    setTimedOut(false);
    setLiveTimedOut(false);
    if (mode === "live") {
      previewCtx.refreshPreview();
    }
    refresh();
  }, [mode, refresh, previewCtx]);

  // Try live again handler
  const handleTryLiveAgain = React.useCallback(() => {
    setMode("live");
    setFallbackActive(false);
    previewCtx.setPreviewError(null);
  }, [previewCtx]);

  // Calculate dimensions
  const baseWidth = VIEWPORT_WIDTHS[viewport];
  const baseHeight = VIEWPORT_HEIGHTS[viewport];
  const displayWidth = rotated ? baseHeight : baseWidth;
  const displayHeight = rotated ? baseWidth : baseHeight;

  // Container width for scale-to-fit
  const [containerWidth, setContainerWidth] = React.useState(0);
  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Scale factor: combine scale-to-fit with zoom
  const fitScale =
    scaleToFit && containerWidth > 0
      ? Math.min(1, containerWidth / displayWidth)
      : 1;
  const effectiveScale = fitScale * zoom;

  // Screen reader announcements
  const [viewportAnnouncement, setViewportAnnouncement] = React.useState("");
  React.useEffect(() => {
    setViewportAnnouncement(`Preview switched to ${viewport} view`);
    const timer = setTimeout(() => setViewportAnnouncement(""), 1000);
    return () => clearTimeout(timer);
  }, [viewport]);

  const showDeviceFrame = viewport === "mobile";
  const previewSurfaceWidth = displayWidth;
  const previewSurfaceHeight = scaleToFit ? `${100 / effectiveScale}%` : "100%";
  const previewSurfaceTransform = `scale(${effectiveScale})`;
  const previewSurfaceMinHeight = scaleToFit ? 0 : 600;
  const previewSurfaceTransition = "width 0.3s ease, transform 0.3s ease";

  // Determine if we show the "no src" placeholder
  const hasContent =
    effectiveMode === "live"
      ? !!previewCtx.currentPageContent || isFrontendTemplatePreview
      : !!src;

  if (!hasContent && !src) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: 300,
          color: colors.textSecondary,
        }}
      >
        <Typography variant="body2">Select a page to preview</Typography>
      </Box>
    );
  }

  // Determine the current timeout state
  const isTimedOut = effectiveMode === "static" ? timedOut : liveTimedOut;
  const isLoading = effectiveMode === "static" ? iframeLoading : false;
  const isError = effectiveMode === "static" ? iframeError : false;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        overflow: "hidden",
        // background: actualTheme === 'dark'
        //   ? 'linear-gradient(180deg, rgba(14,18,19,0.96) 0%, rgba(9,12,13,0.98) 100%)'
        //   : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,250,252,0.98) 100%)',
        boxShadow:
          actualTheme === "dark"
            ? "0 30px 80px rgba(0,0,0,0.45)"
            : "0 24px 60px rgba(15,23,42,0.08)",
      }}
    >
      {/* Screen reader announcement */}
      <Box
        role="status"
        aria-live="polite"
        aria-atomic
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
        }}
      >
        {viewportAnnouncement}
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 1.2, md: 1.5 },
          py: 0.9,
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          gap: 1,
          flexWrap: "wrap",
          background: "linear-gradient(180deg, #f8f8f8 0%, #f1f1f1 100%)",
        }}
      >
        {/* Left: Browser chrome + page selector */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            {["#e5e7eb", "#e5e7eb", "#e5e7eb"].map((dot, index) => (
              <Box
                key={index}
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  bgcolor: dot,
                  border: "1px solid rgba(15,23,42,0.05)",
                }}
              />
            ))}
          </Box>

          <Select
            value={selectedPageValue}
            onChange={(event) => onPageChange?.(String(event.target.value))}
            size="small"
            IconComponent={ChevronDown}
            displayEmpty
            sx={{
              minWidth: 180,
              height: 38,
              borderRadius: "12px",
              bgcolor: "rgba(255,255,255,0.86)",
              color: "#000000",
              fontSize: "0.92rem",
              fontWeight: 600,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.88)",
              "& .MuiSelect-select": {
                py: 0.75,
                pl: 1.25,
                pr: "2rem !important",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(148,163,184,0.18)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(15,23,42,0.22)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#2563eb",
              },
              "& .MuiSelect-icon": {
                color: "#475569",
                right: 8,
                width: 16,
                height: 16,
              },
            }}
            renderValue={(value) => {
              const activePage = pages.find(
                (page) => String(page.id) === String(value),
              );
              return `Page: ${activePage?.title || pageTitle || "Homepage"}`;
            }}
          >
            {!pages.length && (
              <MenuItem value="" disabled>
                {pageTitle || "Homepage"}
              </MenuItem>
            )}
            {pages.map((page) => (
              <MenuItem key={page.id} value={String(page.id)}>
                {page.title}
              </MenuItem>
            ))}
          </Select>

          {/* Preview mode toggle (Live / Static) */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, value) => {
              if (typeof value === "string") setMode(value as PreviewMode);
            }}
            size="small"
            aria-label="Preview mode"
            sx={{
              p: 0.35,
              borderRadius: "14px",
              backgroundColor: "rgba(255,255,255,0.74)",
              border: "1px solid rgba(148,163,184,0.16)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              "& .MuiToggleButton-root": {
                border: "1px solid transparent",
                color: "#6b7280",
                minWidth: 88,
                minHeight: 36,
                borderRadius: "10px !important",
                backgroundColor: "transparent",
                fontSize: "0.82rem",
                fontWeight: 600,
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, #142c2f 0%, #24484a 100%)",
                  color: "#ffffff",
                  borderColor: "rgba(59,130,246,0.18)",
                  boxShadow: "0 10px 24px rgba(37,99,235,0.14)",
                },
              },
            }}
          >
            <ToggleButton value="live" aria-label="Live mode">Live mode</ToggleButton>
            <ToggleButton value="static" aria-label="Static mode">Static mode</ToggleButton>
          </ToggleButtonGroup>

          {/* Viewport toggle */}
          <ToggleButtonGroup
            value={viewport}
            exclusive
            onChange={handleViewportChange}
            size="small"
            aria-label="Preview viewport"
            sx={{
              p: 0.35,
              borderRadius: "14px",
              backgroundColor: "rgba(255,255,255,0.74)",
              border: "1px solid rgba(148,163,184,0.16)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              "& .MuiToggleButton-root": {
                border: "1px solid transparent",
                color: "#6b7280",
                minWidth: 44,
                minHeight: 36,
                borderRadius: "10px !important",
                backgroundColor: "transparent",
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, #142c2f 0%, #24484a 100%)",
                  color: "#ffffff",
                  borderColor: "rgba(59,130,246,0.18)",
                  boxShadow: "0 10px 24px rgba(37,99,235,0.14)",
                  "&:hover": { backgroundColor: "rgba(59, 130, 246, 0.12)" },
                },
              },
            }}
          >
            <ToggleButton value="desktop" aria-label="Desktop view">
              <Tooltip title="Desktop (1920px)">
                <Monitor size={16} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="tablet" aria-label="Tablet view">
              <Tooltip title="Tablet (768px)">
                <Tablet size={16} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="mobile" aria-label="Mobile view">
              <Tooltip title="Mobile (375px)">
                <Smartphone size={16} />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Right: Zoom + Rotation + Scale-to-fit + Refresh */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Viewport dimensions */}
          <Typography variant="caption" sx={{ color: colors.textSecondary, mr: 0.5 }}>
            {`${displayWidth} × ${displayHeight}`}
          </Typography>

          {/* Zoom controls */}
          <ToggleButtonGroup
            value={zoom}
            exclusive
            onChange={handleZoomChange}
            size="small"
            aria-label="Zoom level"
            sx={{
              p: 0.35,
              borderRadius: "14px",
              backgroundColor: "rgba(255,255,255,0.74)",
              border: "1px solid rgba(148,163,184,0.16)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              "& .MuiToggleButton-root": {
                border: "1px solid transparent",
                color: "#6b7280",
                fontSize: "0.72rem",
                px: 1,
                minHeight: 34,
                borderRadius: "10px !important",
                backgroundColor: "transparent",
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, #142c2f 0%, #24484a 100%)",
                  color: "#ffffff",
                  borderColor: "rgba(59,130,246,0.18)",
                  boxShadow: "0 10px 24px rgba(37,99,235,0.14)",
                },
              },
            }}
          >
            <ToggleButton value={0.5} aria-label="50%">
              50%
            </ToggleButton>
            <ToggleButton value={0.75} aria-label="75%">
              75%
            </ToggleButton>
            <ToggleButton value={1} aria-label="100%">
              100%
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Rotation toggle (mobile/tablet only) */}
          {viewport !== "desktop" && (
            <Tooltip title={rotated ? "Portrait" : "Landscape"}>
              <IconButton
                onClick={handleRotate}
                size="small"
                aria-label="Rotate viewport"
                sx={{
                  color: "#64748b",
                  border: "1px solid rgba(148,163,184,0.16)",
                  backgroundColor: "rgba(255,255,255,0.72)",
                  "&:hover": {
                    color: "#2563eb",
                    backgroundColor: "rgba(255,255,255,0.92)",
                  },
                }}
              >
                <RotateCw size={16} />
              </IconButton>
            </Tooltip>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={scaleToFit}
                onChange={(_, checked) => setScaleToFit(checked)}
                size="small"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {scaleToFit ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  {scaleToFit ? "Fit" : "Actual"}
                </Typography>
              </Box>
            }
            sx={{ mr: 0.5 }}
          />

          <Tooltip title="Refresh preview">
            <IconButton
              onClick={refresh}
              size="small"
              aria-label="Refresh preview"
              sx={{
                color: "#64748b",
                minWidth: 44,
                minHeight: 44,
                border: "1px solid rgba(148,163,184,0.16)",
                backgroundColor: "rgba(255,255,255,0.72)",
                "&:hover": {
                  color: "#2563eb",
                  backgroundColor: "rgba(255,255,255,0.92)",
                },
              }}
            >
              <RefreshCw size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Fallback banner (5.1.5) */}
      {fallbackActive && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            px: 2,
            py: 0.75,
            backgroundColor: "rgba(245,158,11,0.15)",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            Switched to static preview
          </Typography>
          <Button
            size="small"
            onClick={handleTryLiveAgain}
            aria-label="Try live again"
            sx={{ textTransform: "none", fontSize: "0.75rem" }}
          >
            Try Live Again
          </Button>
        </Box>
      )}

      {/* Preview Area */}
      <Box
        ref={containerRef}
        onDragOver={handleLibraryDragOver}
        onDragLeave={handleLibraryDragLeave}
        onDrop={handleLibraryDrop}
        sx={{
          flex: 1,
          overflow: scaleToFit ? "hidden" : "auto",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: { xs: 1.5, md: 1.1 },
          background:
            "radial-gradient(circle at top, rgba(45,212,191,0.1), transparent 24%), linear-gradient(180deg, rgba(248,250,252,1), rgba(241,245,249,1))",
        }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              backgroundColor:
                actualTheme === "dark"
                  ? "rgba(0,0,0,0.5)"
                  : "rgba(255,255,255,0.7)",
              gap: 1,
            }}
          >
            <CircularProgress size={32} sx={{ color: "#378C92" }} />
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Loading preview...
            </Typography>
          </Box>
        )}

        {draggedLibraryBlock && (
          <Box
            sx={{
              position: "absolute",
              inset: 14,
              zIndex: 4,
              pointerEvents: "none",
              borderRadius: "24px",
              border: isLibraryDropActive
                ? "2px dashed rgba(37, 99, 235, 0.7)"
                : "2px dashed rgba(15, 23, 42, 0.18)",
              background: isLibraryDropActive
                ? "rgba(37, 99, 235, 0.08)"
                : "rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 160ms ease",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 3,
                backgroundColor: "rgba(15, 23, 42, 0.86)",
                color: "#fff",
                textAlign: "center",
                boxShadow: "0 18px 36px rgba(15, 23, 42, 0.24)",
              }}
            >
              <Typography sx={{ fontSize: "0.92rem", fontWeight: 800 }}>
                Drop {draggedLibraryBlock.label}
              </Typography>
              <Typography sx={{ mt: 0.35, fontSize: "0.78rem", opacity: 0.84 }}>
                {canDropLibraryBlock
                  ? "Drop on the canvas to insert near the selected section."
                  : "Select a section first, then drop the block here."}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Timeout error UI (5.1.5) */}
        {isTimedOut && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
              backgroundColor:
                actualTheme === "dark"
                  ? "rgba(0,0,0,0.7)"
                  : "rgba(255,255,255,0.9)",
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: colors.text, fontWeight: 500 }}
            >
              Preview timed out
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRetry}
              aria-label="Retry preview"
              sx={{ textTransform: "none" }}
            >
              Retry
            </Button>
          </Box>
        )}

        {/* Token expired banner */}
        {tokenExpired && !isLoading && effectiveMode === "static" && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 3,
              p: 1,
              backgroundColor: "rgba(245,158,11,0.9)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Preview session expired
            </Typography>
            <IconButton
              onClick={refresh}
              size="small"
              sx={{ color: "#fff", minWidth: 36, minHeight: 36 }}
              aria-label="Refresh expired preview"
            >
              <RefreshCw size={14} />
            </IconButton>
          </Box>
        )}

        {/* Error state (static mode) */}
        {isError && !isLoading && effectiveMode === "static" ? (
          navigator.onLine === false ? (
            <PreviewNetworkError onRetry={refresh} />
          ) : (
            <PreviewImageError
              onRetry={refresh}
              message="Failed to load website preview"
            />
          )
        ) : isFrontendTemplatePreview &&
          frontendTemplateId &&
          frontendTemplateData ? (
          <Box
            sx={{
              width: previewSurfaceWidth,
              height: previewSurfaceHeight,
              transform: previewSurfaceTransform,
              transformOrigin: "top center",
              minHeight: previewSurfaceMinHeight,
              transition: previewSurfaceTransition,
              position: "relative",
              boxShadow:
                actualTheme === "dark"
                  ? "0 32px 70px rgba(0, 0, 0, 0.52)"
                  : "0 30px 60px rgba(15, 23, 42, 0.12), 0 6px 18px rgba(15, 23, 42, 0.06)",
              borderRadius: showDeviceFrame ? "28px" : "24px",
              overflow: "hidden",
              backgroundColor: "#fff",
              border: showDeviceFrame
                ? undefined
                : "1px solid rgba(226,232,240,0.9)",
              ...(showDeviceFrame && {
                border: "3px solid #333",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 80,
                  height: 4,
                  backgroundColor: "#555",
                  borderRadius: "0 0 4px 4px",
                  zIndex: 1,
                },
              }),
            }}
          >
            <Box
              sx={{
                width: "100%",
                minHeight: 600,
                height: "100%",
                overflow: scaleToFit ? "hidden" : "auto",
                backgroundColor: "#fff",
              }}
            >
              <FrontendTemplateIframePreview
                title={`Website preview - ${viewport}`}
                width={displayWidth}
                minHeight={600}
                templateId={frontendTemplateId}
                pageId={pageId}
                data={frontendTemplateData}
                onEditableElementSelected={onEditableElementSelected}
                onImageSelected={onImageSelected}
                onImageDoubleClick={onImageDoubleClick}
                onSectionSelected={onSectionSelected}
                onSectionAddRequest={onSectionAddRequest}
                onSectionInnerAddRequest={onSectionInnerAddRequest}
                onPreviewContextMenu={onPreviewContextMenu}
                onEditableTextSave={onEditableTextSave}
                onElementTransform={onElementTransform}
                saveSignal={saveSignal}
                iframeRefCallback={iframeRefCallback}
                selectedPreviewTarget={selectedPreviewTarget}
                askAIButtonStatus={askAIButtonStatus}
              />
            </Box>
          </Box>
        ) : (
          /* Iframe container with optional device frame */
          <Box
            sx={{
              width: previewSurfaceWidth,
              height: previewSurfaceHeight,
              transform: previewSurfaceTransform,
              transformOrigin: "top center",
              minHeight: previewSurfaceMinHeight,
              transition: previewSurfaceTransition,
              position: "relative",
              boxShadow:
                actualTheme === "dark"
                  ? "0 32px 70px rgba(0, 0, 0, 0.52)"
                  : "0 30px 60px rgba(15, 23, 42, 0.12), 0 6px 18px rgba(15, 23, 42, 0.06)",
              borderRadius: showDeviceFrame ? "28px" : "24px",
              border: showDeviceFrame
                ? undefined
                : "1px solid rgba(226,232,240,0.9)",
              ...(showDeviceFrame && {
                border: "3px solid #333",
                borderRadius: "28px",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 80,
                  height: 4,
                  backgroundColor: "#555",
                  borderRadius: "0 0 4px 4px",
                  zIndex: 1,
                },
              }),
            }}
          >
            <iframe
              ref={iframeRef}
              {...(effectiveMode === "live" && srcdocHtml
                ? { srcDoc: srcdocHtml }
                : { src })}
              title={`Website preview - ${viewport}`}
              onLoad={
                effectiveMode === "live" ? handleLiveIframeLoad : staticOnLoad
              }
              onError={effectiveMode === "static" ? staticOnError : undefined}
              sandbox="allow-same-origin allow-scripts"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
                minHeight: 600,
                backgroundColor: "#fff",
              }}
              aria-label={`Website preview in ${viewport} mode`}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
});

export default PreviewPanel;
