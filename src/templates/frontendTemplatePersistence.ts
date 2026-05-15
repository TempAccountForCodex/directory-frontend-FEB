const STORAGE_KEY = "tt_frontend_template_website_map";

type FrontendTemplateWebsiteMap = Record<string, string>;

const readMap = (): FrontendTemplateWebsiteMap => {
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

    return parsed as FrontendTemplateWebsiteMap;
  } catch {
    return {};
  }
};

const writeMap = (map: FrontendTemplateWebsiteMap) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures; this is only a frontend fallback.
  }
};

export const storeWebsiteFrontendTemplateId = (
  websiteId: string | number,
  frontendTemplateId: string,
) => {
  const normalizedWebsiteId = String(websiteId || "").trim();
  const normalizedTemplateId = String(frontendTemplateId || "").trim();

  if (!normalizedWebsiteId || !normalizedTemplateId) {
    return;
  }

  const current = readMap();
  writeMap({
    ...current,
    [normalizedWebsiteId]: normalizedTemplateId,
  });
};

export const getStoredWebsiteFrontendTemplateId = (
  websiteId: string | number | null | undefined,
): string | null => {
  const normalizedWebsiteId = String(websiteId || "").trim();
  if (!normalizedWebsiteId) {
    return null;
  }

  const current = readMap();
  const value = current[normalizedWebsiteId];
  return typeof value === "string" && value.trim() ? value : null;
};
