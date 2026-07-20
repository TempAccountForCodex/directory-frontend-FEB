import React from "react";
import Box, { type BoxProps } from "@mui/material/Box";
import Container, {
  type ContainerProps,
} from "@mui/material/Container";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  getSectionStyleDomProps,
  getSectionStyleSx,
} from "../utils/sectionStyle";

type ContentLike = Record<string, any> | null | undefined;
type SectionStyleKey = "sectionStyle" | "outerSectionStyle" | "cardStyle";

export function sectionHasPersistentBackground(
  content: ContentLike,
  styleKey: SectionStyleKey = "outerSectionStyle",
) {
  const style = content?.[styleKey];
  if (!style || typeof style !== "object") return false;

  return Boolean(
    (style.backgroundType && style.backgroundType !== "none") ||
      style.backgroundColor ||
      style.backgroundImage ||
      style.backgroundImageUrl ||
      style.backgroundVideo ||
      style.backgroundVideoUrl ||
      style.animatedBackground ||
      style.backgroundAnimatedPreset,
  );
}

interface TemplateSectionBoundaryProps
  extends Omit<BoxProps, "sx" | "content" | "order"> {
  blockId: string | number | undefined;
  label: string;
  sectionKey: string;
  content: ContentLike;
  styleKey?: SectionStyleKey;
  order?: number;
  sx?: SxProps<Theme>;
}

/** Persistent top-level section boundary shared by template renderers. */
export function TemplateSectionBoundary({
  blockId,
  label,
  sectionKey,
  content,
  styleKey = "outerSectionStyle",
  order: sectionOrder,
  sx,
  children,
  ...rest
}: TemplateSectionBoundaryProps) {
  // Older template sections stored their visible surface in sectionStyle. Keep
  // those values working, but render them on the real top-level boundary so an
  // intermediate layout wrapper never hides the selected parent background.
  const legacySectionStyle =
    styleKey === "outerSectionStyle"
      ? getSectionStyleSx(content, "sectionStyle")
      : {};
  const resolvedOrder =
    typeof sectionOrder === "number" ? sectionOrder : undefined;

  return (
    <Box
      data-preview-section="true"
      data-preview-label={label}
      data-template-section-boundary="true"
      data-editor-section-root="true"
      data-editor-section-key={sectionKey}
      data-preview-block-id={blockId}
      data-preview-style-key={styleKey}
      data-preview-accepts-inner-blocks="true"
      {...rest}
      {...(styleKey === "outerSectionStyle"
        ? getSectionStyleDomProps(content, "sectionStyle")
        : {})}
      {...getSectionStyleDomProps(content, styleKey)}
      sx={[
        {
          ...(resolvedOrder !== undefined ? { order: resolvedOrder } : {}),
          ...legacySectionStyle,
          ...getSectionStyleSx(content, styleKey),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}

interface TemplateInnerContainerProps
  extends Omit<ContainerProps, "maxWidth" | "sx"> {
  maxWidth?: ContainerProps["maxWidth"];
  sx?: SxProps<Theme>;
}

/** Standard page-width container used inside template section boundaries. */
export function TemplateInnerContainer({
  maxWidth = "xl",
  sx,
  children,
  ...rest
}: TemplateInnerContainerProps) {
  return (
    <Container
      maxWidth={maxWidth}
      {...rest}
      data-editor-layout-wrapper="true"
      sx={{ px: { xs: 2, md: 4 }, ...(sx || {}) }}
    >
      {children}
    </Container>
  );
}

interface TemplateSectionContentProps extends Omit<BoxProps, "sx" | "content"> {
  blockId: string | number | undefined;
  label: string;
  content: ContentLike;
  styleKey?: SectionStyleKey;
  acceptsInnerBlocks?: boolean;
  sx?: SxProps<Theme>;
}

/** Structural content surface; the parent boundary owns section styling. */
export function TemplateSectionContent({
  blockId: _blockId,
  label: _label,
  content: _content,
  styleKey: _styleKey = "sectionStyle",
  acceptsInnerBlocks: _acceptsInnerBlocks = true,
  sx,
  children,
  ...rest
}: TemplateSectionContentProps) {
  const parentOwnsBackground = sectionHasPersistentBackground(
    _content,
    "outerSectionStyle",
  );

  return (
    <Box
      {...rest}
      data-editor-layout-wrapper="true"
      data-editor-section-content="true"
      sx={{
        ...(sx || {}),
        ...(parentOwnsBackground
          ? {
              backgroundColor: "transparent !important",
              backgroundImage: "none !important",
            }
          : {}),
      }}
    >
      {children}
    </Box>
  );
}
