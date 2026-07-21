import React, { Suspense, useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import type { BusinessData } from "../types/BusinessData";
import { getTemplateById } from "./templateRegistry";
import {
  applyContainerStyleToElement,
  getStableContainerId,
  getStructuralContainerId,
} from "../utils/containerStyle";
import { HiddenElementsProvider } from "../utils/editableComponents";
import type { HiddenElementsMap } from "../utils/hiddenElements";

interface TemplateEngineProps {
  templateId: string;
  data: BusinessData;
}

const TemplateEngine: React.FC<TemplateEngineProps> = ({
  templateId,
  data,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const definition = getTemplateById(templateId) ?? getTemplateById("modern");
  const animationSignature = `${templateId}:${JSON.stringify(
    (data as BusinessData & { templateContent?: unknown })?.templateContent ||
      {},
  )}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    type AnimationCleanup = (() => void) | null;

    const revealVisibleSections = (animatedSections: HTMLElement[]) => {
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight || 0;

      animatedSections.forEach((element) => {
        if (element.getAttribute("data-section-animated") === "true") {
          return;
        }

        const rect = element.getBoundingClientRect();
        const isVisible =
          rect.top <= viewportHeight * 0.88 &&
          rect.bottom >= viewportHeight * 0.12;

        if (isVisible) {
          element.setAttribute("data-section-animated", "true");
        }
      });
    };

    const forceRevealPendingSections = (animatedSections: HTMLElement[]) => {
      animatedSections.forEach((element) => {
        if (element.getAttribute("data-section-animated") !== "true") {
          element.setAttribute("data-section-animated", "true");
        }
      });
    };

    const setupAnimations = (): AnimationCleanup => {
      const animatedSections = Array.from(
        root.querySelectorAll<HTMLElement>("[data-section-animation]"),
      );

      if (!animatedSections.length) {
        return null;
      }

      animatedSections.forEach((element) => {
        if (!element.getAttribute("data-section-animated")) {
          element.setAttribute("data-section-animated", "false");
        }
      });

      const revealCurrentSections = () =>
        revealVisibleSections(animatedSections);
      const forceRevealCurrentSections = () =>
        forceRevealPendingSections(animatedSections);

      const frame = window.requestAnimationFrame(revealCurrentSections);
      const settleTimer = window.setTimeout(revealCurrentSections, 120);
      const fallbackTimer = window.setTimeout(forceRevealCurrentSections, 900);

      if (typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const target = entry.target as HTMLElement;
              target.setAttribute("data-section-animated", "true");
              observer?.unobserve(target);
            });
          },
          {
            threshold: 0.18,
            rootMargin: "0px 0px -10% 0px",
          },
        );

        animatedSections.forEach((element) => observer?.observe(element));
      }

      window.addEventListener("load", revealCurrentSections);
      window.addEventListener("scroll", revealCurrentSections, {
        passive: true,
      });
      window.addEventListener("resize", revealCurrentSections);

      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(settleTimer);
        window.clearTimeout(fallbackTimer);
        window.removeEventListener("load", revealCurrentSections);
        window.removeEventListener("scroll", revealCurrentSections);
        window.removeEventListener("resize", revealCurrentSections);
        observer?.disconnect();
        observer = null;
      };
    };

    let cleanupAnimations: AnimationCleanup = setupAnimations();

    if (!cleanupAnimations) {
      mutationObserver = new MutationObserver(() => {
        if (cleanupAnimations) {
          return;
        }

        cleanupAnimations = setupAnimations();
        if (cleanupAnimations) {
          mutationObserver?.disconnect();
          mutationObserver = null;
        }
      });

      mutationObserver.observe(root, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (typeof cleanupAnimations === "function") {
        cleanupAnimations();
      }
      mutationObserver?.disconnect();
    };
  }, [animationSignature]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const templateContent =
      ((data as BusinessData & { templateContent?: Record<string, any> })
        ?.templateContent as Record<string, any> | undefined) || {};
    const mediaOverrides =
      (templateContent.__editorStaticMediaOverrides as
        Record<string, Record<string, any>> | undefined) || {};
    const styleOverrides =
      (templateContent.__editorStaticStyleOverrides as
        Record<string, Record<string, any>> | undefined) || {};
    const hiddenElements =
      (templateContent.__hiddenElements as
        Record<string, Record<string, boolean>> | undefined) || {};
    const hiddenContainers =
      (templateContent.__hiddenContainers as
        Record<string, Record<string, boolean>> | undefined) || {};
    const sectionVisibility =
      (templateContent.__editorSectionVisibility as
        Record<string, boolean> | undefined) || {};
    const blockVisibility =
      (templateContent.__editorBlockVisibility as
        Record<string, boolean> | undefined) || {};
    const sectionVisibilityIsAuthoritative =
      templateContent.__editorSectionVisibilityAuthoritative === true;

    const applyStylePatch = (
      element: HTMLElement,
      patch: Record<string, any>,
    ) => {
      if (!patch) {
        return;
      }
      applyContainerStyleToElement(element, patch);
      const style = element.style;
      const assign = (prop: string, value: any) => {
        if (value === undefined || value === null || value === "") {
          return;
        }
        (style as any)[prop] = String(value);
      };

      assign("fontFamily", patch.fontFamily);
      assign("fontSize", patch.fontSize);
      assign("color", patch.color);
      assign("backgroundColor", patch.backgroundColor);
      assign("fontWeight", patch.fontWeight);
      assign("fontStyle", patch.fontStyle);
      assign("textAlign", patch.textAlign);
      assign("textShadow", patch.textShadow);
      assign("textTransform", patch.textTransform);
      assign("lineHeight", patch.lineHeight);
      assign("letterSpacing", patch.letterSpacing);
      assign("wordSpacing", patch.wordSpacing);
      assign("paddingTop", patch.paddingTop);
      assign("paddingBottom", patch.paddingBottom);
      assign("paddingLeft", patch.paddingLeft);
      assign("paddingRight", patch.paddingRight);
      assign("marginTop", patch.marginTop);
      assign("marginBottom", patch.marginBottom);
      assign("marginLeft", patch.marginLeft);
      assign("marginRight", patch.marginRight);
      assign("borderRadius", patch.borderRadius);
      assign("borderWidth", patch.borderWidth);
      assign("borderColor", patch.borderColor);
      assign(
        "borderStyle",
        patch.borderStyle || (patch.borderWidth ? "solid" : undefined),
      );
      assign("width", patch.width);
      assign("height", patch.height);
      assign("opacity", patch.opacity);
    };

    const applyOverrides = () => {
      const generatedContainerAttributes = [
        "data-template-engine-container",
        "data-static-selectable",
        "data-static-style-only",
        "data-static-type",
        "data-static-id",
        "data-static-label",
        "data-container-style-id",
        "data-container-id",
        "data-editor-container",
        "data-parent-section",
        "data-preview-target-kind",
        "data-preview-section",
        "data-preview-block-id",
        "data-preview-style-key",
        "data-preview-label",
      ];

      root
        .querySelectorAll<HTMLElement>(
          '[data-template-engine-container="true"], [data-editor-container="true"][data-static-id^="fallback-"]',
        )
        .forEach((element) => {
          generatedContainerAttributes.forEach((attribute) =>
            element.removeAttribute(attribute),
          );
        });

      root
        .querySelectorAll<HTMLElement>("[data-editor-section-root='true']")
        .forEach((section) => {
          const sectionKey =
            section.getAttribute("data-editor-section-key") || "";
          const blockId = section.getAttribute("data-preview-block-id") || "";
          const hasBlockVisibility =
            blockId &&
            Object.prototype.hasOwnProperty.call(blockVisibility, blockId);
          const hasSectionVisibility =
            sectionKey &&
            Object.prototype.hasOwnProperty.call(sectionVisibility, sectionKey);
          const isVisible = hasBlockVisibility
            ? blockVisibility[blockId] !== false
            : hasSectionVisibility
              ? sectionVisibility[sectionKey] !== false
              : !sectionVisibilityIsAuthoritative;

          if (isVisible) {
            section.removeAttribute("data-tt-section-hidden");
          } else {
            section.setAttribute("data-tt-section-hidden", "true");
          }
        });

      // Resolve every identity before mutating the DOM. Otherwise adding a block id
      // to a parent changes the nearest boundary used to identify its children.
      const unannotatedContainers = Array.from(
        root.querySelectorAll<HTMLElement>(
          "div, section, article, header, footer, nav, main, aside",
        ),
      )
        .filter(
          (element) =>
            element !== root &&
            !element.hasAttribute("data-static-id") &&
            element.getAttribute("data-preview-section") !== "true",
        )
        .map((element) => {
          if (element.getAttribute("data-editor-layout-wrapper") === "true") {
            return null;
          }

          const blockContext = element.closest<HTMLElement>(
            "[data-preview-block-id]",
          );
          const blockId = blockContext?.getAttribute("data-preview-block-id");
          const sectionRoot = element.closest<HTMLElement>(
            '[data-editor-section-root="true"], [data-template-section-boundary="true"]',
          );
          const selectionSurface =
            element.closest<HTMLElement>('[data-preview-section="true"]') ||
            sectionRoot;
          const elementRect = element.getBoundingClientRect();
          const sectionRect = selectionSurface?.getBoundingClientRect();
          const sectionArea = sectionRect
            ? Math.max(1, sectionRect.width * sectionRect.height)
            : 0;
          const elementArea = Math.max(
            1,
            elementRect.width * elementRect.height,
          );
          const isSectionSizedLayoutWrapper =
            !!selectionSurface &&
            selectionSurface !== element &&
            sectionArea > 0 &&
            elementArea / sectionArea >= 0.88;

          if (isSectionSizedLayoutWrapper) {
            return null;
          }

          return blockId
            ? {
                element,
                blockId,
                staticId: `fallback-${getStableContainerId(element)}`,
              }
            : null;
        })
        .filter(
          (
            entry,
          ): entry is {
            element: HTMLElement;
            blockId: string;
            staticId: string;
          } => Boolean(entry),
        );

      unannotatedContainers.forEach(({ element, blockId, staticId }) => {
        element.setAttribute("data-template-engine-container", "true");
        element.setAttribute("data-static-selectable", "true");
        element.setAttribute("data-static-style-only", "false");
        element.setAttribute("data-static-type", "container");
        element.setAttribute("data-static-id", staticId);
        element.setAttribute("data-static-label", "Container");
        element.setAttribute("data-container-style-id", staticId);
        element.setAttribute("data-container-id", staticId);
        element.setAttribute("data-editor-container", "true");
        element.setAttribute("data-parent-section", blockId);
        element.setAttribute("data-preview-target-kind", "static");
        // PreviewPanel must treat this as an existing static target instead of
        // deleting and regenerating its identity on every annotation cycle.
        element.setAttribute("data-preview-section", "true");
        element.setAttribute("data-preview-block-id", blockId);
        element.setAttribute("data-preview-style-key", "containerStyles");
        element.setAttribute("data-preview-label", "Container");
      });

      Object.entries(styleOverrides).forEach(([key, patch]) => {
        const [blockId, styleKey, staticId] = key.split("::");
        if (!blockId || !styleKey || !staticId) {
          return;
        }
        const selector = `[data-preview-block-id="${blockId}"][data-static-id="${staticId}"][data-preview-style-key="${styleKey}"]`;
        let targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
        // Existing websites may contain a structural fallback id saved before
        // the template gained an explicit semantic id. Resolve that legacy id
        // against the same DOM structure so the style remains effective.
        if (targets.length === 0 && staticId.startsWith("fallback-")) {
          targets = Array.from(
            root.querySelectorAll<HTMLElement>(
              `[data-preview-block-id="${blockId}"][data-preview-style-key="${styleKey}"]`,
            ),
          ).filter(
            (element) =>
              `fallback-${getStructuralContainerId(element)}` === staticId,
          );
        }
        targets.forEach((element) => {
          applyStylePatch(element, patch);
        });
      });

      Object.entries(mediaOverrides).forEach(([key, patch]) => {
        const [blockId, staticId] = key.split("::");
        if (!blockId || !staticId) {
          return;
        }
        const selector = `[data-preview-block-id="${blockId}"][data-static-id="${staticId}"]`;
        root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          const mediaTargets =
            element instanceof HTMLImageElement ||
            element instanceof HTMLVideoElement
              ? [element]
              : Array.from(element.querySelectorAll("img, video"));
          if (typeof patch?.src === "string" && patch.src.trim()) {
            const nextSrc = patch.src.trim();
            if (mediaTargets.length > 0) {
              mediaTargets.forEach((mediaEl) => {
                if (mediaEl instanceof HTMLImageElement) {
                  mediaEl.src = nextSrc;
                  mediaEl.setAttribute("src", nextSrc);
                  mediaEl.removeAttribute("srcset");
                  mediaEl.removeAttribute("sizes");
                }
              });
            } else {
              element.style.backgroundImage = `url(${nextSrc})`;
            }
          }
          mediaTargets.forEach((mediaEl) => {
            if (!(mediaEl instanceof HTMLElement)) {
              return;
            }
            if (patch?.objectFit)
              mediaEl.style.objectFit = String(patch.objectFit);
            if (patch?.borderRadius)
              mediaEl.style.borderRadius = String(patch.borderRadius);
            if (patch?.borderWidth) {
              mediaEl.style.borderWidth = String(patch.borderWidth);
              mediaEl.style.borderStyle = String(patch.borderStyle || "solid");
            }
            if (patch?.borderColor)
              mediaEl.style.borderColor = String(patch.borderColor);
            if (patch?.width) mediaEl.style.width = String(patch.width);
            if (patch?.height) mediaEl.style.height = String(patch.height);
          });
        });
      });

      // Persistently-deleted elements: hide any editable/image node whose
      // (blockId, fieldPath) was recorded in content.hiddenElements. This runs
      // in the editor canvas AND Live Preview (both render via TemplateEngine),
      // so a deleted element disappears everywhere and stays gone after refresh.
      // The marker is cleared first so undo/redo/restore re-shows elements that
      // are no longer marked hidden. Templates that use the shared editable
      // components already render nothing for hidden fields; this pass covers
      // templates that spread getEditableTextProps/getEditableImageProps onto
      // raw elements without per-template edits.
      root
        .querySelectorAll("[data-tt-deleted]")
        .forEach((element) => element.removeAttribute("data-tt-deleted"));
      Object.entries(hiddenElements).forEach(([blockId, fields]) => {
        if (!fields || typeof fields !== "object") {
          return;
        }
        Object.keys(fields).forEach((fieldPath) => {
          if (!fields[fieldPath] || !fieldPath) {
            return;
          }
          const escapedBlockId = String(blockId).replace(/["\\]/g, "\\$&");
          const escapedField = fieldPath.replace(/["\\]/g, "\\$&");
          const selector =
            `[data-block-id="${escapedBlockId}"][data-editable="${escapedField}"],` +
            `[data-block-id="${escapedBlockId}"][data-edit-image="${escapedField}"]`;
          root
            .querySelectorAll<HTMLElement>(selector)
            .forEach((element) =>
              element.setAttribute("data-tt-deleted", "true"),
            );
        });
      });

      // Deleted whole containers/wrappers (div/static/card). Hidden by their
      // stable container id (data-static-id) so the container AND its children
      // and background/container styles disappear. Runs after the unannotated-
      // container pass above so auto-detected "fallback-*" wrappers already have
      // their data-static-id assigned.
      Object.entries(hiddenContainers).forEach(([blockId, containers]) => {
        if (!containers || typeof containers !== "object") {
          return;
        }
        Object.keys(containers).forEach((containerId) => {
          if (!containers[containerId] || !containerId) {
            return;
          }
          const escapedBlockId = String(blockId).replace(/["\\]/g, "\\$&");
          const escapedContainer = containerId.replace(/["\\]/g, "\\$&");
          const selector =
            `[data-preview-block-id="${escapedBlockId}"][data-static-id="${escapedContainer}"],` +
            `[data-preview-block-id="${escapedBlockId}"][data-container-style-id="${escapedContainer}"]`;
          let targets = Array.from(
            root.querySelectorAll<HTMLElement>(selector),
          );
          if (targets.length === 0 && containerId.startsWith("fallback-")) {
            targets = Array.from(
              root.querySelectorAll<HTMLElement>(
                `[data-preview-block-id="${escapedBlockId}"][data-preview-style-key="containerStyles"]`,
              ),
            ).filter(
              (element) =>
                `fallback-${getStructuralContainerId(element)}` === containerId,
            );
          }
          targets.forEach((element) =>
            element.setAttribute("data-tt-deleted", "true"),
          );
        });
      });
    };

    applyOverrides();

    // Lazy templates and conditional sections can mount after this effect. Reapply
    // persisted overrides whenever their DOM is inserted or replaced.
    let frameId: number | null = null;
    const observer = new MutationObserver((mutations) => {
      if (!mutations.some((mutation) => mutation.type === "childList")) return;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = null;
        applyOverrides();
      });
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [data]);

  if (!definition) {
    return <Box sx={{ p: 4, textAlign: "center" }}>Template not found.</Box>;
  }

  const TemplateComponent = definition.component;
  const hiddenElementsMap =
    ((data as BusinessData & { templateContent?: Record<string, any> })
      ?.templateContent?.__hiddenElements as
      Record<string, HiddenElementsMap> | undefined) || undefined;

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <style>
        {`
          @keyframes ttTextRise {
            0% { opacity: 0; transform: translate3d(0, 24px, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          @keyframes ttTextBlurIn {
            0% { opacity: 0; filter: blur(10px); transform: translate3d(0, 16px, 0); }
            100% { opacity: 1; filter: blur(0); transform: translate3d(0, 0, 0); }
          }
          @keyframes ttTextPop {
            0% { opacity: 0; transform: scale(0.92); }
            70% { opacity: 1; transform: scale(1.03); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes ttTextGlow {
            0%, 100% { text-shadow: 0 0 0 rgba(91,124,250,0); }
            50% { text-shadow: 0 0 18px rgba(91,124,250,0.32); }
          }
          @keyframes ttTextFloat {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, -8px, 0); }
          }
          @keyframes ttContainerGradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes ttContainerFloat {
            0%, 100% { background-position: 25% 75%; }
            50% { background-position: 75% 25%; }
          }
          @keyframes ttContainerDots {
            from { background-position: 0 0; }
            to { background-position: 16px 16px; }
          }
          @keyframes ttContainerGlow {
            0%, 100% { box-shadow: inset 0 0 20px rgba(0,255,200,.15); }
            50% { box-shadow: inset 0 0 60px rgba(120,80,255,.42); }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="ttText"] { animation: none !important; }
          }
          [data-tt-deleted="true"] { display: none !important; }
   
        `}
      </style>
      <Box ref={rootRef}>
        <HiddenElementsProvider value={hiddenElementsMap}>
          <TemplateComponent data={data} />
        </HiddenElementsProvider>
      </Box>
    </Suspense>
  );
};

export default TemplateEngine;
