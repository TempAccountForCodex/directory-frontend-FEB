export type EditableTextKind = "single" | "multi";

export const getEditableTextProps = (
  blockId: string | number | undefined,
  fieldPath: string,
  kind: EditableTextKind = "single",
) => ({
  "data-editable": fieldPath,
  "data-edit-type": kind,
  "data-block-id": blockId,
});

export const getEditableImageProps = (
  blockId: string | number | undefined,
  fieldPath: string,
  label?: string,
) => ({
  "data-edit-image": fieldPath,
  ...(label ? { "data-image-label": label } : {}),
  "data-block-id": blockId,
});

export const getEditableSectionProps = (
  blockId: string | number | undefined,
  label: string,
  styleKey?: string,
) => ({
  "data-preview-section": "true",
  "data-preview-label": label,
  "data-preview-block-id": blockId,
  ...(styleKey ? { "data-preview-style-key": styleKey } : {}),
});
