import { describe, expect, it } from "vitest";
import {
  buildFrontendTemplateEditorPages,
  buildTemplatePreviewBusinessData,
} from "../frontendTemplateEditorSupport";

describe("buildFrontendTemplateEditorPages", () => {
  it("preserves persisted block sort order for frontend template sections", () => {
    const pages = buildFrontendTemplateEditorPages(
      "company-executive",
      {
        name: "Profits and Pizza",
        businessName: "Profits and Pizza",
        primaryColor: "#378C92",
        secondaryColor: "#D3EB63",
      },
      [
        {
          id: "persisted-home",
          title: "Home",
          path: "/",
          isHome: true,
          sortOrder: 0,
          isPublished: true,
          blocks: [
            {
              id: "process",
              blockType: "FEATURES",
              sortOrder: 0,
              isVisible: true,
              content: { editorSection: "process", editorLabel: "Process" },
            },
            {
              id: "overview",
              blockType: "HERO",
              sortOrder: 1,
              isVisible: true,
              content: { editorSection: "overview", editorLabel: "Overview" },
            },
            {
              id: "about",
              blockType: "TEXT",
              sortOrder: 2,
              isVisible: true,
              content: { editorSection: "about", editorLabel: "About" },
            },
            {
              id: "why-us",
              blockType: "FEATURES",
              sortOrder: 3,
              isVisible: true,
              content: { editorSection: "why-us", editorLabel: "Why Us" },
            },
            {
              id: "contact",
              blockType: "CONTACT",
              sortOrder: 4,
              isVisible: true,
              content: { editorSection: "contact", editorLabel: "Contact" },
            },
          ],
        },
      ],
    );

    const homePage = pages.find((page) => page.isHome);
    expect(homePage).toBeTruthy();

    const orderedSections = [...(homePage?.blocks || [])]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((block) => block.content.editorSection);

    expect(orderedSections).toEqual([
      "navbar",
      "process",
      "overview",
      "about",
      "why-us",
      "contact",
    ]);
  });

  it("uses persisted page and block ids for hydrated frontend template sections", () => {
    const pages = buildFrontendTemplateEditorPages(
      "company-executive",
      {
        name: "First Ever Tester Company",
        businessName: "First Ever Tester Company",
      },
      [
        {
          id: 101,
          title: "Home",
          path: "/",
          isHome: true,
          sortOrder: 0,
          isPublished: true,
          blocks: [
            {
              id: 9001,
              blockType: "HERO",
              sortOrder: 0,
              isVisible: true,
              content: {
                editorSection: "overview",
                editorLabel: "Overview",
                heading: "Persisted heading",
              },
            },
            {
              id: 9002,
              blockType: "TEXT",
              sortOrder: 1,
              isVisible: true,
              content: { editorSection: "about", editorLabel: "About" },
            },
            {
              id: 9003,
              blockType: "FEATURES",
              sortOrder: 2,
              isVisible: true,
              content: { editorSection: "why-us", editorLabel: "Why Us" },
            },
            {
              id: 9004,
              blockType: "PROCESS",
              sortOrder: 3,
              isVisible: true,
              content: { editorSection: "process", editorLabel: "Process" },
            },
            {
              id: 9005,
              blockType: "CONTACT",
              sortOrder: 4,
              isVisible: true,
              content: { editorSection: "contact", editorLabel: "Contact" },
            },
          ],
        },
      ],
    );

    const homePage = pages.find((page) => page.isHome);
    const overviewBlock = homePage?.blocks.find(
      (block) => block.content.editorSection === "overview",
    );

    expect(homePage?.id).toBe("101");
    expect(homePage?.localOnly).toBe(false);
    expect(overviewBlock?.id).toBe("9001");
    expect(overviewBlock?.localOnly).toBe(false);
    expect(overviewBlock?.content.heading).toBe("Persisted heading");
  });

  it("uses the current website theme over older template theme data", () => {
    const previewData = buildTemplatePreviewBusinessData(
      "company-executive",
      {
        id: 92,
        name: "PNC Company",
        businessName: "PNC Company",
        primaryColor: "#FF00FF",
        templateSnapshot: {
          themeSettings: {
            primaryColor: "#378C92",
          },
        },
      },
      [
        {
          id: 184,
          title: "Home",
          path: "/",
          isHome: true,
          sortOrder: 0,
          isPublished: true,
          blocks: [
            {
              id: 8334,
              blockType: "HERO",
              sortOrder: 0,
              isVisible: true,
              content: {
                editorSection: "overview",
                editorLabel: "Overview",
                heading: "Trusted Solutions That Drive Your Business Forward",
                __templateTheme: {
                  primaryColor: "#001F3F",
                },
              },
            },
          ],
        },
      ],
    );

    expect(previewData?.primaryColor).toBe("#FF00FF");
    expect(previewData?.themeSettings?.primaryColor).toBe("#FF00FF");
  });
});

describe("Contact widget custom-section overlay (company-executive)", () => {
  // A Contact block added from the library is persisted as a plan-section
  // wrapper: edited fields live on the outer content, the shared renderer reads
  // the first inner block. The outer content must always win so edits + the
  // custom `formFields` list render on the canvas even if the inner mirror lags.
  it("overlays outer contact content (heading/email/formFields) onto the inner block", () => {
    const contactWidget = {
      id: "contact-widget",
      blockType: "CONTACT",
      sortOrder: 5,
      isVisible: true,
      content: {
        editorBlockType: "CONTACT",
        editorLabel: "Contact",
        editorSection: "plan-1700000000000",
        heading: "Get in touchdfdd",
        body: "Edited body copy.",
        email: "edited@company.com",
        formTitle: "Send a message",
        buttonText: "Contact us",
        formFields: [
          { _id: "full-name", label: "Full name", placeholder: "Full name", fieldType: "text", required: true, options: "" },
          { _id: "custom", label: "Phone", placeholder: "Phone #", fieldType: "tel", required: false, options: "" },
        ],
        innerBlocks: [
          {
            // Stale inner mirror — must be overridden by the outer content.
            id: "inner",
            type: "contact",
            content: {
              heading: "Get in touch",
              email: "hello@yourcompany.com",
              fields: [{ label: "Full name" }, { label: "Email address" }, { label: "Message" }],
            },
          },
        ],
      },
    };

    const data = buildTemplatePreviewBusinessData(
      "company-executive",
      { id: "w1", name: "Consulting Co" } as never,
      [
        {
          id: "home",
          title: "Home",
          path: "/",
          isHome: true,
          sortOrder: 0,
          isPublished: true,
          blocks: [contactWidget],
        },
      ] as never,
    ) as never as { templateContent?: { customSections?: Array<Record<string, never>> } };

    const sections = data?.templateContent?.customSections ?? [];
    const section = sections.find(
      (s) => Array.isArray((s as { innerBlocks?: unknown[] }).innerBlocks),
    ) as { innerBlocks: Array<{ content: Record<string, unknown> }> } | undefined;
    const inner = section?.innerBlocks?.[0]?.content;

    expect(inner?.heading).toBe("Get in touchdfdd");
    expect(inner?.email).toBe("edited@company.com");
    expect(Array.isArray(inner?.formFields)).toBe(true);
    expect(
      (inner?.formFields as Array<{ label: string }>).map((f) => f.label),
    ).toContain("Phone");
  });
});
