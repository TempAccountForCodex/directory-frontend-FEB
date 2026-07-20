/**
 * Reusable editable components for the template editor.
 *
 * Pattern:
 *   1. Wrap each content section with <EditableSection blockId={...} label="...">.
 *      This provides the blockId via context — child components don't repeat it.
 *
 *   2. Replace Typography with <EditableText field="fieldPath" kind="multi|single">.
 *   3. Replace Button    with <EditableButton field="fieldPath">.
 *   4. Replace generic tags (a/li/span/div) with <EditableBox field="fieldPath">.
 *   5. Replace outer containers with <EditableContainer field="items.N" label="Item label">.
 *   6. Replace Card      with <EditableCard field="features.N" label="Item label">.
 *   7. Replace img Box   with <EditableImage field="fieldPath" label="Image label">.
 *
 * All components forward every MUI / HTML prop to their underlying element,
 * so styling, variants, onClick handlers, etc. are unaffected.
 */
import React from "react";
import Box, { type BoxProps } from "@mui/material/Box";
import Typography, { type TypographyProps } from "@mui/material/Typography";
import Button, { type ButtonProps } from "@mui/material/Button";
import Card, { type CardProps } from "@mui/material/Card";
import {
  getEditableTextProps,
  getEditableImageProps,
  getEditableSectionProps,
  getStaticSelectableProps,
  type EditableTextKind,
} from "./editableProps";
import {
  isBlockElementHidden,
  type HiddenElementsMap,
} from "./hiddenElements";
import { renderEditorSharedBlock } from "../blocks/EditorSharedBlockRenderer";

/* ── Context ──────────────────────────────────────────────────────────────── */

interface EditableBlockContextValue {
  blockId: string | number | undefined;
}

const EditableBlockContext = React.createContext<EditableBlockContextValue>({
  blockId: undefined,
});

/** Read the blockId provided by the nearest ancestor EditableSection. */
export function useEditableBlockId(): string | number | undefined {
  return React.useContext(EditableBlockContext).blockId;
}

/* ── Hidden elements (persistent delete) ─────────────────────────────────── */

const HiddenElementsContext = React.createContext<
  Record<string, HiddenElementsMap> | undefined
>(undefined);

/**
 * Provide the `blockId -> hiddenElements` map (from
 * `data.templateContent.__hiddenElements`) so shared editable components can
 * drop elements the user deleted in the editor. Wrap the rendered template with
 * this once — see TemplateEngine.
 */
export function HiddenElementsProvider({
  value,
  children,
}: {
  value: Record<string, HiddenElementsMap> | undefined;
  children: React.ReactNode;
}) {
  return (
    <HiddenElementsContext.Provider value={value}>
      {children}
    </HiddenElementsContext.Provider>
  );
}

/**
 * True when `field` on the current EditableSection's block was deleted via the
 * editor. Shared editable components use this to render nothing (so the deleted
 * element disappears instead of reverting to its template default).
 */
export function useIsFieldHidden(field: string | undefined): boolean {
  const blockId = useEditableBlockId();
  const hiddenMap = React.useContext(HiddenElementsContext);
  return isBlockElementHidden(hiddenMap, blockId, field);
}

/* ── EditableSection ──────────────────────────────────────────────────────── */

interface EditableSectionProps extends Omit<BoxProps, "id"> {
  blockId: string | number | undefined;
  label: string;
  styleKey?: "sectionStyle" | "outerSectionStyle";
  sectionKey?: string;
  id?: string;
}

/**
 * Section wrapper that:
 * - Adds data-preview-section/label/block-id attributes so the editor can
 *   select and style the section.
 * - Provides blockId via context so child EditableText / EditableButton /
 *   EditableCard / EditableImage don't need to repeat it.
 *
 * Spreads all Box props (sx, className, id, etc.) through to the DOM.
 */
export function EditableSection({
  blockId,
  label,
  styleKey,
  sectionKey,
  children,
  ...rest
}: EditableSectionProps) {
  return (
    <EditableBlockContext.Provider value={{ blockId }}>
      <Box
        {...getEditableSectionProps(blockId, label, styleKey)}
        data-template-section-boundary="true"
        data-editor-section-root="true"
        data-editor-section-key={sectionKey}
        {...rest}
      >
        {children}
      </Box>
    </EditableBlockContext.Provider>
  );
}

/* ── EditableText ─────────────────────────────────────────────────────────── */

interface EditableTextProps extends TypographyProps {
  /** Dot-notation field path, e.g. "heading", "features.0.name". */
  field: string;
  kind?: EditableTextKind;
}

/**
 * Drop-in replacement for Typography.
 * Reads blockId from the nearest EditableSection context and adds
 * data-editable / data-edit-type / data-block-id to the element.
 */
export function EditableText({
  field,
  kind = "single",
  children,
  ...rest
}: EditableTextProps) {
  const blockId = useEditableBlockId();
  if (useIsFieldHidden(field)) return null;
  return (
    <Typography {...getEditableTextProps(blockId, field, kind)} {...rest}>
      {children}
    </Typography>
  );
}

interface EditableBoxProps extends BoxProps {
  /** Dot-notation field path, e.g. "links.0.label", "stats.0.value". */
  field: string;
  kind?: EditableTextKind;
}

/**
 * Generic editable wrapper for text-bearing non-Typography elements such as
 * links, list items, pills, badges, chips, counters, and nav/footer labels.
 */
export function EditableBox({
  field,
  kind = "single",
  children,
  ...rest
}: EditableBoxProps) {
  const blockId = useEditableBlockId();
  if (useIsFieldHidden(field)) return null;
  return (
    <Box {...getEditableTextProps(blockId, field, kind)} {...rest}>
      {children}
    </Box>
  );
}

/* ── EditableButton ───────────────────────────────────────────────────────── */

interface EditableButtonProps extends ButtonProps {
  field: string;
  kind?: EditableTextKind;
}

/**
 * Drop-in replacement for MUI Button.
 * Reads blockId from context and marks the button as an editable text node.
 */
export function EditableButton({
  field,
  kind = "single",
  children,
  ...rest
}: EditableButtonProps) {
  const blockId = useEditableBlockId();
  if (useIsFieldHidden(field)) return null;
  return (
    <Button {...getEditableTextProps(blockId, field, kind)} {...rest}>
      {children}
    </Button>
  );
}

interface EditableLinkProps extends BoxProps {
  field: string;
  kind?: EditableTextKind;
}

/** Convenience wrapper for editable anchors / nav items / footer links. */
export function EditableLink({
  field,
  kind = "single",
  children,
  ...rest
}: EditableLinkProps) {
  return (
    <EditableBox field={field} kind={kind} component="a" {...rest}>
      {children}
    </EditableBox>
  );
}

interface StaticSelectableBoxProps extends BoxProps {
  label: string;
  staticId: string;
  blockId?: string | number;
  styleKey?: string;
  staticType?: string;
}

export function StaticSelectableBox({
  label,
  staticId,
  blockId,
  styleKey = "sectionStyle",
  staticType = "unknown",
  children,
  ...rest
}: StaticSelectableBoxProps) {
  const contextBlockId = useEditableBlockId();
  return (
    <Box
      {...getStaticSelectableProps(
        blockId ?? contextBlockId,
        label,
        staticId,
        styleKey,
        staticType,
      )}
      {...rest}
    >
      {children}
    </Box>
  );
}

/* ── EditableImage ────────────────────────────────────────────────────────── */

interface EditableImageProps extends Omit<BoxProps, "component"> {
  field: string;
  label?: string;
  src?: string;
  alt?: string;
}

/**
 * Renders <Box component="img"> with image-selection attributes.
 * Double-clicking in the editor opens the image picker for this field.
 */
export function EditableImage({ field, label, src, alt, ...rest }: EditableImageProps) {
  const blockId = useEditableBlockId();
  if (useIsFieldHidden(field)) return null;
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      {...getEditableImageProps(blockId, field, label)}
      {...rest}
    />
  );
}

/* ── renderEditableMedia ──────────────────────────────────────────────────── */

interface EditableMediaStyle {
  mediaType?: string;
  videoUrl?: string;
  videoPoster?: string;
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  videoControls?: boolean;
  [key: string]: any;
}

interface RenderEditableMediaArgs {
  blockId: string | number | undefined;
  /** data-edit-image field path (e.g. "image"). Keeps double-click editing. */
  field: string;
  label?: string;
  /** Image source used when mediaType is not "video". */
  src?: string;
  alt?: string;
  /** The image/media style object (content[`${field}Style`]). */
  style?: EditableMediaStyle;
  /** sx applied to whichever element renders. */
  sx?: any;
  /**
   * Component to use for the IMAGE render (default "img"). Pass `motion.img`
   * to preserve a template's entrance/scroll animation on the image.
   */
  imageComponent?: React.ElementType;
  /** Extra props for the image element (e.g. motion initial/animate/style). */
  imageProps?: Record<string, any>;
  /** Component to use for the VIDEO render (default "video", e.g. motion.video). */
  videoComponent?: React.ElementType;
  /** Extra props for the video element. */
  videoProps?: Record<string, any>;
}

/**
 * Renders either an <img> or a <video> for an editable media field, based on
 * `style.mediaType`. Backward compatible: a missing/"image" mediaType (or a
 * video mediaType with no videoUrl) renders the <img>, so existing image blocks
 * keep working. Video attributes come from the style object so the same block
 * can switch between image and video. Keeps the data-edit-image attributes so
 * double-clicking still opens the media editor for this field.
 *
 * `imageComponent`/`imageProps` let callers keep animated images (e.g.
 * `motion.img` with initial/animate/scroll `style`) — the image path is
 * untouched for existing blocks, and only the video path swaps in a <video>.
 */
export function renderEditableMedia({
  blockId,
  field,
  label,
  src,
  alt,
  style,
  sx,
  imageComponent = "img",
  imageProps = {},
  videoComponent = "video",
  videoProps = {},
}: RenderEditableMediaArgs) {
  const s = (style || {}) as EditableMediaStyle;
  const videoUrl = typeof s.videoUrl === "string" ? s.videoUrl.trim() : "";
  const isVideo = s.mediaType === "video" && videoUrl.length > 0;

  const editAttrs = {
    className: "tt-preview-image-node",
    "data-edit-image": field,
    ...(label ? { "data-image-label": label } : {}),
    "data-block-id": blockId,
  };

  if (isVideo) {
    return (
      <Box
        component={videoComponent}
        src={videoUrl}
        poster={s.videoPoster || undefined}
        autoPlay={Boolean(s.videoAutoplay)}
        muted={s.videoMuted !== false}
        loop={Boolean(s.videoLoop)}
        controls={s.videoControls !== false}
        playsInline
        {...videoProps}
        {...editAttrs}
        sx={sx}
      />
    );
  }

  return (
    <Box
      component={imageComponent}
      src={src}
      alt={alt}
      {...imageProps}
      {...editAttrs}
      sx={sx}
    />
  );
}

/* ── EditableCard ─────────────────────────────────────────────────────────── */

interface EditableContainerProps extends BoxProps {
  field: string;
  label: string;
  selectionSuffix?: "__card" | "__container";
  styleKey?: string;
}

/**
 * Generic compound-selection container:
 * - clicking empty space selects the outer container
 * - clicking inner editable text/image selects that specific child
 */
export function EditableContainer({
  field,
  label,
  selectionSuffix = "__container",
  styleKey = "cardStyle",
  children,
  ...rest
}: EditableContainerProps) {
  const blockId = useEditableBlockId();
  const containerPath = field.endsWith(`.${selectionSuffix}`)
    ? field
    : `${field}.${selectionSuffix}`;
  const resolvedStyleKey =
    styleKey === "cardStyle" ? "containerStyles" : styleKey;
  const staticType = selectionSuffix === "__card" ? "card" : "container";

  return (
    <Box
      {...getStaticSelectableProps(
        blockId,
        label,
        containerPath,
        resolvedStyleKey,
        staticType,
      )}
      data-content-path={field}
      {...rest}
    >
      {children}
    </Box>
  );
}

interface EditableCardProps extends CardProps {
  /**
   * Base field path for this card item, e.g. "features.0".
   * The component appends ".__card" automatically to mark the container.
   */
  field: string;
  /** Human-readable label shown in the editor overlay, e.g. "Program 1". */
  label: string;
}

/**
 * Card container with compound selection behaviour:
 * - Clicking empty space inside the card → section/style panel (via
 *   data-preview-section + the .__card suffix logic in PreviewPanel).
 * - Clicking an inner EditableText → text selection for that specific field.
 *
 * Reads blockId from the nearest EditableSection context.
 */
export function EditableCard({ field, label, children, ...rest }: EditableCardProps) {
  return (
    <EditableContainer
      component={Card}
      field={field}
      label={label}
      selectionSuffix="__card"
      {...rest}
    >
      {children}
    </EditableContainer>
  );
}

/* ── EditorExtraBlocks ────────────────────────────────────────────────────── */

interface EditorExtraBlocksProps {
  /**
   * Top-level editor blocks that don't map to one of the template's fixed
   * sections (e.g. a second Hero, an extra Contact/CTA added from the Library).
   * Provided by buildTemplatePreviewBusinessData as templateContent.extraBlocks.
   */
  blocks?: Array<Record<string, any>> | undefined;
  themeColor?: string;
  fallbackImageSrc?: string;
  websiteId?: string | number;
  /** Visual tone for the shared renderer. Defaults to "dark". */
  tone?: "light" | "dark";
  headingFont?: string;
}

/**
 * Renders template blocks that fall outside the fixed section layout using the
 * shared editor block renderer — the same renderer the dynamic Company
 * templates use. Each block:
 *  - is rendered by type via renderEditorSharedBlock (registry-driven, not
 *    template-specific),
 *  - is individually selectable/editable (its own blockId, flat field paths),
 *  - round-trips through block.content so edits persist across reload.
 *
 * Field paths are relative to the block's own content (top-level blocks), so
 * blockPath is empty. The save handler strips the resulting empty leading
 * segment, keeping content flat.
 */
export function EditorExtraBlocks({
  blocks,
  themeColor = "#2563eb",
  fallbackImageSrc = "",
  websiteId,
  tone = "dark",
  headingFont = "inherit",
}: EditorExtraBlocksProps) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  const isLight = tone === "light";
  const textColor = isLight ? "#0f172a" : "#ffffff";
  const mutedTextColor = isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.75)";
  const lineColor = isLight ? "rgba(15,23,42,0.16)" : "rgba(255,255,255,0.2)";
  const passthrough = (_: any, fallback: any = "100%") => fallback;

  return (
    <>
      {blocks.map((block, index) => {
        const blockId = block.id ?? block.blockId;
        const rawContent = (block.content as Record<string, any>) || {};
        // A block persisted as a SECTION wrapper carries its real type in
        // content.editorBlockType and its live fields in the first inner block.
        // Resolve to the real type and merge inner + root content (root wins, so
        // the latest edited fields like `formFields` are used) — otherwise the
        // wrapper resolves to type "section", renders nothing, and custom fields
        // never appear on the canvas.
        const editorBlockType = String(rawContent.editorBlockType || "").toLowerCase();
        const rawType = String(block.type || block.blockType || "").toLowerCase();
        const blockType = editorBlockType || rawType;
        const innerContent =
          Array.isArray(rawContent.innerBlocks) && rawContent.innerBlocks[0]
            ? ((rawContent.innerBlocks[0].content as Record<string, any>) || {})
            : {};
        const content = { ...innerContent, ...rawContent };
        // Top-level block: field paths are relative to its own content.
        const blockPath = "";
        const label = String(block.label || blockType || `Block ${index + 1}`);
        const normalizedBlock = { ...block, type: blockType, content };
        const rawCardStyle = (content.cardStyle as Record<string, any>) || {};
        const rawSectionStyle = (content.sectionStyle as Record<string, any>) || {};
        const compoundBlockSelectionProps = {
          ...getEditableTextProps(blockId, "__card", "single"),
          "data-preview-section": "true",
          "data-preview-label": label,
          "data-preview-block-id": blockId,
          "data-preview-style-key": "cardStyle",
        };

        const rendered = renderEditorSharedBlock({
          section: { blockId },
          block: normalizedBlock,
          index,
          blockPath,
          tone,
          textColor,
          mutedTextColor,
          lineColor,
          themeColor,
          headingFont,
          headingStyle: {},
          bodyStyle: {},
          textStyle: {},
          buttonStyle: {},
          eyebrowStyle: {},
          imageStyle: (content.imageStyle as Record<string, any>) || {},
          cardStyle: rawCardStyle,
          sectionStyle: rawSectionStyle,
          rawCardStyle,
          resolvedCardStyle: rawCardStyle,
          rawSectionStyle,
          resolvedSectionStyle: rawSectionStyle,
          blockMaxWidth: "100%",
          canvas: false,
          canvasBaseSx: null,
          compoundBlockSelectionProps,
          compoundBlockLabel: label,
          compoundCardSx: {},
          fallbackImageSrc,
          accentSoftColor: "rgba(37,99,235,0.08)",
          whiteColor: "#ffffff",
          getCanvasWidth: passthrough,
          getCanvasMaxWidth: passthrough,
          getCanvasTransform: () => undefined,
          getEditableFieldStyle: () => ({}),
          websiteId,
        });

        if (!rendered) return null;
        return (
          <Box key={String(blockId ?? index)} sx={{ width: "100%" }}>
            {rendered}
          </Box>
        );
      })}
    </>
  );
}
