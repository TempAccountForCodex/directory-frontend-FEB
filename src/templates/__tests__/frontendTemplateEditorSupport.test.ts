import { describe, expect, it } from "vitest";
import { buildFrontendTemplateEditorPages } from "../frontendTemplateEditorSupport";

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
      "process",
      "overview",
      "about",
      "why-us",
      "contact",
    ]);
  });
});
