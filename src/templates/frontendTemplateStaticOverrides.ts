const STORAGE_KEY = "tt_frontend_template_static_overrides";

type StaticOverrideStore = {
  media?: Record<string, Record<string, any>>;
  style?: Record<string, Record<string, any>>;
};

const readStore = (): StaticOverrideStore => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as StaticOverrideStore;
  } catch {
    return {};
  }
};

const writeStore = (next: StaticOverrideStore) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures; editor-only enhancement.
  }
};

export const buildStoredStaticMediaOverrideKey = (
  websiteId: string | number,
  pageId: string | number,
  blockId: string | number,
  staticId: string,
) =>
  `${String(websiteId)}::${String(pageId)}::${String(blockId)}::${String(staticId)}`;

export const buildStoredStaticStyleOverrideKey = (
  websiteId: string | number,
  pageId: string | number,
  blockId: string | number,
  styleKey: string,
  staticId: string,
) =>
  `${String(websiteId)}::${String(pageId)}::${String(blockId)}::${String(styleKey || "sectionStyle")}::${String(staticId)}`;

export const storeStaticMediaOverride = (
  key: string,
  value: Record<string, any>,
) => {
  if (!key) {
    return;
  }

  const current = readStore();
  writeStore({
    ...current,
    media: {
      ...(current.media || {}),
      [key]: value,
    },
  });
};

export const storeStaticStyleOverride = (
  key: string,
  value: Record<string, any>,
) => {
  if (!key) {
    return;
  }

  const current = readStore();
  writeStore({
    ...current,
    style: {
      ...(current.style || {}),
      [key]: value,
    },
  });
};

export const getStoredStaticOverridesForPage = (
  websiteId: string | number | null | undefined,
  pageId: string | number | null | undefined,
) => {
  const result = {
    media: {} as Record<string, Record<string, any>>,
    style: {} as Record<string, Record<string, any>>,
  };

  if (websiteId == null || pageId == null) {
    return result;
  }

  const current = readStore();
  const websiteKey = String(websiteId);
  const pageKey = String(pageId);

  Object.entries(current.media || {}).forEach(([key, value]) => {
    const [storedWebsiteId, storedPageId, blockId, staticId] =
      key.split("::");
    if (
      storedWebsiteId === websiteKey &&
      storedPageId === pageKey &&
      blockId &&
      staticId
    ) {
      result.media[`${blockId}::${staticId}`] = value;
    }
  });

  Object.entries(current.style || {}).forEach(([key, value]) => {
    const [storedWebsiteId, storedPageId, blockId, styleKey, staticId] =
      key.split("::");
    if (
      storedWebsiteId === websiteKey &&
      storedPageId === pageKey &&
      blockId &&
      styleKey &&
      staticId
    ) {
      result.style[`${blockId}::${styleKey}::${staticId}`] = value;
    }
  });

  return result;
};
