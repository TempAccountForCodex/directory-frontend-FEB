import type {
  BusinessData,
  BlogPost,
  Feature,
  Review,
} from "../landingTemplates/types/BusinessData";
import { buildFrontendTemplateBusinessData } from "./frontendTemplateSiteData";

export type TemplateThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
  headingFont?: string;
  bodyFont?: string;
  paletteId?: string;
  fontPackId?: string;
};

type WebsiteLike = {
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
  "education",
  "gardening",
  "restaurant",
]);

const TEMPLATE_THEME_CONTENT_KEY = "__templateTheme";

const FALLBACK_SECTION_KEY_MAP: Record<string, Record<string, string>> = {
  "company-executive": {
    HERO: "overview",
    ABOUT: "about",
    FEATURES: "why-us",
    PROCESS: "process",
    CONTACT: "contact",
  },
};

const getBlockTypeKey = (
  block: TemplateEditorBlock | RawTemplateBlock | null | undefined,
): string => {
  if (!block) {
    return "";
  }

  const rawType = block.blockType || ("type" in block ? block.type : "") || "";
  return typeof rawType === "string" ? rawType.trim().toUpperCase() : "";
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

const postsToFeatures = (posts: BlogPost[] = []) =>
  posts.slice(0, 6).map((post, index) => ({
    icon: post.category || `Article ${index + 1}`,
    title: post.title,
    description: post.description || "",
  }));

const featuresToFeatureItems = (features: Feature[] = []) =>
  features.slice(0, 6).map((feature, index) => ({
    icon: feature.icon || `feature-${index + 1}`,
    title: feature.title,
    description: feature.description,
  }));

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

const buildTemplateBlockContent = (
  section: TemplateSectionSeed,
  data: BusinessData,
): Record<string, unknown> => ({
  editorLabel: section.label,
  editorSection: section.key,
  ...section.buildContent(data),
});

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
            features: featuresToFeatureItems(data.features || []),
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
            features: featuresToFeatureItems(data.features || []),
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
          key: "overview",
          label: "Overview",
          blockType: "HERO",
          buildContent: (data) => ({
            heading: data.tagline || "Delivering Trusted Solutions",
            subheading: data.description || "",
            ctaText: "Contact Us",
            ctaLink: "#contact",
          }),
        },
        {
          key: "about",
          label: "About",
          blockType: "TEXT",
          buildContent: (data) => ({
            title:
              "Driving innovation and excellence for corporate success worldwide.",
            body: data.description || data.tagline || "",
          }),
        },
        {
          key: "why-us",
          label: "Why Us",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Built for business trust, clarity, and conversion.",
            description: data.description || data.tagline || "",
            features: featuresToFeatureItems(data.features || []).length
              ? featuresToFeatureItems(data.features || [])
              : companyStatsToItems(data.stats),
          }),
        },
        {
          key: "process",
          label: "Process",
          blockType: "FEATURES",
          buildContent: () => ({
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
          key: "contact",
          label: "Contact",
          blockType: "CONTACT",
          buildContent: (data) => ({
            heading: "Drop us a line.",
            description:
              data.contact.address ||
              data.contact.email ||
              data.contact.phone ||
              data.description ||
              "",
            buttonLabel: "Send message",
            primaryCtaText: "Contact Us",
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
            features: featuresToFeatureItems(data.features || []),
          }),
        },
        {
          key: "highlights",
          label: "Why Choose Us",
          blockType: "FEATURES",
          buildContent: (data) => ({
            heading: "Support that feels personal, structured, and ambitious.",
            description: data.description || data.tagline || "",
          }),
        },
        {
          key: "gallery",
          label: "Gallery",
          blockType: "GALLERY",
          buildContent: () => ({
            heading: "Learning spaces that feel active and inspiring.",
          }),
        },
        {
          key: "reviews",
          label: "Reviews",
          blockType: "REVIEWS",
          buildContent: () => ({
            heading: "Trusted by families who want more than tutoring.",
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
          blockType: "LOCATION",
          buildContent: (data) => ({
            heading: "Find us, visit us, and talk with our team.",
            description: data.contact.address || data.location?.address || "",
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
            features: featuresToFeatureItems(data.features || []),
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
          blockType: "LOCATION",
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
      localOnly: true,
      blocks: rawBlocks.map((block, blockIndex) => {
        const typedBlock = (block || {}) as RawTemplateBlock;
        return {
          id: String(
            typedBlock.id ?? `${typedPage.id ?? pageIndex}-block-${blockIndex}`,
          ),
          blockType: typedBlock.blockType || typedBlock.type || "",
          content: typedBlock.content || {},
          sortOrder: typedBlock.sortOrder ?? blockIndex,
          isVisible: typedBlock.isVisible ?? true,
          localOnly: true,
        };
      }),
    };
  });
};

const getTemplateSectionKeys = (templateId: string): string[] =>
  (TEMPLATE_PAGE_SCHEMAS[templateId] || []).flatMap((page) =>
    page.sections.map((section) => section.key),
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
): string[] =>
  getOrderedBlocksForHomePage(pages)
    .map((block) => getCompatibleSectionKey(templateId, block))
    .filter(Boolean);

const getOrderedPlanSectionsForHomePage = (pages: TemplateEditorPage[]) =>
  getOrderedBlocksForHomePage(pages)
    .filter((block) => {
      const sectionKey =
        typeof block.content?.editorSection === "string"
          ? block.content.editorSection.trim()
          : "";
      const blockType = getBlockTypeKey(block);
      return (
        blockType === "PLAN" ||
        blockType === "SECTION" ||
        sectionKey.startsWith("plan-")
      );
    })
    .map((block, index) => {
      const content = block.content || {};
      const sectionKey =
        typeof content.editorSection === "string" &&
        content.editorSection.trim()
          ? content.editorSection.trim()
          : `plan-${index + 1}`;

      return {
        blockId: block.id,
        sectionKey,
        label: readString(content, ["editorLabel", "heading"], "Plan Section"),
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
        innerBlocks: Array.isArray(content.innerBlocks)
          ? content.innerBlocks
          : [],
        sectionStyle: getSectionStyleValue(content),
        outerSectionStyle: getSectionStyleValue(content, "outerSectionStyle"),
      };
    });

const getOrderedSectionContentMap = (
  templateId: string,
  pages: TemplateEditorPage[],
): Map<string, Record<string, unknown>> => {
  const orderedBlocks = getOrderedBlocksForHomePage(pages);
  const orderedContentMap = new Map<string, Record<string, unknown>>();
  const templateSlots = new Set(
    (TEMPLATE_PAGE_SCHEMAS[templateId] || []).flatMap((page) =>
      page.sections.map((section) => section.key),
    ),
  );

  orderedBlocks.forEach((block) => {
    const sectionKey =
      typeof block.content?.editorSection === "string"
        ? block.content.editorSection.trim()
        : getCompatibleSectionKey(templateId, block);

    if (
      !sectionKey ||
      !templateSlots.has(sectionKey) ||
      orderedContentMap.has(sectionKey)
    ) {
      return;
    }

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
  getAllBlocks(pages).forEach((block) => {
    const sectionKey = getCompatibleSectionKey(templateId, block);
    if (sectionKey) {
      map.set(sectionKey, block);
    }
  });
  return map;
};

const hasCompatiblePersistedTemplateData = (
  templateId: string,
  pages: TemplateEditorPage[],
): boolean => {
  const expectedKeys = getTemplateSectionKeys(templateId);
  if (!expectedKeys.length) {
    return false;
  }

  const sectionMap = getTemplateSectionMap(templateId, pages);
  return expectedKeys.every((key) => sectionMap.has(key));
};

const mergeTemplateBlockContent = (
  seededContent: Record<string, unknown>,
  persistedContent: Record<string, unknown>,
): Record<string, unknown> => {
  const persistedTheme = persistedContent?.[TEMPLATE_THEME_CONTENT_KEY];
  if (
    persistedTheme &&
    typeof persistedTheme === "object" &&
    !Array.isArray(persistedTheme)
  ) {
    return {
      ...seededContent,
      ...persistedContent,
      [TEMPLATE_THEME_CONTENT_KEY]: {
        ...(seededContent[TEMPLATE_THEME_CONTENT_KEY] as
          | Record<string, unknown>
          | undefined),
        ...(persistedTheme as Record<string, unknown>),
      },
    };
  }

  return {
    ...seededContent,
    ...persistedContent,
  };
};

const hydrateSeededPages = (
  templateId: string,
  seededPages: TemplateEditorPage[],
  persistedPages: TemplateEditorPage[],
): TemplateEditorPage[] => {
  if (!hasCompatiblePersistedTemplateData(templateId, persistedPages)) {
    return seededPages;
  }

  const persistedPageMap = new Map(
    persistedPages.map((page) => [getPageStorageKey(page), page]),
  );
  const persistedSections = getTemplateSectionMap(templateId, persistedPages);
  const templateSectionKeys = new Set(getTemplateSectionKeys(templateId));

  return seededPages.map((page) => {
    const pageKey = getPageStorageKey(page);
    const persistedPage = persistedPageMap.get(pageKey);
    const customPersistedBlocks = (persistedPage?.blocks || []).filter(
      (block) => {
        const sectionKey =
          typeof block.content?.editorSection === "string"
            ? block.content.editorSection.trim()
            : "";

        return !!sectionKey && !templateSectionKeys.has(sectionKey);
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
        sortOrder: persisted.sortOrder ?? block.sortOrder,
        content: mergeTemplateBlockContent(
          block.content,
          persisted.content || {},
        ),
        isVisible: persisted.isVisible ?? block.isVisible,
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
      sortOrder: persistedPage?.sortOrder ?? page.sortOrder,
      isPublished: persistedPage?.isPublished ?? page.isPublished,
      blocks,
    };
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

  return hydrateSeededPages(templateId, seededPages, persistedPages);
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

const readArray = <T>(source: Record<string, unknown>, keys: string[]): T[] => {
  for (const key of keys) {
    const value = source?.[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }
  return [];
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

export const buildTemplatePreviewBusinessData = (
  templateId: string,
  website: WebsiteLike,
  pages: TemplateEditorPage[],
): BusinessData | null => {
  const base = buildFrontendTemplateBusinessData(templateId, {
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

  const themeSettings =
    readTemplateThemeSettingsFromPages(pages) ||
    getThemeSettingsFromUnknown(website.templateSnapshot?.themeSettings) ||
    undefined;

  const themedBase: BusinessData = {
    ...base,
    primaryColor: themeSettings?.primaryColor || base.primaryColor,
    secondaryColor: themeSettings?.secondaryColor || base.secondaryColor,
    themeSettings: themeSettings
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

  if (templateId === "company-executive") {
    const overviewBlock = findSectionBlock(templateId, pages, "overview");
    const aboutBlock = findSectionBlock(templateId, pages, "about");
    const whyUsBlock = findSectionBlock(templateId, pages, "why-us");
    const processBlock = findSectionBlock(templateId, pages, "process");
    const contactBlock = findSectionBlock(templateId, pages, "contact");
    const overview = getSectionContent("overview");
    const about = getSectionContent("about");
    const whyUs = getSectionContent("why-us");
    const process = getSectionContent("process");
    const contact = getSectionContent("contact");
    const customSections = getOrderedPlanSectionsForHomePage(pages);

    const whyUsItems = readArray<Record<string, unknown>>(whyUs, [
      "features",
      "items",
    ]);
    const processItems = readArray<Record<string, unknown>>(process, [
      "features",
      "items",
    ]);
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
        home: {
          blockId: overviewBlock?.id,
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
          heading: readString(about, ["title", "heading"]),
          body: readString(about, ["body", "description", "subheading"]),
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
          items: processItems,
          headingStyle: process.headingStyle,
          subheadingStyle: process.subheadingStyle || process.descriptionStyle,
          ctaTextStyle: process.ctaTextStyle || process.buttonTextStyle,
          innerBlocks: Array.isArray(process.innerBlocks)
            ? process.innerBlocks
            : [],
          sectionStyle: getSectionStyleValue(process),
          outerSectionStyle: getSectionStyleValue(process, "outerSectionStyle"),
        },
        testimonials: {
          heading: readString(process, ["heading", "title"]),
          items: processItems,
        },
        contact: {
          blockId: contactBlock?.id,
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
          innerBlocks: Array.isArray(contact.innerBlocks)
            ? contact.innerBlocks
            : [],
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
    const hero = getSectionContent("hero");
    const programs = getSectionContent("programs");
    const highlights = getSectionContent("highlights");
    const gallery = getSectionContent("gallery");
    const reviews = getSectionContent("reviews");
    const contact = getSectionContent("contact");
    const campus = getSectionContent("campus");

    return {
      ...themedBase,
      templateContent: {
        hero: {
          blockId: heroBlock?.id,
          sectionStyle: getSectionStyleValue(hero),
        },
        programs: {
          blockId: programsBlock?.id,
          sectionStyle: getSectionStyleValue(programs),
        },
        highlights: {
          blockId: highlightsBlock?.id,
          sectionStyle: getSectionStyleValue(highlights),
        },
        gallery: {
          blockId: galleryBlock?.id,
          sectionStyle: getSectionStyleValue(gallery),
        },
        reviews: {
          blockId: reviewsBlock?.id,
          sectionStyle: getSectionStyleValue(reviews),
        },
        contact: {
          blockId: contactBlock?.id,
          sectionStyle: getSectionStyleValue(contact),
        },
        campus: {
          blockId: campusBlock?.id,
          sectionStyle: getSectionStyleValue(campus),
        },
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
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
    const hero = getSectionContent("hero");
    const about = getSectionContent("about");
    const portfolio = getSectionContent("portfolio");
    const services = getSectionContent("services");
    const testimonials = getSectionContent("testimonials");
    const contact = getSectionContent("contact");

    return {
      ...themedBase,
      templateContent: {
        hero: {
          blockId: heroBlock?.id,
          sectionStyle: getSectionStyleValue(hero),
        },
        about: {
          blockId: aboutBlock?.id,
          sectionStyle: getSectionStyleValue(about),
        },
        portfolio: {
          blockId: portfolioBlock?.id,
          sectionStyle: getSectionStyleValue(portfolio),
        },
        services: {
          blockId: servicesBlock?.id,
          sectionStyle: getSectionStyleValue(services),
        },
        testimonials: {
          blockId: testimonialsBlock?.id,
          sectionStyle: getSectionStyleValue(testimonials),
        },
        contact: {
          blockId: contactBlock?.id,
          sectionStyle: getSectionStyleValue(contact),
        },
        sectionOrder: getOrderedSectionKeysForHomePage(templateId, pages),
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
    const hero = getSectionContent("hero");
    const story = getSectionContent("story");
    const location = getSectionContent("location");
    const whyUs = getSectionContent("why-us");
    const reviews = getSectionContent("reviews");
    const contact = getSectionContent("contact");

    return {
      ...themedBase,
      templateContent: {
        hero: {
          blockId: heroBlock?.id,
          sectionStyle: getSectionStyleValue(hero),
        },
        story: {
          blockId: storyBlock?.id,
          sectionStyle: getSectionStyleValue(story),
        },
        location: {
          blockId: locationBlock?.id,
          sectionStyle: getSectionStyleValue(location),
        },
        whyUs: {
          blockId: whyUsBlock?.id,
          sectionStyle: getSectionStyleValue(whyUs),
        },
        reviews: {
          blockId: reviewsBlock?.id,
          sectionStyle: getSectionStyleValue(reviews),
        },
        contact: {
          blockId: contactBlock?.id,
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
          heading: readString(about, ["title", "heading"]),
          body: readString(about, ["body", "description", "subheading"]),
          headingStyle: about.headingStyle || about.titleStyle,
          descriptionStyle:
            about.descriptionStyle || about.bodyStyle || about.subheadingStyle,
          sectionStyle: getSectionStyleValue(about),
        },
        contact: {
          blockId: contactBlock?.id,
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
