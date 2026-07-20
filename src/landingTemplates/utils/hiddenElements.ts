/**
 * Shared "hidden elements" registry.
 *
 * Delete in the template editor must PERSIST as a real removal, not reset a
 * field to its default (which templates fall back to via `value || "Default"`).
 * For optional single fields (heading, eyebrow, body, image, ...) we record the
 * deletion in a generic, reusable map stored inside `block.content`:
 *
 *   {
 *     "hiddenElements": {
 *       "heading": true,
 *       "image": true,
 *       "splitContentCards.darkCard.body": true
 *     }
 *   }
 *
 * Renderers check this map before rendering an optional element so the element
 * disappears in the editor canvas, in Live Preview, and after an editor refresh.
 *
 * Array items (features[], items[], detailGroups[].items[], ...) and top-level
 * sections/blocks are removed structurally instead — see the editor's delete
 * pipeline — so they are naturally gone and don't need this map.
 *
 * NOTE: The backend must allow `hiddenElements` through block validation for
 * this to survive `Save Changes`. See TEMPLATE_SCHEMA_BACKEND_FOLLOWUPS.md.
 */

export type HiddenElementsMap = Record<string, boolean>;

const readMapField = (content: unknown, field: string): HiddenElementsMap => {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return {};
  }
  const raw = (content as Record<string, unknown>)[field];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return raw as HiddenElementsMap;
};

const readHiddenMap = (content: unknown): HiddenElementsMap =>
  readMapField(content, "hiddenElements");

const HIDDEN_CONTAINER_STYLE_PREFIX = "__hidden__--";

const readHiddenContainerMap = (content: unknown): HiddenElementsMap => {
  const hidden = { ...readMapField(content, "hiddenContainers") };
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return hidden;
  }
  const styles = (content as Record<string, unknown>).containerStyles;
  if (!styles || typeof styles !== "object" || Array.isArray(styles)) {
    return hidden;
  }
  Object.keys(styles).forEach((styleId) => {
    if (styleId.startsWith(HIDDEN_CONTAINER_STYLE_PREFIX)) {
      const containerId = styleId.slice(HIDDEN_CONTAINER_STYLE_PREFIX.length);
      if (containerId) hidden[containerId] = true;
    }
  });
  return hidden;
};

/**
 * True when the given field path has been persistently deleted/hidden on a
 * section/block content object (e.g. `isElementHidden(aboutContent, "heading")`).
 */
export const isElementHidden = (
  content: unknown,
  path: string | null | undefined,
): boolean => {
  if (!path) return false;
  return readHiddenMap(content)[path] === true;
};

/**
 * Immutably mark a field path as hidden within a block/section content object.
 * Used by the editor delete pipeline.
 */
export const markElementHidden = <T extends Record<string, any>>(
  content: T | null | undefined,
  path: string,
): T => {
  const base = (content || {}) as T;
  if (!path) return base;
  return {
    ...base,
    hiddenElements: { ...readHiddenMap(base), [path]: true },
  };
};

/**
 * Immutably mark a whole container/wrapper (by its stable container id — the
 * element's `data-static-id`) as hidden. Deleting a div/static container hides
 * the container and all of its children/styles. Used by the editor delete
 * pipeline for containers that don't map to a single content field or array
 * item (fixed EditableContainers and auto-detected "fallback-*" wrappers).
 */
export const markContainerHidden = <T extends Record<string, any>>(
  content: T | null | undefined,
  containerId: string,
): T => {
  const base = (content || {}) as T;
  if (!containerId) return base;
  const containerStyles =
    base.containerStyles &&
    typeof base.containerStyles === "object" &&
    !Array.isArray(base.containerStyles)
      ? base.containerStyles
      : {};
  return {
    ...base,
    // containerStyles is supported by every backend block schema. Keeping the
    // delete marker here makes nested-container removal round-trip even on
    // backends that strip the legacy hiddenContainers field.
    containerStyles: {
      ...containerStyles,
      [`${HIDDEN_CONTAINER_STYLE_PREFIX}${containerId}`]: {
        backgroundType: "none",
      },
    },
  };
};

/**
 * Build a `blockId -> hiddenElements` map from editor/persisted pages so a
 * template can check any block's hidden fields from the top-level BusinessData
 * without every section needing to thread the map through props.
 */
export const buildHiddenElementsMap = (
  pages:
    | Array<{ blocks?: Array<{ id?: unknown; content?: unknown }> }>
    | null
    | undefined,
): Record<string, HiddenElementsMap> => {
  const map: Record<string, HiddenElementsMap> = {};
  (pages || []).forEach((page) => {
    (page?.blocks || []).forEach((block) => {
      const hidden = readHiddenMap(block?.content);
      if (block?.id != null && Object.keys(hidden).length > 0) {
        map[String(block.id)] = hidden;
      }
    });
  });
  return map;
};

/**
 * Build a `blockId -> hiddenContainers` map (keyed by stable container id) from
 * editor/persisted pages. Mirrors buildHiddenElementsMap for whole-container
 * deletes.
 */
export const buildHiddenContainersMap = (
  pages:
    | Array<{ blocks?: Array<{ id?: unknown; content?: unknown }> }>
    | null
    | undefined,
): Record<string, HiddenElementsMap> => {
  const map: Record<string, HiddenElementsMap> = {};
  (pages || []).forEach((page) => {
    (page?.blocks || []).forEach((block) => {
      const hidden = readHiddenContainerMap(block?.content);
      if (block?.id != null && Object.keys(hidden).length > 0) {
        map[String(block.id)] = hidden;
      }
    });
  });
  return map;
};

/**
 * Check a hidden field by blockId against a BusinessData-level hidden map
 * (`data.templateContent.__hiddenElements`). Reusable by any template/section.
 */
export const isBlockElementHidden = (
  hiddenByBlockId: Record<string, HiddenElementsMap> | null | undefined,
  blockId: string | number | null | undefined,
  path: string | null | undefined,
): boolean => {
  if (!hiddenByBlockId || blockId == null || !path) return false;
  return hiddenByBlockId[String(blockId)]?.[path] === true;
};
