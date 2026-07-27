/**
 * Curated Lucide icon catalog for the Icon Library modal.
 * Names are kebab-case; persisted as lucide:<name>.
 */

export type IconCategoryId =
  | "all"
  | "brands"
  | "regular"
  | "solid"
  | "arrows"
  | "business"
  | "social"
  | "ui"
  | "contact"
  | "services";

export type IconCatalogEntry = {
  name: string;
  label: string;
  categories: Exclude<IconCategoryId, "all">[];
};

export const ICON_LIBRARY_CATEGORIES: Array<{
  id: IconCategoryId;
  label: string;
}> = [
  { id: "all", label: "All Icons" },
  { id: "brands", label: "Brands" },
  { id: "regular", label: "Regular" },
  { id: "solid", label: "Solid" },
  { id: "arrows", label: "Arrows" },
  { id: "business", label: "Business" },
  { id: "social", label: "Social" },
  { id: "ui", label: "UI" },
  { id: "contact", label: "Contact" },
  { id: "services", label: "Services" },
];

export const ICON_CATALOG: IconCatalogEntry[] = [
  // Social / brands-like
  { name: "instagram", label: "Instagram", categories: ["social", "brands"] },
  { name: "facebook", label: "Facebook", categories: ["social", "brands"] },
  { name: "twitter", label: "Twitter", categories: ["social", "brands"] },
  { name: "youtube", label: "YouTube", categories: ["social", "brands"] },
  { name: "linkedin", label: "LinkedIn", categories: ["social", "brands", "business"] },
  { name: "github", label: "GitHub", categories: ["social", "brands"] },
  { name: "gitlab", label: "GitLab", categories: ["social", "brands"] },
  { name: "twitch", label: "Twitch", categories: ["social", "brands"] },
  { name: "dribbble", label: "Dribbble", categories: ["social", "brands"] },
  { name: "figma", label: "Figma", categories: ["social", "brands", "services"] },
  { name: "slack", label: "Slack", categories: ["social", "brands", "business"] },
  { name: "chrome", label: "Chrome", categories: ["brands"] },
  { name: "apple", label: "Apple", categories: ["brands"] },
  { name: "share-2", label: "Share", categories: ["social", "ui"] },

  // Contact
  { name: "mail", label: "Mail", categories: ["contact", "ui", "regular"] },
  { name: "phone", label: "Phone", categories: ["contact", "services", "solid"] },
  { name: "phone-call", label: "Phone Call", categories: ["contact", "services"] },
  { name: "message-circle", label: "Message", categories: ["contact", "social", "ui"] },
  { name: "messages-square", label: "Messages", categories: ["contact", "ui"] },
  { name: "map-pin", label: "Map Pin", categories: ["contact", "business"] },
  { name: "navigation", label: "Navigation", categories: ["contact", "arrows"] },
  { name: "globe", label: "Globe", categories: ["contact", "business", "ui"] },

  // Business / services
  { name: "briefcase", label: "Briefcase", categories: ["business", "services", "solid"] },
  { name: "building-2", label: "Building", categories: ["business", "solid"] },
  { name: "badge-check", label: "Badge Check", categories: ["business", "solid"] },
  { name: "chart-column", label: "Chart", categories: ["business", "services"] },
  { name: "wallet", label: "Wallet", categories: ["business", "services"] },
  { name: "credit-card", label: "Credit Card", categories: ["business", "services"] },
  { name: "handshake", label: "Handshake", categories: ["business", "services"] },
  { name: "users", label: "Users", categories: ["business", "services", "ui"] },
  { name: "user-round", label: "User", categories: ["business", "ui", "regular"] },
  { name: "store", label: "Store", categories: ["business", "services"] },
  { name: "package", label: "Package", categories: ["business", "services"] },
  { name: "truck", label: "Truck", categories: ["services", "business"] },
  { name: "wrench", label: "Wrench", categories: ["services", "solid"] },
  { name: "hammer", label: "Hammer", categories: ["services"] },
  { name: "shield-check", label: "Shield Check", categories: ["services", "business", "solid"] },
  { name: "life-buoy", label: "Life Buoy", categories: ["services", "contact"] },
  { name: "sparkles", label: "Sparkles", categories: ["services", "ui"] },
  { name: "leaf", label: "Leaf", categories: ["services"] },
  { name: "droplets", label: "Droplets", categories: ["services"] },
  { name: "camera", label: "Camera", categories: ["services", "ui", "regular"] },
  { name: "video", label: "Video", categories: ["services", "ui"] },
  { name: "music-2", label: "Music", categories: ["services", "social"] },
  { name: "palette", label: "Palette", categories: ["services", "ui"] },
  { name: "code", label: "Code", categories: ["services", "ui"] },
  { name: "graduation-cap", label: "Graduation", categories: ["services", "business"] },

  // Arrows
  { name: "arrow-right", label: "Arrow Right", categories: ["arrows", "ui", "regular"] },
  { name: "arrow-left", label: "Arrow Left", categories: ["arrows", "ui"] },
  { name: "arrow-up", label: "Arrow Up", categories: ["arrows", "ui"] },
  { name: "arrow-down", label: "Arrow Down", categories: ["arrows", "ui"] },
  { name: "arrow-up-right", label: "Arrow Up Right", categories: ["arrows", "ui"] },
  { name: "chevron-right", label: "Chevron Right", categories: ["arrows", "ui", "regular"] },
  { name: "chevron-left", label: "Chevron Left", categories: ["arrows", "ui"] },
  { name: "chevrons-right", label: "Chevrons Right", categories: ["arrows"] },
  { name: "move-right", label: "Move Right", categories: ["arrows"] },
  { name: "external-link", label: "External Link", categories: ["arrows", "ui", "social"] },

  // UI / regular / solid-ish
  { name: "star", label: "Star", categories: ["ui", "solid", "regular"] },
  { name: "heart", label: "Heart", categories: ["ui", "solid", "social"] },
  { name: "check", label: "Check", categories: ["ui", "regular", "solid"] },
  { name: "check-circle-2", label: "Check Circle", categories: ["ui", "solid"] },
  { name: "circle", label: "Circle", categories: ["ui", "regular"] },
  { name: "plus", label: "Plus", categories: ["ui", "regular"] },
  { name: "minus", label: "Minus", categories: ["ui", "regular"] },
  { name: "x", label: "Close", categories: ["ui", "regular"] },
  { name: "search", label: "Search", categories: ["ui", "regular"] },
  { name: "settings", label: "Settings", categories: ["ui", "solid"] },
  { name: "menu", label: "Menu", categories: ["ui", "regular"] },
  { name: "house", label: "Home", categories: ["ui", "solid", "regular"] },
  { name: "bell", label: "Bell", categories: ["ui", "solid", "contact"] },
  { name: "calendar", label: "Calendar", categories: ["ui", "business", "regular"] },
  { name: "clock", label: "Clock", categories: ["ui", "business", "regular"] },
  { name: "image", label: "Image", categories: ["ui", "services"] },
  { name: "link", label: "Link", categories: ["ui", "social"] },
  { name: "bookmark", label: "Bookmark", categories: ["ui", "solid"] },
  { name: "file-text", label: "File Text", categories: ["ui", "business"] },
  { name: "copy", label: "Copy", categories: ["ui", "regular"] },
  { name: "trash-2", label: "Trash", categories: ["ui"] },
  { name: "eye", label: "Eye", categories: ["ui", "regular"] },
  { name: "lock", label: "Lock", categories: ["ui", "solid"] },
  { name: "zap", label: "Zap", categories: ["ui", "services", "solid"] },
  { name: "info", label: "Info", categories: ["ui", "regular"] },
  { name: "circle-help", label: "Help", categories: ["ui", "regular"] },
];

export const filterIconCatalog = (
  query: string,
  category: IconCategoryId,
): IconCatalogEntry[] => {
  const q = query.trim().toLowerCase();
  return ICON_CATALOG.filter((entry) => {
    const inCategory =
      category === "all" || entry.categories.includes(category);
    if (!inCategory) return false;
    if (!q) return true;
    return (
      entry.name.includes(q) ||
      entry.label.toLowerCase().includes(q) ||
      entry.categories.some((c) => c.includes(q))
    );
  });
};
