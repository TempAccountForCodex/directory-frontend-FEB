export type EditableTextKind = "single" | "multi";

export const getEditableTextProps = (
  blockId: string | number | undefined,
  fieldPath: string,
  kind: EditableTextKind = "single",
  styleKey?: string,
) => ({
  className: "tt-preview-editable-node",
  "data-editable": fieldPath,
  "data-edit-type": kind,
  "data-block-id": blockId,
  ...(styleKey ? { "data-edit-style-key": styleKey } : {}),
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
  "data-template-section-boundary": "true",
  "data-editor-section-root": "true",
  "data-preview-label": label,
  "data-preview-block-id": blockId,
  ...(styleKey ? { "data-preview-style-key": styleKey } : {}),
});

const PERSISTENT_CONTAINER_TYPES = new Set([
  "container",
  "card",
  "section",
  "div",
]);

export const isPersistentContainerType = (staticType?: string) =>
  PERSISTENT_CONTAINER_TYPES.has(String(staticType || "").toLowerCase());

export const getStaticSelectableProps = (
  blockId: string | number | undefined,
  label: string,
  staticId: string,
  styleKey = "sectionStyle",
  staticType = "unknown",
) => {
  const persistentContainer = isPersistentContainerType(staticType);
  const resolvedStyleKey =
    persistentContainer && (styleKey === "sectionStyle" || styleKey.startsWith("static."))
      ? "containerStyles"
      : styleKey;

  return {
    "data-static-selectable": "true",
    "data-static-style-only": persistentContainer ? "false" : "true",
    "data-static-id": staticId,
    "data-static-label": label,
    "data-static-type": staticType,
    "data-hidden-key": persistentContainer
      ? `container:${staticId}`
      : `element:${staticId}`,
    ...(persistentContainer
      ? {
          "data-container-style-id": staticId,
          "data-container-id": staticId,
          "data-editor-container": "true",
          "data-parent-section": blockId,
        }
      : {}),
    "data-preview-target-kind": "static",
    "data-preview-section": "true",
    "data-preview-label": label,
    "data-preview-block-id": blockId,
    "data-preview-style-key": resolvedStyleKey,
  };
};
