export type EditableTextKind = "single" | "multi";

export const getEditableTextProps = (
  blockId: string | number | undefined,
  fieldPath: string,
  kind: EditableTextKind = "single",
) => ({
  className: "tt-preview-editable-node",
  "data-editable": fieldPath,
  "data-edit-type": kind,
  "data-block-id": blockId,
});

export const getEditableImageProps = (
  blockId: string | number | undefined,
  fieldPath: string,
  label?: string,
) => ({
  className: "tt-preview-image-node",
  "data-edit-image": fieldPath,
  ...(label ? { "data-image-label": label } : {}),
  "data-block-id": blockId,
});

export const getEditableSectionProps = (
  blockId: string | number | undefined,
  label: string,
  styleKey?: string,
) => ({
  className: "tt-preview-section-node",
  "data-preview-section": "true",
  "data-preview-label": label,
  "data-preview-block-id": blockId,
  ...(styleKey ? { "data-preview-style-key": styleKey } : {}),
});

export const getStaticSelectableProps = (
  blockId: string | number | undefined,
  label: string,
  staticId: string,
  styleKey = "sectionStyle",
  staticType = "unknown",
) => ({
  "data-static-selectable": "true",
  "data-static-style-only": "true",
  "data-static-id": staticId,
  "data-static-label": label,
  "data-static-type": staticType,
  "data-preview-target-kind": "static",
  "data-preview-section": "true",
  "data-preview-label": label,
  "data-preview-block-id": blockId,
  "data-preview-style-key": styleKey,
});
