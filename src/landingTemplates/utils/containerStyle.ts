export type ContainerStyleValue = Record<string, unknown>;

export const getStructuralContainerId = (element: Element): string => {
  const boundary =
    element.closest(
      "[data-editor-section-root='true'], [data-template-section-boundary='true']",
    ) || element.closest("[data-preview-block-id]");
  const segments: string[] = [];
  let current: Element | null = element;
  while (current && current !== boundary) {
    const parent = current.parentElement;
    if (!parent) break;
    const stableSiblings = Array.from(parent.children).filter(
      (child) =>
        child.getAttribute("data-editor-container-background-video") !==
          "true" && child.getAttribute("data-editor-runtime-node") !== "true",
    );
    const index = stableSiblings.indexOf(current);
    segments.unshift(`${current.tagName.toLowerCase()}-${Math.max(index, 0)}`);
    current = parent;
  }
  return segments.join("__") || element.tagName.toLowerCase();
};

export const getStableContainerId = (element: Element): string => {
  const explicitId =
    element.getAttribute("data-container-style-id") ||
    element.getAttribute("data-container-id") ||
    element.getAttribute("data-static-id");
  if (explicitId && !explicitId.startsWith("fallback-")) {
    return explicitId;
  }
  return getStructuralContainerId(element);
};

const ANIMATED_BACKGROUNDS: Record<
  string,
  { background: string; backgroundSize?: string; animation: string }
> = {
  "moving-gradient": {
    background:
      "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
    backgroundSize: "400% 400%",
    animation: "ttContainerGradient 4s ease infinite",
  },
  "floating-bubbles": {
    background:
      "radial-gradient(circle at 25% 75%, rgba(120,80,200,.8), transparent 34%), radial-gradient(circle at 75% 25%, rgba(200,80,120,.8), transparent 30%), #0f172a",
    backgroundSize: "140% 140%",
    animation: "ttContainerFloat 5s ease-in-out infinite",
  },
  "particle-dots": {
    background:
      "radial-gradient(circle, rgba(99,102,241,.85) 1.5px, transparent 1.5px), #0f172a",
    backgroundSize: "16px 16px",
    animation: "ttContainerDots 1.5s linear infinite",
  },
  "wave-motion": {
    background:
      "linear-gradient(60deg, #0f3460, #533483, #e94560, #0f3460, #16213e)",
    backgroundSize: "400% 400%",
    animation: "ttContainerGradient 5s ease-in-out infinite",
  },
  "neon-glow": {
    background: "#0f172a",
    animation: "ttContainerGlow 2.5s ease-in-out infinite",
  },
};

const setStyle = (
  style: CSSStyleDeclaration,
  property: keyof CSSStyleDeclaration,
  value: unknown,
) => {
  if (value === undefined || value === null) return;
  (style as unknown as Record<string, string>)[String(property)] = String(value);
};

const ensureBackgroundVideo = (element: HTMLElement, url: string) => {
  let video = element.querySelector<HTMLVideoElement>(
    ":scope > video[data-editor-container-background-video='true']",
  );
  if (!url) {
    video?.remove();
    return;
  }
  if (!video) {
    video = element.ownerDocument.createElement("video");
    video.setAttribute("data-editor-container-background-video", "true");
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    element.prepend(video);
  }
  if (video.src !== url) video.src = url;
  Object.assign(video.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    pointerEvents: "none",
    zIndex: "0",
  });
  if (!element.style.position || element.style.position === "static") {
    element.style.position = "relative";
  }
  element.style.isolation = "isolate";
  Array.from(element.children).forEach((child) => {
    if (!(child instanceof HTMLElement) || child === video) return;
    const childStyle = child.ownerDocument.defaultView?.getComputedStyle(child);
    if (!child.style.position && childStyle?.position === "static") {
      child.style.position = "relative";
    }
    if (!child.style.zIndex) child.style.zIndex = "1";
  });
};

export const applyContainerStyleToElement = (
  element: HTMLElement,
  patch: ContainerStyleValue,
) => {
  if (!patch || typeof patch !== "object") return;
  const style = element.style;

  setStyle(style, "backgroundColor", patch.backgroundColor);
  setStyle(style, "backgroundPosition", patch.backgroundPosition);
  setStyle(style, "backgroundSize", patch.backgroundSize);
  setStyle(style, "backgroundRepeat", patch.backgroundRepeat);
  setStyle(style, "paddingTop", patch.paddingTop);
  setStyle(style, "paddingBottom", patch.paddingBottom);
  setStyle(style, "paddingLeft", patch.paddingLeft);
  setStyle(style, "paddingRight", patch.paddingRight);
  setStyle(style, "borderRadius", patch.borderRadius);
  setStyle(style, "borderWidth", patch.borderWidth);
  setStyle(style, "borderColor", patch.borderColor);
  setStyle(style, "borderStyle", patch.borderStyle);
  setStyle(style, "width", patch.width);
  setStyle(style, "height", patch.height);

  if ("backgroundImageUrl" in patch || "backgroundImage" in patch) {
    const image = String(
      patch.backgroundImageUrl || patch.backgroundImage || "",
    ).trim();
    style.backgroundImage = image
      ? image.startsWith("url(") || image.includes("gradient(")
        ? image
        : `url(${image.replace(/[()'"\\]/g, "")})`
      : "none";
  }

  if ("backgroundVideoUrl" in patch || "backgroundVideo" in patch) {
    ensureBackgroundVideo(
      element,
      String(patch.backgroundVideoUrl || patch.backgroundVideo || "").trim(),
    );
  }

  if (patch.backgroundType === "animated" || patch.animatedBackground) {
    const preset = String(
      patch.backgroundAnimatedPreset || patch.animatedBackground || "",
    );
    const animated = ANIMATED_BACKGROUNDS[preset];
    if (animated) {
      style.background = animated.background;
      style.backgroundSize = animated.backgroundSize || "";
      style.animation = animated.animation;
    }
  } else if (
    "backgroundType" in patch ||
    "backgroundAnimatedPreset" in patch ||
    "animatedBackground" in patch
  ) {
    style.animation = "none";
  }

  if (patch.overlayColor || patch.overlayOpacity) {
    const opacity = Number(patch.overlayOpacity ?? 0.35);
    const color = String(patch.overlayColor || "#000000");
    style.boxShadow = `inset 0 0 0 9999px color-mix(in srgb, ${color} ${Math.max(0, Math.min(1, opacity)) * 100}%, transparent)`;
  } else if ("overlayColor" in patch || "overlayOpacity" in patch) {
    style.boxShadow = "none";
  }
};
