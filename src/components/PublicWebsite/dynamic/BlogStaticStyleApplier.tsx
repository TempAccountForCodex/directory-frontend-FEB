import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

const BLOG_STYLE_BLOCK_TYPES = new Set([
  "BLOG_HERO",
  "BLOG_FEATURED",
  "BLOG_GRID",
  "BLOG_ARTICLE",
]);

type StyleOverrideMap = Record<string, Record<string, any>>;

interface BlogStaticStyleApplierProps {
  blockId: string | number;
  blockType: string;
  staticStyleOverrides?: StyleOverrideMap;
  children: React.ReactNode;
}

const STYLE_PROPS = [
  "fontFamily",
  "fontSize",
  "color",
  "backgroundColor",
  "backgroundImage",
  "fontWeight",
  "fontStyle",
  "textAlign",
  "textShadow",
  "textTransform",
  "lineHeight",
  "letterSpacing",
  "wordSpacing",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "borderRadius",
  "borderWidth",
  "borderColor",
  "boxShadow",
  "objectFit",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
  "transform",
  "justifyContent",
  "alignItems",
  "alignSelf",
  "justifySelf",
  "gap",
  "flex",
  "flexDirection",
  "gridTemplateColumns",
] as const;

function applyPatch(element: HTMLElement, patch: Record<string, any>) {
  if (!patch || typeof patch !== "object") return;

  const style = element.style;
  const assign = (prop: string, value: any) => {
    if (value === undefined || value === null || value === "") return;
    (style as any)[prop] = String(value);
  };

  STYLE_PROPS.forEach((prop) => assign(prop, patch[prop]));
  assign("borderStyle", patch.borderStyle || (patch.borderWidth ? "solid" : undefined));
  if (patch.opacity !== undefined && patch.opacity !== null && patch.opacity !== "") {
    style.opacity = String(patch.opacity);
  }

  const imageTargets =
    element instanceof HTMLImageElement
      ? [element]
      : Array.from(element.querySelectorAll<HTMLImageElement>("img"));
  const videoTargets =
    element instanceof HTMLVideoElement
      ? [element]
      : Array.from(element.querySelectorAll<HTMLVideoElement>("video"));

  const resolvedHeight =
    typeof patch.customHeight === "string" && patch.customHeight
      ? patch.customHeight
      : patch.heightPreset === "small"
        ? "180px"
        : patch.heightPreset === "medium"
          ? "260px"
          : patch.heightPreset === "large"
            ? "340px"
            : undefined;

  if (typeof patch.src === "string" && patch.src.trim()) {
    const nextSrc = patch.src.trim();
    if (imageTargets.length > 0) {
      imageTargets.forEach((img) => {
        img.setAttribute("src", nextSrc);
        img.setAttribute("data-image-src", nextSrc);
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.src = nextSrc;
      });
    } else {
      element.style.backgroundImage = `url(${nextSrc})`;
      element.setAttribute("data-image-src", nextSrc);
    }
  }

  if (typeof patch.videoUrl === "string" && patch.videoUrl.trim()) {
    videoTargets.forEach((video) => {
      video.src = patch.videoUrl.trim();
      if (typeof patch.videoPoster === "string") video.poster = patch.videoPoster;
      if (typeof patch.videoAutoplay === "boolean") video.autoplay = patch.videoAutoplay;
      if (typeof patch.videoMuted === "boolean") video.muted = patch.videoMuted;
      if (typeof patch.videoLoop === "boolean") video.loop = patch.videoLoop;
      if (typeof patch.videoControls === "boolean") video.controls = patch.videoControls;
      if (typeof video.load === "function") video.load();
    });
  }

  [...imageTargets, ...videoTargets].forEach((mediaEl) => {
    const mediaStyle = mediaEl.style;
    const assignMedia = (prop: string, value: any) => {
      if (value === undefined || value === null || value === "") return;
      (mediaStyle as any)[prop] = String(value);
    };
    assignMedia("objectFit", patch.objectFit);
    assignMedia("borderRadius", patch.borderRadius);
    assignMedia("borderWidth", patch.borderWidth);
    assignMedia("borderColor", patch.borderColor);
    assignMedia("borderStyle", patch.borderStyle || (patch.borderWidth ? "solid" : undefined));
    assignMedia("height", patch.height || resolvedHeight);
    assignMedia("width", patch.width);
  });
}

function applyBlogStaticOverrides(
  root: HTMLElement,
  blockId: string | number,
  overrides: StyleOverrideMap,
) {
  const currentBlockId = String(blockId);

  Object.entries(overrides || {}).forEach(([key, patch]) => {
    const [overrideBlockId, , ...staticIdParts] = key.split("::");
    const staticId = staticIdParts.join("::");
    if (String(overrideBlockId || "") !== currentBlockId || !staticId) return;

    root
      .querySelectorAll<HTMLElement>("[data-static-id], [data-fallback-id]")
      .forEach((element) => {
        const elementBlockId =
          element.getAttribute("data-preview-block-id") ||
          element.getAttribute("data-fallback-context-block-id");
        if (String(elementBlockId || "") !== currentBlockId) return;
        if (
          element.getAttribute("data-static-id") === staticId ||
          element.getAttribute("data-fallback-id") === staticId
        ) {
          applyPatch(element, patch);
        }
      });
  });
}

const BlogStaticStyleApplier: React.FC<BlogStaticStyleApplierProps> = ({
  blockId,
  blockType,
  staticStyleOverrides,
  children,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shouldApply =
    BLOG_STYLE_BLOCK_TYPES.has(blockType) &&
    !!staticStyleOverrides &&
    Object.keys(staticStyleOverrides).length > 0;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !shouldApply || !staticStyleOverrides) return undefined;

    let frame = 0;
    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        applyBlogStaticOverrides(root, blockId, staticStyleOverrides);
      });
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [blockId, shouldApply, staticStyleOverrides]);

  if (!BLOG_STYLE_BLOCK_TYPES.has(blockType)) {
    return <>{children}</>;
  }

  return (
    <Box ref={rootRef} data-blog-static-style-root="true">
      {children}
    </Box>
  );
};

export default BlogStaticStyleApplier;
