/**
 * Icon Library — value parse/serialize + Lucide resolve.
 * Canonical persisted format: "lucide:<name>" (string, backend-safe).
 */

import React from "react";
import { icons, CircleHelp, type LucideIcon, type LucideProps } from "lucide-react";

export type IconLibraryId = "lucide";

export type ParsedIconValue = {
  library: IconLibraryId;
  name: string;
  label: string;
};

const LEGACY_ALIASES: Record<string, string> = {
  ig: "instagram",
  fb: "facebook",
  x: "twitter",
  yt: "youtube",
  mail: "mail",
  email: "mail",
  home: "house",
  phone: "phone",
  star: "star",
  verified: "badge-check",
  analytics: "chart-column",
  business: "briefcase",
  support: "life-buoy",
  code: "code",
  palette: "palette",
  video: "video",
  global: "globe",
  web: "globe",
  build: "wrench",
  social: "share-2",
};

const toKebab = (value: string): string =>
  String(value || "")
    .trim()
    .replace(/^lucide:/i, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();

const toPascal = (kebab: string): string =>
  kebab
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const humanize = (kebab: string): string =>
  kebab
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const serializeIconValue = (
  icon: Pick<ParsedIconValue, "library" | "name"> | string,
): string => {
  if (typeof icon === "string") {
    const parsed = parseIconValue(icon);
    return parsed ? `lucide:${parsed.name}` : "";
  }
  const name = toKebab(icon.name);
  if (!name) return "";
  return `lucide:${name}`;
};

export const parseIconValue = (value: unknown): ParsedIconValue | null => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const name = toKebab(String(record.name || record.icon || ""));
    if (!name) return null;
    const label =
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : humanize(name);
    return { library: "lucide", name, label };
  }

  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  let name = toKebab(raw);
  if (LEGACY_ALIASES[name]) name = LEGACY_ALIASES[name];
  if (!name) return null;

  return {
    library: "lucide",
    name,
    label: humanize(name),
  };
};

export const getIconLabel = (value: unknown): string => {
  const parsed = parseIconValue(value);
  return parsed?.label || "";
};

export const resolveLucideIcon = (name: string): LucideIcon => {
  const kebab = toKebab(name);
  const aliased = LEGACY_ALIASES[kebab] || kebab;
  const pascal = toPascal(aliased);
  const map = icons as Record<string, LucideIcon>;
  return map[pascal] || CircleHelp;
};

export type RenderSavedIconProps = LucideProps & {
  value?: unknown;
  fallback?: LucideIcon;
};

/** Render a persisted icon value (lucide:name or legacy plain name). */
export function renderSavedIcon({
  value,
  fallback = CircleHelp,
  size = 18,
  ...rest
}: RenderSavedIconProps): React.ReactElement {
  const parsed = parseIconValue(value);
  const Icon = parsed ? resolveLucideIcon(parsed.name) : fallback;
  return React.createElement(Icon, { size, "aria-hidden": true, ...rest });
}

export default renderSavedIcon;
