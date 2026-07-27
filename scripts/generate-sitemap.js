import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TODAY = new Date().toISOString().slice(0, 10);
const projectRoot = process.cwd();

const readEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return acc;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        return acc;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      acc[key] = value;
      return acc;
    }, {});
};

const env = {
  ...readEnvFile(path.join(projectRoot, ".env")),
  ...readEnvFile(path.join(projectRoot, ".env.production")),
  ...process.env,
};

const normalizeSiteUrl = (url) => {
  if (!url) {
    return "https://www.techietribe.ai";
  }

  const trimmedUrl = url.endsWith("/") ? url.slice(0, -1) : url;

  try {
    const parsedUrl = new URL(trimmedUrl);
    if (parsedUrl.hostname === "techietribe.ai") {
      parsedUrl.hostname = "www.techietribe.ai";
      return parsedUrl.toString().replace(/\/$/, "");
    }
  } catch {
    return trimmedUrl;
  }

  return trimmedUrl;
};

const SITE_URL = normalizeSiteUrl(
  env.SITE_URL || env.VITE_SITE_URL || env.VITE_APP_URL,
);

const EXCLUDED_PREFIXES = [
  "/auth",
  "/dashboard",
  "/template-preview",
  "/landing-preview",
  "/checkout",
  "/site/",
];

// Video files that are never presented to a user as playable media — they are
// decoded off-screen as canvas texture sources. Kept out of the crawl so
// Google's video indexer does not flag them as thumbnail-less.
const UNCRAWLABLE_VIDEOS = [
  "/assets/publicAssets/videos/About/bg_test2_compressed.mp4",
  "/assets/publicAssets/videos/About/why-choose-us-bg.webm",
  "/assets/video/logoLoader.webm",
];

const MANUAL_ROUTES = [
  "/",
  "/about",
  "/pricing",
  "/templates",
  "/listings",
  "/directory",
  "/contact",
  "/blog",
  "/faq",
  "/app-access",
  "/privacy-policy",
  "/cookie-policy",
  "/terms-and-conditions",
];

const ROUTE_SOURCE_FILES = [path.join(projectRoot, "src", "App.tsx")];

const normalizeRoute = (route) => {
  if (!route) {
    return null;
  }

  let normalized = route.trim();

  if (!normalized.startsWith("/")) {
    return null;
  }

  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
};

const isIndexableRoute = (route) => {
  if (!route || route === "*") {
    return false;
  }

  if (route.includes("*") || route.includes(":") || route.includes("?")) {
    return false;
  }

  if (EXCLUDED_PREFIXES.some((prefix) => route.startsWith(prefix))) {
    return false;
  }

  return true;
};

const extractRoutesFromFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const matches = new Set();
  const routePatterns = [
    /\bpath\s*:\s*["'`]([^"'`]+)["'`]/g,
    /\bhref\s*:\s*["'`]([^"'`]+)["'`]/g,
    /\bto\s*=\s*["'`]([^"'`]+)["'`]/g,
  ];

  for (const pattern of routePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const route = normalizeRoute(match[1]);
      if (isIndexableRoute(route)) {
        matches.add(route);
      }
    }
  }

  return matches;
};

const discoverRoutes = () => {
  const allRoutes = new Set(MANUAL_ROUTES);
  const sourceFiles = ROUTE_SOURCE_FILES.filter((filePath) =>
    fs.existsSync(filePath),
  );

  for (const filePath of sourceFiles) {
    const routes = extractRoutesFromFile(filePath);
    for (const route of routes) {
      allRoutes.add(route);
    }
  }

  return [...allRoutes]
    .map(normalizeRoute)
    .filter(isIndexableRoute)
    .sort((a, b) => {
      if (a === "/") {
        return -1;
      }
      if (b === "/") {
        return 1;
      }
      return a.localeCompare(b);
    });
};

const getRouteMetadata = (loc) => {
  if (loc === "/") {
    return { changefreq: "weekly", priority: "1.0" };
  }

  if (loc === "/blog" || loc.startsWith("/case-study")) {
    return { changefreq: "weekly", priority: "0.8" };
  }

  if (loc === "/directory" || loc === "/listings") {
    return { changefreq: "daily", priority: "0.8" };
  }

  if (
    loc === "/privacy-policy" ||
    loc === "/app-access" ||
    loc === "/cookie-policy" ||
    loc === "/terms-and-conditions"
  ) {
    return { changefreq: "yearly", priority: "0.4" };
  }

  if (loc === "/faq" || loc === "/contact") {
    return { changefreq: "monthly", priority: "0.7" };
  }

  return { changefreq: "monthly", priority: "0.8" };
};

const STATIC_ROUTES = discoverRoutes().map((loc) => ({
  loc,
  ...getRouteMetadata(loc),
}));

const getDynamicBlogRoutes = async () => {
  const insightsFilePath = path.join(projectRoot, "src", "utils", "data", "Insights.js");

  if (!fs.existsSync(insightsFilePath)) {
    return [];
  }

  const insightsModule = await import(pathToFileURL(insightsFilePath).href);
  const insightData = Array.isArray(insightsModule.InsightData)
    ? insightsModule.InsightData
    : [];

  return insightData
    .map((item) => item?.slug || item?.legacyId || item?.id)
    .filter(Boolean)
    .map((identifier) => ({
      loc: `/blogdetail/${identifier}`,
      changefreq: "weekly",
      priority: "0.7",
    }));
};

const xmlEscape = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const routeToXml = (route) => {
  const absoluteUrl = `${SITE_URL}${route.loc}`;

  return [
    "  <url>",
    `    <loc>${xmlEscape(absoluteUrl)}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    `    <changefreq>${route.changefreq}</changefreq>`,
    `    <priority>${route.priority}</priority>`,
    "  </url>",
  ].join("\n");
};

const buildSitemap = async () => {
  const dynamicBlogRoutes = await getDynamicBlogRoutes();
  const allRoutes = [...STATIC_ROUTES, ...dynamicBlogRoutes].filter(
    (route, index, arr) =>
      arr.findIndex((candidate) => candidate.loc === route.loc) === index,
  );

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allRoutes.map(routeToXml),
    "</urlset>",
    "",
  ].join("\n");

  const robotsTxt = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Videos rendered off-screen as canvas texture sources, never as playable",
    "# content. Blocking them keeps Google's video crawler from reporting them",
    '# as unindexable ("No thumbnail URL provided"). Every user-visible',
    "# background video carries a poster instead and is left crawlable.",
    ...UNCRAWLABLE_VIDEOS.map((p) => `Disallow: ${p}`),
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");

  const outputPaths = [
    path.join(projectRoot, "public", "sitemap.xml"),
    path.join(projectRoot, "dist", "sitemap.xml"),
  ];

  for (const outputPath of outputPaths) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, sitemapXml, "utf8");
  }

  const robotsOutputPaths = [
    path.join(projectRoot, "public", "robots.txt"),
    path.join(projectRoot, "dist", "robots.txt"),
  ];

  for (const outputPath of robotsOutputPaths) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, robotsTxt, "utf8");
  }

  console.log(
    `Sitemap generated with ${allRoutes.length} URLs for ${SITE_URL} -> ${outputPaths.join(", ")}`,
  );
};

await buildSitemap();
