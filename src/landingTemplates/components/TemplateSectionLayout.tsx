import React from "react";
import Box, { type BoxProps } from "@mui/material/Box";
import Container, {
  type ContainerProps,
} from "@mui/material/Container";
import {
  getSectionStyleDomProps,
  getSectionStyleSx,
} from "../utils/sectionStyle";

type ContentLike = Record<string, any> | null | undefined;
type StyleObject = Record<string, any>;

export function sectionHasPersistentBackground(
  content: ContentLike,
  styleKey = "outerSectionStyle",
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

interface TemplateSectionBoundaryProps extends Omit<BoxProps, "sx"> {
  blockId: string | number | undefined;
  label: string;
  sectionKey: string;
  content: ContentLike;
  styleKey?: string;
  order?: number;
  sx?: StyleObject;
}

/** Persistent top-level section boundary shared by template renderers. */
export function TemplateSectionBoundary({
  blockId,
  label,
  sectionKey,
  content,
  styleKey = "outerSectionStyle",
  order,
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
      sx={{
        order,
        ...legacySectionStyle,
        ...getSectionStyleSx(content, styleKey),
        ...(sx || {}),
      }}
    >
      {children}
    </Box>
  );
}

interface TemplateInnerContainerProps
  extends Omit<ContainerProps, "maxWidth" | "sx"> {
  maxWidth?: ContainerProps["maxWidth"];
  sx?: StyleObject;
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

interface TemplateSectionContentProps extends Omit<BoxProps, "sx"> {
  blockId: string | number | undefined;
  label: string;
  content: ContentLike;
  styleKey?: string;
  acceptsInnerBlocks?: boolean;
  sx?: StyleObject;
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
