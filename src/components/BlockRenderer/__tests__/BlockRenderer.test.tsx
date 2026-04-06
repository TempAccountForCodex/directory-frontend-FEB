import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import BlockRenderer, { BLOCK_RENDERERS } from "../index";
import PreviewRenderer from "../PreviewRenderer";
import type { PreviewBlock } from "../types";

const makeBlock = (
  blockType: string,
  content: Record<string, unknown> = {},
): PreviewBlock => ({
  id: 1,
  blockType,
  content,
  sortOrder: 0,
});

describe("BlockRenderer", () => {
  it("renders HERO block type", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("HERO", { heading: "Test" })} />,
    );
    expect(container.querySelector(".block--hero")).toBeTruthy();
  });

  it("renders TEXT block type", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("TEXT", { title: "Title" })} />,
    );
    expect(container.querySelector(".block--text")).toBeTruthy();
  });

  it("renders IMAGE block type", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("IMAGE", { src: "/img.jpg" })} />,
    );
    expect(container.querySelector(".block--image")).toBeTruthy();
  });

  it("renders FORM block type", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("FORM", {})} />,
    );
    expect(container.querySelector(".block--form")).toBeTruthy();
  });

  it("renders CONTACT as alias for FORM", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("CONTACT", {})} />,
    );
    expect(container.querySelector(".block--form")).toBeTruthy();
  });

  it("renders GALLERY block type", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("GALLERY", {})} />,
    );
    expect(container.querySelector(".block--gallery")).toBeTruthy();
  });

  it("renders CTA block type", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("CTA", {})} />,
    );
    expect(container.querySelector(".block--cta")).toBeTruthy();
  });

  it("renders TESTIMONIALS block type", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("TESTIMONIALS", {})} />,
    );
    expect(container.querySelector(".block--testimonials")).toBeTruthy();
  });

  it("renders TESTIMONIAL alias", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("TESTIMONIAL", {})} />,
    );
    expect(container.querySelector(".block--testimonials")).toBeTruthy();
  });

  it("renders FEATURES block type", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("FEATURES", {})} />,
    );
    expect(container.querySelector(".block--features")).toBeTruthy();
  });

  it("renders FEATURE alias", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("FEATURE", {})} />,
    );
    expect(container.querySelector(".block--features")).toBeTruthy();
  });

  it("falls back to DefaultBlock for unknown types", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("UNKNOWN_WIDGET", {})} />,
    );
    expect(container.querySelector(".block--default")).toBeTruthy();
  });

  it("handles case-insensitive block types", () => {
    const { container } = render(
      <BlockRenderer block={makeBlock("hero", { heading: "Test" })} />,
    );
    expect(container.querySelector(".block--hero")).toBeTruthy();
  });

  it("passes isPreview to sub-renderer", () => {
    const { container } = render(
      <BlockRenderer
        block={makeBlock("HERO", {
          heading: "H",
          ctaText: "Click",
          ctaLink: "/go",
        })}
        isPreview={true}
      />,
    );
    expect(container.querySelector(".hero__cta")?.tagName).toBe("SPAN");
  });

  it("exports BLOCK_RENDERERS with all supported types", () => {
    const expectedTypes = [
      "HERO",
      "TEXT",
      "IMAGE",
      "FORM",
      "CONTACT",
      "GALLERY",
      "CTA",
      "TESTIMONIALS",
      "TESTIMONIAL",
      "FEATURES",
      "FEATURE",
    ];
    expectedTypes.forEach((type) => {
      expect(BLOCK_RENDERERS[type]).toBeDefined();
    });
  });
});

describe("PreviewRenderer", () => {
  const blocks: PreviewBlock[] = [
    {
      id: 1,
      blockType: "HERO",
      content: { heading: "Hello" },
      sortOrder: 0,
      isVisible: true,
    },
    {
      id: 2,
      blockType: "TEXT",
      content: { title: "About" },
      sortOrder: 1,
      isVisible: true,
    },
    {
      id: 3,
      blockType: "CTA",
      content: { heading: "Go" },
      sortOrder: 2,
      isVisible: true,
    },
  ];

  it("renders all visible blocks", () => {
    const { container } = render(<PreviewRenderer blocks={blocks} />);
    expect(container.querySelector(".block--hero")).toBeTruthy();
    expect(container.querySelector(".block--text")).toBeTruthy();
    expect(container.querySelector(".block--cta")).toBeTruthy();
  });

  it("injects CSS styles", () => {
    const { container } = render(<PreviewRenderer blocks={blocks} />);
    const style = container.querySelector("style");
    expect(style).toBeTruthy();
    expect(style?.innerHTML).toContain(".block--hero");
    expect(style?.innerHTML).toContain(".text__inner");
    expect(style?.innerHTML).toContain(".preview-wrapper");
  });

  it("wraps in preview-wrapper with viewport data attribute", () => {
    const { container } = render(
      <PreviewRenderer blocks={blocks} viewport="mobile" />,
    );
    const wrapper = container.querySelector(".preview-wrapper");
    expect(wrapper?.getAttribute("data-viewport")).toBe("mobile");
    expect(wrapper?.getAttribute("style")).toContain("375px");
  });

  it("filters out invisible blocks", () => {
    const blocksWithHidden: PreviewBlock[] = [
      {
        id: 1,
        blockType: "HERO",
        content: { heading: "Hello" },
        sortOrder: 0,
        isVisible: true,
      },
      {
        id: 2,
        blockType: "TEXT",
        content: { title: "Hidden" },
        sortOrder: 1,
        isVisible: false,
      },
    ];
    const { container } = render(<PreviewRenderer blocks={blocksWithHidden} />);
    expect(container.querySelector(".block--hero")).toBeTruthy();
    expect(container.querySelector(".block--text")).toBeNull();
  });

  it("sorts blocks by sortOrder", () => {
    const unsorted: PreviewBlock[] = [
      { id: 2, blockType: "TEXT", content: { title: "Second" }, sortOrder: 1 },
      { id: 1, blockType: "HERO", content: { heading: "First" }, sortOrder: 0 },
    ];
    const { container } = render(<PreviewRenderer blocks={unsorted} />);
    const allBlocks = container.querySelectorAll(".block");
    expect(allBlocks[0]?.classList.contains("block--hero")).toBe(true);
    expect(allBlocks[1]?.classList.contains("block--text")).toBe(true);
  });

  it("shows empty message when no blocks", () => {
    const { container } = render(<PreviewRenderer blocks={[]} />);
    expect(container.textContent).toContain("No blocks to display");
  });

  it("defaults to desktop viewport", () => {
    const { container } = render(<PreviewRenderer blocks={blocks} />);
    const wrapper = container.querySelector(".preview-wrapper");
    expect(wrapper?.getAttribute("data-viewport")).toBe("desktop");
    expect(wrapper?.getAttribute("style")).toContain("100%");
  });

  it("applies tablet viewport width", () => {
    const { container } = render(
      <PreviewRenderer blocks={blocks} viewport="tablet" />,
    );
    const wrapper = container.querySelector(".preview-wrapper");
    expect(wrapper?.getAttribute("style")).toContain("768px");
  });

  it("sets siteName as data attribute", () => {
    const { container } = render(
      <PreviewRenderer blocks={blocks} siteName="TestSite" />,
    );
    const wrapper = container.querySelector(".preview-wrapper");
    expect(wrapper?.getAttribute("data-site-name")).toBe("TestSite");
  });
});
