import type {
  BusinessData,
  BlogPost,
  Feature,
  Review,
} from "../landingTemplates/types/BusinessData";
import { normalizeContactFormFields } from "../api/formSubmissions";
import { buildFrontendTemplateBusinessData } from "./frontendTemplateSiteData";
import {
  buildHiddenElementsMap,
  buildHiddenContainersMap,
} from "../landingTemplates/utils/hiddenElements";
import { companyStudioAssets } from "../landingTemplates/assets/company/company-executive";
import { companyProAssets } from "../landingTemplates/assets/company/company-pro";
import { educationProAssets } from "../landingTemplates/assets/education/education-pro/index";
import { gardeningProAssets } from "../landingTemplates/assets/gardening/gardening-pro/index";
import { plumbingProAssets } from "../landingTemplates/assets/plumbing/plumbing-pro/index";
import { photoStudioProAssets } from "../landingTemplates/assets/portfolio/photo-studio-pro";
import { linkHubProAssets } from "../landingTemplates/assets/link-hub/link-hub-pro";
import { linkHubDarkProAssets } from "../landingTemplates/assets/link-hub/link-hub-dark-pro";
import { beautyLinkHubProAssets } from "../landingTemplates/assets/link-hub/beauty-link-hub-pro";

export type TemplateThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
  headingFont?: string;
  bodyFont?: string;
  paletteId?: string;
  fontPackId?: string;
};

type WebsiteLike = {
  id?: string | number;
  slug?: string | null;
  name?: string | null;
  businessName?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  themeSettings?: TemplateThemeSettings | null;
  metaDescription?: string | null;
  shortDescription?: string | null;
  logoUrl?: string | null;
  fullAddress?: string | null;
  tags?: string[] | null;
  templateSnapshot?: {
    templateId?: string | null;
    version?: number | null;
    themeSettings?: TemplateThemeSettings | null;
    pages?: unknown[] | null;
  } | null;
};

type RawTemplateBlock = {
  id?: string | number;
  blockType?: string;
  type?: string;
  content?: Record<string, unknown>;
  sortOrder?: number;
  isVisible?: boolean;
};

type RawTemplatePage = {
  id?: string | number;
  title?: string;
  path?: string;
  isHome?: boolean;
  sortOrder?: number;
  isPublished?: boolean;
  blocks?: RawTemplateBlock[];
};

export type TemplateEditorBlock = {
  id: string;
  blockType: string;
  content: Record<string, unknown>;
  sortOrder: number;
  isVisible: boolean;
  localOnly?: boolean;
};

export type TemplateEditorPage = {
  id: string;
  title: string;
  path: string;
  isHome: boolean;
  sortOrder: number;
  isPublished: boolean;
  localOnly?: boolean;
  blocks: TemplateEditorBlock[];
};

type TemplateSectionSeed = {
  key: string;
  label: string;
  blockType: string;
  buildContent: (data: BusinessData) => Record<string, unknown>;
  optional?: boolean;
};

type TemplatePageSeed = {
  key: string;
  title: string;
  path: string;
  isHome: boolean;
  sections: TemplateSectionSeed[];
};

const LOCAL_TEMPLATE_EDITOR_IDS = new Set([
  "blog",
  "blog-premium",
  "company",
  "company-premium",
  "company-executive",
  "company-pro",
  "education-pro",
  "gardening-pro",
  "plumbing-pro",
  "photo-studio-pro",
  "link-hub-pro",
  "link-hub-dark-pro",
  "beauty-link-hub-pro",
  "education",
  "gardening",
  "plumbing",
  "portfolio-agency",
  "portfolio-creative",
  "portfolio-photo-studio",
  "restaurant",
]);

const TEMPLATE_THEME_CONTENT_KEY = "__templateTheme";

const FALLBACK_SECTION_KEY_MAP: Record<string, Record<string, string>> = {
  "company-executive": {
    HERO: "overview",
    ABOUT: "about",
    TEXT: "about",
    FEATURES: "why-us",
    PROCESS: "process",
    CONTACT: "contact",
    NAVBAR: "navbar",
  },
};

const getBlockTypeKey = (
  block: TemplateEditorBlock | RawTemplateBlock | null | undefined,
): string => {
  if (!block) {
    return "";
  }

  const rawType = block.blockType || ("type" in block ? block.type : "") || "";
  const normalizedType =
    typeof rawType === "string" ? rawType.trim().toUpperCase() : "";

  // The blog sections (BLOG_HERO/BLOG_FEATURED/BLOG_GRID/BLOG_SHOWCASE) are not
  // in the backend block-type enum, so they persist as a BLOG_FEED carrier plus
  // a `content._subType` discriminator. This module reads persisted blocks
  // directly (it never runs the editor's normalizeLoadedBlock), so without this
  // a reloaded blog section collapses to "BLOG_FEED" — its section then no
  // longer matches its own inner block type and stops rendering after a save.
  if (normalizedType === "BLOG_FEED") {
    const subType = (block as { content?: { _subType?: unknown } })?.content
      ?._subType;
    if (typeof subType === "string" && subType.trim()) {
      return subType.trim().toUpperCase();
    }
  }

  return normalizedType;
};

const inferFrontendTemplateIdFromBlocks = (
  blocks: Array<TemplateEditorBlock | RawTemplateBlock>,
): string | null => {
  const heroBlock = blocks.find((block) => getBlockTypeKey(block) === "HERO");
  const heroStyle = heroBlock?.content?.style;

  if (
    typeof heroStyle === "string" &&
    heroStyle.trim().toLowerCase() === "executive"
  ) {
    return "company-executive";
  }

  // Recover company-executive when style was omitted but section markers exist.
  const sectionKeys = new Set(
    blocks
      .map((block) =>
        typeof block?.content?.editorSection === "string"
          ? block.content.editorSection.trim()
          : "",
      )
      .filter(Boolean),
  );
  if (
    sectionKeys.has("overview") &&
    sectionKeys.has("why-us") &&
    sectionKeys.has("process-details")
  ) {
    return "company-executive";
  }

  return null;
};

const getCompatibleSectionKey = (
  templateId: string,
  block: TemplateEditorBlock | RawTemplateBlock | null | undefined,
): string => {
  const explicitSectionKey = block?.content?.editorSection;
  if (typeof explicitSectionKey === "string" && explicitSectionKey.trim()) {
    return explicitSectionKey.trim();
  }

  const templateMap = FALLBACK_SECTION_KEY_MAP[templateId];
  if (!templateMap) {
    return "";
  }

  return templateMap[getBlockTypeKey(block)] || "";
};

const makeBlock = (
  id: string,
  blockType: string,
  content: Record<string, unknown>,
  sortOrder: number,
): TemplateEditorBlock => ({
  id,
  blockType,
  content,
  sortOrder,
  isVisible: true,
  localOnly: true,
});

const nonEmptyText = (...candidates: unknown[]): string => {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "";
};

const postsToFeatures = (posts: BlogPost[] = []) =>
  posts.slice(0, 6).map((post, index) => ({
    icon: post.category || `Article ${index + 1}`,
    title: post.title,
    description:
      nonEmptyText(post.description, post.title) || "Article overview",
  }));

const featuresToFeatureItems = (features: Feature[] = []) =>
  features.slice(0, 6).map((feature, index) => ({
    icon: feature.icon || `feature-${index + 1}`,
    title: feature.title,
    description:
      nonEmptyText(feature.description, feature.title) ||
      `Feature ${index + 1} details`,
  }));

const servicesToFeatureItems = (services: BusinessData["services"] = []) =>
  (services || []).slice(0, 6).map((service, index) => ({
    icon: `service-${index + 1}`,
    title: service?.name || `Service ${index + 1}`,
    description:
      nonEmptyText(service?.description, service?.price, service?.name) ||
      `Service ${index + 1} details`,
  }));

const productsToFeatureItems = (products: BusinessData["products"] = []) =>
  (products || []).slice(0, 6).map((product, index) => ({
    icon: `product-${index + 1}`,
    title: product?.name || `Product ${index + 1}`,
    description:
      nonEmptyText(
        product?.description,
        product?.price,
        product?.category,
        product?.badge,
        product?.name,
      ) || `Product ${index + 1} details`,
  }));

const statsToFeatureItems = (stats: BusinessData["stats"] = []) =>
  (stats || []).slice(0, 6).map((stat, index) => ({
    icon: `stat-${index + 1}`,
    title: stat?.label || `Metric ${index + 1}`,
    description:
      nonEmptyText(stat?.value, stat?.label) || `Metric ${index + 1}`,
  }));

const resolveFeatureItems = (data: BusinessData) => {
  const featureItems = featuresToFeatureItems(data.features || []);
  if (featureItems.length > 0) {
    return featureItems;
  }

  const serviceItems = servicesToFeatureItems(data.services || []);
  if (serviceItems.length > 0) {
    return serviceItems;
  }

  const productItems = productsToFeatureItems(data.products || []);
  if (productItems.length > 0) {
    return productItems;
  }

  const postItems = postsToFeatures(data.blogPosts || []);
  if (postItems.length > 0) {
    return postItems;
  }

  return statsToFeatureItems(data.stats || []);
};

const reviewsToTestimonials = (reviews: Review[] = []) =>
  reviews.slice(0, 3).map((review, index) => ({
    quote: review.text || review.comment || "",
    author: review.author || review.name || `Client ${index + 1}`,
    position: review.role || "",
  }));

const companyStatsToItems = (stats: BusinessData["stats"] = []) =>
  (stats || []).slice(0, 3).map((stat, index) => ({
    title: stat?.label || `Metric ${index + 1}`,
    description: stat?.value || "",
    icon: `metric-${index + 1}`,
  }));

const TEMPLATE_MEDIA_URL_FIELDS = new Set([
  "avatarUrl",
  "backgroundImage",
  "backgroundImageUrl",
  "backgroundVideo",
  "backgroundVideoUrl",
  "contactImage",
  "heroImage",
  "heroImageSecondary",
  "image",
  "imageUrl",
  "logo",
  "photo",
  "poster",
  "videoPoster",
  "videoUrl",
]);

const isExternalOrInlineUrl = (value: string) =>
  /^(https?:)?\/\//i.test(value) ||
  /^(data|blob):/i.test(value);

const isCssBackgroundValue = (value: string) =>
  /^(linear-gradient|radial-gradient|conic-gradient|url\()/i.test(value.trim());

const isLocalTemplateAssetUrl = (value: string) =>
  value.startsWith("/") ||
  value.startsWith("./") ||
  value.startsWith("../") ||
  /^src\//i.test(value) ||
  /\.(avif|gif|jpe?g|mov|mp4|png|svg|webm|webp)(\?.*)?$/i.test(value);

const toBackendMediaUrl = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (
    !trimmed ||
    isExternalOrInlineUrl(trimmed) ||
    isCssBackgroundValue(trimmed) ||
    !isLocalTemplateAssetUrl(trimmed)
  ) {
    return value;
  }

  if (typeof window === "undefined" || !window.location?.origin) {
    return value;
  }

  return new URL(trimmed, window.location.origin).toString();
};

const normalizeTemplateMediaUrls = (value: unknown, key?: string): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeTemplateMediaUrls(item));
  }

  if (!value || typeof value !== "object") {
    return TEMPLATE_MEDIA_URL_FIELDS.has(key || "") ? toBackendMediaUrl(value) : value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [
      entryKey,
      TEMPLATE_MEDIA_URL_FIELDS.has(entryKey)
        ? toBackendMediaUrl(entryValue)
        : normalizeTemplateMediaUrls(entryValue, entryKey),
    ]),
  );
};

const buildTemplateBlockContent = (
  section: TemplateSectionSeed,
  data: BusinessData,
): Record<string, unknown> =>
  normalizeTemplateMediaUrls({
    editorLabel: section.label,
    editorSection: section.key,
    ...section.buildContent(data),
  }) as Record<string, unknown>;

const seedPagesFromSchema = (
  templateId: string,
  data: BusinessData,
): TemplateEditorPage[] => {
  const schemaPages = TEMPLATE_PAGE_SCHEMAS[templateId] || [];

  return schemaPages.map((page, pageIndex) => ({
    id: `page-${pageIndex}`,
    title: page.title,
    path: page.path,
    isHome: page.isHome,
    sortOrder: pageIndex,
    isPublished: true,
    localOnly: true,
    blocks: page.sections.map((section, blockIndex) =>
      makeBlock(
        `${templateId}-${page.key}-${section.key}`,
        section.blockType,
        buildTemplateBlockContent(section, data),
        blockIndex,
      ),
    ),
  }));
};

const TEMPLATE_PAGE_SCHEMAS: Record<string, TemplatePageSeed[]> = {
  blog: [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "home",
          label: "Home",
          blockType: "HERO",
          buildContent: (data) => ({
            heading:
              data.blogPosts?.[0]?.title ||
              "Everything you need to know about VAT for your business",
            subheading:
              data.blogPosts?.[0]?.description ||
              data.tagline ||
              data.description ||
              "",
            ctaText: "Read article",
            ctaLink: "#blog-articles",
          }),
        },
        {
          key: "articles",
          label: "Articles",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Latest articles",
            features: postsToFeatures(data.blogPosts || []),
            staticPosts: data.blogPosts || [],
          }),
        },
        {
          key: "contact",
          label: "Subscribe",
          blockType: "CONTACT",
          buildContent: () => ({
            heading: "Subscribe for updates",
            description:
              "Add your email and receive editorial updates directly in your inbox.",
            buttonLabel: "Subscribe",
          }),
        },
      ],
    },
  ],
  "blog-premium": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "home",
          label: "Home",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.tagline || "Sustainable Future Insights",
            subheading: data.description || "",
            ctaText: "Learn more",
            ctaLink: "#blog-list",
          }),
        },
        {
          key: "about",
          label: "About",
          blockType: "TEXT",
          buildContent: (data) => ({
            title: "Have a question? We are here to answer.",
            body:
              data.description ||
              data.tagline ||
              "We share common trends and strategies for improving your operation.",
          }),
        },
        {
          key: "articles",
          label: "Blog",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Our Trending Article",
            features: postsToFeatures(data.blogPosts || []),
            staticPosts: data.blogPosts || [],
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Contact Us",
            description:
              data.contact.email ||
              data.contact.phone ||
              "Reach out for partnership questions or editorial collaborations.",
            buttonLabel: "Contact",
          }),
        },
      ],
    },
  ],
  company: [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "projects",
          label: "Projects",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.name,
            subheading: data.tagline || data.description || "",
            ctaText: "View Studio",
            ctaLink: "#studio",
          }),
        },
        {
          key: "studio",
          label: "Studio",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Studio",
            body: data.description || data.tagline || "",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Newsletter Sign Up",
            description:
              data.contact.email ||
              data.contact.phone ||
              data.contact.address ||
              "",
            buttonLabel: "Sign Up",
          }),
        },
      ],
    },
  ],
  "company-premium": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "about",
          label: "About",
          blockType: "HERO",
          buildContent: (data) => ({
            heading:
              data.tagline || "Beautiful presentation for modern brands.",
            subheading: data.description || "",
            ctaText: "Explore our work",
            ctaLink: "#services",
            eyebrow: "Premium company presentation",
          }),
        },
        {
          key: "work",
          label: "Work",
          blockType: "TEXT",
          buildContent: (data) => ({
            title: "Featured selections",
            body:
              data.description ||
              "A premium showcase for signature offerings and editorial presentation.",
          }),
        },
        {
          key: "gallery",
          label: "Gallery",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "Brand occasions",
            title:
              "Direction for launches, events, and polished company moments.",
            body: "Use this section for campaigns, seasonal messaging, private appointments, or company capabilities.",
          }),
        },
        {
          key: "services",
          label: "Services",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "What we do",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Let's shape something memorable.",
            description:
              data.contact.address ||
              data.contact.email ||
              data.contact.phone ||
              "Contact",
            buttonLabel: "Book a consultation",
          }),
        },
      ],
    },
  ],
  "company-executive": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "navbar",
          label: "Header",
          blockType: "NAVBAR",
          optional: true,
          buildContent: (data) => ({
            brandName: data.name || "Atelier North",
            contactPrimaryText: "Drop us a line.",
            navigationItems: [
              { label: "Overview", link: "#overview" },
              { label: "About", link: "#about" },
              { label: "Why Us", link: "#why-us" },
              { label: "Process", link: "#process" },
              { label: "Contact", link: "#contact" },
            ],
            navLabels: {
              overview: "Overview",
              about: "About",
              "why-us": "Why Us",
              process: "Process",
              contact: "Contact",
            },
          }),
        },
        {
          key: "overview",
          label: "Overview",
          blockType: "HERO",
          buildContent: (data) => ({
            style: "executive",
            heading:
              data.tagline || "Interior studio workplace projects",
            subheading: "",
            ctaText: "Explore services",
            ctaLink: "#about",
            secondaryCtaText: "Contact",
            eyebrow: "Trusted business partner",
            heroImage: companyStudioAssets.heroPortrait,
            image: companyStudioAssets.heroPortrait,
            // Persist hero title scale so public/created sites keep template size.
            headingStyle: {
              fontSize: { xs: "3rem", md: "6.7rem" },
              lineHeight: { xs: 0.94, md: 0.88 },
              letterSpacing: "-0.08em",
              fontWeight: 800,
            },
            socialProof: {
              label: "Trusted business partner",
              value: "100+ happy customers.",
              rating: 5,
              avatars: [
                {
                  image: companyStudioAssets.avatars[0],
                  alt: "Client 1",
                },
                {
                  image: companyStudioAssets.avatars[1],
                  alt: "Client 2",
                },
                {
                  image: companyStudioAssets.avatars[2],
                  alt: "Client 3",
                },
                {
                  image: companyStudioAssets.avatars[3],
                  alt: "Client 4",
                },
              ],
            },
          }),
        },
        {
          key: "about",
          label: "About",
          blockType: "TEXT",
          buildContent: (data) => ({
            eyebrow: "Get to know us",
            // Canonical editable field for CompanyStudioTemplate + TEXT blocks.
            heading:
              "Driving innovation and excellence for corporate success worldwide.",
            title:
              "Driving innovation and excellence for corporate success worldwide.",
            body:
              data.description ||
              "Built to showcase business services, executive credibility, and client confidence in a clearer and more professional way.",
            image: companyStudioAssets.strategy,
            headingStyle: {
              fontSize: { xs: "2.35rem", md: "4.1rem" },
              lineHeight: 0.96,
              letterSpacing: "-0.07em",
              fontWeight: 800,
            },
            detailGroups: [
              {
                title: "What we build",
                items: ["Clear systems", "Premium visuals", "Business growth"],
              },
              {
                title: "How we work",
                items: [
                  "Fast collaboration",
                  "Focused delivery",
                  "Global support",
                ],
              },
            ],
            progressTitle: "Business progress",
            progressStats: [
              { label: "Revenue", value: "82%" },
              { label: "Satisfaction", value: "90%" },
            ],
          }),
        },
        {
          key: "why-us",
          label: "Why Us",
          blockType: "FEATURES",
          buildContent: (data) => ({
            eyebrow: "Why choose us",
            heading: "Built for business trust, clarity, and conversion.",
            description: data.description || data.tagline || "",
            features: resolveFeatureItems(data).length
              ? resolveFeatureItems(data)
              : companyStatsToItems(data.stats),
          }),
        },
        {
          key: "process",
          label: "Process",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Our process",
            heading: "How it works.",
            subheading:
              "A simple executive flow built to move from strategy to launch with clarity.",
            ctaText: "Partner With Excellence",
            features: [
              {
                icon: "01",
                title: "Discovery & planning",
                description:
                  "We define the brand story, service positioning, and the sections that matter most for a professional company site.",
              },
              {
                icon: "02",
                title: "Structure & delivery",
                description:
                  "The design system, imagery, and motion are shaped into a clear website flow built for trust and executive presence.",
              },
              {
                icon: "03",
                title: "Review & support",
                description:
                  "The final experience is refined for readability, conversion, and easy reuse across different client brands.",
              },
            ],
          }),
        },
        {
          key: "process-details",
          label: "Process Details",
          blockType: "FEATURES",
          buildContent: () => ({
            splitContentCards: {
              eyebrow: "Team",
              heading: "Strong visuals for trust and leadership.",
              subItems: [{ label: "Leadership" }, { label: "Operations" }],
              darkCard: {
                heading: "Built to feel sharp, premium, and easy to scan.",
                body: "",
                footerLabel: "Executive team",
              },
              image: companyStudioAssets.team,
              imageStyle: {
                fit: "cover",
                height: "auto",
                borderRadius: 34,
                borderWidth: 0,
                borderColor: "#000000",
              },
            },
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            eyebrow: "Get in touch",
            heading: "Drop us a line.",
            description:
              data.contact.address ||
              data.contact.email ||
              data.contact.phone ||
              data.description ||
              "",
            buttonLabel: "Send message",
            primaryCtaText: "Contact Us",
            innerBlocks: [
              {
                type: "FOOTER",
                content: {
                  copyright: `© 2026 ${data.name || "Your company"}. Global business presence.`,
                },
              },
            ],
          }),
        },
      ],
    },
  ],
  "company-pro": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "navbar",
          label: "Header",
          blockType: "NAVBAR",
          optional: true,
          buildContent: (data) => ({
            brandName: data.name || "Alder & Co.",
            navigationItems: [
              { label: "About", link: "#about" },
              { label: "Services", link: "#services" },
              { label: "Process", link: "#process" },
              { label: "Contact", link: "#contact" },
            ],
            ctaText: "Start a project",
            ctaLink: "#contact",
          }),
        },
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            eyebrow: "Independent strategy and design practice",
            heading: data.tagline || "Clarity for companies in motion.",
            subheading:
              data.description ||
              "Strategy, identity, and delivery systems for leadership teams building their next chapter.",
            ctaText: "Book a working session",
            ctaLink: "#contact",
            heroImage: companyProAssets.hero,
            heroImageStyle: {
              fit: "cover",
              height: "auto",
              borderRadius: 0,
              borderWidth: 0,
              borderColor: "#102a2a",
            },
            socialProof: {
              label: "Client partnership",
              value: "Trusted by ambitious teams worldwide.",
              rating: 5,
              avatars: companyProAssets.avatars.map((image, index) => ({
                image,
                alt: `Client ${index + 1}`,
              })),
            },
          }),
        },
        {
          key: "stats",
          label: "Trust and statistics",
          blockType: "STATS",
          buildContent: () => ({
            heading: "Proof in the progress",
            stats: [
              { number: "12", suffix: "+", label: "Years of focused delivery" },
              { number: "94", suffix: "%", label: "Long-term client retention" },
              { number: "160", suffix: "+", label: "Programs launched" },
            ],
          }),
        },
        {
          key: "courses",
          label: "Featured courses",
          blockType: "FEATURES",
          buildContent: () => ({
            heading: "Explore featured courses.",
            features: [
              { icon: "Digital skills", title: "The complete beginner’s guide to content", description: "12 lessons · 5 students", image: educationProAssets.onlineClass },
              { icon: "Programming", title: "Getting started with PHP and WordPress", description: "18 lessons · 8 students", image: educationProAssets.groupStudy },
              { icon: "Creative learning", title: "Advanced Java programming with Eclipse", description: "12 lessons · 3 students", image: educationProAssets.scienceLab },
            ],
          }),
        },
        {
          key: "offer",
          label: "Course offer",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "Limited places available",
            heading: "50% off for your first course.",
            body: "Start learning with a focused program, expert support, and a community that keeps you moving.",
            image: educationProAssets.studentTutoring,
          }),
        },
        {
          key: "about",
          label: "About",
          blockType: "TEXT",
          buildContent: (data) => ({
            eyebrow: "A better operating partner",
            heading: "Capability that turns into momentum.",
            body:
              data.description ||
              "We work beside leadership teams to turn complex ambitions into clear systems, useful experiences, and measurable progress.",
            detailGroups: [
              {
                title: "Senior partnership",
                items: ["Direct access", "Clear ownership", "Fast decisions"],
              },
              {
                title: "Built to last",
                items: ["Reusable systems", "Measured outcomes", "Knowledge transfer"],
              },
            ],
          }),
        },
        {
          key: "showcase",
          label: "Leadership portrait",
          blockType: "IMAGE",
          buildContent: () => ({
            image: companyProAssets.about,
            alt: "Company Pro leadership team collaborating",
            caption: "Senior operators, designers, and strategists working as one accountable team.",
            imageStyle: {
              mediaType: "image",
              fit: "cover",
              height: "auto",
              borderRadius: 0,
              borderWidth: 0,
              borderColor: "#12100f",
            },
          }),
        },
        {
          key: "services",
          label: "Services",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "What we do",
            heading: "Expertise for meaningful change.",
            features: [
              { icon: "01", title: "Strategy systems", description: "Clear priorities, operating models, and measurable roadmaps." },
              { icon: "02", title: "Experience design", description: "Useful digital experiences that feel coherent at every touchpoint." },
              { icon: "03", title: "Delivery partnership", description: "Senior guidance and practical execution from direction to launch." },
            ],
          }),
        },
        {
          key: "process",
          label: "Process",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "How we work",
            heading: "A clear path from ambition to action.",
            features: [
              { icon: "01", title: "Frame the opportunity", description: "Align the team around the decision, outcome, and evidence that matter." },
              { icon: "02", title: "Build the system", description: "Turn direction into a focused operating and experience model." },
              { icon: "03", title: "Launch and learn", description: "Deliver, measure, and improve with clear ownership after launch." },
            ],
          }),
        },
        {
          key: "testimonials",
          label: "Testimonials",
          blockType: "TESTIMONIALS",
          buildContent: () => ({
            heading: "Trusted when the work matters.",
            testimonials: [
              { quote: "Alder turned a difficult transformation into a system we can keep using.", author: "Maya Chen", position: "Chief Operating Officer", photo: companyProAssets.avatars[0], rating: 5 },
              { quote: "Strategic and practical in equal measure. The result feels premium without being performative.", author: "Owen Brooks", position: "VP, Commercial Growth", photo: companyProAssets.avatars[1], rating: 5 },
            ],
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            eyebrow: "Let's build what is next",
            heading: "Ready to move with clarity?",
            description:
              data.contact.email ||
              "Tell us what you are building and where you need momentum.",
            email: data.contact.email || "hello@alderandco.com",
            phone: data.contact.phone || "(555) 280-1440",
            address: data.contact.address || "120 Market Street, New York, NY",
            buttonLabel: "Start a project",
            showForm: true,
          }),
        },
        {
          key: "footer",
          label: "Footer",
          blockType: "FOOTER",
          optional: true,
          buildContent: (data) => ({
            logoText: data.name || "Alder & Co.",
            copyright: `(c) 2026 ${data.name || "Alder & Co."}. All rights reserved.`,
            // Canonical, editable footer nav links (the Footer block editor's
            // "Footer Navigation Links" repeater). See PRD §9.5.
            links: [
              { label: "About", url: "#about" },
              { label: "Services", url: "#services" },
              { label: "Contact", url: "#contact" },
              { label: "LinkedIn", url: "#" },
            ],
          }),
        },
      ],
    },
  ],
  "education-pro": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "navbar",
          label: "Header",
          blockType: "NAVBAR",
          optional: true,
          buildContent: (data) => ({
            brandName: data.name || "EdCare",
            navigationItems: [
              { label: "Home", link: "/" },
              { label: "About", link: "/about" },
              { label: "Courses", link: "/courses" },
              { label: "Contact", link: "/contact" },
            ],
            ctaText: "Start Free Trial",
            ctaLink: "/courses",
          }),
        },
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            eyebrow: "#1 Platform for online learning",
            heading:
              data.tagline || "Start learning from the world's best sites.",
            subheading:
              data.description ||
              "A modern learning experience built around expert instructors, flexible courses, and a supportive student community.",
            ctaText: "Get Started Now",
            ctaLink: "/courses",
            image: educationProAssets.studentLearning,
            imageStyle: { fit: "cover", height: "auto" },
            items: [
              { value: "9.5K+", heading: "Enrolled Students" },
              { value: "15.5K+", heading: "Classes Completed" },
              { value: "7.6K+", heading: "Certified Members" },
            ],
          }),
        },
        {
          key: "categories",
          label: "Explore top categories",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Popular categories",
            heading: "Explore Top Categories",
            features: [
              {
                icon: "01",
                title: "Language Learning",
                description: "Live-taught fluency courses with native mentors.",
              },
              {
                icon: "02",
                title: "IT & Software",
                description: "Hands-on tracks covering modern dev tooling.",
              },
              {
                icon: "03",
                title: "Web Development",
                description: "Ship real projects across the full stack.",
              },
              {
                icon: "04",
                title: "Business Management",
                description: "Lead teams with practical strategy frameworks.",
              },
              {
                icon: "05",
                title: "Photography",
                description: "Master composition, light, and storytelling.",
              },
              {
                icon: "06",
                title: "Digital Marketing",
                description: "Grow audiences with data-driven campaigns.",
              },
            ],
          }),
        },
        {
          key: "intro",
          label: "About our academy",
          blockType: "TEXT",
          buildContent: (data) => ({
            eyebrow: "Why choose us",
            heading: "We Care About Your Life For Better Future",
            body:
              data.description ||
              "We combine expert instruction, practical projects, and close mentorship so every student can build lasting confidence and real skills.",
            image: educationProAssets.groupStudy,
            alt: "Students learning together",
            items: [
              { heading: "Instructor-led online classes" },
              { heading: "Flexible, self-paced access" },
              { heading: "Personalized learning progress" },
            ],
            ctaText: "Learn More",
            ctaLink: "/about",
          }),
        },
        {
          key: "courses",
          label: "Featured courses",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Top courses",
            heading: "Explore Featured Courses",
            features: [
              {
                icon: "Culinary",
                title: "The Complete Beginner's Guide to Cooking",
                description: "12 lessons · 5 students",
                image: educationProAssets.scienceLab,
              },
              {
                icon: "Programming",
                title: "Getting Started With PHP And MySQL",
                description: "18 lessons · 8 students",
                image: educationProAssets.onlineClass,
              },
              {
                icon: "Programming",
                title: "Advanced Java Programming With Eclipse",
                description: "12 lessons · 3 students",
                image: educationProAssets.groupStudy,
              },
            ],
          }),
        },
        {
          key: "promo",
          label: "Enrollment offer",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "Limited seats available",
            heading: "50% Off For Very First 50 Students & Members",
            body: "Join now with a focused learning program, dedicated mentor support, and a community that keeps you moving forward.",
            image: educationProAssets.studentTutoring,
            ctaText: "Enroll Now",
            ctaLink: "/courses",
          }),
        },
        {
          key: "instructors",
          label: "Expert instructors",
          blockType: "TEAM",
          buildContent: () => ({
            eyebrow: "Our mentors",
            heading: "Meet Our Expert Instructor",
            members: [
              {
                name: "Noah C. Logan",
                role: "Programming",
                photo: educationProAssets.instructorNora,
              },
              {
                name: "Scarlett Foster",
                role: "Marketing",
                photo: educationProAssets.instructorScarlet,
              },
              {
                name: "Chloe Smith",
                role: "Design",
                photo: educationProAssets.instructorChloe,
              },
              {
                name: "Madison Chloe",
                role: "Business",
                photo: educationProAssets.instructorMelanie,
              },
            ],
          }),
        },
        {
          key: "courseRequest",
          label: "Find your best course",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "Get started today",
            heading: "Find Your Best Course With Us",
            body:
              "Talk with an academic advisor to build a learning path suited to your goals and schedule.",
            image: educationProAssets.onlineClass,
            ctaText: "Get Started Now",
            ctaLink: "/courses",
          }),
        },
        {
          key: "testimonials",
          label: "Student feedback",
          blockType: "TESTIMONIALS",
          buildContent: () => ({
            eyebrow: "Testimonials",
            heading: "Feedback From Our Students",
            testimonials: [
              {
                quote:
                  "The instructors made every lesson feel practical. I finished the program with skills I actually use every day.",
                author: "Michael Thomas",
                role: "Web Development student",
                photo: educationProAssets.instructorNora,
                rating: 5,
              },
              {
                quote:
                  "Flexible scheduling and genuinely caring mentors. This is the most supportive learning community I've found.",
                author: "Mathew White",
                role: "Business Management student",
                photo: educationProAssets.instructorChloe,
                rating: 5,
              },
            ],
          }),
        },
        {
          key: "stats",
          label: "Outcomes",
          blockType: "STATS",
          buildContent: () => ({
            stats: [
              { number: "5,192", suffix: "+", label: "Registered Students" },
              { number: "15,485", suffix: "+", label: "Classes Completed" },
              { number: "97.55", suffix: "%", label: "Satisfaction Rate" },
              { number: "97.55", suffix: "%", label: "Course Completion" },
            ],
          }),
        },
        {
          key: "footer",
          label: "Footer",
          blockType: "FOOTER",
          optional: true,
          buildContent: (data) => ({
            logoText: data.name || "EdCare",
            heading: "Subscribe Our Newsletter For Latest Updates",
            ctaText: "Subscribe Now",
            ctaLink: "/contact",
            description:
              "Fusce varius, dolor tempor interdum tristique bibendum.",
            // Canonical, editable footer nav links (the Footer block editor's
            // "Footer Navigation Links" repeater). See PRD §9.5.
            links: [
              { label: "About Us", url: "/about" },
              { label: "All Courses", url: "/courses" },
              { label: "Contact", url: "/contact" },
            ],
            copyright: `© 2026 ${data.name || "EdCare"}. All Rights Reserved.`,
          }),
        },
      ],
    },
    {
      key: "about",
      title: "About",
      path: "/about",
      isHome: false,
      sections: [
        {
          key: "banner",
          label: "Page banner",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "Get to know EdCare",
            heading: "About Us",
            image: educationProAssets.studentTutoring,
            alt: "Students learning at EdCare",
          }),
        },
        {
          key: "intro",
          label: "Our story",
          blockType: "TEXT",
          buildContent: (data) => ({
            eyebrow: "Our Speciality",
            heading: "Over 10 Years in Distant Learning for Skill Development",
            body:
              data.description ||
              "EdCare brings together exceptional teaching, a culture of care, and creative learning spaces for people who want to grow with purpose.",
            image: educationProAssets.groupStudy,
            alt: "Students learning together at EdCare",
            items: [
              { value: "9.5K+", heading: "Students Enrolled" },
              { value: "6.7K+", heading: "Certified Members" },
            ],
            ctaText: "Start Free Trial",
            ctaLink: "/courses",
          }),
        },
        {
          key: "features",
          label: "Why choose us",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Our Features",
            heading: "Online Education That Improves You",
            features: [
              {
                icon: "01",
                title: "Instructor-led online classes",
                description: "Guided lessons taught live by subject experts.",
              },
              {
                icon: "02",
                title: "Every worthwhile access",
                description: "Learn on your schedule, from any device, anywhere.",
              },
              {
                icon: "03",
                title: "Personalized learning profile",
                description: "Progress tracking built around your own pace.",
              },
            ],
          }),
        },
        {
          key: "stats",
          label: "Community outcomes",
          blockType: "STATS",
          buildContent: () => ({
            stats: [
              { number: "3,192", suffix: "+", label: "Registered Students" },
              { number: "15,485", suffix: "+", label: "Classes Completed" },
              { number: "97.55", suffix: "%", label: "Satisfaction Rate" },
              { number: "97.55", suffix: "%", label: "Course Completion" },
            ],
          }),
        },
        {
          key: "members",
          label: "Expert instructors",
          blockType: "TEAM",
          buildContent: () => ({
            eyebrow: "Our Mentors",
            heading: "Meet Our Expert Instructor",
            members: [
              {
                name: "Noah C. Logan",
                role: "Programming",
                photo: educationProAssets.instructorNora,
              },
              {
                name: "Scarlett Foster",
                role: "Marketing",
                photo: educationProAssets.instructorScarlet,
              },
              {
                name: "Chloe Smith",
                role: "Design",
                photo: educationProAssets.instructorChloe,
              },
              {
                name: "Madison Chloe",
                role: "Business",
                photo: educationProAssets.instructorMelanie,
              },
            ],
          }),
        },
        {
          key: "showcase",
          label: "Leadership",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Our Journey",
            heading: "Founded by Industry Leaders With Large Scale Business",
            features: [
              {
                title: "Career Opportunities in EdCare",
                description:
                  "Join a collaborative education team shaping meaningful learning experiences.",
                image: educationProAssets.onlineClass,
              },
              {
                title: "Career Opportunities in EdCare",
                description:
                  "Build your career alongside mentors who put student outcomes first.",
                image: educationProAssets.studentTutoring,
              },
            ],
          }),
        },
      ],
    },
    {
      key: "courses",
      title: "Courses",
      path: "/courses",
      isHome: false,
      sections: [
        {
          key: "banner",
          label: "Page banner",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "Browse our catalog",
            heading: "All Courses",
            image: educationProAssets.studentLearning,
            alt: "Browse EdCare courses",
          }),
        },
        {
          key: "features",
          label: "Featured courses",
          blockType: "FEATURES",
          buildContent: () => ({
            heading: "Explore Our Learning Pathways",
            features: [
              {
                icon: "Culinary",
                title: "The Complete Beginner's Guide to Cooking",
                description: "15 lessons · 4 students",
                image: educationProAssets.scienceLab,
              },
              {
                icon: "Programming",
                title: "Getting Started With PHP And MySQL",
                description: "18 lessons · 11 students",
                image: educationProAssets.onlineClass,
              },
              {
                icon: "Programming",
                title: "Advanced Java Programming With Eclipse",
                description: "12 lessons · 3 students",
                image: educationProAssets.groupStudy,
              },
              {
                icon: "Programming",
                title: "The Complete Python Bootcamp From Zero",
                description: "16 lessons · 2 students",
                image: educationProAssets.studentTutoring,
              },
              {
                icon: "Culinary",
                title: "Practical Cooking Course for Students",
                description: "11 lessons · 2 students",
                image: educationProAssets.studentLearning,
              },
              {
                icon: "Culinary",
                title: "A Step-by-Step Course for Busy People",
                description: "12 lessons · 1 student",
                image: educationProAssets.scienceLab,
              },
            ],
          }),
        },
      ],
    },
    {
      key: "contact",
      title: "Contact",
      path: "/contact",
      isHome: false,
      sections: [
        {
          key: "banner",
          label: "Page banner",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "We'd love to hear from you",
            heading: "Contact",
            image: educationProAssets.groupStudy,
            alt: "Contact EdCare",
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            eyebrow: "Contact",
            heading: "Leave A Reply",
            description:
              "Fill up the form and message us about your amazing question.",
            email: data.contact.email || "hello@edcare.com",
            phone: data.contact.phone || "(165) 48596-5789",
            detailGroups: [
              {
                title: "Phone Number & Email",
                items: [
                  data.contact.phone || "(165) 48596-5789",
                  data.contact.email || "hello@edcare.com",
                ],
              },
              {
                title: "Our Office Address",
                items: [
                  data.contact.address ||
                    "2690 Hilton Street Victoria Road, New York, Canada",
                ],
              },
              {
                title: "Official Work Time",
                items: [
                  "Monday - Friday: 09:00 - 20:00",
                  "Sunday & Saturday: 10:30 - 22:00",
                ],
              },
            ],
            buttonLabel: "Submit Message",
            buttonLink: "/contact",
            // Persisted, editable contact fields — the canvas renders these
            // dynamically (see PRD §9.1.1), so editor and canvas stay in sync.
            formFields: [
              { _id: "full-name", label: "Your Name", placeholder: "Your Name", fieldType: "text", required: true, options: "" },
              { _id: "email", label: "Your Email", placeholder: "Your Email", fieldType: "email", required: true, options: "" },
              { _id: "subject", label: "Subject", placeholder: "Subject", fieldType: "text", required: false, options: "" },
              { _id: "message", label: "Message", placeholder: "Message", fieldType: "textarea", required: true, options: "" },
            ],
          }),
        },
      ],
    },
  ],
  "gardening-pro": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "navbar",
          label: "Header",
          blockType: "NAVBAR",
          optional: true,
          buildContent: (data) => ({
            brandName: data.name || "Greenth",
            navigationItems: [
              { label: "Home", link: "/" },
              { label: "About", link: "/about" },
              { label: "Services", link: "/services" },
              { label: "Contact", link: "/contact" },
            ],
            ctaText: "Request a Quote",
            ctaLink: "/contact",
          }),
        },
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            eyebrow: "Landscape studio · Est. 2012",
            heading: "Designing",
            headingAccent: "Landscapes",
            subheading:
              data.description ||
              "We design and care for outdoor spaces that feel settled from day one — layered planting, honest materials, and seasons that unfold beautifully.",
            ctaText: "Get Started",
            ctaLink: "/contact",
            image: gardeningProAssets.heroEstate,
            headingStyle: {
              fontSize: { xs: "2.8rem", sm: "3.6rem", md: "4.6rem" },
            },
            items: [
              { value: "850+", heading: "Gardens Designed" },
              { value: "12yr", heading: "Craft Experience" },
              { value: "98%", heading: "Client Retention" },
            ],
          }),
        },
        {
          key: "trust",
          label: "Trusted by",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Trusted by estates & studios",
            features: [
              { title: "Garden & Co", description: "Estate partner" },
              { title: "Verdant Homes", description: "Residential partner" },
              { title: "Estate Living", description: "Property partner" },
              { title: "Bloom Studio", description: "Design partner" },
              { title: "Root & Branch", description: "Horticulture partner" },
            ],
            image: gardeningProAssets.trustAvatar,
          }),
        },
        {
          key: "intro",
          label: "About us",
          blockType: "TEXT",
          buildContent: (data) => ({
            eyebrow: "About Us",
            heading: "A studio rooted in",
            headingAccent: "living landscapes",
            body:
              data.description ||
              "Greenth designs gardens that feel inevitable on site — quiet structure, seasonal colour, and outdoor rooms meant for everyday living.",
            ctaText: "Read More",
            ctaLink: "/about",
            image: gardeningProAssets.aboutMower,
            items: [
              {
                heading: "Hands in the soil",
                image: gardeningProAssets.plantingHands,
              },
            ],
          }),
        },
        {
          key: "stats",
          label: "Growing together",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "Growing Together",
            heading: "Growing",
            headingAccent: "Together",
            items: [
              { value: "850+", heading: "Gardens Designed" },
              { value: "12yr", heading: "Craft Experience" },
              { value: "98%", heading: "Client Retention" },
              { value: "40+", heading: "Landscape Artists" },
            ],
          }),
        },
        {
          key: "servicesList",
          label: "Services list",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "What we offer",
            heading: "Craft for every",
            headingAccent: "season",
            body: "From first sketch to seasonal pruning, every service is delivered by the same hands that designed your garden.",
            features: [
              {
                title: "Garden Design",
                description:
                  "Bespoke outdoor compositions shaped around light, soil, and the way you live.",
                image: gardeningProAssets.serviceList1,
              },
              {
                title: "Seasonal Care",
                description:
                  "Year-round maintenance that keeps every bed, lawn, and border quietly thriving.",
                image: gardeningProAssets.serviceList2,
              },
              {
                title: "Hardscape Build",
                description:
                  "Stone paths, terraces, and outdoor rooms built to feel inevitable and lasting.",
                image: gardeningProAssets.serviceList3,
              },
              {
                title: "Tree & Planting",
                description:
                  "Specimen trees and layered planting plans that grow more beautiful each season.",
                image: gardeningProAssets.serviceList4,
              },
            ],
            ctaText: "View All Services",
            ctaLink: "/services",
          }),
        },
        {
          key: "projects",
          label: "Featured projects",
          blockType: "FEATURES",
          buildContent: () => ({
            heading: "Featured",
            headingAccent: "Projects",
            features: [
              {
                title: "Hedgerow Estate",
                description: "Formal hedges · Private residence",
                image: gardeningProAssets.projectHedge,
              },
              {
                title: "Courtyard House",
                description: "Stone & softscape · Urban retreat",
                image: gardeningProAssets.projectHouse,
              },
              {
                title: "Sunset Terrace",
                description: "Evening garden · Entertaining",
                image: gardeningProAssets.projectSunset,
              },
            ],
          }),
        },
        {
          key: "success",
          label: "Success banner",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Plant once.",
            headingAccent: "Thrive for years.",
            body: "Our clients return season after season — not because gardens need fixing, but because great landscapes keep evolving with care.",
            image: gardeningProAssets.promoShears,
            ctaText: "Start a Conversation",
            ctaLink: "/contact",
          }),
        },
        {
          key: "features",
          label: "Features",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "The Greenth way",
            heading: "What sets our",
            headingAccent: "gardens apart",
            body: "Every project begins with the land, then grows through careful craft and seasonal attention.",
            image: gardeningProAssets.featuresPortrait,
            features: [
              {
                title: "Site-first planting plans rooted in soil science",
                description: "Planting plans shaped by soil, light, and climate.",
              },
              {
                title: "Quiet craftsmanship with lasting hardscape detail",
                description: "Stone and timber work built to age gracefully.",
              },
              {
                title: "Seasonal care programs that protect your investment",
                description: "Ongoing care that keeps every garden thriving.",
              },
              {
                title: "Transparent timelines from concept to first bloom",
                description: "Clear milestones from sketch to settled garden.",
              },
            ],
          }),
        },
        {
          key: "cta",
          label: "CTA banner",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Ready to begin",
            headingAccent: "your garden?",
            body: "Tell us about your site, your seasons, and how you want to live outdoors. We'll take it from there.",
            ctaText: "Request a Quote",
            ctaLink: "/contact",
            image: gardeningProAssets.ctaMower,
          }),
        },
        {
          key: "footer",
          label: "Footer",
          blockType: "FOOTER",
          optional: true,
          buildContent: (data) => ({
            logoText: data.name || "Greenth",
            heading: "Seasonal notes from the studio",
            headingAccent: "Subscribe",
            ctaText: "Subscribe",
            ctaLink: "/contact",
            description:
              "Quiet updates on planting seasons, studio projects, and care tips for living landscapes.",
            image: gardeningProAssets.footerPortrait,
            // Canonical, editable footer nav links (the Footer block editor's
            // "Footer Navigation Links" repeater). See PRD §9.5.
            links: [
              { label: "Home", url: "/" },
              { label: "About Us", url: "/about" },
              { label: "Services", url: "/services" },
              { label: "Contact", url: "/contact" },
              { label: "Book a Visit", url: "/contact" },
            ],
            copyright: `© 2026 ${data.name || "Greenth"}. All Rights Reserved.`,
          }),
        },
      ],
    },
    {
      key: "about",
      title: "About",
      path: "/about",
      isHome: false,
      sections: [
        {
          key: "banner",
          label: "About banner",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "About Greenth",
            heading: "A studio rooted in",
            headingAccent: "the land",
            image: gardeningProAssets.aboutHero,
          }),
        },
        {
          key: "vision",
          label: "Our vision",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "Our vision",
            heading: "Gardens that belong to",
            headingAccent: "their place",
            body: "We believe a great garden never shouts. It settles into the soil, frames the light, and becomes the quiet backdrop for every season of living outdoors.",
            items: [
              {
                image: gardeningProAssets.vision1,
                title: "Quiet structure",
              },
              {
                image: gardeningProAssets.vision2,
                title: "Seasonal colour",
              },
              {
                image: gardeningProAssets.vision3,
                title: "Lived-in outdoor rooms",
              },
            ],
          }),
        },
        {
          key: "stats",
          label: "About stats",
          blockType: "TEXT",
          buildContent: () => ({
            items: [
              { value: "850+", heading: "Projects completed" },
              { value: "40+", heading: "Team members" },
              { value: "12", heading: "Years of craft" },
              { value: "6", heading: "Regions served" },
            ],
          }),
        },
        {
          key: "founder",
          label: "Founder letter",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "A letter from our founder",
            heading: "We still start with",
            headingAccent: "a walk",
            body: "Every Greenth garden begins the same way — boots on soil, notebook in hand. We listen to the wind, the slope, the way morning light finds a wall. Design is what follows when the land has already spoken.",
            name: "Margaret Hale",
            role: "Founder & Creative Director",
            image: gardeningProAssets.founder,
          }),
        },
        {
          key: "values",
          label: "Values banner",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Craft. Patience.",
            headingAccent: "Belonging.",
            body: "These are the values we plant into every project — quiet enough to notice, strong enough to last.",
            image: gardeningProAssets.valuesGate,
          }),
        },
        {
          key: "members",
          label: "Team members",
          blockType: "TEAM",
          buildContent: () => ({
            eyebrow: "The people behind the planting",
            heading: "Meet the",
            headingAccent: "studio",
            members: [
              {
                name: "Elena Marsh",
                role: "Lead Landscape Designer",
                photo: gardeningProAssets.member1,
              },
              {
                name: "James Whitfield",
                role: "Horticulture Director",
                photo: gardeningProAssets.member2,
              },
              {
                name: "Sofia Reyes",
                role: "Hardscape Specialist",
                photo: gardeningProAssets.member3,
              },
            ],
          }),
        },
      ],
    },
    {
      key: "services",
      title: "Services",
      path: "/services",
      isHome: false,
      sections: [
        {
          key: "intro",
          label: "Services intro",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "What we cultivate",
            heading: "Services shaped for",
            headingAccent: "living landscapes",
            body: "From concept sketches to seasonal care, every Greenth service is delivered by the same studio that designs your garden.",
          }),
        },
        {
          key: "features",
          label: "Service cards",
          blockType: "FEATURES",
          buildContent: () => ({
            features: [
              {
                icon: "01",
                title: "Garden Design",
                description:
                  "Concept-to-planting plans that balance structure, bloom, and the way you move through the space.",
                image: gardeningProAssets.serviceSoil,
              },
              {
                icon: "02",
                title: "Landscape Lighting",
                description:
                  "Subtle evening light that reveals form, path, and canopy without overpowering the night.",
                image: gardeningProAssets.serviceLighting,
              },
              {
                icon: "03",
                title: "Ongoing Maintenance",
                description:
                  "Seasonal care programs — pruning, soil health, and lawn work that protect your investment.",
                image: gardeningProAssets.serviceMaintenance,
              },
              {
                icon: "04",
                title: "Hardscape Construction",
                description:
                  "Terraces, paths, and outdoor rooms built in stone and timber to feel inevitable on site.",
                image: gardeningProAssets.serviceHardscape,
              },
              {
                icon: "05",
                title: "Tree Care",
                description:
                  "Specimen selection, planting, and long-term canopy care for shade and structure.",
                image: gardeningProAssets.serviceTree,
              },
              {
                icon: "06",
                title: "Planting & Borders",
                description:
                  "Layered perennial and shrub compositions that evolve gracefully through every season.",
                image: gardeningProAssets.servicePlanting,
              },
            ],
          }),
        },
        {
          key: "cta",
          label: "Services CTA",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Let's plan your",
            headingAccent: "next season",
            body: "Share a few details about your site and we'll outline a thoughtful path from first visit to first bloom.",
            ctaText: "Request a Quote",
            ctaLink: "/contact",
            image: gardeningProAssets.servicesCta,
          }),
        },
      ],
    },
    {
      key: "contact",
      title: "Contact",
      path: "/contact",
      isHome: false,
      sections: [
        {
          key: "intro",
          label: "Contact intro",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "Get in touch",
            heading: "Let's talk about your",
            headingAccent: "garden",
            body: "Tell us about your property, your favourite seasons, and how you hope to live outdoors. We'll reply with thoughtful next steps.",
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Send a message",
            description:
              "Share a few details about your garden and we'll get back to you shortly.",
            email: data.contact.email || "hello@greenth.studio",
            phone: data.contact.phone || "+1 (555) 214-0890",
            address: data.contact.address || "184 Orchard Lane, Greenfield",
            items: [
              {
                heading: "Monday – Friday",
                description: "8:00 AM – 6:00 PM",
              },
              {
                heading: "Saturday",
                description: "9:00 AM – 2:00 PM",
              },
              {
                heading: "Sunday",
                description: "Closed",
              },
            ],
            buttonLabel: "Send Message",
            // Persisted, editable contact fields — the canvas renders these
            // dynamically (see PRD §9.1.1), so editor and canvas stay in sync.
            formFields: [
              { _id: "full-name", label: "Your Name", placeholder: "Your Name", fieldType: "text", required: true, options: "" },
              { _id: "email", label: "Your Email", placeholder: "Your Email", fieldType: "email", required: true, options: "" },
              { _id: "subject", label: "Subject", placeholder: "Subject", fieldType: "text", required: false, options: "" },
              { _id: "message", label: "Message", placeholder: "Message", fieldType: "textarea", required: true, options: "" },
            ],
          }),
        },
      ],
    },
  ],
  "plumbing-pro": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "navbar",
          label: "Header",
          blockType: "NAVBAR",
          optional: true,
          buildContent: (data) => ({
            brandName: data.name || "QuickFix",
            navigationItems: [
              { label: "Home", link: "/" },
              { label: "About", link: "/about" },
              { label: "Services", link: "/services" },
              { label: "Contact", link: "/contact" },
            ],
            ctaText: "Book A Plumber",
            ctaLink: "/contact",
          }),
        },
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            eyebrow: "24/7 Plumber Service",
            heading: "Your affordable plumbing service",
            subheading:
              data.description ||
              "High-quality, cost-effective plumbing for homes and businesses — licensed techs, fair pricing, same-day response.",
            ctaText: "+1 234 567 8910",
            phone: "+1 234 567 8910",
            ctaLink: "/contact",
            ctaSecondaryText: "Work with us",
            ctaSecondaryLink: "/contact",
            image: plumbingProAssets.hero,
            headingStyle: {
              fontSize: { xs: "2.4rem", sm: "3.2rem", md: "3.8rem" },
            },
          }),
        },
        {
          key: "trust",
          label: "Trust bar",
          blockType: "FEATURES",
          buildContent: () => ({
            heading: "325k+ Happy Customers in USA",
            quote: "I had great QuickFix team! Fast, friendly, and reliable.",
            image: plumbingProAssets.trustAvatar,
          }),
        },
        {
          key: "servicesList",
          label: "Services overview",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Services",
            heading: "We are expert in all plumber solution",
            body: "From emergency repairs to full installs, our licensed plumbers deliver clean workmanship every visit.",
            features: [
              {
                icon: "01",
                title: "Repair & Install",
                description:
                  "Leak fixes, fixture installs, and reliable part replacements.",
                image: plumbingProAssets.service1,
              },
              {
                icon: "02",
                title: "Commercial Plumbing",
                description:
                  "Scalable plumbing support for offices, retail, and facilities.",
                image: plumbingProAssets.service2,
              },
              {
                icon: "03",
                title: "Residential Boiler",
                description:
                  "Boiler inspection, repair, and efficient home heating support.",
                image: plumbingProAssets.service3,
              },
            ],
          }),
        },
        {
          key: "intro",
          label: "About teaser",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "About Us",
            heading: "Smart plumber solution for you 24/7 hours.",
            ctaText: "Read More",
            ctaLink: "/about",
            ctaSecondaryText: "Call Anytime",
            ctaSecondaryLink: "/contact",
            phone: "+1 234 567 8910",
            image: plumbingProAssets.aboutImage,
            features: [
              {
                title: "Fastest Repair Service",
                description:
                  "Same-day response for urgent leaks, clogs, and fixture failures.",
              },
              {
                title: "Licensed & Certified",
                description:
                  "Fully trained technicians you can trust in your home or business.",
              },
              {
                title: "24/7 Emergency Support",
                description:
                  "Round-the-clock help when plumbing emergencies strike.",
              },
            ],
          }),
        },
        {
          key: "whyChoose",
          label: "Why choose us",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Why Choose Us",
            heading: "Why choose our Services",
            body: "We combine expertise, reliability, and care to deliver the best experience every time.",
            image: plumbingProAssets.plumberService,
            features: [
              {
                icon: "team",
                title: "Insured Professionals",
                description:
                  "Our plumbers are trained experts who follow industry standards on every job.",
              },
              {
                icon: "pricing",
                title: "Transparent Pricing",
                description:
                  "We believe in honesty. Every service comes with upfront pricing before work begins.",
              },
            ],
            detailGroups: [
              {
                heading: "Work Backed by Customer Satisfaction",
                description:
                  "We ensure everything works perfectly and you're completely satisfied before we leave.",
              },
            ],
            ctaText: "Explore all our services",
            ctaLink: "/services",
          }),
        },
        {
          key: "members",
          label: "Team",
          blockType: "TEAM",
          buildContent: () => ({
            eyebrow: "Plumber Team",
            heading: "Our hard working members",
            members: [
              {
                name: "Sonu Maahi",
                role: "Plumber",
                photo: plumbingProAssets.member1,
              },
              {
                name: "Alex Rivera",
                role: "Chief Plumber",
                photo: plumbingProAssets.member2,
              },
              {
                name: "Jordan Lee",
                role: "Technician",
                photo: plumbingProAssets.member3,
              },
              {
                name: "Morgan Blake",
                role: "Installer",
                photo: plumbingProAssets.founder,
              },
            ],
          }),
        },
        {
          key: "promo",
          label: "Promo video",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Perfect solution for all plumbing service",
            ctaText: "Watch Video",
            ctaLink: "/contact",
            image: plumbingProAssets.promoImage,
            items: [
              { title: "Best Response" },
              { title: "Expert Team" },
              { title: "Satisfaction Guaranteed" },
            ],
          }),
        },
        {
          key: "testimonials",
          label: "Testimonials",
          blockType: "REVIEWS",
          buildContent: () => ({
            eyebrow: "Customer Says",
            heading: "315k+ Positive Reviews",
            testimonials: [
              {
                name: "Leslie Alexander",
                role: "Homeowner",
                quote:
                  "I had a great QuickFix team! Fast, friendly, and the leak was fixed the same day.",
                photo: plumbingProAssets.clientAlex,
              },
              {
                name: "Cameron West",
                role: "Business Owner",
                quote:
                  "Professional plumbers who explained every step. Highly recommend QuickFix.",
                photo: plumbingProAssets.clientJordan,
              },
            ],
          }),
        },
        {
          key: "contactStrip",
          label: "Contact strip",
          blockType: "CONTACT",
          buildContent: (data) => ({
            addressHeading: "Our Address",
            address:
              data.contact.address || "455 West Orchard Street, Light City, UK",
            contactHeading: "Contact Info",
            phone: data.contact.phone || "+1 234 567 8910",
            email: data.contact.email || "hello@quickfix.com",
            hoursHeading: "Opening Hours",
            hours: "Mon - Sat 8am - 10pm",
            image: plumbingProAssets.contactImage,
            items: [
              { value: "125k+", heading: "Completed Project" },
              { value: "324k+", heading: "Work Per Month" },
              { value: "250+", heading: "Expert Plumbers" },
            ],
          }),
        },
        {
          key: "footer",
          label: "Footer",
          blockType: "FOOTER",
          optional: true,
          buildContent: (data) => ({
            logoText: data.name || "QuickFix",
            description:
              "QuickFix provides reliable electrical and plumbing services for homes and businesses with licensed technicians on call.",
            linksHeading: "LINKS",
            infoHeading: "INFO",
            newsletterHeading: "NEWSLETTER",
            newsletterBody: "Sign up to get updates & news.",
            ctaText: "SUBSCRIBE NOW",
            address:
              data.contact.address || "455 West Orchard Street, Light City, UK",
            phone: data.contact.phone || "+1 (123) 005 763",
            email: data.contact.email || "hello@quickfix.com",
            links: [
              { label: "About Us", url: "/about" },
              { label: "Services", url: "/services" },
              { label: "Blog", url: "/blog" },
              { label: "Contact", url: "/contact" },
              { label: "License", url: "/" },
            ],
            copyright: `© ${new Date().getFullYear()} All Right Reserved by ${data.name || "QuickFix"}`,
            legalText: "Privacy Policy | Terms of Use",
          }),
        },
      ],
    },
    {
      key: "about",
      title: "About",
      path: "/about",
      isHome: false,
      sections: [
        {
          key: "banner",
          label: "About banner",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "About Us",
            body: "Professional, dependable, and affordable plumbing solutions for your home or business.",
          }),
        },
        {
          key: "valueCards",
          label: "Value cards",
          blockType: "FEATURES",
          buildContent: () => ({
            features: [
              {
                title: "Affordable Price",
                description:
                  "Transparent rates with no surprise fees on residential or commercial jobs.",
                image: plumbingProAssets.service1,
              },
              {
                title: "Expert Plumber",
                description:
                  "Licensed technicians trained for repairs, installs, and emergencies.",
                image: plumbingProAssets.service2,
              },
              {
                title: "Quality Improve",
                description:
                  "Durable parts and careful workmanship that last for years.",
                image: plumbingProAssets.service3,
              },
              {
                title: "100% Certified",
                description:
                  "Fully insured, bonded, and certified for peace of mind.",
                image: plumbingProAssets.service4,
              },
            ],
          }),
        },
        {
          key: "intro",
          label: "About intro",
          blockType: "TEXT",
          buildContent: () => ({
            eyebrow: "ABOUT US",
            heading: "Smart plumber solution for you 24/7 hours",
            body: "We combine modern tools with trusted craftsmanship to keep water flowing safely in homes and workplaces.",
            ctaText: "Learn More",
            ctaLink: "/services",
            badgeValue: "25+",
            badgeLabel: "Years Of Experience",
            image: plumbingProAssets.aboutImage,
            items: [
              { title: "Residential and Commercial Services" },
              { title: "Highly skilled and experienced plumbers" },
              { title: "Immediate 24/7 Emergency Service" },
            ],
          }),
        },
        {
          key: "members",
          label: "Team members",
          blockType: "TEAM",
          buildContent: () => ({
            eyebrow: "— TEAM MEMBER —",
            heading: "Our hard working members",
            members: [
              {
                name: "Sonu Maahi",
                role: "Plumber",
                photo: plumbingProAssets.member1,
              },
              {
                name: "Alex Rivera",
                role: "Chief Plumber",
                photo: plumbingProAssets.member2,
              },
              {
                name: "Jordan Lee",
                role: "Technician",
                photo: plumbingProAssets.member3,
              },
              {
                name: "Morgan Blake",
                role: "Installer",
                photo: plumbingProAssets.founder,
              },
            ],
          }),
        },
        {
          key: "stats",
          label: "About stats",
          blockType: "TEXT",
          buildContent: () => ({
            items: [
              { value: "324k", heading: "Satisfied Customer" },
              { value: "250+", heading: "Expert Plumbers" },
              { value: "125k", heading: "Successful Projects" },
              { value: "100%", heading: "Quality Service" },
            ],
          }),
        },
        {
          key: "why",
          label: "Why choose us",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "WHY CHOOSE US",
            heading: "We're experience of 24 years in plumbing service",
            ctaText: "(+1) 234 567 890",
            phone: "(+1) 234 567 890",
            ctaLink: "/contact",
            image: plumbingProAssets.whyImage,
            features: [
              {
                icon: "experience",
                title: "Experience Team",
                description:
                  "Seasoned plumbers who diagnose fast and fix it right the first time.",
              },
              {
                icon: "delivery",
                title: "On-time Delivery",
                description:
                  "Clear arrival windows and methodical work that respects your schedule.",
              },
            ],
          }),
        },
        {
          key: "testimonials",
          label: "Testimonials",
          blockType: "REVIEWS",
          buildContent: () => ({
            eyebrow: "CLIENT FEEDBACK",
            heading: "315k+ Positive Reviews",
            testimonials: [
              {
                name: "Leslie Alexander",
                role: "Homeowner",
                quote:
                  "QuickFix restored our kitchen plumbing overnight. Professional and courteous.",
                photo: plumbingProAssets.clientMorgan,
              },
              {
                name: "Cameron West",
                role: "Property Manager",
                quote:
                  "Reliable commercial support with clear pricing and excellent follow-through.",
                photo: plumbingProAssets.clientTaylor,
              },
            ],
          }),
        },
        {
          key: "cta",
          label: "CTA banner",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Looking for a reliable plumbing service?",
            ctaText: "GET A FREE QUOTE",
            phone: "+1 394 598 4958",
            ctaLink: "/contact",
          }),
        },
      ],
    },
    {
      key: "services",
      title: "Services",
      path: "/services",
      isHome: false,
      sections: [
        {
          key: "banner",
          label: "Services banner",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Our Services",
            body: "Reliable, trustworthy, and affordable plumbing solutions for your home or business",
          }),
        },
        {
          key: "why",
          label: "Why choose us",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "— WHY CHOOSE US",
            heading: "We're experience of 24 years in plumbing service",
            image: plumbingProAssets.servicesWhy,
            features: [
              {
                icon: "experience",
                title: "Experience Team",
                description:
                  "Our plumbers handle a wide range of residential and commercial tasks with care.",
              },
              {
                icon: "delivery",
                title: "On-time Delivery",
                description:
                  "Methodical scheduling and clear communication keep every project on track.",
              },
            ],
          }),
        },
        {
          key: "features",
          label: "Service cards",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "— SERVICES",
            heading: "We are expert in all plumber solution",
            features: [
              {
                title: "Repair & Install",
                description:
                  "Leak fixes, fixture installs, and reliable part replacements.",
                image: plumbingProAssets.service1,
              },
              {
                title: "Commercial Plumbing",
                description:
                  "Scalable plumbing support for offices, retail, and facilities.",
                image: plumbingProAssets.service2,
              },
              {
                title: "Residential Boiler",
                description:
                  "Boiler inspection, repair, and efficient home heating support.",
                image: plumbingProAssets.service3,
              },
              {
                title: "All Drain Cleaning",
                description:
                  "Powerful drain clearing that restores flow and prevents backups.",
                image: plumbingProAssets.service4,
              },
              {
                title: "Kitchen Plumbing",
                description:
                  "Sink, disposal, and supply-line work done cleanly and quickly.",
                image: plumbingProAssets.service5,
              },
              {
                title: "Bathroom Fitting",
                description:
                  "Faucet, shower, and bathroom fixture fitting with tidy finish work.",
                image: plumbingProAssets.service6,
              },
            ],
          }),
        },
        {
          key: "cta",
          label: "Services CTA",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Looking for a reliable plumbing service?",
            ctaText: "BOOK A FREE VISITING",
            phone: "+1 394 598 4958",
            ctaLink: "/contact",
          }),
        },
      ],
    },
    {
      key: "contact",
      title: "Contact",
      path: "/contact",
      isHome: false,
      sections: [
        {
          key: "banner",
          label: "Contact banner",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Contact Us",
            body: "Reliable, trustworthy, and affordable plumbing solutions for your home or business",
          }),
        },
        {
          key: "cards",
          label: "Contact cards",
          blockType: "FEATURES",
          buildContent: (data) => ({
            contactCards: [
              {
                title: "Office address",
                description:
                  data.contact.address || "Moonshine St. 14/05 Light City, UK",
                icon: "address",
              },
              {
                title: "Call us",
                description: data.contact.phone || "+1-394-598-4958",
                icon: "phone",
              },
              {
                title: "Send us email",
                description: data.contact.email || "hello@quickfix.com",
                icon: "email",
              },
            ],
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Send us a message",
            email: data.contact.email || "hello@quickfix.com",
            phone: data.contact.phone || "+1-394-598-4958",
            address:
              data.contact.address || "Moonshine St. 14/05 Light City, UK",
            buttonLabel: "SEND MESSAGE",
            formFields: [
              {
                _id: "full-name",
                label: "Full Name",
                placeholder: "Full Name",
                fieldType: "text",
                required: true,
                options: "",
              },
              {
                _id: "email",
                label: "Email address",
                placeholder: "Email address",
                fieldType: "email",
                required: true,
                options: "",
              },
              {
                _id: "subject",
                label: "Subject",
                placeholder: "Subject",
                fieldType: "text",
                required: false,
                options: "",
              },
              {
                _id: "message",
                label: "Message",
                placeholder: "Message",
                fieldType: "textarea",
                required: true,
                options: "",
              },
            ],
          }),
        },
        {
          key: "cta",
          label: "Contact CTA",
          blockType: "TEXT",
          buildContent: () => ({
            heading: "Looking for a reliable plumbing service?",
            ctaText: "BOOK A FREE VISITING",
            phone: "+1 394 598 4958",
            ctaLink: "/contact",
          }),
        },
      ],
    },
  ],
  education: [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: "A brighter learning journey starts here.",
            subheading: data.description || data.tagline || "",
            ctaText: "Explore Programs",
          }),
        },
        {
          key: "programs",
          label: "Programs",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Built for real academic momentum.",
            description: data.description || data.tagline || "",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "highlights",
          label: "Why Choose Us",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Support that feels personal, structured, and ambitious.",
            description: data.description || data.tagline || "",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "gallery",
          label: "Gallery",
          blockType: "GALLERY",
          buildContent: (data) => ({
            heading: "Learning spaces that feel active and inspiring.",
            items: (data.gallery ?? []).slice(0, 5).map((g) => ({
              url: g.url || "",
              caption: g.caption || "",
            })),
          }),
        },
        {
          key: "reviews",
          label: "Reviews",
          blockType: "REVIEWS",
          buildContent: (data) => ({
            heading: "Trusted by families who want more than tutoring.",
            items: (data.reviews ?? []).slice(0, 3).map((r) => ({
              rating: r.rating || 5,
              text: r.text || r.comment || "",
              author: r.author || r.name || "",
              date: r.date || "",
            })),
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Let’s find the right program for your learner.",
            description:
              data.contact.address ||
              data.contact.email ||
              data.contact.phone ||
              "",
          }),
        },
        {
          key: "campus",
          label: "Campus",
          blockType: "MAP_LOCATION",
          buildContent: (data) => ({
            heading: "Find us, visit us, and talk with our team.",
            description: data.contact.address || data.location?.address || "",
            campusName: data.name || "Our Campus",
            mapAddress: data.location?.address || data.contact.address || "",
          }),
        },
      ],
    },
  ],
  gardening: [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.tagline || data.name,
            subheading: data.description || "",
          }),
        },
        {
          key: "about",
          label: "About",
          blockType: "TEXT",
          buildContent: (data) => ({
            title: "Rooted in care, crafted for outdoor living.",
            body: data.description || data.tagline || "",
          }),
        },
        {
          key: "portfolio",
          label: "Portfolio",
          blockType: "GALLERY",
          buildContent: () => ({
            heading: "Selected garden transformations.",
          }),
        },
        {
          key: "services",
          label: "Services",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Services",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "testimonials",
          label: "Testimonials",
          blockType: "REVIEWS",
          buildContent: () => ({
            heading: "Client stories",
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Let’s talk about your space.",
            description:
              data.contact.address ||
              data.contact.email ||
              data.contact.phone ||
              "",
          }),
        },
      ],
    },
  ],
  restaurant: [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.tagline || data.name,
            subheading: data.description || "",
          }),
        },
        {
          key: "story",
          label: "Story",
          blockType: "TEXT",
          buildContent: (data) => ({
            title: "Our Story",
            body: data.description || data.tagline || "",
          }),
        },
        {
          key: "location",
          label: "Location",
          blockType: "MAP_LOCATION",
          buildContent: (data) => ({
            heading: "Find us tonight.",
            description: data.contact.address || data.location?.address || "",
          }),
        },
        {
          key: "why-us",
          label: "Why Us",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Why guests keep coming back.",
            description: data.description || data.tagline || "",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "reviews",
          label: "Reviews",
          blockType: "REVIEWS",
          buildContent: () => ({
            heading: "Guest reviews",
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Book your table.",
            description:
              data.contact.address ||
              data.contact.email ||
              data.contact.phone ||
              "",
          }),
        },
      ],
    },
  ],
  "plumbing": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.tagline || data.name,
            subheading: data.description || "",
            ctaText: "Book Now",
            ctaLink: "#contact",
          }),
        },
        {
          key: "about",
          label: "About",
          blockType: "TEXT",
          buildContent: (data) => ({
            title: "Reliable, licensed, and on call.",
            body: data.description || data.tagline || "",
          }),
        },
        {
          key: "services",
          label: "Services",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Our services.",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Need a plumber?",
            description:
              data.contact.phone ||
              data.contact.email ||
              data.contact.address ||
              "",
            buttonLabel: "Book a visit",
          }),
        },
      ],
    },
  ],
  "portfolio-agency": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.tagline || data.name,
            subheading: data.description || "",
            ctaText: "View Work",
            ctaLink: "#services",
          }),
        },
        {
          key: "services",
          label: "Services",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "What We Specialise In.",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "about",
          label: "About",
          blockType: "TEXT",
          buildContent: (data) => ({
            title: "A studio built for ambitious brands.",
            body: data.description || data.tagline || "",
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Let's build something together.",
            description:
              data.contact.email ||
              data.contact.phone ||
              data.contact.address ||
              "",
            buttonLabel: "Get in touch",
          }),
        },
      ],
    },
  ],
  "portfolio-creative": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.tagline || data.name,
            subheading: data.description || "",
            ctaText: "See My Work",
            ctaLink: "#portfolio",
          }),
        },
        {
          key: "portfolio",
          label: "Portfolio",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Selected Work.",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "services",
          label: "Services",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "What I Offer.",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Let's create something amazing.",
            description:
              data.contact.email || data.contact.phone || "",
            buttonLabel: "Say hello",
          }),
        },
      ],
    },
  ],
  "portfolio-photo-studio": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.tagline || data.name,
            subheading: data.description || "",
            ctaText: "View Portfolio",
            ctaLink: "#services",
          }),
        },
        {
          key: "services",
          label: "Services",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "What I Shoot.",
            features: resolveFeatureItems(data),
          }),
        },
        {
          key: "about",
          label: "About",
          blockType: "TEXT",
          buildContent: (data) => ({
            title: "Behind the lens.",
            body: data.description || data.tagline || "",
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Book a session.",
            description:
              data.contact.email || data.contact.phone || "",
            buttonLabel: "Enquire now",
          }),
        },
      ],
    },
  ],
  "photo-studio-pro": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "navbar",
          label: "Header",
          blockType: "NAVBAR",
          optional: true,
          buildContent: (data) => ({
            brandName: data.name || "TARGET",
            eyebrow: "Photographer",
            subheading: "Nigeria, Netherlands.",
            email: data.contact?.email || "hello@studio.com",
            phone: data.contact?.phone || "+234 123 456 7890",
            instagramLabel: "↗ Instagram",
            navigationItems: [
              { label: "Portfolio", link: "#works" },
              { label: "About me", link: "#about" },
              { label: "My shots", link: "#works" },
              { label: "Contact", link: "#contact" },
            ],
            ctaText: "Book a shoot",
            ctaLink: "#contact",
          }),
        },
        {
          key: "hero",
          label: "Hero",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: "Photographer",
            subheading:
              data.description ||
              "Capturing timeless moments that tell stories of emotion, beauty, and truth in every frame and every pose.",
            image: photoStudioProAssets.hero,
            heroImage: photoStudioProAssets.hero,
            secondaryImage: photoStudioProAssets.photoStudioHero,
            ctaText: "View works",
            ctaLink: "#works",
            ctaSecondaryText: "Recent Work",
          }),
        },
        {
          key: "intro",
          label: "Intro showcase",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Snapify Photography",
            heading: "Capturing",
            subheading: "The Moment",
            body: "Light, mood, and composition shaped into lasting frames.",
            image: photoStudioProAssets.creativeMakeup,
            features: [
              {
                title: "Editorial portrait",
                description: "Bold color and cinematic makeup storytelling.",
                image: photoStudioProAssets.creativeMakeup,
              },
              {
                title: "Fashion study",
                description: "High-contrast fashion frames with strong direction.",
                image: photoStudioProAssets.pinkHairPortrait,
              },
            ],
          }),
        },
        {
          key: "about",
          label: "About",
          blockType: "TEXT",
          buildContent: (data) => ({
            heading: "About",
            body:
              data.description ||
              "A photography practice focused on people, atmosphere, and clean editorial storytelling.",
            description:
              "From portraits to campaigns, every frame is shaped with intention, contrast, and a calm editorial rhythm.",
            image: photoStudioProAssets.portraitLifestyle,
            ctaText: "More about me",
            ctaLink: "#works",
            features: [
              {
                title: "Studio portrait",
                description: "Secondary about portrait.",
                image: photoStudioProAssets.portraitProfessional,
              },
            ],
          }),
        },
        {
          key: "works",
          label: "My Works",
          blockType: "FEATURES",
          buildContent: () => ({
            eyebrow: "Selected Portfolio",
            heading: "My Works",
            body: "A curated selection of portraits, editorial studies, and visual stories shaped through light, mood, and clean composition.",
            ctaText: "See all projects",
            ctaLink: "#contact",
            features: [
              {
                title: "Featured frame",
                description: "Signature editorial portrait for campaigns.",
                image: photoStudioProAssets.hero,
              },
              {
                title: "Editorial Figure",
                description: "Graphic color and sculpted silhouette work.",
                image: photoStudioProAssets.travelLandscape,
              },
              {
                title: "Soft Motion",
                description: "Natural light portraiture with quiet motion.",
                image: photoStudioProAssets.portraitNatural,
              },
              {
                title: "Golden Hour",
                description: "Warm lifestyle frames for story-led brands.",
                image: photoStudioProAssets.weddingEvening,
              },
              {
                title: "Studio Light",
                description: "Controlled studio looks with crisp finish.",
                image: photoStudioProAssets.fashionEditorial,
              },
            ],
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            eyebrow: "Let's Work Together",
            heading: "Start Your Next Shoot",
            description:
              "Share your concept, timeline, and the kind of visuals you want to create. We'll shape the right direction for the shoot.",
            buttonLabel: "Get in touch",
            email: data.contact?.email || "hello@studio.com",
            phone: data.contact?.phone || "+1 (555) 220 1188",
            address:
              data.contact?.address || "245 Mercer Street, New York, NY",
            formFields: [
              {
                _id: "full-name",
                label: "Full Name",
                placeholder: "Full Name",
                fieldType: "text",
                required: true,
                options: "",
              },
              {
                _id: "email",
                label: "Email Address",
                placeholder: "Email Address",
                fieldType: "email",
                required: true,
                options: "",
              },
              {
                _id: "message",
                label: "Message",
                placeholder: "Message",
                fieldType: "textarea",
                required: true,
                options: "",
              },
            ],
          }),
        },
        {
          key: "lens",
          label: "Lens gallery",
          blockType: "FEATURES",
          buildContent: () => ({
            heading: "See Through My Lens",
            features: [
              {
                title: "Travel frame",
                description: "Landscape storytelling from the road.",
                image: photoStudioProAssets.travelLandscape,
              },
              {
                title: "Wedding evening",
                description: "Quiet celebration moments after dark.",
                image: photoStudioProAssets.weddingEvening,
              },
              {
                title: "Natural portrait",
                description: "Soft daylight portraits with honest tone.",
                image: photoStudioProAssets.portraitNatural,
              },
              {
                title: "Fashion editorial",
                description: "Campaign-ready fashion imagery.",
                image: photoStudioProAssets.fashionEditorial,
              },
              {
                title: "Studio portrait",
                description: "Controlled lighting with editorial finish.",
                image: photoStudioProAssets.malePortrait,
              },
              {
                title: "Lifestyle",
                description: "Everyday scenes with cinematic polish.",
                image: photoStudioProAssets.portraitLifestyle,
              },
              {
                title: "Creative makeup",
                description: "Color-forward beauty storytelling.",
                image: photoStudioProAssets.creativeMakeup,
              },
              {
                title: "Pink hair study",
                description: "Bold fashion color and attitude.",
                image: photoStudioProAssets.pinkHairPortrait,
              },
              {
                title: "Wedding moment",
                description: "Intimate celebration frames.",
                image: photoStudioProAssets.weddingMoment,
              },
              {
                title: "Photo studio hero",
                description: "Signature studio atmosphere.",
                image: photoStudioProAssets.photoStudioHero,
              },
            ],
          }),
        },
        {
          key: "footer",
          label: "Footer",
          blockType: "FOOTER",
          optional: true,
          buildContent: (data) => ({
            heading: "Every Frame Tells a Story; Let's Tell Yours.",
            email: data.contact?.email || "hello@studio.com",
            body: `${data.contact?.phone || "+1 (555) 220 1188"}\n${
              data.contact?.address || "245 Mercer Street, New York, NY"
            }`,
          }),
        },
      ],
    },
  ],
  "link-hub-pro": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "navbar",
          label: "Header",
          blockType: "NAVBAR",
          optional: true,
          buildContent: (data) => ({
            brandName: data.name || "Alex Rivera",
            // Backend requires ≥1 NAVBAR navigationItems even for minimal/hidden chrome.
            navigationItems: [
              { label: "Links", link: "#links" },
              { label: "Products", link: "#products" },
              { label: "Contact", link: "#contact" },
            ],
          }),
        },
        {
          key: "profile",
          label: "Profile",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.name || "Alex Rivera",
            subheading: "@alexcreates",
            body:
              data.description ||
              "Creator, designer, and builder of calm digital products.",
            image: linkHubProAssets.avatar,
            heroImage: linkHubProAssets.background,
            sectionStyle: {
              backgroundImageUrl: linkHubProAssets.background,
              backgroundType: "image",
            },
          }),
        },
        {
          key: "socials",
          label: "Social links",
          blockType: "FEATURES",
          buildContent: (data) => ({
            editorBlockType: "LINK_HUB_SOCIALS",
            heading: "Social",
            features: [
              {
                title: "Instagram",
                description: "Instagram profile",
                icon: "lucide:instagram",
                link: data.socialLinks?.instagram || "https://instagram.com",
                type: "social",
                isVisible: true,
              },
              {
                title: "YouTube",
                description: "YouTube channel",
                icon: "lucide:youtube",
                link: "https://youtube.com",
                type: "social",
                isVisible: true,
              },
              {
                title: "Twitter",
                description: "X / Twitter profile",
                icon: "lucide:twitter",
                link: data.socialLinks?.twitter || "https://twitter.com",
                type: "social",
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "featured",
          label: "Featured link",
          blockType: "FEATURES",
          buildContent: () => ({
            editorBlockType: "LINK_HUB_FEATURED",
            heading: "Featured",
            features: [
              {
                title: "New drop — Studio Guide",
                description:
                  "A free guide to building a calm creative practice online.",
                image: linkHubProAssets.featured,
                link: "https://example.com/featured",
                type: "featured",
                isFeatured: true,
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "links",
          label: "Links",
          blockType: "FEATURES",
          buildContent: () => ({
            editorBlockType: "LINK_HUB_LINKS",
            heading: "Links",
            features: [
              {
                title: "Book a collab call",
                description: "15-minute intro for brand partnerships",
                image: linkHubProAssets.linkOne,
                link: "https://example.com/book",
                type: "link",
                isVisible: true,
              },
              {
                title: "Latest portfolio",
                description: "Selected work and case studies",
                image: linkHubProAssets.linkTwo,
                link: "https://example.com/portfolio",
                type: "link",
                isVisible: true,
              },
              {
                title: "Creator newsletter",
                description: "Weekly notes on craft and product",
                link: "https://example.com/newsletter",
                type: "link",
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "products",
          label: "Products",
          blockType: "FEATURES",
          buildContent: () => ({
            editorBlockType: "LINK_HUB_PRODUCTS",
            heading: "Products & services",
            features: [
              {
                title: "Brand kit template",
                description: "Notion + Figma starter for indie brands",
                image: linkHubProAssets.product,
                link: "https://example.com/brand-kit",
                type: "product",
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Stay in the loop",
            description:
              "Drop your email for drops, collabs, and new links.",
            buttonLabel: "Email me",
            ctaText: "Join list",
            email: data.contact?.email || "hello@alexcreates.com",
            formFields: [
              {
                _id: "email",
                label: "Email",
                placeholder: "you@email.com",
                fieldType: "email",
                required: true,
                options: "",
              },
            ],
          }),
        },
        {
          key: "footer",
          label: "Footer",
          blockType: "FOOTER",
          optional: true,
          buildContent: (data) => ({
            heading: data.name || "Alex Rivera",
            body: "Link Hub · Share your world in one place.",
          }),
        },
      ],
    },
  ],
  "link-hub-dark-pro": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "navbar",
          label: "Header",
          blockType: "NAVBAR",
          optional: true,
          buildContent: (data) => ({
            brandName: data.name || "Studio North",
            navigationItems: [
              { label: "Links", link: "#links" },
              { label: "Products", link: "#products" },
              { label: "Contact", link: "#contact" },
            ],
          }),
        },
        {
          key: "profile",
          label: "Profile",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.name || "Studio North",
            subheading: "@studionorth",
            body:
              data.description ||
              "Creator studio · products, drops, and collaborations.",
            image: linkHubDarkProAssets.avatar,
            heroImage: "",
            sectionStyle: {
              backgroundType: "color",
              backgroundColor: "#1a1614",
            },
            headingStyle: {},
            subheadingStyle: {},
            bodyStyle: {},
          }),
        },
        {
          key: "socials",
          label: "Social links",
          blockType: "FEATURES",
          buildContent: (data) => ({
            editorBlockType: "LINK_HUB_SOCIALS",
            heading: "Social",
            features: [
              {
                title: "Instagram",
                description: "Instagram profile",
                icon: "lucide:instagram",
                link: data.socialLinks?.instagram || "https://instagram.com",
                type: "social",
                isVisible: true,
              },
              {
                title: "TikTok",
                description: "TikTok profile",
                icon: "lucide:music-2",
                link: "https://tiktok.com",
                type: "social",
                isVisible: true,
              },
              {
                title: "Twitter",
                description: "X / Twitter profile",
                icon: "lucide:twitter",
                link: data.socialLinks?.twitter || "https://twitter.com",
                type: "social",
                isVisible: true,
              },
              {
                title: "YouTube",
                description: "YouTube channel",
                icon: "lucide:youtube",
                link: "https://youtube.com",
                type: "social",
                isVisible: true,
              },
              {
                title: "Facebook",
                description: "Facebook page",
                icon: "lucide:facebook",
                link: "https://facebook.com",
                type: "social",
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "featured",
          label: "Featured link",
          blockType: "FEATURES",
          buildContent: () => ({
            editorBlockType: "LINK_HUB_FEATURED",
            heading: "Featured",
            features: [
              {
                title: "Shop the new drop",
                description: "Limited release essentials for creators",
                image: linkHubDarkProAssets.featured,
                link: "https://example.com/shop",
                type: "featured",
                isFeatured: true,
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "links",
          label: "Links",
          blockType: "FEATURES",
          buildContent: () => ({
            editorBlockType: "LINK_HUB_LINKS",
            heading: "Links",
            features: [
              {
                title: "Flagship collection",
                description: "Explore the latest release",
                image: linkHubDarkProAssets.linkOne,
                link: "https://example.com/collection",
                type: "link",
                isVisible: true,
              },
              {
                title: "Watch the tour film",
                description: "Behind the scenes playlist",
                image: linkHubDarkProAssets.linkTwo,
                link: "https://example.com/film",
                type: "link",
                isVisible: true,
              },
              {
                title: "Brand partnerships",
                description: "Collab and booking inquiries",
                link: "https://example.com/partners",
                type: "link",
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "products",
          label: "Products",
          blockType: "FEATURES",
          buildContent: () => ({
            editorBlockType: "LINK_HUB_PRODUCTS",
            heading: "Products",
            features: [
              {
                title: "Signature energy",
                description: "Everyday performance essentials",
                image: linkHubDarkProAssets.product,
                link: "https://example.com/product",
                type: "product",
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Join the list",
            description: "Get drops and studio updates.",
            buttonLabel: "Join",
            ctaText: "Join",
            email: data.contact?.email || "hello@studionorth.com",
            formFields: [
              {
                _id: "email",
                label: "Email",
                placeholder: "you@email.com",
                fieldType: "email",
                required: true,
                options: "",
              },
            ],
          }),
        },
        {
          key: "footer",
          label: "Footer",
          blockType: "FOOTER",
          optional: true,
          buildContent: (data) => ({
            heading: data.name || "Studio North",
            body: "Link Hub · Dark Pro",
          }),
        },
      ],
    },
  ],
  "beauty-link-hub-pro": [
    {
      key: "home",
      title: "Home",
      path: "/",
      isHome: true,
      sections: [
        {
          key: "navbar",
          label: "Header",
          blockType: "NAVBAR",
          optional: true,
          buildContent: (data) => ({
            brandName: data.name || "Luna Belle",
            navigationItems: [
              { label: "Links", link: "#links" },
              { label: "Contact", link: "#contact" },
            ],
          }),
        },
        {
          key: "profile",
          label: "Profile",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.name || "Luna Belle",
            subheading: "Makeup | Skin | Entrepreneur",
            body: data.description || "",
            image: beautyLinkHubProAssets.avatar,
            heroImage: beautyLinkHubProAssets.background,
            sectionStyle: {
              backgroundType: "image",
              backgroundImageUrl: beautyLinkHubProAssets.background,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            },
            headingStyle: {},
            subheadingStyle: {},
            bodyStyle: {},
          }),
        },
        {
          key: "socials",
          label: "Social links",
          blockType: "FEATURES",
          buildContent: (data) => ({
            editorBlockType: "LINK_HUB_SOCIALS",
            heading: "Social",
            features: [
              {
                title: "TikTok",
                description: "TikTok profile",
                icon: "lucide:music-2",
                link: "https://tiktok.com",
                type: "social",
                isVisible: true,
              },
              {
                title: "YouTube",
                description: "YouTube channel",
                icon: "lucide:youtube",
                link: "https://youtube.com",
                type: "social",
                isVisible: true,
              },
              {
                title: "Twitter",
                description: "X / Twitter profile",
                icon: "lucide:twitter",
                link: data.socialLinks?.twitter || "https://twitter.com",
                type: "social",
                isVisible: true,
              },
              {
                title: "Instagram",
                description: "Instagram profile",
                icon: "lucide:instagram",
                link: data.socialLinks?.instagram || "https://instagram.com",
                type: "social",
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "featured",
          label: "Featured link",
          blockType: "FEATURES",
          buildContent: () => ({
            editorBlockType: "LINK_HUB_FEATURED",
            heading: "💄 Make Up Tutorials 💄",
            features: [
              {
                title: "Make Up Tutorials",
                description: "Soft glam looks and product guides",
                image: beautyLinkHubProAssets.featured,
                link: "https://example.com/tutorials",
                type: "featured",
                isFeatured: true,
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "links",
          label: "Links",
          blockType: "FEATURES",
          buildContent: () => ({
            editorBlockType: "LINK_HUB_LINKS",
            heading: "Links",
            features: [
              {
                title: "MUA",
                description: "Book makeup artistry",
                link: "https://example.com/mua",
                type: "link",
                isVisible: true,
              },
              {
                title: "Referral Codes",
                description: "Beauty brand referral links",
                link: "https://example.com/referrals",
                type: "link",
                isVisible: true,
              },
            ],
          }),
        },
        {
          key: "products",
          label: "Products",
          blockType: "FEATURES",
          buildContent: () => ({
            editorBlockType: "LINK_HUB_PRODUCTS",
            heading: "Favorites",
            features: [
              {
                title: "Skin essentials",
                description: "Daily beauty favorites",
                image: beautyLinkHubProAssets.product,
                link: "https://example.com/shop",
                type: "product",
                isVisible: false,
              },
            ],
          }),
        },
        {
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Stay in the glow",
            description: "New looks, launches, and studio updates.",
            buttonLabel: "Join",
            ctaText: "Join",
            email: data.contact?.email || "hello@lunabelle.studio",
            formFields: [
              {
                _id: "email",
                label: "Email",
                placeholder: "you@email.com",
                fieldType: "email",
                required: true,
                options: "",
              },
            ],
          }),
        },
        {
          key: "footer",
          label: "Footer",
          blockType: "FOOTER",
          optional: true,
          buildContent: (data) => ({
            heading: data.name || "Luna Belle",
            body: "Beauty Link Hub Pro",
          }),
        },
      ],
    },
  ],
};

const normalizePersistedPages = (
  pages: unknown[] | null | undefined,
): TemplateEditorPage[] => {
  if (!Array.isArray(pages)) {
    return [];
  }

  return pages.map((page, pageIndex) => {
    const typedPage = (page || {}) as RawTemplatePage;
    const rawBlocks = Array.isArray(typedPage.blocks) ? typedPage.blocks : [];

    return {
      id: String(typedPage.id ?? `page-${pageIndex}`),
      title: typedPage.title || `Page ${pageIndex + 1}`,
      path: typedPage.path || "/",
      isHome: !!typedPage.isHome,
      sortOrder: typedPage.sortOrder ?? pageIndex,
      isPublished: typedPage.isPublished ?? true,
      localOnly: false,
      blocks: rawBlocks.map((block, blockIndex) => {
        const typedBlock = (block || {}) as RawTemplateBlock;
        return {
          id: String(
            typedBlock.id ?? `${typedPage.id ?? pageIndex}-block-${blockIndex}`,
          ),
          blockType: typedBlock.blockType || typedBlock.type || "",
          content: normalizeAIFlatStyleFields(
            (typedBlock.content || {}) as Record<string, unknown>,
          ),
          sortOrder: typedBlock.sortOrder ?? blockIndex,
          isVisible: typedBlock.isVisible ?? true,
          localOnly: false,
        };
      }),
    };
  });
};

const STYLE_FIELD_MAP: Array<{
  styleKey: string;
  fields: Record<string, string>;
}> = [
  {
    styleKey: "headingStyle",
    fields: {
      headingColor: "color",
      headingTextColor: "color",
      headingFontSize: "fontSize",
      headingFontWeight: "fontWeight",
      headingTextShadow: "textShadow",
      headingShadow: "textShadow",
      headingBackgroundColor: "backgroundColor",
      headingBackground: "backgroundColor",
      headingTextAlign: "textAlign",
      headingAlign: "textAlign",
      headingAlignment: "textAlign",
    },
  },
  {
    styleKey: "titleStyle",
    fields: {
      titleColor: "color",
      titleTextColor: "color",
      titleFontSize: "fontSize",
      titleFontWeight: "fontWeight",
      titleTextShadow: "textShadow",
      titleShadow: "textShadow",
      titleBackgroundColor: "backgroundColor",
      titleTextAlign: "textAlign",
      titleAlign: "textAlign",
      titleAlignment: "textAlign",
    },
  },
  {
    styleKey: "descriptionStyle",
    fields: {
      descriptionColor: "color",
      descriptionTextColor: "color",
      descriptionFontSize: "fontSize",
      descriptionFontWeight: "fontWeight",
      descriptionTextShadow: "textShadow",
      descriptionShadow: "textShadow",
      descriptionBackgroundColor: "backgroundColor",
      descriptionTextAlign: "textAlign",
      descriptionAlign: "textAlign",
      descriptionAlignment: "textAlign",
    },
  },
  {
    styleKey: "textStyle",
    fields: {
      textColor: "color",
      textTextColor: "color",
      textFontSize: "fontSize",
      textFontWeight: "fontWeight",
      textShadow: "textShadow",
      textBackgroundColor: "backgroundColor",
      textTextAlign: "textAlign",
      textAlign: "textAlign",
      textAlignment: "textAlign",
    },
  },
  {
    styleKey: "buttonTextStyle",
    fields: {
      buttonTextColor: "color",
      buttonTextFontSize: "fontSize",
      buttonTextFontWeight: "fontWeight",
      buttonTextShadow: "textShadow",
      buttonTextBackgroundColor: "backgroundColor",
      buttonTextAlign: "textAlign",
    },
  },
  {
    styleKey: "ctaTextStyle",
    fields: {
      ctaTextColor: "color",
      ctaTextFontSize: "fontSize",
      ctaTextFontWeight: "fontWeight",
      ctaTextShadow: "textShadow",
      ctaTextBackgroundColor: "backgroundColor",
      ctaTextAlign: "textAlign",
    },
  },
];

/**
 * HERO schema uses preset tokens like "default" / "display" for
 * `headingFontSize`. Those must NOT be copied into `headingStyle.fontSize`,
 * or CSS receives `font-size: default` (invalid) and the title collapses to
 * body size after website creation.
 */
const NON_CSS_FONT_SIZE_TOKENS = new Set([
  "default",
  "large",
  "xl",
  "display",
  "custom",
  "small",
  "medium",
  "auto",
  "none",
  "inherit",
  "initial",
  "unset",
]);

const isCssFontSizeValue = (value: unknown): boolean => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return true;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value as Record<string, unknown>).some((entry) =>
      isCssFontSizeValue(entry),
    );
  }
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  if (!trimmed || NON_CSS_FONT_SIZE_TOKENS.has(trimmed.toLowerCase())) {
    return false;
  }
  return (
    /^-?[\d.]+(px|rem|em|%|vh|vw|ch|ex)$/i.test(trimmed) ||
    /^clamp\(/i.test(trimmed) ||
    /^calc\(/i.test(trimmed) ||
    /^var\(/i.test(trimmed)
  );
};

const sanitizeStyleFontSize = (
  style: Record<string, unknown>,
): Record<string, unknown> => {
  if (!("fontSize" in style) || isCssFontSizeValue(style.fontSize)) {
    return style;
  }
  const next = { ...style };
  delete next.fontSize;
  return next;
};

const normalizeAIFlatStyleFields = (
  content: Record<string, unknown>,
): Record<string, unknown> => {
  const normalized = { ...content };

  STYLE_FIELD_MAP.forEach(({ styleKey, fields }) => {
    const stylePatch = Object.entries(fields).reduce<Record<string, unknown>>(
      (patch, [flatField, styleField]) => {
        if (normalized[flatField] === undefined || normalized[flatField] === null) {
          return patch;
        }
        // Never promote HERO preset tokens (e.g. headingFontSize: "default")
        // into CSS style objects.
        if (styleField === "fontSize" && !isCssFontSizeValue(normalized[flatField])) {
          return patch;
        }
        patch[styleField] = normalized[flatField];
        return patch;
      },
      {},
    );

    const existingStyle =
      normalized[styleKey] &&
      typeof normalized[styleKey] === "object" &&
      !Array.isArray(normalized[styleKey])
        ? sanitizeStyleFontSize(
            normalized[styleKey] as Record<string, unknown>,
          )
        : {};

    if (!Object.keys(stylePatch).length && !Object.keys(existingStyle).length) {
      return;
    }

    if (!Object.keys(stylePatch).length) {
      if (
        normalized[styleKey] &&
        typeof normalized[styleKey] === "object" &&
        !Array.isArray(normalized[styleKey])
      ) {
        normalized[styleKey] = existingStyle;
      }
      return;
    }

    normalized[styleKey] = sanitizeStyleFontSize({
      ...stylePatch,
      ...existingStyle,
    });
  });

  // Scrub preset tokens already stored on style objects even when no flat
  // fields were present to trigger the merge above.
  STYLE_FIELD_MAP.forEach(({ styleKey }) => {
    if (
      normalized[styleKey] &&
      typeof normalized[styleKey] === "object" &&
      !Array.isArray(normalized[styleKey])
    ) {
      normalized[styleKey] = sanitizeStyleFontSize(
        normalized[styleKey] as Record<string, unknown>,
      );
    }
  });

  return normalized;
};

const getTemplateSectionKeys = (templateId: string, requiredOnly = false): string[] =>
  (TEMPLATE_PAGE_SCHEMAS[templateId] || []).flatMap((page) =>
    page.sections
      .filter((s) => !requiredOnly || !s.optional)
      .map((section) => section.key),
  );

const getPageStorageKey = (
  page: Pick<TemplateEditorPage, "isHome" | "path">,
) => (page.isHome ? "__home__" : page.path);

const getAllBlocks = (pages: TemplateEditorPage[]): TemplateEditorBlock[] =>
  pages.flatMap((page) => (Array.isArray(page.blocks) ? page.blocks : []));

const getOrderedBlocksForHomePage = (
  pages: TemplateEditorPage[],
): TemplateEditorBlock[] => {
  const homePage =
    pages.find((page) => page.isHome) ||
    pages.find((page) => page.path === "/") ||
    pages[0];

  const homeBlocks = Array.isArray(homePage?.blocks) ? homePage.blocks : [];

  return [...homeBlocks]
    .filter((block) => block?.isVisible !== false)
    .sort((left, right) => {
      const leftOrder =
        typeof left?.sortOrder === "number"
          ? left.sortOrder
          : Number.MAX_SAFE_INTEGER;
      const rightOrder =
        typeof right?.sortOrder === "number"
          ? right.sortOrder
          : Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    });
};

const getOrderedSectionKeysForHomePage = (
  templateId: string,
  pages: TemplateEditorPage[],
): string[] => {
  const sectionMap = getTemplateSectionMap(templateId, pages);
  const sectionKeyByBlockId = new Map(
    Array.from(sectionMap.entries()).map(([sectionKey, block]) => [
      String(block.id),
      sectionKey,
    ] as const),
  );
  const usedSectionKeys = new Set<string>();
  const sectionKeys = getOrderedBlocksForHomePage(pages).map((block, index) => {
    const mappedSectionKey = sectionKeyByBlockId.get(String(block.id)) || "";
    const explicitSectionKey =
      typeof block.content?.editorSection === "string"
        ? block.content.editorSection.trim()
        : "";
    const fallbackSectionKey = `block-${String(block.id ?? index + 1)}`;
    const preferredSectionKey =
      mappedSectionKey || explicitSectionKey || fallbackSectionKey;
    const sectionKey = usedSectionKeys.has(preferredSectionKey)
      ? fallbackSectionKey
      : preferredSectionKey;

    usedSectionKeys.add(sectionKey);
    return sectionKey;
  });

  // Older Company Executive sites do not have a persisted Process Details
  // block. The editor exposes that legacy section immediately after Process,
  // so keep the public renderer order identical instead of appending the
  // synthetic section after Contact.
  if (
    templateId === "company-executive" &&
    sectionKeys.includes("process") &&
    !sectionKeys.includes("process-details")
  ) {
    const processIndex = sectionKeys.indexOf("process");
    sectionKeys.splice(processIndex + 1, 0, "process-details");
  }

  return sectionKeys;
};

const getOrderedCustomSectionsForHomePage = (
  templateId: string,
  pages: TemplateEditorPage[],
) => {
  const schemaHomePage =
    (TEMPLATE_PAGE_SCHEMAS[templateId] || []).find((page) => page.isHome) ||
    (TEMPLATE_PAGE_SCHEMAS[templateId] || [])[0];
  const seededSectionKeys = new Set(
    (schemaHomePage?.sections || []).map((section) => section.key),
  );
  const sectionMap = getTemplateSectionMap(templateId, pages);
  const seededBlockIds = new Set(
    Array.from(seededSectionKeys)
      .map((sectionKey) => sectionMap.get(sectionKey)?.id)
      .filter((blockId) => blockId !== undefined)
      .map(String),
  );

  return getOrderedBlocksForHomePage(pages)
    .filter((block) => {
      const sectionKey =
        typeof block.content?.editorSection === "string"
          ? block.content.editorSection.trim()
          : "";
      const blockType = getBlockTypeKey(block);
      return (
        !seededBlockIds.has(String(block.id)) ||
        blockType === "PLAN" ||
        blockType === "SECTION" ||
        (sectionKey.startsWith("plan-") && !seededSectionKeys.has(sectionKey))
      );
    })
    .map((block, index) => {
      const content = block.content || {};
      const blockType = getBlockTypeKey(block);
      const explicitSectionKey =
        typeof content.editorSection === "string"
          ? content.editorSection.trim()
          : "";
      const sectionKey =
        explicitSectionKey && !seededSectionKeys.has(explicitSectionKey)
          ? explicitSectionKey
          : `block-${String(block.id ?? index + 1)}`;

      const rawInnerBlocks = Array.isArray(content.innerBlocks)
        ? content.innerBlocks
        : [];
      // Overlay live-edited outer Contact fields onto the first inner block so
      // the canvas never renders a stale inner mirror. See
      // overlayContactInnerBlocks — outer always wins for contact widgets.
      const innerBlocks = rawInnerBlocks.length
        ? overlayContactInnerBlocks(content, rawInnerBlocks)
        : [
            {
              id: block.id,
              type: blockType,
              content,
            },
          ];

      return {
        ...content,
        blockId: block.id,
        sectionKey,
        editorBlockType: blockType,
        label: readString(
          content,
          ["editorLabel", "heading"],
          blockType || "Plan Section",
        ),
        heading: readString(content, ["heading", "title"], "Plan your section"),
        subheading: readString(
          content,
          ["subheading", "description", "body"],
          "Use the controls in the editor to shape this section.",
        ),
        buttonText: readString(
          content,
          ["buttonText", "ctaText", "buttonLabel"],
          "",
        ),
        buttonUrl: readString(content, ["buttonUrl", "ctaLink"], "#contact"),
        headingStyle: content.headingStyle,
        subheadingStyle:
          content.subheadingStyle ||
          content.descriptionStyle ||
          content.bodyStyle,
        buttonTextStyle: content.buttonTextStyle || content.ctaTextStyle,
        beforeImage: typeof content.beforeImage === "string" ? content.beforeImage : undefined,
        afterImage: typeof content.afterImage === "string" ? content.afterImage : undefined,
        beforeLabel: typeof content.beforeLabel === "string" ? content.beforeLabel : undefined,
        afterLabel: typeof content.afterLabel === "string" ? content.afterLabel : undefined,
        innerBlocks,
        sectionStyle: getSectionStyleValue(content),
        outerSectionStyle: getSectionStyleValue(content, "outerSectionStyle"),
      };
    });
};

const getOrderedSectionContentMap = (
  templateId: string,
  pages: TemplateEditorPage[],
): Map<string, Record<string, unknown>> => {
  const orderedContentMap = new Map<string, Record<string, unknown>>();
  const sectionMap = getTemplateSectionMap(templateId, pages);

  sectionMap.forEach((block, sectionKey) => {
    if (block.content && typeof block.content === "object") {
      orderedContentMap.set(sectionKey, block.content);
    }
  });

  return orderedContentMap;
};

const getTemplateSectionMap = (
  templateId: string,
  pages: TemplateEditorPage[],
) => {
  const map = new Map<string, TemplateEditorBlock>();
  const orderedBlocks = getOrderedBlocksForHomePage(pages);
  const schemaHomePage =
    (TEMPLATE_PAGE_SCHEMAS[templateId] || []).find((page) => page.isHome) ||
    (TEMPLATE_PAGE_SCHEMAS[templateId] || [])[0];
  const seededSections = Array.isArray(schemaHomePage?.sections)
    ? schemaHomePage.sections
    : [];
  const usedBlockIndexes = new Set<number>();

  orderedBlocks.forEach((block, index) => {
    const sectionKey =
      typeof block.content?.editorSection === "string"
        ? block.content.editorSection.trim()
        : getCompatibleSectionKey(templateId, block);

    if (sectionKey && !map.has(sectionKey)) {
      map.set(sectionKey, block);
      usedBlockIndexes.add(index);
    }
  });

  seededSections.forEach((section) => {
    if (map.has(section.key)) {
      return;
    }

    const fallbackIndex = orderedBlocks.findIndex((block, index) => {
      if (usedBlockIndexes.has(index)) {
        return false;
      }

      const persistedBlockType = String(
        block?.content?.editorBlockType || block?.blockType || "",
      )
        .trim()
        .toUpperCase();

      return persistedBlockType === String(section.blockType || "").toUpperCase();
    });

    if (fallbackIndex >= 0) {
      map.set(section.key, orderedBlocks[fallbackIndex]);
      usedBlockIndexes.add(fallbackIndex);
    }
  });

  return map;
};

/** Required nested keys that must survive AI/persisted shallow merges. */
const REQUIRED_NESTED_ARRAY_FIELDS: Record<string, string[]> = {
  features: ["title", "description"],
  members: ["name", "role"],
};

const mergeNestedArrayItemsPreservingRequired = (
  seededItems: unknown,
  persistedItems: unknown,
  requiredKeys: string[],
): unknown => {
  if (!Array.isArray(persistedItems)) {
    return seededItems;
  }
  if (!Array.isArray(seededItems)) {
    return persistedItems;
  }

  return persistedItems.map((item, index) => {
    const seededItem =
      seededItems[index] &&
      typeof seededItems[index] === "object" &&
      !Array.isArray(seededItems[index])
        ? (seededItems[index] as Record<string, unknown>)
        : {};
    const persistedItem =
      item && typeof item === "object" && !Array.isArray(item)
        ? (item as Record<string, unknown>)
        : {};
    const merged: Record<string, unknown> = {
      ...seededItem,
      ...persistedItem,
    };

    requiredKeys.forEach((key) => {
      const current = merged[key];
      if (typeof current === "string" && current.trim()) {
        return;
      }
      const fallback = seededItem[key];
      if (typeof fallback === "string" && fallback.trim()) {
        merged[key] = fallback;
        return;
      }
      if (key === "description") {
        merged[key] =
          nonEmptyText(merged.title, `Item ${index + 1} details`) ||
          `Item ${index + 1} details`;
        return;
      }
      if (key === "title" || key === "name" || key === "role") {
        merged[key] = `${key === "role" ? "Team member" : "Item"} ${index + 1}`;
      }
    });

    return merged;
  });
};

const mergeTemplateBlockContent = (
  seededContent: Record<string, unknown>,
  persistedContent: Record<string, unknown>,
): Record<string, unknown> => {
  const normalizedPersistedContent = normalizeAIFlatStyleFields(persistedContent);
  const persistedTheme =
    normalizedPersistedContent?.[TEMPLATE_THEME_CONTENT_KEY];

  const merged: Record<string, unknown> = {
    ...seededContent,
    ...normalizedPersistedContent,
  };

  // Deep-merge style objects so scrubbing an invalid persisted fontSize
  // (e.g. HERO token "default") does not wipe seeded template sizes.
  STYLE_FIELD_MAP.forEach(({ styleKey }) => {
    const seededStyle = seededContent[styleKey];
    const persistedStyle = normalizedPersistedContent[styleKey];
    const hasSeeded =
      seededStyle &&
      typeof seededStyle === "object" &&
      !Array.isArray(seededStyle);
    const hasPersisted =
      persistedStyle &&
      typeof persistedStyle === "object" &&
      !Array.isArray(persistedStyle);

    if (!hasSeeded && !hasPersisted) {
      return;
    }

    const nextStyle = sanitizeStyleFontSize({
      ...(hasSeeded ? (seededStyle as Record<string, unknown>) : {}),
      ...(hasPersisted ? (persistedStyle as Record<string, unknown>) : {}),
    });

    if (
      !isCssFontSizeValue(nextStyle.fontSize) &&
      hasSeeded &&
      isCssFontSizeValue(
        (seededStyle as Record<string, unknown>).fontSize,
      )
    ) {
      nextStyle.fontSize = (seededStyle as Record<string, unknown>).fontSize;
    }

    merged[styleKey] = nextStyle;
  });

  // Prefer seeded copy when persisted text was cleared / never written.
  // Prevents blank hero/about after creation when backend omits seed fields.
  const PREFER_SEEDED_TEXT_KEYS = [
    "heading",
    "title",
    "subheading",
    "body",
    "description",
    "eyebrow",
    "ctaText",
    "brandName",
    "buttonLabel",
    "primaryCtaText",
    "secondaryCtaText",
  ];
  PREFER_SEEDED_TEXT_KEYS.forEach((key) => {
    const seededValue = seededContent[key];
    const persistedValue = normalizedPersistedContent[key];
    const persistedText =
      typeof persistedValue === "string" ? persistedValue.trim() : "";
    const persistedMissing =
      !(key in normalizedPersistedContent) ||
      persistedValue === null ||
      persistedValue === undefined ||
      !persistedText;
    const persistedIsGenericPlaceholder =
      typeof persistedValue === "string" &&
      /^(section title|section heading|my brand|untitled|heading)$/i.test(
        persistedText,
      );
    if (
      (persistedMissing || persistedIsGenericPlaceholder) &&
      typeof seededValue === "string" &&
      seededValue.trim()
    ) {
      merged[key] = seededValue;
    }
  });

  if (
    (!merged.heading ||
      (typeof merged.heading === "string" && !String(merged.heading).trim())) &&
    typeof seededContent.title === "string" &&
    seededContent.title.trim()
  ) {
    merged.heading = seededContent.title;
  }

  if (
    persistedTheme &&
    typeof persistedTheme === "object" &&
    !Array.isArray(persistedTheme)
  ) {
    merged[TEMPLATE_THEME_CONTENT_KEY] = {
      ...(seededContent[TEMPLATE_THEME_CONTENT_KEY] as
        | Record<string, unknown>
        | undefined),
      ...(persistedTheme as Record<string, unknown>),
    };
  }

  Object.entries(REQUIRED_NESTED_ARRAY_FIELDS).forEach(
    ([arrayKey, requiredKeys]) => {
      if (
        arrayKey in normalizedPersistedContent ||
        arrayKey in seededContent
      ) {
        merged[arrayKey] = mergeNestedArrayItemsPreservingRequired(
          seededContent[arrayKey],
          merged[arrayKey],
          requiredKeys,
        );
      }
    },
  );

  return merged;
};

// Build a section map (sectionKey -> persisted block) scoped to a SINGLE page.
// Multi-page templates reuse section keys across pages (e.g. About, Courses, and
// Contact each own a `banner`; Home and About both own `intro`/`stats`). A
// global/home-only section map therefore bleeds one page's saved content onto
// another page or drops it entirely, so hydration must always be page-scoped.
const buildPersistedSectionMapForPage = (
  templateId: string,
  persistedPage: TemplateEditorPage | undefined,
  schemaPage: TemplatePageSeed | undefined,
): Map<string, TemplateEditorBlock> => {
  const map = new Map<string, TemplateEditorBlock>();
  if (!persistedPage) {
    return map;
  }

  const orderedBlocks = [...(persistedPage.blocks || [])]
    .filter((block) => block?.isVisible !== false)
    .sort((left, right) => {
      const leftOrder =
        typeof left?.sortOrder === "number"
          ? left.sortOrder
          : Number.MAX_SAFE_INTEGER;
      const rightOrder =
        typeof right?.sortOrder === "number"
          ? right.sortOrder
          : Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    });
  const usedBlockIndexes = new Set<number>();

  orderedBlocks.forEach((block, index) => {
    const sectionKey =
      typeof block.content?.editorSection === "string"
        ? block.content.editorSection.trim()
        : getCompatibleSectionKey(templateId, block);
    if (sectionKey && !map.has(sectionKey)) {
      map.set(sectionKey, block);
      usedBlockIndexes.add(index);
    }
  });

  // Legacy blocks that predate editorSection markers are matched by block type
  // against this page's own schema sections (never another page's).
  const seededSections = Array.isArray(schemaPage?.sections)
    ? schemaPage.sections
    : [];
  seededSections.forEach((section) => {
    if (map.has(section.key)) {
      return;
    }
    const fallbackIndex = orderedBlocks.findIndex((block, index) => {
      if (usedBlockIndexes.has(index)) {
        return false;
      }
      const persistedBlockType = String(
        block?.content?.editorBlockType || block?.blockType || "",
      )
        .trim()
        .toUpperCase();
      return persistedBlockType === String(section.blockType || "").toUpperCase();
    });
    if (fallbackIndex >= 0) {
      map.set(section.key, orderedBlocks[fallbackIndex]);
      usedBlockIndexes.add(fallbackIndex);
    }
  });

  return map;
};

const hydrateSeededPages = (
  templateId: string,
  seededPages: TemplateEditorPage[],
  persistedPages: TemplateEditorPage[],
): TemplateEditorPage[] => {
  if (!persistedPages.length) {
    return seededPages;
  }

  const persistedPageMap = new Map(
    persistedPages.map((page) => [getPageStorageKey(page), page]),
  );
  const templateSectionKeys = new Set(getTemplateSectionKeys(templateId));
  const schemaPages = TEMPLATE_PAGE_SCHEMAS[templateId] || [];

  return seededPages.map((page) => {
    const pageKey = getPageStorageKey(page);
    const persistedPage = persistedPageMap.get(pageKey);
    const schemaPage =
      schemaPages.find((candidate) =>
        page.isHome ? candidate.isHome : candidate.path === page.path,
      ) || (page.isHome ? schemaPages.find((c) => c.isHome) : undefined);

    // Section map scoped to THIS page's persisted blocks only. This prevents
    // cross-page content bleed and guarantees each page hydrates from its own
    // saved blocks instead of Home's.
    const persistedSections = buildPersistedSectionMapForPage(
      templateId,
      persistedPage,
      schemaPage,
    );
    // Only blocks claimed by one of the template's OWN seeded sections count as
    // "used" (they are re-hydrated into the seeded block below, so keeping them
    // here too would render them twice). Blocks mapped under a custom key —
    // e.g. a Library section saved as `plan-<timestamp>` — are NOT consumed by
    // seeded hydration, so treating them as used silently dropped them from the
    // page on every reload.
    const usedPersistedBlocks = new Set(
      Array.from(persistedSections.entries())
        .filter(([sectionKey]) => templateSectionKeys.has(sectionKey))
        .map(([, block]) => block),
    );

    const customPersistedBlocks = (persistedPage?.blocks || []).filter(
      (block) => {
        if (usedPersistedBlocks.has(block)) {
          return false;
        }

        const sectionKey =
          typeof block.content?.editorSection === "string"
            ? block.content.editorSection.trim()
            : "";

        // Keep every persisted block that is NOT one of the template's seeded
        // sections. This covers blocks added from the Library (which carry no
        // editorSection) as well as blocks with a custom section key. Seeded
        // section blocks are hydrated separately via persistedSections below,
        // so we exclude only those here to avoid rendering them twice.
        return !(sectionKey && templateSectionKeys.has(sectionKey));
      },
    );

    const hydratedSeedBlocks = page.blocks.map((block) => {
      const sectionKey =
        typeof block.content?.editorSection === "string"
          ? block.content.editorSection
          : null;
      if (!sectionKey) {
        return block;
      }

      const persisted = persistedSections.get(sectionKey);
      if (!persisted) {
        return block;
      }

      return {
        ...block,
        id: persisted.id,
        blockType: block.blockType,
        sortOrder: persisted.sortOrder ?? block.sortOrder,
        content: mergeTemplateBlockContent(
          block.content,
          persisted.content || {},
        ),
        isVisible: persisted.isVisible ?? block.isVisible,
        localOnly: persisted.localOnly ?? false,
      };
    });

    const blocks = [...hydratedSeedBlocks, ...customPersistedBlocks].sort(
      (left, right) => {
        const leftOrder =
          typeof left?.sortOrder === "number"
            ? left.sortOrder
            : Number.MAX_SAFE_INTEGER;
        const rightOrder =
          typeof right?.sortOrder === "number"
            ? right.sortOrder
            : Number.MAX_SAFE_INTEGER;
        return leftOrder - rightOrder;
      },
    );

    return {
      ...page,
      id: persistedPage?.id ?? page.id,
      sortOrder: persistedPage?.sortOrder ?? page.sortOrder,
      isPublished: persistedPage?.isPublished ?? page.isPublished,
      localOnly: persistedPage?.localOnly ?? false,
      blocks,
    };
  });
};

const migrateCompanyExecutiveSectionBoundaries = (
  templateId: string,
  pages: TemplateEditorPage[],
): TemplateEditorPage[] => {
  if (templateId !== "company-executive") {
    return pages;
  }

  return pages.map((page) => {
    const processBlock = page.blocks.find(
      (block) => block.content?.editorSection === "process",
    );
    const detailsIndex = page.blocks.findIndex(
      (block) => block.content?.editorSection === "process-details",
    );
    if (detailsIndex < 0 || !processBlock?.content?.splitContentCards) {
      return page;
    }

    const detailsBlock = page.blocks[detailsIndex];
    if (detailsBlock.localOnly === false) {
      return page;
    }

    const blocks = [...page.blocks];
    blocks[detailsIndex] = {
      ...detailsBlock,
      content: {
        ...detailsBlock.content,
        splitContentCards: processBlock.content.splitContentCards,
      },
    };
    return { ...page, blocks };
  });
};

const getThemeSettingsFromUnknown = (
  value: unknown,
): TemplateThemeSettings | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const themeSettings: TemplateThemeSettings = {};

  if (typeof source.primaryColor === "string" && source.primaryColor.trim()) {
    themeSettings.primaryColor = source.primaryColor;
  }
  if (
    typeof source.secondaryColor === "string" &&
    source.secondaryColor.trim()
  ) {
    themeSettings.secondaryColor = source.secondaryColor;
  }
  if (typeof source.headingFont === "string" && source.headingFont.trim()) {
    themeSettings.headingFont = source.headingFont;
  }
  if (typeof source.bodyFont === "string" && source.bodyFont.trim()) {
    themeSettings.bodyFont = source.bodyFont;
  }
  if (typeof source.paletteId === "string" && source.paletteId.trim()) {
    themeSettings.paletteId = source.paletteId;
  }
  if (typeof source.fontPackId === "string" && source.fontPackId.trim()) {
    themeSettings.fontPackId = source.fontPackId;
  }

  return Object.keys(themeSettings).length ? themeSettings : null;
};

export const readTemplateThemeSettingsFromPages = (
  pages: TemplateEditorPage[] | null | undefined,
): TemplateThemeSettings | null => {
  if (!Array.isArray(pages)) {
    return null;
  }

  for (const block of getAllBlocks(pages)) {
    const themeSettings = getThemeSettingsFromUnknown(
      block.content?.[TEMPLATE_THEME_CONTENT_KEY],
    );
    if (themeSettings) {
      return themeSettings;
    }
  }

  return null;
};

export const injectTemplateThemeSettingsIntoBlocks = (
  blocks: TemplateEditorBlock[],
  themeSettings: TemplateThemeSettings | null | undefined,
): TemplateEditorBlock[] => {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return blocks;
  }

  if (!themeSettings || Object.keys(themeSettings).length === 0) {
    return blocks;
  }

  return blocks.map((block, index) =>
    index === 0
      ? {
          ...block,
          content: {
            ...block.content,
            [TEMPLATE_THEME_CONTENT_KEY]: {
              ...(block.content?.[TEMPLATE_THEME_CONTENT_KEY] as
                | Record<string, unknown>
                | undefined),
              ...themeSettings,
            },
          },
        }
      : block,
  );
};

export const supportsFrontendTemplateEditor = (
  templateId?: string | null,
): boolean => !!templateId && LOCAL_TEMPLATE_EDITOR_IDS.has(templateId);

/**
 * True when `path` is one of the template's declared default pages (from
 * TEMPLATE_PAGE_SCHEMAS). Dynamic pages like Blog (`/blog`) or user-added
 * pages are NOT owned — those must render via page-shell + persisted blocks,
 * not the template's Home body fallback.
 */
export const isFrontendTemplateOwnedPagePath = (
  templateId?: string | null,
  path?: string | null,
): boolean => {
  if (!templateId) return false;
  const schemaPages = TEMPLATE_PAGE_SCHEMAS[templateId] || [];
  if (!schemaPages.length) return false;

  const normalized = String(path || "/")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return schemaPages.some((page) => {
    const pagePath = String(page.path || "/")
      .trim()
      .replace(/^\/+|\/+$/g, "");
    if (page.isHome) {
      return normalized === "" || normalized === "home" || pagePath === normalized;
    }
    return pagePath === normalized;
  });
};

export const isSyntheticTemplatePageId = (pageId: unknown): boolean =>
  typeof pageId === "string" && /^page-\d+$/.test(pageId);

export const inferFrontendTemplateIdFromPages = (
  pagesInput: unknown[] | null | undefined,
): string | null => {
  const pages = normalizePersistedPages(pagesInput);
  const blocks = getAllBlocks(pages);
  return inferFrontendTemplateIdFromBlocks(blocks);
};

export const buildFrontendTemplateEditorPages = (
  templateId: string,
  website: WebsiteLike,
  persistedPagesInput?: unknown[] | null,
): TemplateEditorPage[] => {
  const data = buildFrontendTemplateBusinessData(templateId, {
    name: website.name || "",
    businessName: website.businessName || undefined,
    primaryColor: website.primaryColor || undefined,
    secondaryColor: website.secondaryColor || undefined,
    themeSettings:
      website.themeSettings ||
      website.templateSnapshot?.themeSettings ||
      undefined,
    metaDescription: website.metaDescription || undefined,
    shortDescription: website.shortDescription || undefined,
    logoUrl: website.logoUrl || undefined,
    fullAddress: website.fullAddress || undefined,
    tags: website.tags || undefined,
  });

  if (!data) return [];

  const seededPages = seedPagesFromSchema(templateId, data);
  const persistedPages = normalizePersistedPages(
    persistedPagesInput || website.templateSnapshot?.pages || null,
  );

  const hydratedPages = migrateCompanyExecutiveSectionBoundaries(
    templateId,
    hydrateSeededPages(templateId, seededPages, persistedPages),
  );

  // Append any persisted page that is NOT represented by a seeded template page
  // (e.g. a custom page added from Pages management). Template schemas only define
  // the Home page, so without this these real backend pages are silently dropped
  // and never appear in the editor's page dropdown. Each keeps its real id and
  // blocks (localOnly: false) so it can be selected and saved independently of
  // Home rather than overwriting the Home page's blocks.
  const seededStorageKeys = new Set(hydratedPages.map(getPageStorageKey));
  const extraPersistedPages = persistedPages.filter(
    (page) => !seededStorageKeys.has(getPageStorageKey(page)),
  );

  return [...hydratedPages, ...extraPersistedPages];
};

const readString = (
  source: Record<string, unknown>,
  keys: string[],
  fallback = "",
): string => {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return fallback;
};

/**
 * Carry the Contact block's fully-managed form configuration through the
 * section field-mapping so the shared renderer can render the editable
 * `formFields` list (added/removed/reordered fields), not just the defaults.
 * Only defined keys are included so nothing overwrites existing mapped fields.
 */
const buildContactFormConfig = (
  contact: Record<string, unknown>,
): Record<string, unknown> => {
  const config: Record<string, unknown> = {};
  const normalizedFormFields = normalizeContactFormFields(
    contact.formFields,
    contact,
  );
  if (normalizedFormFields.length) {
    config.formFields = normalizedFormFields.map((field) => ({
      _id: field.key,
      label: field.label,
      placeholder: field.placeholder,
      fieldType: field.fieldType,
      required: field.required,
      options: field.options.join(", "),
    }));
  }
  const passthroughStrings: Array<[string, string[]]> = [
    ["formTitle", ["formTitle"]],
    ["buttonText", ["buttonText"]],
    ["fullNamePlaceholder", ["fullNamePlaceholder"]],
    ["emailPlaceholder", ["emailPlaceholder"]],
    ["messagePlaceholder", ["messagePlaceholder"]],
    ["email", ["email", "contactEmail"]],
    ["phone", ["phone", "contactPhone"]],
    ["address", ["address", "contactAddress"]],
  ];
  for (const [target, keys] of passthroughStrings) {
    const value = readString(contact, keys);
    if (value) {
      config[target] = value;
    }
  }
  return config;
};

/**
 * A Contact widget added from the library is persisted as a section wrapper: its
 * live-edited fields live on the outer `content`, while the shared renderer reads
 * the FIRST inner block's content. Overlay the outer (fully-merged) Contact
 * fields onto that inner block so edited heading/body/email/phone/address and the
 * `formFields` list always render on the canvas — never a stale inner mirror.
 * Outer wins, matching the built-in Contact section and EditorExtraBlocks paths.
 *
 * Detect the contact widget robustly: the wrapper may carry `editorBlockType`
 * "CONTACT", or — for blocks seeded/persisted with a differing wrapper type or
 * before that flag existed — simply hold a first inner block of type "contact".
 * Either way the outer content owns the contact fields and must win.
 */
const overlayContactInnerBlocks = (
  outerContent: Record<string, unknown>,
  rawInnerBlocks: unknown[],
): unknown[] => {
  const firstInner = rawInnerBlocks[0] as
    | { type?: string; blockType?: string; content?: Record<string, unknown> }
    | undefined;
  if (!firstInner) {
    return rawInnerBlocks;
  }

  const firstInnerType = String(
    firstInner.type || firstInner.blockType || "",
  ).toUpperCase();
  const isContactWidget =
    String(outerContent.editorBlockType || "").toUpperCase() === "CONTACT" ||
    firstInnerType === "CONTACT";

  if (!isContactWidget) {
    return rawInnerBlocks;
  }

  return [
    {
      ...firstInner,
      content: {
        ...(firstInner.content || {}),
        ...buildContactFormConfig(outerContent),
        ...(typeof outerContent.heading === "string"
          ? { heading: outerContent.heading }
          : {}),
        ...(typeof outerContent.body === "string"
          ? { body: outerContent.body }
          : {}),
      },
    },
    ...rawInnerBlocks.slice(1),
  ];
};

const ensureFooterInnerBlock = (
  rawInnerBlocks: unknown[],
  fallbackCopyright: string,
): unknown[] => {
  const innerBlocks = Array.isArray(rawInnerBlocks) ? rawInnerBlocks : [];
  const hasFooter = innerBlocks.some(
    (block) => String((block as { type?: string })?.type || "").toUpperCase() === "FOOTER",
  );

  if (hasFooter) {
    return innerBlocks;
  }

  return [
    ...innerBlocks,
    {
      type: "FOOTER",
      content: {
        copyright: fallbackCopyright,
      },
    },
  ];
};

const readArray = <T>(source: Record<string, unknown>, keys: string[]): T[] => {
  for (const key of keys) {
    const value = source?.[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }
  return [];
};

const readObjectRecord = (
  source: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> | undefined => {
  for (const key of keys) {
    const value = source?.[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }
  return undefined;
};

const mapDetailGroups = (
  groups: Array<Record<string, unknown>>,
  fallback: Array<{ title: string; items: string[] }> = [],
): Array<{ title: string; items: string[] }> =>
  groups.length
    ? groups.map((group, index) => ({
        title: readString(
          group,
          ["title", "heading"],
          fallback[index]?.title || `Group ${index + 1}`,
        ),
        items: readArray<string>(group, ["items"]).map((item) => String(item)),
      }))
    : fallback;

const mapProgressStats = (
  stats: Array<Record<string, unknown>>,
  fallback: Array<{ label: string; value: string }> = [],
): Array<{ label: string; value: string }> =>
  stats.length
    ? stats.map((stat, index) => ({
        label: readString(
          stat,
          ["label", "title"],
          fallback[index]?.label || `Stat ${index + 1}`,
        ),
        value: readString(stat, ["value"], fallback[index]?.value || ""),
      }))
    : fallback;

const readSocialProof = (
  source: Record<string, unknown>,
  fallback: {
    label: string;
    value: string;
    rating: number;
    avatars: Array<{ image: string; alt: string }>;
  },
) => {
  const socialProof = readObjectRecord(source, ["socialProof"]) || {};
  const avatars = readArray<Record<string, unknown>>(socialProof, [
    "avatars",
  ]).map((avatar, index) => ({
    image: readString(
      avatar,
      ["image", "src", "url"],
      fallback.avatars[index]?.image || "",
    ),
    alt: readString(
      avatar,
      ["alt", "label", "name"],
      fallback.avatars[index]?.alt || `Avatar ${index + 1}`,
    ),
  }));

  return {
    label: readString(socialProof, ["label"], fallback.label),
    value: readString(socialProof, ["value"], fallback.value),
    rating: Number(socialProof.rating || fallback.rating || 5),
    avatars: avatars.length ? avatars : fallback.avatars,
  };
};

const getSectionStyleValue = (
  source: Record<string, unknown>,
  styleKey: "sectionStyle" | "outerSectionStyle" = "sectionStyle",
) => {
  const value = source?.[styleKey];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value;
};

const mapFeatureItems = (items: Array<Record<string, unknown>>): Feature[] =>
  items.map((item, index) => ({
    title: String(item.title || `Feature ${index + 1}`),
    description: String(item.description || ""),
    icon: typeof item.icon === "string" ? item.icon : "",
  }));

const mapPosts = (
  items: Array<Record<string, unknown>>,
  fallbackPosts: BlogPost[] = [],
): BlogPost[] =>
  items.map((item, index) => ({
    id: String(item.id || `editor-post-${index + 1}`),
    title: readString(item, ["title", "heading"], `Article ${index + 1}`),
    description: readString(item, ["description", "excerpt", "subheading"]),
    image: readString(item, ["image", "imageUrl", "thumbnail", "coverImage"]),
    category: readString(
      item,
      ["category", "tag", "icon"],
      fallbackPosts[index]?.category || "Article",
    ),
    author: readString(
      item,
      ["author", "authorName"],
      fallbackPosts[index]?.author || "",
    ),
    publishedAt: readString(
      item,
      ["publishedAt", "date"],
      fallbackPosts[index]?.publishedAt || "",
    ),
    slug: readString(
      item,
      ["slug"],
      fallbackPosts[index]?.slug || `editor-article-${index + 1}`,
    ),
    content: readString(
      item,
      ["content", "body"],
      fallbackPosts[index]?.content || "",
    ),
  }));

const mapTestimonials = (items: Array<Record<string, unknown>>): Review[] =>
  items.map((item, index) => ({
    author: String(item.author || `Client ${index + 1}`),
    text: String(item.quote || item.text || ""),
    comment: String(item.quote || item.text || ""),
    role: String(item.position || ""),
    rating: 5,
  }));

const findSectionContent = (
  templateId: string,
  pages: TemplateEditorPage[],
  sectionKey: string,
): Record<string, unknown> => {
  const match = getAllBlocks(pages).find(
    (block) => getCompatibleSectionKey(templateId, block) === sectionKey,
  );
  return match?.content || {};
};

const findSectionBlock = (
  templateId: string,
  pages: TemplateEditorPage[],
  sectionKey: string,
): TemplateEditorBlock | undefined =>
  getAllBlocks(pages).find(
    (block) => getCompatibleSectionKey(templateId, block) === sectionKey,
  );

const buildNavbarContent = (
  navbarBlock: TemplateEditorBlock | undefined,
  rawContent: Record<string, unknown>,
): Record<string, unknown> => ({
  ...rawContent,
  blockId: navbarBlock?.id,
  ctaText: readString(rawContent, ["ctaText", "contactPrimaryText"], ""),
});

const buildTemplatePreviewBusinessDataImpl = (
  templateId: string,
  website: WebsiteLike,
  pages: TemplateEditorPage[],
): BusinessData | null => {
  const base = buildFrontendTemplateBusinessData(templateId, {
    websiteId: website.id,
    slug: website.slug,
    name: website.name || "",
    businessName: website.businessName || undefined,
    primaryColor: website.primaryColor || undefined,
    secondaryColor: website.secondaryColor || undefined,
    themeSettings:
      website.themeSettings ||
      website.templateSnapshot?.themeSettings ||
      undefined,
    metaDescription: website.metaDescription || undefined,
    shortDescription: website.shortDescription || undefined,
    logoUrl: website.logoUrl || undefined,
    fullAddress: website.fullAddress || undefined,
    tags: website.tags || undefined,
  });

  if (!base) return null;

  // The saved template block is the authoritative source for a frontend
  // template's palette and font pack. Website-level colors can lag behind the
  // block mutation (or be served from a cached website payload), so they must
  // not overwrite a theme that was just saved with the page.
  const themeSettings = {
    ...(getThemeSettingsFromUnknown(website.templateSnapshot?.themeSettings) ||
      {}),
    ...(getThemeSettingsFromUnknown(website.themeSettings) || {}),
    ...(website.primaryColor ? { primaryColor: website.primaryColor } : {}),
    ...(website.secondaryColor
      ? { secondaryColor: website.secondaryColor }
      : {}),
    ...(readTemplateThemeSettingsFromPages(pages) || {}),
  };
  const hasThemeSettings = Object.keys(themeSettings).length > 0;

  const themedBase: BusinessData = {
    ...base,
    pages: pages.map((page) => ({
      id: page.id,
      title: page.title,
      path: page.path,
      isHome: page.isHome,
      isPublished: page.isPublished,
      pageType: (page as { pageType?: string | null }).pageType ?? null,
      isNavigationPage:
        (page as { isNavigationPage?: boolean | null }).isNavigationPage ??
        null,
      type: (page as { type?: string | null }).type ?? null,
    })),
    primaryColor: themeSettings.primaryColor || base.primaryColor,
    secondaryColor: themeSettings.secondaryColor || base.secondaryColor,
    themeSettings: hasThemeSettings
      ? {
          ...(base.themeSettings || {}),
          ...themeSettings,
        }
      : base.themeSettings,
  };

  const orderedSectionContentMap = getOrderedSectionContentMap(
    templateId,
    pages,
  );
  const getSectionContent = (sectionKey: string): Record<string, unknown> =>
    orderedSectionContentMap.get(sectionKey) ||
    findSectionContent(templateId, pages, sectionKey);

  if (templateId === "education-pro") {
    const getPageSection = (
      path: string,
      sectionKey: string,
    ): { id?: string | number; content: Record<string, unknown> } => {
      const page = pages.find((candidate) => candidate.path === path);
      const block = page?.blocks.find(
        (candidate) =>
          candidate.content &&
          typeof candidate.content === "object" &&
          !Array.isArray(candidate.content) &&
          (candidate.content as Record<string, unknown>).editorSection ===
            sectionKey,
      );

      return {
        id: block?.id,
        content:
          block?.content &&
          typeof block.content === "object" &&
          !Array.isArray(block.content)
            ? (block.content as Record<string, unknown>)
            : {},
      };
    };
    const withBlock = (
      section: { id?: string | number; content: Record<string, unknown> },
    ): Record<string, unknown> => ({
      ...section.content,
      blockId: section.id,
      sectionStyle: getSectionStyleValue(section.content),
      outerSectionStyle: getSectionStyleValue(
        section.content,
        "outerSectionStyle",
      ),
    });
    const homeNavbar = getPageSection("/", "navbar");
    const homeFooter = getPageSection("/", "footer");
    const pageBodies = {
      home: {
        hero: withBlock(getPageSection("/", "hero")),
        categories: withBlock(getPageSection("/", "categories")),
        intro: withBlock(getPageSection("/", "intro")),
        courses: withBlock(getPageSection("/", "courses")),
        promo: withBlock(getPageSection("/", "promo")),
        instructors: withBlock(getPageSection("/", "instructors")),
        courseRequest: withBlock(getPageSection("/", "courseRequest")),
        testimonials: withBlock(getPageSection("/", "testimonials")),
        stats: withBlock(getPageSection("/", "stats")),
      },
      about: {
        banner: withBlock(getPageSection("/about", "banner")),
        intro: withBlock(getPageSection("/about", "intro")),
        features: withBlock(getPageSection("/about", "features")),
        stats: withBlock(getPageSection("/about", "stats")),
        members: withBlock(getPageSection("/about", "members")),
        showcase: withBlock(getPageSection("/about", "showcase")),
      },
      courses: {
        banner: withBlock(getPageSection("/courses", "banner")),
        features: withBlock(getPageSection("/courses", "features")),
      },
      contact: {
        banner: withBlock(getPageSection("/contact", "banner")),
        contact: withBlock(getPageSection("/contact", "contact")),
      },
    };

    return {
      ...themedBase,
      tagline: readString(
        pageBodies.home.hero,
        ["heading"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        pageBodies.home.intro,
        ["body", "description"],
        String(themedBase.description),
      ),
      templateContent: {
        __siteSlug: website.slug || undefined,
        navbar: {
          ...homeNavbar.content,
          blockId: homeNavbar.id,
          ctaText: readString(homeNavbar.content, ["ctaText"], ""),
        },
        footer: withBlock(homeFooter),
        pageBodies,
      },
    };
  }

  if (templateId === "gardening-pro") {
    const getPageSection = (
      path: string,
      sectionKey: string,
    ): { id?: string | number; content: Record<string, unknown> } => {
      const page = pages.find((candidate) => candidate.path === path);
      const block = page?.blocks.find(
        (candidate) =>
          candidate.content &&
          typeof candidate.content === "object" &&
          !Array.isArray(candidate.content) &&
          (candidate.content as Record<string, unknown>).editorSection ===
            sectionKey,
      );

      return {
        id: block?.id,
        content:
          block?.content &&
          typeof block.content === "object" &&
          !Array.isArray(block.content)
            ? (block.content as Record<string, unknown>)
            : {},
      };
    };
    const withBlock = (
      section: { id?: string | number; content: Record<string, unknown> },
    ): Record<string, unknown> => ({
      ...section.content,
      blockId: section.id,
      sectionStyle: getSectionStyleValue(section.content),
      outerSectionStyle: getSectionStyleValue(
        section.content,
        "outerSectionStyle",
      ),
    });
    const homeNavbar = getPageSection("/", "navbar");
    const homeFooter = getPageSection("/", "footer");
    const pageBodies = {
      home: {
        hero: withBlock(getPageSection("/", "hero")),
        trust: withBlock(getPageSection("/", "trust")),
        intro: withBlock(getPageSection("/", "intro")),
        stats: withBlock(getPageSection("/", "stats")),
        servicesList: withBlock(getPageSection("/", "servicesList")),
        projects: withBlock(getPageSection("/", "projects")),
        success: withBlock(getPageSection("/", "success")),
        features: withBlock(getPageSection("/", "features")),
        cta: withBlock(getPageSection("/", "cta")),
      },
      about: {
        banner: withBlock(getPageSection("/about", "banner")),
        vision: withBlock(getPageSection("/about", "vision")),
        stats: withBlock(getPageSection("/about", "stats")),
        founder: withBlock(getPageSection("/about", "founder")),
        values: withBlock(getPageSection("/about", "values")),
        members: withBlock(getPageSection("/about", "members")),
      },
      services: {
        intro: withBlock(getPageSection("/services", "intro")),
        features: withBlock(getPageSection("/services", "features")),
        cta: withBlock(getPageSection("/services", "cta")),
      },
      contact: {
        intro: withBlock(getPageSection("/contact", "intro")),
        contact: withBlock(getPageSection("/contact", "contact")),
      },
    };

    return {
      ...themedBase,
      tagline: readString(
        pageBodies.home.hero,
        ["heading"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        pageBodies.home.intro,
        ["body", "description"],
        String(themedBase.description),
      ),
      templateContent: {
        __siteSlug: website.slug || undefined,
        navbar: {
          ...homeNavbar.content,
          blockId: homeNavbar.id,
          ctaText: readString(homeNavbar.content, ["ctaText"], ""),
        },
        footer: withBlock(homeFooter),
        pageBodies,
      },
    };
  }

  if (templateId === "plumbing-pro") {
    const getPageSection = (
      path: string,
      sectionKey: string,
    ): { id?: string | number; content: Record<string, unknown> } => {
      const page = pages.find((candidate) => candidate.path === path);
      const block = page?.blocks.find(
        (candidate) =>
          candidate.content &&
          typeof candidate.content === "object" &&
          !Array.isArray(candidate.content) &&
          (candidate.content as Record<string, unknown>).editorSection ===
            sectionKey,
      );

      return {
        id: block?.id,
        content:
          block?.content &&
          typeof block.content === "object" &&
          !Array.isArray(block.content)
            ? (block.content as Record<string, unknown>)
            : {},
      };
    };
    const withBlock = (
      section: { id?: string | number; content: Record<string, unknown> },
    ): Record<string, unknown> => ({
      ...section.content,
      blockId: section.id,
      sectionStyle: getSectionStyleValue(section.content),
      outerSectionStyle: getSectionStyleValue(
        section.content,
        "outerSectionStyle",
      ),
    });
    const homeNavbar = getPageSection("/", "navbar");
    const homeFooter = getPageSection("/", "footer");
    const pageBodies = {
      home: {
        hero: withBlock(getPageSection("/", "hero")),
        trust: withBlock(getPageSection("/", "trust")),
        servicesList: withBlock(getPageSection("/", "servicesList")),
        intro: withBlock(getPageSection("/", "intro")),
        whyChoose: withBlock(getPageSection("/", "whyChoose")),
        members: withBlock(getPageSection("/", "members")),
        promo: withBlock(getPageSection("/", "promo")),
        testimonials: withBlock(getPageSection("/", "testimonials")),
        contactStrip: withBlock(getPageSection("/", "contactStrip")),
      },
      about: {
        banner: withBlock(getPageSection("/about", "banner")),
        valueCards: withBlock(getPageSection("/about", "valueCards")),
        intro: withBlock(getPageSection("/about", "intro")),
        members: withBlock(getPageSection("/about", "members")),
        stats: withBlock(getPageSection("/about", "stats")),
        why: withBlock(getPageSection("/about", "why")),
        testimonials: withBlock(getPageSection("/about", "testimonials")),
        cta: withBlock(getPageSection("/about", "cta")),
      },
      services: {
        banner: withBlock(getPageSection("/services", "banner")),
        why: withBlock(getPageSection("/services", "why")),
        features: withBlock(getPageSection("/services", "features")),
        cta: withBlock(getPageSection("/services", "cta")),
      },
      contact: {
        banner: withBlock(getPageSection("/contact", "banner")),
        cards: withBlock(getPageSection("/contact", "cards")),
        contact: withBlock(getPageSection("/contact", "contact")),
        cta: withBlock(getPageSection("/contact", "cta")),
      },
    };

    return {
      ...themedBase,
      tagline: readString(
        pageBodies.home.hero,
        ["heading"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        pageBodies.home.hero,
        ["subheading", "body", "description"],
        String(themedBase.description),
      ),
      templateContent: {
        __siteSlug: website.slug || undefined,
        navbar: {
          ...homeNavbar.content,
          blockId: homeNavbar.id,
          ctaText: readString(homeNavbar.content, ["ctaText"], ""),
        },
        footer: withBlock(homeFooter),
        pageBodies,
      },
    };
  }

  if (templateId === "company-pro") {
    const sectionMap = getTemplateSectionMap(templateId, pages);
    const navbar = getSectionContent("navbar");
    const hero = getSectionContent("hero");
    const stats = getSectionContent("stats");
    const about = getSectionContent("about");
    const showcase = getSectionContent("showcase");
    const services = getSectionContent("services");
    const process = getSectionContent("process");
    const testimonials = getSectionContent("testimonials");
    const contact = getSectionContent("contact");
    const footer = getSectionContent("footer");
    const serviceItems = readArray<Record<string, unknown>>(services, [
      "features",
    ]);
    const processItems = readArray<Record<string, unknown>>(process, [
      "features",
    ]);
    const statItems = readArray<Record<string, unknown>>(stats, ["stats"]);
    const testimonialItems = readArray<Record<string, unknown>>(
      testimonials,
      ["testimonials"],
    );
    const aboutDetailGroups = mapDetailGroups(
      readArray<Record<string, unknown>>(about, ["detailGroups"]),
      [
        {
          title: "Senior partnership",
          items: ["Direct access", "Clear ownership", "Fast decisions"],
        },
        {
          title: "Built to last",
          items: ["Reusable systems", "Measured outcomes", "Knowledge transfer"],
        },
      ],
    );
    const heroSocialProof = readSocialProof(hero, {
      label: "Trusted worldwide",
      value: "Trusted by ambitious teams worldwide.",
      rating: 5,
      avatars: companyProAssets.avatars.map((image, index) => ({
        image,
        alt: `Client ${index + 1}`,
      })),
    });
    const withBlock = (
      sectionKey: string,
      rawContent: Record<string, unknown>,
      additions: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      ...rawContent,
      ...additions,
      blockId: sectionMap.get(sectionKey)?.id,
      sectionStyle: getSectionStyleValue(rawContent),
      outerSectionStyle: getSectionStyleValue(
        rawContent,
        "outerSectionStyle",
      ),
    });

    return {
      ...themedBase,
      tagline: readString(
        hero,
        ["heading"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        about,
        ["body", "description"],
        String(themedBase.description),
      ),
      features: serviceItems.length
        ? mapFeatureItems(serviceItems)
        : themedBase.features,
      stats: statItems.map((item) => ({
        label: readString(item, ["label"]),
        value: `${readString(item, ["prefix"])}${readString(item, ["number"])}${readString(item, ["suffix"])}`,
      })),
      reviews: testimonialItems.length
        ? mapTestimonials(testimonialItems)
        : themedBase.reviews,
      templateContent: {
        navbar: buildNavbarContent(sectionMap.get("navbar"), navbar),
        hero: withBlock("hero", hero, { socialProof: heroSocialProof }),
        stats: withBlock("stats", stats, { stats: statItems }),
        about: withBlock("about", about, {
          detailGroups: aboutDetailGroups,
        }),
        showcase: withBlock("showcase", showcase),
        services: withBlock("services", services, {
          features: serviceItems,
        }),
        process: withBlock("process", process, {
          features: processItems,
        }),
        testimonials: withBlock("testimonials", testimonials, {
          testimonials: testimonialItems,
        }),
        contact: withBlock("contact", contact, {
          ...buildContactFormConfig(contact),
        }),
        footer: withBlock("footer", footer),
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
      },
    };
  }

  if (templateId === "photo-studio-pro") {
    const sectionMap = getTemplateSectionMap(templateId, pages);
    const getSection = (key: string) => getSectionContent(key);
    const withBlock = (
      sectionKey: string,
      rawContent: Record<string, unknown>,
      additions: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      ...rawContent,
      ...additions,
      blockId: sectionMap.get(sectionKey)?.id,
      sectionStyle: getSectionStyleValue(rawContent),
      outerSectionStyle: getSectionStyleValue(
        rawContent,
        "outerSectionStyle",
      ),
    });
    const navbar = getSection("navbar");
    const hero = getSection("hero");
    const intro = getSection("intro");
    const about = getSection("about");
    const works = getSection("works");
    const contact = getSection("contact");
    const lens = getSection("lens");
    const footer = getSection("footer");
    const workItems = readArray<Record<string, unknown>>(works, ["features"]);
    const introItems = readArray<Record<string, unknown>>(intro, ["features"]);
    const lensItems = readArray<Record<string, unknown>>(lens, ["features"]);

    return {
      ...themedBase,
      tagline: readString(
        hero,
        ["heading"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        about,
        ["body", "description"],
        String(themedBase.description),
      ),
      portfolioItems: workItems.map((item, index) => ({
        title: readString(item, ["title"], `Work ${index + 1}`),
        description: readString(item, ["description"], ""),
        image: readString(item, ["image"], ""),
        category: readString(item, ["icon"], "Portfolio"),
      })),
      templateContent: {
        __siteSlug: website.slug || undefined,
        navbar: buildNavbarContent(sectionMap.get("navbar"), navbar),
        hero: withBlock("hero", hero),
        intro: withBlock("intro", intro, { features: introItems }),
        about: withBlock("about", about),
        works: withBlock("works", works, { features: workItems }),
        contact: withBlock("contact", contact, {
          ...buildContactFormConfig(contact),
        }),
        lens: withBlock("lens", lens, { features: lensItems }),
        footer: withBlock("footer", footer),
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
      },
    };
  }

  if (
    templateId === "link-hub-pro" ||
    templateId === "link-hub-dark-pro" ||
    templateId === "beauty-link-hub-pro"
  ) {
    const sectionMap = getTemplateSectionMap(templateId, pages);
    const getSection = (key: string) => getSectionContent(key);
    const withBlock = (
      sectionKey: string,
      rawContent: Record<string, unknown>,
      additions: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      ...rawContent,
      ...additions,
      blockId: sectionMap.get(sectionKey)?.id,
      sectionStyle: getSectionStyleValue(rawContent),
      outerSectionStyle: getSectionStyleValue(rawContent, "outerSectionStyle"),
    });
    const navbar = getSection("navbar");
    const profile = getSection("profile");
    const socials = getSection("socials");
    const featured = getSection("featured");
    const links = getSection("links");
    const products = getSection("products");
    const contact = getSection("contact");
    const footer = getSection("footer");
    const socialItems = readArray<Record<string, unknown>>(socials, [
      "features",
      "items",
    ]);
    const featuredItems = readArray<Record<string, unknown>>(featured, [
      "features",
      "items",
    ]);
    const linkItems = readArray<Record<string, unknown>>(links, [
      "features",
      "items",
    ]);
    const productItems = readArray<Record<string, unknown>>(products, [
      "features",
      "items",
    ]);

    return {
      ...themedBase,
      tagline: readString(
        profile,
        ["subheading", "heading"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        profile,
        ["body", "description"],
        String(themedBase.description),
      ),
      templateContent: {
        __siteSlug: website.slug || undefined,
        navbar: buildNavbarContent(sectionMap.get("navbar"), navbar),
        profile: withBlock("profile", profile),
        hero: withBlock("profile", profile),
        socials: withBlock("socials", socials, { features: socialItems }),
        featured: withBlock("featured", featured, { features: featuredItems }),
        links: withBlock("links", links, { features: linkItems }),
        products: withBlock("products", products, { features: productItems }),
        contact: withBlock("contact", contact, {
          ...buildContactFormConfig(contact),
        }),
        footer: withBlock("footer", footer),
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
      },
    };
  }

  if (templateId === "company-executive") {
    // Company Executive has multiple FEATURES blocks. Resolve them through the
    // ordered section map so old sites without editorSection metadata do not
    // collapse Why Us, Process, and Process Details onto the first FEATURES row.
    const companySectionMap = getTemplateSectionMap(templateId, pages);
    const navbarBlock = companySectionMap.get("navbar");
    const overviewBlock = companySectionMap.get("overview");
    const aboutBlock = companySectionMap.get("about");
    const whyUsBlock = companySectionMap.get("why-us");
    const processBlock = companySectionMap.get("process");
    const processDetailsBlock = companySectionMap.get("process-details");
    const contactBlock = companySectionMap.get("contact");
    const navbar = getSectionContent("navbar");
    const overview = getSectionContent("overview");
    const about = getSectionContent("about");
    const whyUs = getSectionContent("why-us");
    const process = getSectionContent("process");
    const processDetails = getSectionContent("process-details");
    const contact = getSectionContent("contact");
    const customSections = getOrderedCustomSectionsForHomePage(
      templateId,
      pages,
    );

    const whyUsItems = readArray<Record<string, unknown>>(whyUs, [
      "features",
      "items",
    ]);
    const savedProcessItems = readArray<Record<string, unknown>>(process, [
      "features",
      "items",
    ]);
    const processItems = savedProcessItems.length
      ? savedProcessItems
      : [
          {
            icon: "01",
            title: "Discovery & planning",
            description:
              "We define the brand story, service positioning, and the sections that matter most for a professional company site.",
          },
          {
            icon: "02",
            title: "Structure & delivery",
            description:
              "The design system, imagery, and motion are shaped into a clear website flow built for trust and executive presence.",
          },
          {
            icon: "03",
            title: "Review & support",
            description:
              "The final experience is refined for readability, conversion, and easy reuse across different client brands.",
          },
        ];
    const contactHeading = readString(
      contact,
      ["heading", "title"],
      "Drop us a line.",
    );
    const contactDescription = readString(
      contact,
      ["description", "subheading", "body"],
      String(themedBase.description),
    );
    const contactButton = readString(
      contact,
      ["buttonLabel", "primaryCtaText", "ctaText"],
      "Contact Us",
    );
    const heroSocialProof = readSocialProof(overview, {
      label: "Trusted business partner",
      value: "100+ happy customers.",
      rating: 5,
      avatars: [
        {
          image: companyStudioAssets.avatars[0],
          alt: "Client 1",
        },
        {
          image: companyStudioAssets.avatars[1],
          alt: "Client 2",
        },
        {
          image: companyStudioAssets.avatars[2],
          alt: "Client 3",
        },
        {
          image: companyStudioAssets.avatars[3],
          alt: "Client 4",
        },
      ],
    });
    const aboutDetailGroups = mapDetailGroups(
      readArray<Record<string, unknown>>(about, ["detailGroups"]),
      [
        {
          title: "What we build",
          items: ["Clear systems", "Premium visuals", "Business growth"],
        },
        {
          title: "How we work",
          items: ["Fast collaboration", "Focused delivery", "Global support"],
        },
      ],
    );
    const aboutProgressStats = mapProgressStats(
      readArray<Record<string, unknown>>(about, ["progressStats"]),
      [
        { label: "Revenue", value: "82%" },
        { label: "Satisfaction", value: "90%" },
      ],
    );
    const splitContentCards =
      readObjectRecord(processDetails, ["splitContentCards"]) ||
      readObjectRecord(process, ["splitContentCards"]) ||
      {};
    const splitContentCardDetails =
      readObjectRecord(splitContentCards, ["darkCard"]) || {};
    const splitContentCardSubItems = readArray<Record<string, unknown>>(
      splitContentCards,
      ["subItems"],
    );

    return {
      ...themedBase,
      tagline: readString(
        overview,
        ["heading", "heroHeading", "title"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        about,
        ["body", "description", "subheading"],
        String(themedBase.description),
      ),
      features: whyUsItems.length
        ? mapFeatureItems(whyUsItems)
        : themedBase.features,
      templateContent: {
        navbar: buildNavbarContent(navbarBlock, navbar),
        home: {
          blockId: overviewBlock?.id,
          eyebrow: readString(overview, ["eyebrow"], heroSocialProof.label),
          eyebrowStyle: overview.eyebrowStyle,
          socialProof: heroSocialProof,
          heading: readString(overview, ["heading", "heroHeading", "title"]),
          subheading: readString(overview, [
            "subheading",
            "heroDescription",
            "description",
            "body",
          ]),
          ctaText: readString(
            overview,
            ["ctaText", "heroCtaText", "buttonText", "buttonLabel"],
            contactButton,
          ),
          primaryCtaText: readString(
            overview,
            ["ctaText", "heroCtaText", "buttonText", "buttonLabel"],
            contactButton,
          ),
          secondaryCtaText: readString(
            overview,
            ["secondaryCtaText", "secondaryCta"],
            "Contact",
          ),
          heroHeading: readString(overview, [
            "heading",
            "heroHeading",
            "title",
          ]),
          heroDescription: readString(overview, [
            "subheading",
            "heroDescription",
            "description",
            "body",
          ]),
          heroCtaText: readString(
            overview,
            ["ctaText", "heroCtaText", "buttonText", "buttonLabel"],
            contactButton,
          ),
          heroImage: readString(overview, ["heroImage", "image", "imageUrl"]),
          image: readString(overview, ["heroImage", "image", "imageUrl"]),
          heroImageStyle: overview.heroImageStyle || overview.imageStyle,
          imageStyle: overview.heroImageStyle || overview.imageStyle,
          headingStyle: overview.headingStyle,
          subheadingStyle: overview.subheadingStyle,
          ctaTextStyle: overview.ctaTextStyle || overview.buttonTextStyle,
          innerBlocks: Array.isArray(overview.innerBlocks)
            ? overview.innerBlocks
            : [],
          sectionStyle: getSectionStyleValue(overview),
          outerSectionStyle: getSectionStyleValue(
            overview,
            "outerSectionStyle",
          ),
        },
        about: {
          blockId: aboutBlock?.id,
          eyebrow: readString(about, ["eyebrow"], "Get to know us"),
          eyebrowStyle: about.eyebrowStyle,
          heading: readString(about, ["heading", "title"]),
          title: readString(about, ["title", "heading"]),
          body: readString(about, ["body", "description", "subheading"]),
          detailGroups: aboutDetailGroups,
          progressTitle: readString(
            about,
            ["progressTitle"],
            "Business progress",
          ),
          progressStats: aboutProgressStats,
          image: readString(about, ["image", "imageUrl"]),
          imageStyle: about.imageStyle,
          headingStyle: about.headingStyle || about.titleStyle,
          bodyStyle: about.bodyStyle || about.descriptionStyle,
          innerBlocks: Array.isArray(about.innerBlocks)
            ? about.innerBlocks
            : [],
          sectionStyle: getSectionStyleValue(about),
          outerSectionStyle: getSectionStyleValue(about, "outerSectionStyle"),
        },
        features: {
          blockId: whyUsBlock?.id,
          eyebrow: readString(whyUs, ["eyebrow"], "Why choose us"),
          eyebrowStyle: whyUs.eyebrowStyle,
          features: whyUsItems,
          heading: readString(whyUs, ["heading", "title"]),
          description: readString(whyUs, ["description", "body", "subheading"]),
          image: readString(whyUs, ["image", "imageUrl"]),
          imageStyle: whyUs.imageStyle,
          items: whyUsItems,
          headingStyle: whyUs.headingStyle,
          descriptionStyle: whyUs.descriptionStyle || whyUs.bodyStyle,
          innerBlocks: Array.isArray(whyUs.innerBlocks)
            ? whyUs.innerBlocks
            : [],
          sectionStyle: getSectionStyleValue(whyUs),
          outerSectionStyle: getSectionStyleValue(whyUs, "outerSectionStyle"),
        },
        process: {
          blockId: processBlock?.id,
          eyebrow: readString(process, ["eyebrow"], "Our process"),
          eyebrowStyle: process.eyebrowStyle,
          heading: readString(process, ["heading", "title"]),
          subheading: readString(process, [
            "subheading",
            "description",
            "body",
          ]),
          image: readString(process, ["image", "imageUrl"]),
          imageStyle: process.imageStyle,
          ctaText: readString(
            process,
            ["ctaText", "buttonLabel", "primaryCtaText"],
            contactButton,
          ),
          features: processItems,
          items: processItems,
          headingStyle: process.headingStyle,
          titleStyle: process.titleStyle,
          bodyStyle: process.bodyStyle,
          textStyle: process.textStyle,
          subheadingStyle:
            process.subheadingStyle ||
            process.descriptionStyle ||
            process.bodyStyle,
          descriptionStyle: process.descriptionStyle || process.bodyStyle,
          ctaTextStyle: process.ctaTextStyle || process.buttonTextStyle,
          innerBlocks: Array.isArray(process.innerBlocks)
            ? process.innerBlocks
            : [],
          sectionStyle: getSectionStyleValue(process),
          outerSectionStyle: getSectionStyleValue(process, "outerSectionStyle"),
        },
        processDetails: {
          blockId: processDetailsBlock?.id || processBlock?.id,
          splitContentCards: {
            eyebrow: readString(splitContentCards, ["eyebrow"], "Team"),
            heading: readString(
              splitContentCards,
              ["heading"],
              "Strong visuals for trust and leadership.",
            ),
            subItems: splitContentCardSubItems.length
              ? splitContentCardSubItems.map((item, index) => ({
                  label: readString(
                    item,
                    ["label", "title"],
                    index === 0 ? "Leadership" : "Operations",
                  ),
                }))
              : [{ label: "Leadership" }, { label: "Operations" }],
            darkCard: {
              heading: readString(
                splitContentCardDetails,
                ["heading", "title"],
                "Built to feel sharp, premium, and easy to scan.",
              ),
              body: readString(
                splitContentCardDetails,
                ["body", "description"],
                "",
              ),
              footerLabel: readString(
                splitContentCardDetails,
                ["footerLabel", "label"],
                "Executive team",
              ),
            },
            image: readString(
              splitContentCards,
              ["image", "imageUrl"],
              companyStudioAssets.team,
            ),
            imageStyle:
              readObjectRecord(splitContentCards, ["imageStyle"]) || {},
          },
          sectionStyle: getSectionStyleValue(processDetails),
          outerSectionStyle: getSectionStyleValue(
            processDetails,
            "outerSectionStyle",
          ),
        },
        testimonials: {
          heading: readString(process, ["heading", "title"]),
          items: processItems,
        },
        contact: {
          blockId: contactBlock?.id,
          ...buildContactFormConfig(contact),
          eyebrow: readString(contact, ["eyebrow"], "Get in touch"),
          eyebrowStyle: contact.eyebrowStyle,
          heading: contactHeading,
          subheading: contactDescription,
          description: contactDescription,
          primaryCtaText: contactButton,
          ctaText: contactButton,
          buttonLabel: contactButton,
          headingStyle: contact.headingStyle,
          descriptionStyle:
            contact.descriptionStyle ||
            contact.bodyStyle ||
            contact.subheadingStyle,
          buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
          innerBlocks: ensureFooterInnerBlock(
            overlayContactInnerBlocks(
              contact,
              Array.isArray(contact.innerBlocks) ? contact.innerBlocks : [],
            ),
            `© 2026 ${website.name || base.name || "Your company"}. Global business presence.`,
          ),
          sectionStyle: getSectionStyleValue(contact),
          outerSectionStyle: getSectionStyleValue(contact, "outerSectionStyle"),
        },
        customSections,
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
      },
    };
  }

  if (templateId === "company-premium") {
    const aboutBlock = findSectionBlock(templateId, pages, "about");
    const workBlock = findSectionBlock(templateId, pages, "work");
    const galleryBlock = findSectionBlock(templateId, pages, "gallery");
    const servicesBlock = findSectionBlock(templateId, pages, "services");
    const contactBlock = findSectionBlock(templateId, pages, "contact");
    const about = getSectionContent("about");
    const work = getSectionContent("work");
    const gallery = getSectionContent("gallery");
    const services = getSectionContent("services");
    const contact = getSectionContent("contact");
    const serviceItems = readArray<Record<string, unknown>>(services, [
      "features",
      "items",
    ]);
    const contactHeading = readString(
      contact,
      ["heading", "title"],
      "Let's shape something memorable.",
    );
    const contactDescription = readString(
      contact,
      ["description", "subheading", "body"],
      "Contact",
    );
    const contactButton = readString(
      contact,
      ["buttonLabel", "primaryCtaText", "ctaText"],
      "Book a consultation",
    );

    return {
      ...themedBase,
      tagline: readString(
        about,
        ["heading", "heroHeading", "title"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        work,
        ["body", "description", "subheading"],
        String(themedBase.description),
      ),
      features: serviceItems.length
        ? mapFeatureItems(serviceItems)
        : themedBase.features,
      templateContent: {
        home: {
          blockId: aboutBlock?.id,
          eyebrow: readString(
            about,
            ["eyebrow"],
            "Premium company presentation",
          ),
          eyebrowStyle: about.eyebrowStyle,
          heading: readString(about, ["heading", "heroHeading", "title"]),
          subheading: readString(about, [
            "subheading",
            "heroDescription",
            "description",
            "body",
          ]),
          ctaText: readString(
            about,
            ["ctaText", "heroCtaText", "buttonText", "buttonLabel"],
            contactButton,
          ),
          primaryCtaText: readString(
            about,
            ["ctaText", "heroCtaText", "buttonText", "buttonLabel"],
            contactButton,
          ),
          heroHeading: readString(about, ["heading", "heroHeading", "title"]),
          heroDescription: readString(about, [
            "subheading",
            "heroDescription",
            "description",
            "body",
          ]),
          heroCtaText: readString(
            about,
            ["ctaText", "heroCtaText", "buttonText", "buttonLabel"],
            contactButton,
          ),
          headingStyle: about.headingStyle || about.titleStyle,
          subheadingStyle:
            about.subheadingStyle || about.descriptionStyle || about.bodyStyle,
          ctaTextStyle: about.ctaTextStyle || about.buttonTextStyle,
          sectionStyle: getSectionStyleValue(about),
        },
        features: {
          blockId: servicesBlock?.id,
          features: serviceItems,
          items: serviceItems,
          heading: readString(services, ["heading", "title"]),
          description: readString(services, [
            "description",
            "subheading",
            "body",
          ]),
          headingStyle: services.headingStyle || services.titleStyle,
          descriptionStyle:
            services.descriptionStyle ||
            services.subheadingStyle ||
            services.bodyStyle,
          sectionStyle: getSectionStyleValue(services),
        },
        gallery: {
          blockId: galleryBlock?.id,
          eyebrow: readString(gallery, ["eyebrow"], "Brand occasions"),
          eyebrowStyle: gallery.eyebrowStyle,
          heading: readString(gallery, ["title", "heading"]),
          description: readString(gallery, [
            "description",
            "subheading",
            "body",
          ]),
          headingStyle: gallery.headingStyle || gallery.titleStyle,
          descriptionStyle:
            gallery.descriptionStyle ||
            gallery.subheadingStyle ||
            gallery.bodyStyle,
          sectionStyle: getSectionStyleValue(gallery),
        },
        about: {
          blockId: workBlock?.id,
          eyebrow: readString(work, ["eyebrow"], "Featured selections"),
          eyebrowStyle: work.eyebrowStyle,
          heading: readString(work, ["title", "heading"]),
          body: readString(work, ["body", "description", "subheading"]),
          headingStyle: work.headingStyle || work.titleStyle,
          descriptionStyle:
            work.descriptionStyle || work.bodyStyle || work.subheadingStyle,
          buttonTextStyle: work.buttonTextStyle || work.ctaTextStyle,
          sectionStyle: getSectionStyleValue(work),
        },
        testimonials: {
          blockId: servicesBlock?.id,
          heading: readString(services, ["heading", "title"]),
          description: readString(services, [
            "description",
            "subheading",
            "body",
          ]),
          headingStyle: services.headingStyle || services.titleStyle,
          descriptionStyle:
            services.descriptionStyle ||
            services.subheadingStyle ||
            services.bodyStyle,
          sectionStyle: getSectionStyleValue(services),
        },
        contact: {
          blockId: contactBlock?.id,
          ...buildContactFormConfig(contact),
          eyebrow: readString(contact, ["eyebrow"], "Contact"),
          eyebrowStyle: contact.eyebrowStyle,
          heading: contactHeading,
          subheading: contactDescription,
          description: contactDescription,
          primaryCtaText: contactButton,
          ctaText: contactButton,
          buttonLabel: contactButton,
          headingStyle: contact.headingStyle || contact.titleStyle,
          descriptionStyle:
            contact.descriptionStyle ||
            contact.subheadingStyle ||
            contact.bodyStyle,
          buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
          sectionStyle: getSectionStyleValue(contact),
        },
      },
    };
  }

  if (templateId === "company") {
    const projectsBlock = findSectionBlock(templateId, pages, "projects");
    const studioBlock = findSectionBlock(templateId, pages, "studio");
    const contactBlock = findSectionBlock(templateId, pages, "contact");
    const projects = getSectionContent("projects");
    const studio = getSectionContent("studio");
    const contact = getSectionContent("contact");
    const studioItems = readArray<Record<string, unknown>>(studio, [
      "features",
      "items",
    ]);
    const contactHeading = readString(
      contact,
      ["heading", "title"],
      "Newsletter Sign Up",
    );
    const contactDescription = readString(
      contact,
      ["description", "subheading", "body"],
      "",
    );
    const contactButton = readString(
      contact,
      ["buttonLabel", "primaryCtaText", "ctaText"],
      "Sign Up",
    );

    return {
      ...themedBase,
      tagline: readString(
        projects,
        ["heading", "heroHeading", "title"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        studio,
        ["body", "description", "subheading"],
        String(themedBase.description),
      ),
      features: studioItems.length
        ? mapFeatureItems(studioItems)
        : themedBase.features,
      templateContent: {
        home: {
          blockId: projectsBlock?.id,
          eyebrow: readString(projects, ["eyebrow"], ""),
          eyebrowStyle: projects.eyebrowStyle,
          heading: readString(projects, ["heading", "heroHeading", "title"]),
          subheading: readString(projects, [
            "subheading",
            "heroDescription",
            "description",
            "body",
          ]),
          ctaText: readString(
            projects,
            ["ctaText", "heroCtaText", "buttonText", "buttonLabel"],
            contactButton,
          ),
          primaryCtaText: readString(
            projects,
            ["ctaText", "heroCtaText", "buttonText", "buttonLabel"],
            contactButton,
          ),
          heroHeading: readString(projects, [
            "heading",
            "heroHeading",
            "title",
          ]),
          heroDescription: readString(projects, [
            "subheading",
            "heroDescription",
            "description",
            "body",
          ]),
          heroCtaText: readString(
            projects,
            ["ctaText", "heroCtaText", "buttonText", "buttonLabel"],
            contactButton,
          ),
          headingStyle: projects.headingStyle || projects.titleStyle,
          subheadingStyle:
            projects.subheadingStyle ||
            projects.descriptionStyle ||
            projects.bodyStyle,
          ctaTextStyle: projects.ctaTextStyle || projects.buttonTextStyle,
          sectionStyle: getSectionStyleValue(projects),
        },
        features: {
          blockId: studioBlock?.id,
          eyebrow: readString(studio, ["eyebrow"], ""),
          eyebrowStyle: studio.eyebrowStyle,
          features: studioItems,
          items: studioItems,
          heading: readString(studio, ["heading", "title"]),
          description: readString(studio, [
            "body",
            "description",
            "subheading",
          ]),
          headingStyle: studio.headingStyle || studio.titleStyle,
          descriptionStyle:
            studio.descriptionStyle ||
            studio.bodyStyle ||
            studio.subheadingStyle,
          sectionStyle: getSectionStyleValue(studio),
        },
        about: {
          blockId: studioBlock?.id,
          eyebrow: readString(studio, ["eyebrow"], ""),
          eyebrowStyle: studio.eyebrowStyle,
          heading: readString(studio, ["heading", "title"]),
          body: readString(studio, ["body", "description", "subheading"]),
          headingStyle: studio.headingStyle || studio.titleStyle,
          descriptionStyle:
            studio.descriptionStyle ||
            studio.bodyStyle ||
            studio.subheadingStyle,
          sectionStyle: getSectionStyleValue(studio),
        },
        contact: {
          blockId: contactBlock?.id,
          ...buildContactFormConfig(contact),
          eyebrow: readString(contact, ["eyebrow"], ""),
          eyebrowStyle: contact.eyebrowStyle,
          heading: contactHeading,
          subheading: contactDescription,
          description: contactDescription,
          primaryCtaText: contactButton,
          ctaText: contactButton,
          buttonLabel: contactButton,
          headingStyle: contact.headingStyle || contact.titleStyle,
          descriptionStyle:
            contact.descriptionStyle ||
            contact.subheadingStyle ||
            contact.bodyStyle,
          buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
          sectionStyle: getSectionStyleValue(contact),
        },
      },
    };
  }

  if (templateId === "education") {
    const heroBlock = findSectionBlock(templateId, pages, "hero");
    const programsBlock = findSectionBlock(templateId, pages, "programs");
    const highlightsBlock = findSectionBlock(templateId, pages, "highlights");
    const galleryBlock = findSectionBlock(templateId, pages, "gallery");
    const reviewsBlock = findSectionBlock(templateId, pages, "reviews");
    const contactBlock = findSectionBlock(templateId, pages, "contact");
    const campusBlock = findSectionBlock(templateId, pages, "campus");
    const claimedIds = new Set<string | number | undefined>(
      [heroBlock?.id, programsBlock?.id, highlightsBlock?.id, galleryBlock?.id, reviewsBlock?.id, contactBlock?.id, campusBlock?.id].filter((v) => v !== undefined),
    );
    const extraBlocks = getOrderedBlocksForHomePage(pages).filter(
      (block) => !claimedIds.has(block.id),
    );
    const hero = getSectionContent("hero");
    const programs = getSectionContent("programs");
    const highlights = getSectionContent("highlights");
    const gallery = getSectionContent("gallery");
    const reviews = getSectionContent("reviews");
    const contact = getSectionContent("contact");
    const campus = getSectionContent("campus");
    const programItems = readArray<Record<string, unknown>>(programs, [
      "features",
      "items",
    ]);
    const contactHeading = readString(
      contact,
      ["heading", "title"],
      "Let's find the right program for your learner.",
    );
    const contactDescription = readString(
      contact,
      ["description", "subheading", "body"],
      "",
    );
    const contactButton = readString(
      contact,
      ["buttonLabel", "primaryCtaText", "ctaText"],
      "Contact Us",
    );

    return {
      ...themedBase,
      tagline: readString(
        hero,
        ["heading", "title"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        hero,
        ["subheading", "description", "body"],
        String(themedBase.description),
      ),
      features: programItems.length
        ? mapFeatureItems(programItems)
        : themedBase.features,
      templateContent: {
        hero: {
          blockId: heroBlock?.id,
          heading: readString(hero, ["heading", "title"]),
          subheading: readString(hero, ["subheading", "description", "body"]),
          ctaText: readString(hero, ["ctaText", "buttonText", "buttonLabel"]),
          secondaryCtaText: readString(hero, ["secondaryCtaText", "secondaryButtonLabel"]),
          heroImage: readString(hero, ["heroImage", "image", "imageUrl"]),
          image: readString(hero, ["heroImage", "image", "imageUrl"]),
          headingStyle: hero.headingStyle,
          subheadingStyle: hero.subheadingStyle || hero.descriptionStyle,
          ctaTextStyle: hero.ctaTextStyle || hero.buttonTextStyle,
          innerBlocks: Array.isArray(hero.innerBlocks) ? hero.innerBlocks : [],
          sectionStyle: getSectionStyleValue(hero),
          outerSectionStyle: getSectionStyleValue(hero, "outerSectionStyle"),
        },
        programs: {
          blockId: programsBlock?.id,
          heading: readString(programs, ["heading", "title"]),
          description: readString(programs, ["description", "subheading", "body"]),
          sectionLabel: readString(programs, ["sectionLabel", "label"]),
          items: programItems,
          headingStyle: programs.headingStyle,
          descriptionStyle: programs.descriptionStyle || programs.subheadingStyle,
          innerBlocks: Array.isArray(programs.innerBlocks) ? programs.innerBlocks : [],
          sectionStyle: getSectionStyleValue(programs),
          outerSectionStyle: getSectionStyleValue(programs, "outerSectionStyle"),
        },
        highlights: {
          blockId: highlightsBlock?.id,
          heading: readString(highlights, ["heading", "title"]),
          description: readString(highlights, ["description", "subheading", "body"]),
          sectionLabel: readString(highlights, ["sectionLabel", "label"]),
          items: readArray<Record<string, unknown>>(highlights, ["features", "items"]),
          headingStyle: highlights.headingStyle,
          descriptionStyle: highlights.descriptionStyle || highlights.subheadingStyle,
          innerBlocks: Array.isArray(highlights.innerBlocks) ? highlights.innerBlocks : [],
          sectionStyle: getSectionStyleValue(highlights),
          outerSectionStyle: getSectionStyleValue(highlights, "outerSectionStyle"),
        },
        gallery: {
          blockId: galleryBlock?.id,
          heading: readString(gallery, ["heading", "title"]),
          sectionLabel: readString(gallery, ["sectionLabel", "label"]),
          items: readArray<Record<string, unknown>>(gallery, ["items", "gallery"]),
          headingStyle: gallery.headingStyle,
          sectionStyle: getSectionStyleValue(gallery),
          outerSectionStyle: getSectionStyleValue(gallery, "outerSectionStyle"),
        },
        reviews: {
          blockId: reviewsBlock?.id,
          heading: readString(reviews, ["heading", "title"]),
          sectionLabel: readString(reviews, ["sectionLabel", "label"]),
          items: readArray<Record<string, unknown>>(reviews, ["items", "reviews"]),
          headingStyle: reviews.headingStyle,
          sectionStyle: getSectionStyleValue(reviews),
          outerSectionStyle: getSectionStyleValue(reviews, "outerSectionStyle"),
        },
        contact: {
          blockId: contactBlock?.id,
          ...buildContactFormConfig(contact),
          heading: contactHeading,
          description: contactDescription,
          subheading: contactDescription,
          sectionLabel: readString(contact, ["sectionLabel", "label"]),
          buttonLabel: contactButton,
          primaryCtaText: contactButton,
          ctaText: contactButton,
          phoneLabel: readString(contact, ["phoneLabel"], "Call us"),
          emailLabel: readString(contact, ["emailLabel"], "Email"),
          addressLabel: readString(contact, ["addressLabel"], "Visit"),
          phone: readString(contact, ["phone"]),
          email: readString(contact, ["email"]),
          address: readString(contact, ["address"]),
          headingStyle: contact.headingStyle,
          descriptionStyle: contact.descriptionStyle || contact.subheadingStyle || contact.bodyStyle,
          buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
          innerBlocks: overlayContactInnerBlocks(
            contact,
            Array.isArray(contact.innerBlocks) ? contact.innerBlocks : [],
          ),
          sectionStyle: getSectionStyleValue(contact),
          outerSectionStyle: getSectionStyleValue(contact, "outerSectionStyle"),
        },
        campus: {
          blockId: campusBlock?.id,
          heading: readString(campus, ["heading", "title"]),
          description: readString(campus, ["description", "subheading", "body"]),
          sectionLabel: readString(campus, ["sectionLabel", "label"]),
          campusName: readString(campus, ["campusName", "name"]),
          mapAddress: readString(campus, ["mapAddress", "address"]),
          headingStyle: campus.headingStyle,
          descriptionStyle: campus.descriptionStyle || campus.subheadingStyle,
          sectionStyle: getSectionStyleValue(campus),
          outerSectionStyle: getSectionStyleValue(campus, "outerSectionStyle"),
        },
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
        extraBlocks,
      },
    };
  }

  if (templateId === "gardening") {
    const heroBlock = findSectionBlock(templateId, pages, "hero");
    const aboutBlock = findSectionBlock(templateId, pages, "about");
    const portfolioBlock = findSectionBlock(templateId, pages, "portfolio");
    const servicesBlock = findSectionBlock(templateId, pages, "services");
    const testimonialsBlock = findSectionBlock(
      templateId,
      pages,
      "testimonials",
    );
    const contactBlock = findSectionBlock(templateId, pages, "contact");
    const claimedIds = new Set<string | number | undefined>(
      [heroBlock?.id, aboutBlock?.id, portfolioBlock?.id, servicesBlock?.id, testimonialsBlock?.id, contactBlock?.id].filter((v) => v !== undefined),
    );
    const extraBlocks = getOrderedBlocksForHomePage(pages).filter(
      (block) => !claimedIds.has(block.id),
    );
    const hero = getSectionContent("hero");
    const about = getSectionContent("about");
    const portfolio = getSectionContent("portfolio");
    const services = getSectionContent("services");
    const testimonials = getSectionContent("testimonials");
    const contact = getSectionContent("contact");
    const serviceItems = readArray<Record<string, unknown>>(services, [
      "features",
      "items",
    ]);
    const contactHeading = readString(
      contact,
      ["heading", "title"],
      "Let's talk about your space.",
    );
    const contactDescription = readString(
      contact,
      ["description", "subheading", "body"],
      "",
    );
    const contactButton = readString(
      contact,
      ["buttonLabel", "primaryCtaText", "ctaText"],
      "Contact Us",
    );

    return {
      ...themedBase,
      tagline: readString(
        hero,
        ["heading", "title"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        about,
        ["body", "description", "subheading"],
        String(themedBase.description),
      ),
      features: serviceItems.length
        ? mapFeatureItems(serviceItems)
        : themedBase.features,
      templateContent: {
        hero: {
          blockId: heroBlock?.id,
          heading: readString(hero, ["heading", "title"]),
          subheading: readString(hero, ["subheading", "description", "body"]),
          ctaText: readString(hero, ["ctaText", "primaryCtaText", "buttonLabel"]),
          heroImage: readString(hero, ["heroImage", "image", "imageUrl"]),
          image: readString(hero, ["heroImage", "image", "imageUrl"]),
          headingStyle: hero.headingStyle,
          subheadingStyle: hero.subheadingStyle || hero.descriptionStyle,
          innerBlocks: Array.isArray(hero.innerBlocks) ? hero.innerBlocks : [],
          sectionStyle: getSectionStyleValue(hero),
          outerSectionStyle: getSectionStyleValue(hero, "outerSectionStyle"),
        },
        about: {
          blockId: aboutBlock?.id,
          heading: readString(about, ["heading", "title"]),
          body: readString(about, ["body", "description", "subheading"]),
          buttonLabel: readString(about, ["buttonLabel", "ctaText", "primaryCtaText"]),
          image: readString(about, ["image", "imageUrl"]),
          headingStyle: about.headingStyle || about.titleStyle,
          bodyStyle: about.bodyStyle || about.descriptionStyle,
          innerBlocks: Array.isArray(about.innerBlocks) ? about.innerBlocks : [],
          sectionStyle: getSectionStyleValue(about),
          outerSectionStyle: getSectionStyleValue(about, "outerSectionStyle"),
        },
        portfolio: {
          blockId: portfolioBlock?.id,
          heading: readString(portfolio, ["heading", "title"]),
          description: readString(portfolio, ["description", "subheading", "body"]),
          headingStyle: portfolio.headingStyle,
          sectionStyle: getSectionStyleValue(portfolio),
          outerSectionStyle: getSectionStyleValue(portfolio, "outerSectionStyle"),
        },
        services: {
          blockId: servicesBlock?.id,
          heading: readString(services, ["heading", "title"]),
          items: serviceItems,
          headingStyle: services.headingStyle,
          descriptionStyle: services.descriptionStyle || services.subheadingStyle,
          innerBlocks: Array.isArray(services.innerBlocks) ? services.innerBlocks : [],
          sectionStyle: getSectionStyleValue(services),
          outerSectionStyle: getSectionStyleValue(services, "outerSectionStyle"),
        },
        testimonials: {
          blockId: testimonialsBlock?.id,
          heading: readString(testimonials, ["heading", "title"]),
          headingStyle: testimonials.headingStyle,
          sectionStyle: getSectionStyleValue(testimonials),
          outerSectionStyle: getSectionStyleValue(testimonials, "outerSectionStyle"),
        },
        contact: {
          blockId: contactBlock?.id,
          ...buildContactFormConfig(contact),
          heading: contactHeading,
          description: contactDescription,
          subheading: contactDescription,
          buttonLabel: contactButton,
          primaryCtaText: contactButton,
          ctaText: contactButton,
          headingStyle: contact.headingStyle,
          descriptionStyle: contact.descriptionStyle || contact.subheadingStyle || contact.bodyStyle,
          buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
          innerBlocks: overlayContactInnerBlocks(
            contact,
            Array.isArray(contact.innerBlocks) ? contact.innerBlocks : [],
          ),
          sectionStyle: getSectionStyleValue(contact),
          outerSectionStyle: getSectionStyleValue(contact, "outerSectionStyle"),
        },
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
        extraBlocks,
      },
    };
  }

  if (templateId === "restaurant") {
    const heroBlock = findSectionBlock(templateId, pages, "hero");
    const storyBlock = findSectionBlock(templateId, pages, "story");
    const locationBlock = findSectionBlock(templateId, pages, "location");
    const whyUsBlock = findSectionBlock(templateId, pages, "why-us");
    const reviewsBlock = findSectionBlock(templateId, pages, "reviews");
    const contactBlock = findSectionBlock(templateId, pages, "contact");
    const claimedIds = new Set<string | number | undefined>(
      [heroBlock?.id, storyBlock?.id, locationBlock?.id, whyUsBlock?.id, reviewsBlock?.id, contactBlock?.id].filter((v) => v !== undefined),
    );
    const extraBlocks = getOrderedBlocksForHomePage(pages).filter(
      (block) => !claimedIds.has(block.id),
    );
    const hero = getSectionContent("hero");
    const story = getSectionContent("story");
    const location = getSectionContent("location");
    const whyUs = getSectionContent("why-us");
    const reviews = getSectionContent("reviews");
    const contact = getSectionContent("contact");
    const whyUsItems = readArray<Record<string, unknown>>(whyUs, [
      "features",
      "items",
    ]);
    const contactHeading = readString(
      contact,
      ["heading", "title"],
      "Book your table.",
    );
    const contactDescription = readString(
      contact,
      ["description", "subheading", "body"],
      "",
    );
    const contactButton = readString(
      contact,
      ["buttonLabel", "primaryCtaText", "ctaText"],
      "Reserve Now",
    );

    return {
      ...themedBase,
      tagline: readString(
        hero,
        ["heading", "title"],
        String(themedBase.tagline || themedBase.name),
      ),
      description: readString(
        story,
        ["body", "description", "subheading"],
        String(themedBase.description),
      ),
      features: whyUsItems.length
        ? mapFeatureItems(whyUsItems)
        : themedBase.features,
      templateContent: {
        hero: {
          blockId: heroBlock?.id,
          heading: readString(hero, ["heading", "title"]),
          subheading: readString(hero, ["subheading", "description", "body"]),
          ctaText: readString(hero, ["ctaText", "primaryCtaText", "buttonLabel"]),
          heroImage: readString(hero, ["heroImage", "image", "imageUrl"]),
          image: readString(hero, ["heroImage", "image", "imageUrl"]),
          headingStyle: hero.headingStyle,
          subheadingStyle: hero.subheadingStyle || hero.descriptionStyle,
          innerBlocks: Array.isArray(hero.innerBlocks) ? hero.innerBlocks : [],
          sectionStyle: getSectionStyleValue(hero),
          outerSectionStyle: getSectionStyleValue(hero, "outerSectionStyle"),
        },
        story: {
          blockId: storyBlock?.id,
          heading: readString(story, ["title", "heading"]),
          body: readString(story, ["body", "description", "subheading"]),
          subItems: readArray<Record<string, unknown>>(story, ["subItems"]),
          image: readString(story, ["image", "imageUrl"]),
          headingStyle: story.headingStyle || story.titleStyle,
          bodyStyle: story.bodyStyle || story.descriptionStyle,
          innerBlocks: Array.isArray(story.innerBlocks) ? story.innerBlocks : [],
          sectionStyle: getSectionStyleValue(story),
          outerSectionStyle: getSectionStyleValue(story, "outerSectionStyle"),
        },
        location: {
          blockId: locationBlock?.id,
          heading: readString(location, ["heading", "title"]),
          description: readString(location, ["description", "subheading", "body"]),
          headingStyle: location.headingStyle,
          descriptionStyle: location.descriptionStyle || location.subheadingStyle,
          sectionStyle: getSectionStyleValue(location),
          outerSectionStyle: getSectionStyleValue(location, "outerSectionStyle"),
        },
        whyUs: {
          blockId: whyUsBlock?.id,
          heading: readString(whyUs, ["heading", "title"]),
          description: readString(whyUs, ["description", "subheading", "body"]),
          items: whyUsItems,
          headingStyle: whyUs.headingStyle,
          descriptionStyle: whyUs.descriptionStyle || whyUs.subheadingStyle,
          innerBlocks: Array.isArray(whyUs.innerBlocks) ? whyUs.innerBlocks : [],
          sectionStyle: getSectionStyleValue(whyUs),
          outerSectionStyle: getSectionStyleValue(whyUs, "outerSectionStyle"),
        },
        reviews: {
          blockId: reviewsBlock?.id,
          heading: readString(reviews, ["heading", "title"]),
          headingStyle: reviews.headingStyle,
          sectionStyle: getSectionStyleValue(reviews),
          outerSectionStyle: getSectionStyleValue(reviews, "outerSectionStyle"),
        },
        contact: {
          blockId: contactBlock?.id,
          ...buildContactFormConfig(contact),
          heading: contactHeading,
          description: contactDescription,
          subheading: contactDescription,
          buttonLabel: contactButton,
          primaryCtaText: contactButton,
          ctaText: contactButton,
          headingStyle: contact.headingStyle,
          descriptionStyle: contact.descriptionStyle || contact.subheadingStyle || contact.bodyStyle,
          buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
          innerBlocks: overlayContactInnerBlocks(
            contact,
            Array.isArray(contact.innerBlocks) ? contact.innerBlocks : [],
          ),
          sectionStyle: getSectionStyleValue(contact),
          outerSectionStyle: getSectionStyleValue(contact, "outerSectionStyle"),
        },
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
        extraBlocks,
      },
    };
  }

  if (
    templateId === "portfolio-agency" ||
    templateId === "portfolio-creative" ||
    templateId === "portfolio-photo-studio"
  ) {
    const heroBlock = findSectionBlock(templateId, pages, "hero");
    const servicesBlock = findSectionBlock(templateId, pages, "services");
    const aboutBlock = findSectionBlock(templateId, pages, "about");
    const contactBlock = findSectionBlock(templateId, pages, "contact");
    const hero = getSectionContent("hero");
    const services = getSectionContent("services");
    const about = getSectionContent("about");
    const contact = getSectionContent("contact");
    const serviceItems = readArray<Record<string, unknown>>(services, ["features", "items"]);
    const contactHeading = readString(contact, ["heading", "title"], "Let's build something together.");
    const contactDescription = readString(contact, ["description", "subheading", "body"], "");
    const contactButton = readString(contact, ["buttonLabel", "primaryCtaText", "ctaText"], "Get in touch");

    return {
      ...themedBase,
      tagline: readString(hero, ["heading", "title"], String(themedBase.tagline || themedBase.name)),
      description: readString(
        about,
        ["body", "description", "subheading"],
        readString(hero, ["subheading", "description", "body"], String(themedBase.description)),
      ),
      services: serviceItems.length
        ? serviceItems.map((item) => ({
            name: readString(item, ["title"], "Service"),
            description: readString(item, ["description"], ""),
          }))
        : themedBase.services,
      templateContent: {
        hero: {
          blockId: heroBlock?.id,
          heading: readString(hero, ["heading", "title"]),
          subheading: readString(hero, ["subheading", "description", "body"]),
          ctaText: readString(hero, ["ctaText", "buttonText", "buttonLabel"]),
          headingStyle: hero.headingStyle,
          subheadingStyle: hero.subheadingStyle || hero.descriptionStyle,
          sectionStyle: getSectionStyleValue(hero),
        },
        services: {
          blockId: servicesBlock?.id,
          heading: readString(services, ["heading", "title"]),
          items: serviceItems,
          headingStyle: services.headingStyle,
          sectionStyle: getSectionStyleValue(services),
        },
        about: {
          blockId: aboutBlock?.id,
          heading: readString(about, ["heading", "title"]),
          body: readString(about, ["body", "description", "subheading"]),
          headingStyle: about.headingStyle || about.titleStyle,
          bodyStyle: about.bodyStyle || about.descriptionStyle,
          sectionStyle: getSectionStyleValue(about),
        },
        contact: {
          blockId: contactBlock?.id,
          ...buildContactFormConfig(contact),
          heading: contactHeading,
          description: contactDescription,
          subheading: contactDescription,
          buttonLabel: contactButton,
          primaryCtaText: contactButton,
          ctaText: contactButton,
          headingStyle: contact.headingStyle,
          descriptionStyle: contact.descriptionStyle || contact.subheadingStyle || contact.bodyStyle,
          buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
          sectionStyle: getSectionStyleValue(contact),
        },
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
      },
    };
  }

  if (templateId === "plumbing") {
    const heroBlock = findSectionBlock(templateId, pages, "hero");
    const aboutBlock = findSectionBlock(templateId, pages, "about");
    const servicesBlock = findSectionBlock(templateId, pages, "services");
    const contactBlock = findSectionBlock(templateId, pages, "contact");
    const hero = getSectionContent("hero");
    const about = getSectionContent("about");
    const services = getSectionContent("services");
    const contact = getSectionContent("contact");
    const serviceItems = readArray<Record<string, unknown>>(services, ["features", "items"]);
    const contactHeading = readString(contact, ["heading", "title"], "Need a plumber?");
    const contactDescription = readString(contact, ["description", "subheading", "body"], "");
    const contactButton = readString(contact, ["buttonLabel", "primaryCtaText", "ctaText"], "Book a visit");

    return {
      ...themedBase,
      tagline: readString(hero, ["heading", "title"], String(themedBase.tagline || themedBase.name)),
      description: readString(
        about,
        ["body", "description", "subheading"],
        readString(hero, ["subheading", "description", "body"], String(themedBase.description)),
      ),
      services: serviceItems.length
        ? serviceItems.map((item) => ({
            name: readString(item, ["title"], "Service"),
            description: readString(item, ["description"], ""),
          }))
        : themedBase.services,
      templateContent: {
        hero: {
          blockId: heroBlock?.id,
          heading: readString(hero, ["heading", "title"]),
          subheading: readString(hero, ["subheading", "description", "body"]),
          ctaText: readString(hero, ["ctaText", "buttonText", "buttonLabel"], "Book Now"),
          headingStyle: hero.headingStyle,
          subheadingStyle: hero.subheadingStyle || hero.descriptionStyle,
          sectionStyle: getSectionStyleValue(hero),
        },
        about: {
          blockId: aboutBlock?.id,
          heading: readString(about, ["heading", "title"]),
          body: readString(about, ["body", "description", "subheading"]),
          headingStyle: about.headingStyle || about.titleStyle,
          bodyStyle: about.bodyStyle || about.descriptionStyle,
          sectionStyle: getSectionStyleValue(about),
        },
        services: {
          blockId: servicesBlock?.id,
          heading: readString(services, ["heading", "title"]),
          items: serviceItems,
          headingStyle: services.headingStyle,
          sectionStyle: getSectionStyleValue(services),
        },
        contact: {
          blockId: contactBlock?.id,
          ...buildContactFormConfig(contact),
          heading: contactHeading,
          description: contactDescription,
          subheading: contactDescription,
          buttonLabel: contactButton,
          primaryCtaText: contactButton,
          ctaText: contactButton,
          headingStyle: contact.headingStyle,
          descriptionStyle: contact.descriptionStyle || contact.subheadingStyle || contact.bodyStyle,
          buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
          sectionStyle: getSectionStyleValue(contact),
        },
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
      },
    };
  }

  if (templateId === "blog-premium") {
    const homeBlock = findSectionBlock(templateId, pages, "home");
    const aboutBlock = findSectionBlock(templateId, pages, "about");
    const articlesBlock = findSectionBlock(templateId, pages, "articles");
    const contactBlock = findSectionBlock(templateId, pages, "contact");
    const home = getSectionContent("home");
    const about = getSectionContent("about");
    const articles = getSectionContent("articles");
    const contact = getSectionContent("contact");
    const featureItems = readArray<Record<string, unknown>>(articles, [
      "features",
      "items",
    ]);
    const staticPosts = readArray<Record<string, unknown>>(articles, [
      "staticPosts",
      "posts",
      "insights",
    ]);
    const derivedPosts = staticPosts.length
      ? mapPosts(staticPosts, themedBase.blogPosts || [])
      : featureItems.length
        ? mapPosts(featureItems, themedBase.blogPosts || [])
        : themedBase.blogPosts || [];
    const contactHeading = readString(
      contact,
      ["heading", "title"],
      "Contact Us",
    );
    const contactDescription = readString(
      contact,
      ["description", "subheading", "body"],
      "",
    );
    const contactButton = readString(
      contact,
      ["buttonLabel", "primaryCtaText", "ctaText"],
      "Contact",
    );

    return {
      ...themedBase,
      description: readString(
        about,
        ["body", "description", "subheading"],
        readString(
          home,
          ["subheading", "heroDescription", "description", "body"],
          String(themedBase.description),
        ),
      ),
      blogPosts: derivedPosts,
      templateContent: {
        home: {
          blockId: homeBlock?.id,
          heroHeading: readString(home, ["heading", "heroHeading", "title"]),
          heroDescription: readString(home, [
            "subheading",
            "heroDescription",
            "description",
            "body",
          ]),
          heroCtaText: readString(home, [
            "ctaText",
            "heroCtaText",
            "buttonText",
            "buttonLabel",
          ]),
          headingStyle: home.headingStyle || home.titleStyle,
          descriptionStyle:
            home.descriptionStyle || home.subheadingStyle || home.bodyStyle,
          ctaTextStyle: home.ctaTextStyle || home.buttonTextStyle,
          sectionStyle: getSectionStyleValue(home),
        },
        articles: {
          blockId: articlesBlock?.id,
          heading: readString(articles, ["heading", "title"]),
          headingStyle: articles.headingStyle || articles.titleStyle,
          sectionStyle: getSectionStyleValue(articles),
        },
        about: {
          blockId: aboutBlock?.id,
          heading: readString(about, ["heading", "title"]),
          body: readString(about, ["body", "description", "subheading"]),
          headingStyle: about.headingStyle || about.titleStyle,
          descriptionStyle:
            about.descriptionStyle || about.bodyStyle || about.subheadingStyle,
          sectionStyle: getSectionStyleValue(about),
        },
        contact: {
          blockId: contactBlock?.id,
          ...buildContactFormConfig(contact),
          heading: contactHeading,
          description: contactDescription,
          buttonLabel: contactButton,
          headingStyle: contact.headingStyle || contact.titleStyle,
          descriptionStyle:
            contact.descriptionStyle ||
            contact.subheadingStyle ||
            contact.bodyStyle,
          buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
          sectionStyle: getSectionStyleValue(contact),
        },
      },
    };
  }

  const homeBlock = findSectionBlock(templateId, pages, "home");
  const articlesBlock = findSectionBlock(templateId, pages, "articles");
  const contactBlock = findSectionBlock(templateId, pages, "contact");
  const home = getSectionContent("home");
  const articles = getSectionContent("articles");
  const contact = getSectionContent("contact");
  const featureItems = readArray<Record<string, unknown>>(articles, [
    "features",
    "items",
  ]);
  const staticPosts = readArray<Record<string, unknown>>(articles, [
    "staticPosts",
    "posts",
    "insights",
  ]);
  const derivedPosts = staticPosts.length
    ? mapPosts(staticPosts, themedBase.blogPosts || [])
    : featureItems.length
      ? mapPosts(featureItems, themedBase.blogPosts || [])
      : themedBase.blogPosts || [];
  const contactHeading = readString(
    contact,
    ["heading", "title"],
    "Subscribe for updates",
  );
  const contactDescription = readString(
    contact,
    ["description", "subheading", "body"],
    "",
  );
  const contactButton = readString(
    contact,
    ["buttonLabel", "primaryCtaText", "ctaText"],
    "Subscribe",
  );

  return {
    ...themedBase,
    description: readString(
      home,
      ["subheading", "heroDescription", "description", "body"],
      String(themedBase.description),
    ),
    blogPosts: derivedPosts,
    templateContent: {
      home: {
        blockId: homeBlock?.id,
        heroHeading: readString(home, ["heading", "heroHeading", "title"]),
        heroDescription: readString(home, [
          "subheading",
          "heroDescription",
          "description",
          "body",
        ]),
        heroCtaText: readString(home, [
          "ctaText",
          "heroCtaText",
          "buttonText",
          "buttonLabel",
        ]),
        headingStyle: home.headingStyle || home.titleStyle,
        descriptionStyle:
          home.descriptionStyle || home.subheadingStyle || home.bodyStyle,
        ctaTextStyle: home.ctaTextStyle || home.buttonTextStyle,
        sectionStyle: getSectionStyleValue(home),
      },
      articles: {
        blockId: articlesBlock?.id,
        heading: readString(articles, ["heading", "title"]),
        headingStyle: articles.headingStyle || articles.titleStyle,
        sectionStyle: getSectionStyleValue(articles),
      },
      contact: {
        blockId: contactBlock?.id,
        ...buildContactFormConfig(contact),
        heading: contactHeading,
        description: contactDescription,
        buttonLabel: contactButton,
        headingStyle: contact.headingStyle || contact.titleStyle,
        descriptionStyle:
          contact.descriptionStyle ||
          contact.subheadingStyle ||
          contact.bodyStyle,
        buttonTextStyle: contact.buttonTextStyle || contact.ctaTextStyle,
        sectionStyle: getSectionStyleValue(contact),
      },
    },
  };
};

export const buildTemplatePreviewBusinessData = (
  templateId: string,
  website: WebsiteLike,
  pages: TemplateEditorPage[],
  activePageId?: string | number | null,
): BusinessData | null => {
  const result = buildTemplatePreviewBusinessDataImpl(templateId, website, pages);
  if (!result) return null;

  const activePage =
    (activePageId !== undefined && activePageId !== null
      ? pages.find((page) => String(page.id) === String(activePageId))
      : undefined) ||
    pages.find((page) => page.isHome) ||
    pages.find((page) => page.path === "/") ||
    pages[0];
  const activeBlocks = Array.isArray(activePage?.blocks)
    ? activePage.blocks
    : [];
  const schemaPage =
    (TEMPLATE_PAGE_SCHEMAS[templateId] || []).find((page) =>
      activePage?.isHome
        ? page.isHome
        : page.path === activePage?.path,
    ) ||
    (TEMPLATE_PAGE_SCHEMAS[templateId] || []).find((page) => page.isHome) ||
    (TEMPLATE_PAGE_SCHEMAS[templateId] || [])[0];
  const sectionVisibility: Record<string, boolean> = {};
  const blockVisibility: Record<string, boolean> = {};

  (schemaPage?.sections || []).forEach((section) => {
    sectionVisibility[section.key] = false;
  });

  activeBlocks.forEach((block) => {
    blockVisibility[String(block.id)] = block.isVisible !== false;
  });

  const activeSectionMap = activePage
    ? getTemplateSectionMap(templateId, [activePage])
    : new Map<string, TemplateEditorBlock>();
  activeSectionMap.forEach((block, sectionKey) => {
    sectionVisibility[sectionKey] = block.isVisible !== false;
  });

  // Older Company Executive sites predate the independent Process Details
  // block. Render its schema-backed default beside the visible Process block;
  // newly separated blocks still use their own visibility when present.
  if (
    templateId === "company-executive" &&
    !activeSectionMap.has("process-details")
  ) {
    const legacyProcessBlock = activeSectionMap.get("process");
    if (legacyProcessBlock) {
      sectionVisibility["process-details"] =
        legacyProcessBlock?.isVisible !== false;
    }
  }

  const persistedContainerStyleOverrides: Record<
    string,
    Record<string, unknown>
  > = {};
  pages.forEach((page) => {
    (page.blocks || []).forEach((block) => {
      const containerStyles = block.content?.containerStyles;
      if (
        containerStyles &&
        (typeof containerStyles !== "object" || Array.isArray(containerStyles))
      ) {
        // Ignore malformed container style maps; static styles below are still valid.
      } else if (containerStyles) {
        Object.entries(containerStyles).forEach(([containerId, style]) => {
          if (style && typeof style === "object" && !Array.isArray(style)) {
            persistedContainerStyleOverrides[
              `${block.id}::containerStyles::${containerId}`
            ] = style as Record<string, unknown>;
          }
        });
      }
      const staticStyles = block.content?.staticStyles;
      if (
        staticStyles &&
        typeof staticStyles === "object" &&
        !Array.isArray(staticStyles)
      ) {
        Object.entries(staticStyles).forEach(([targetKey, style]) => {
          if (
            style &&
            typeof style === "object" &&
            !Array.isArray(style) &&
            String(targetKey).includes("::")
          ) {
            persistedContainerStyleOverrides[
              `${block.id}::${String(targetKey)}`
            ] = style as Record<string, unknown>;
          }
        });
      }
    });
  });

  const resultWithContainerStyles = {
    ...result,
    templateContent: {
      ...((result.templateContent as Record<string, unknown>) || {}),
      __editorStaticStyleOverrides: persistedContainerStyleOverrides,
      // blockId -> { fieldPath: true } for elements deleted via the editor.
      // Renderers use isBlockElementHidden(data.templateContent.__hiddenElements,
      // blockId, path) to drop deleted optional elements everywhere (editor
      // canvas, Live Preview, and after refresh).
      __hiddenElements: buildHiddenElementsMap(pages),
      // blockId -> { containerId: true } for whole divs/containers deleted via
      // the editor (keyed by the container's stable data-static-id).
      __hiddenContainers: buildHiddenContainersMap(pages),
      // The active page block list is authoritative. Template components may
      // still render seeded fallback markup for a missing block; TemplateEngine
      // uses this map to hide deleted/hidden section roots instead of allowing
      // those defaults to reappear in the canvas or public renderer.
      __editorSectionVisibility: sectionVisibility,
      __editorBlockVisibility: blockVisibility,
      __editorSectionVisibilityAuthoritative: Boolean(activePage),
      // Multi-page template components use this editor-only route hint to
      // render the selected persisted page's dedicated composition instead of
      // inferring Home from the dashboard URL.
      __activePagePath: activePage?.path || "/",
    },
  } as BusinessData;

  const navbarBlock = findSectionBlock(templateId, pages, "navbar");
  if (!navbarBlock) return resultWithContainerStyles;

  const existing = (resultWithContainerStyles.templateContent as Record<string, unknown> | undefined)?.navbar;
  if (existing) return resultWithContainerStyles;

  const navbarRaw = findSectionContent(templateId, pages, "navbar");
  return {
    ...resultWithContainerStyles,
    templateContent: {
      ...(resultWithContainerStyles.templateContent as Record<string, unknown> || {}),
      navbar: buildNavbarContent(navbarBlock, navbarRaw),
    },
  };
};


