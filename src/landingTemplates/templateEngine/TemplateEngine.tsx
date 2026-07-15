import React, { Suspense, useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import type { BusinessData } from "../types/BusinessData";
import { getTemplateById } from "./templateRegistry";

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
        | Record<string, Record<string, any>>
        | undefined) || {};
    const styleOverrides =
      (templateContent.__editorStaticStyleOverrides as
        | Record<string, Record<string, any>>
        | undefined) || {};

    const applyStylePatch = (element: HTMLElement, patch: Record<string, any>) => {
      if (!patch) {
        return;
      }
      const style = element.style;
      const assign = (prop: keyof CSSStyleDeclaration, value: any) => {
        if (value === undefined || value === null || value === "") {
          return;
        }
        style[prop] = String(value);
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
      assign("borderStyle", patch.borderStyle || (patch.borderWidth ? "solid" : undefined));
      assign("width", patch.width);
      assign("height", patch.height);
      assign("opacity", patch.opacity);
    };

    Object.entries(styleOverrides).forEach(([key, patch]) => {
      const [blockId, styleKey, staticId] = key.split("::");
      if (!blockId || !styleKey || !staticId) {
        return;
      }
      const selector = `[data-preview-block-id="${blockId}"][data-static-id="${staticId}"][data-preview-style-key="${styleKey}"]`;
      root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
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
          element instanceof HTMLImageElement || element instanceof HTMLVideoElement
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
          if (patch?.objectFit) mediaEl.style.objectFit = String(patch.objectFit);
          if (patch?.borderRadius) mediaEl.style.borderRadius = String(patch.borderRadius);
          if (patch?.borderWidth) {
            mediaEl.style.borderWidth = String(patch.borderWidth);
            mediaEl.style.borderStyle = String(patch.borderStyle || "solid");
          }
          if (patch?.borderColor) mediaEl.style.borderColor = String(patch.borderColor);
          if (patch?.width) mediaEl.style.width = String(patch.width);
          if (patch?.height) mediaEl.style.height = String(patch.height);
        });
      });
    });
  }, [data]);

  if (!definition) {
    return <Box sx={{ p: 4, textAlign: "center" }}>Template not found.</Box>;
  }

  const TemplateComponent = definition.component;

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
          @media (prefers-reduced-motion: reduce) {
            [style*="ttText"] { animation: none !important; }
          }
        `}
      </style>
      <Box ref={rootRef}>
        <TemplateComponent data={data} />
      </Box>
    </Suspense>
  );
};

export default TemplateEngine;
