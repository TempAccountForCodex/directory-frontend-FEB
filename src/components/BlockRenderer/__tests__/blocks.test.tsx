import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroBlock from "../blocks/HeroBlock";
import TextBlock from "../blocks/TextBlock";
import ImageBlock from "../blocks/ImageBlock";
import FormBlock from "../blocks/FormBlock";
import GalleryBlock from "../blocks/GalleryBlock";
import CtaBlock from "../blocks/CtaBlock";
import TestimonialsBlock from "../blocks/TestimonialsBlock";
import FeaturesBlock from "../blocks/FeaturesBlock";
import DefaultBlock from "../blocks/DefaultBlock";

const makeBlock = (
  blockType: string,
  content: Record<string, unknown> = {},
) => ({
  id: 1,
  blockType,
  content,
  sortOrder: 0,
});

describe("HeroBlock", () => {
  it("renders heading and subheading with correct classes", () => {
    const { container } = render(
      <HeroBlock
        block={makeBlock("HERO", {
          heading: "Test Title",
          subheading: "Sub text",
        })}
      />,
    );
    expect(container.querySelector(".block--hero")).toBeTruthy();
    expect(container.querySelector(".hero__inner")).toBeTruthy();
    expect(container.querySelector(".hero__heading")?.textContent).toBe(
      "Test Title",
    );
    expect(container.querySelector(".hero__subheading")?.textContent).toBe(
      "Sub text",
    );
  });

  it("renders CTA as link when not in preview", () => {
    const { container } = render(
      <HeroBlock
        block={makeBlock("HERO", {
          heading: "H",
          ctaText: "Click",
          ctaLink: "/go",
        })}
        isPreview={false}
      />,
    );
    const cta = container.querySelector(".hero__cta");
    expect(cta?.tagName).toBe("A");
    expect(cta?.getAttribute("href")).toBe("/go");
  });

  it("renders CTA as span when in preview", () => {
    const { container } = render(
      <HeroBlock
        block={makeBlock("HERO", {
          heading: "H",
          ctaText: "Click",
          ctaLink: "/go",
        })}
        isPreview={true}
      />,
    );
    const cta = container.querySelector(".hero__cta");
    expect(cta?.tagName).toBe("SPAN");
  });

  it("defaults heading to Welcome", () => {
    const { container } = render(<HeroBlock block={makeBlock("HERO", {})} />);
    expect(container.querySelector(".hero__heading")?.textContent).toBe(
      "Welcome",
    );
  });

  it("escapes HTML in heading", () => {
    const { container } = render(
      <HeroBlock
        block={makeBlock("HERO", { heading: "<script>alert(1)</script>" })}
      />,
    );
    expect(container.querySelector(".hero__heading")?.innerHTML).not.toContain(
      "<script>",
    );
  });
});

describe("TextBlock", () => {
  it("renders title and body with correct classes", () => {
    const { container } = render(
      <TextBlock
        block={makeBlock("TEXT", { title: "Title", body: "<b>bold</b>" })}
      />,
    );
    expect(container.querySelector(".block--text")).toBeTruthy();
    expect(container.querySelector(".text__inner")).toBeTruthy();
    expect(container.querySelector(".text__title")?.textContent).toBe("Title");
    expect(container.querySelector(".text__body")?.innerHTML).toContain(
      "<b>bold</b>",
    );
  });

  it("handles empty content", () => {
    const { container } = render(<TextBlock block={makeBlock("TEXT", {})} />);
    expect(container.querySelector(".block--text")).toBeTruthy();
    expect(container.querySelector(".text__title")).toBeNull();
    expect(container.querySelector(".text__body")).toBeNull();
  });

  it("applies text alignment", () => {
    const { container } = render(
      <TextBlock block={makeBlock("TEXT", { alignment: "right" })} />,
    );
    const section = container.querySelector(".block--text") as HTMLElement;
    expect(section?.style.textAlign).toBe("right");
  });
});

describe("ImageBlock", () => {
  it("renders image with figure and correct width class", () => {
    const { container } = render(
      <ImageBlock
        block={makeBlock("IMAGE", {
          src: "/img.jpg",
          alt: "Test",
          width: "medium",
        })}
      />,
    );
    expect(container.querySelector(".block--image")).toBeTruthy();
    expect(container.querySelector(".image__figure--medium")).toBeTruthy();
    expect(container.querySelector(".image__img")?.getAttribute("alt")).toBe(
      "Test",
    );
    expect(
      container.querySelector(".image__img")?.getAttribute("loading"),
    ).toBe("lazy");
  });

  it("renders caption when provided", () => {
    const { container } = render(
      <ImageBlock
        block={makeBlock("IMAGE", { src: "/img.jpg", caption: "A caption" })}
      />,
    );
    expect(container.querySelector(".image__caption")?.textContent).toBe(
      "A caption",
    );
  });

  it("blocks javascript: URLs", () => {
    const { container } = render(
      <ImageBlock block={makeBlock("IMAGE", { src: "javascript:alert(1)" })} />,
    );
    expect(
      container.querySelector(".image__img")?.getAttribute("src"),
    ).toBeNull();
  });
});

describe("FormBlock", () => {
  it("renders form with disabled inputs", () => {
    const { container } = render(
      <FormBlock block={makeBlock("FORM", { title: "Contact" })} />,
    );
    expect(container.querySelector(".block--form")).toBeTruthy();
    expect(container.querySelector(".block--contact")).toBeTruthy();
    const inputs = container.querySelectorAll("input");
    inputs.forEach((input) => expect(input.disabled).toBe(true));
    expect(
      container.querySelector(".form__submit")?.getAttribute("disabled"),
    ).toBe("");
  });

  it("renders contact info when email and phone provided", () => {
    const { container } = render(
      <FormBlock
        block={makeBlock("FORM", {
          title: "Contact",
          email: "a@b.com",
          phone: "123",
        })}
      />,
    );
    expect(container.querySelector(".form__contact-info")).toBeTruthy();
    expect(
      container.querySelector(".form__contact-link")?.getAttribute("href"),
    ).toBe("mailto:a@b.com");
  });

  it("defaults title to Contact Us", () => {
    const { container } = render(<FormBlock block={makeBlock("FORM", {})} />);
    expect(container.querySelector(".form__title")?.textContent).toBe(
      "Contact Us",
    );
  });
});

describe("GalleryBlock", () => {
  it("renders grid with correct column class", () => {
    const { container } = render(
      <GalleryBlock
        block={makeBlock("GALLERY", {
          title: "Gallery",
          columns: 4,
          images: [
            { src: "/a.jpg", alt: "A" },
            { src: "/b.jpg", alt: "B" },
          ],
        })}
      />,
    );
    expect(container.querySelector(".block--gallery")).toBeTruthy();
    expect(container.querySelector(".gallery__grid--cols-4")).toBeTruthy();
    expect(container.querySelectorAll(".gallery__item")).toHaveLength(2);
  });

  it("shows empty message when no images", () => {
    const { container } = render(
      <GalleryBlock block={makeBlock("GALLERY", {})} />,
    );
    expect(container.querySelector(".gallery__empty")?.textContent).toBe(
      "No images",
    );
  });

  it("limits to 20 images", () => {
    const images = Array.from({ length: 25 }, (_, i) => ({
      src: `/${i}.jpg`,
      alt: `${i}`,
    }));
    const { container } = render(
      <GalleryBlock block={makeBlock("GALLERY", { images })} />,
    );
    expect(container.querySelectorAll(".gallery__item")).toHaveLength(20);
  });
});

describe("CtaBlock", () => {
  it("renders heading, subheading, and buttons", () => {
    const { container } = render(
      <CtaBlock
        block={makeBlock("CTA", {
          heading: "Act Now",
          subheading: "Limited time",
          primaryCtaText: "Buy",
          primaryCtaLink: "/buy",
          secondaryCtaText: "Learn",
          secondaryCtaLink: "/learn",
        })}
      />,
    );
    expect(container.querySelector(".block--cta")).toBeTruthy();
    expect(container.querySelector(".cta__heading")?.textContent).toBe(
      "Act Now",
    );
    expect(container.querySelector(".cta__btn--primary")?.textContent).toBe(
      "Buy",
    );
    expect(container.querySelector(".cta__btn--secondary")?.textContent).toBe(
      "Learn",
    );
  });

  it("renders buttons as spans in preview mode", () => {
    const { container } = render(
      <CtaBlock
        block={makeBlock("CTA", {
          primaryCtaText: "Go",
          primaryCtaLink: "/go",
        })}
        isPreview={true}
      />,
    );
    const btn = container.querySelector(".cta__btn--primary");
    expect(btn?.tagName).toBe("SPAN");
  });

  it("renders buttons as links when not in preview", () => {
    const { container } = render(
      <CtaBlock
        block={makeBlock("CTA", {
          primaryCtaText: "Go",
          primaryCtaLink: "/go",
        })}
        isPreview={false}
      />,
    );
    const btn = container.querySelector(".cta__btn--primary");
    expect(btn?.tagName).toBe("A");
    expect(btn?.getAttribute("href")).toBe("/go");
  });
});

describe("TestimonialsBlock", () => {
  it("renders testimonial cards with correct structure (items key)", () => {
    const { container } = render(
      <TestimonialsBlock
        block={makeBlock("TESTIMONIALS", {
          title: "Reviews",
          items: [
            { quote: "Great!", author: "Jane", role: "CEO" },
            { quote: "Amazing!", author: "John" },
          ],
        })}
      />,
    );
    expect(container.querySelector(".block--testimonials")).toBeTruthy();
    expect(container.querySelector(".testimonials__title")?.textContent).toBe(
      "Reviews",
    );
    expect(container.querySelectorAll(".testimonial__card")).toHaveLength(2);
    expect(
      container.querySelector(".testimonial__quote")?.textContent,
    ).toContain("Great!");
    expect(container.querySelector(".testimonial__author")?.textContent).toBe(
      "Jane",
    );
    expect(container.querySelector(".testimonial__role")?.textContent).toBe(
      "CEO",
    );
  });

  it("falls back to testimonials key when items absent", () => {
    const { container } = render(
      <TestimonialsBlock
        block={makeBlock("TESTIMONIALS", {
          testimonials: [{ quote: "Fallback", author: "Bob" }],
        })}
      />,
    );
    expect(container.querySelectorAll(".testimonial__card")).toHaveLength(1);
    expect(
      container.querySelector(".testimonial__quote")?.textContent,
    ).toContain("Fallback");
  });

  it("shows placeholder avatar when no image", () => {
    const { container } = render(
      <TestimonialsBlock
        block={makeBlock("TESTIMONIALS", {
          items: [{ author: "Jane", quote: "Test" }],
        })}
      />,
    );
    const placeholder = container.querySelector(
      ".testimonial__avatar--placeholder",
    );
    expect(placeholder?.textContent).toBe("J");
  });

  it("shows empty message when no testimonials", () => {
    const { container } = render(
      <TestimonialsBlock block={makeBlock("TESTIMONIALS", {})} />,
    );
    expect(container.querySelector(".testimonials__empty")?.textContent).toBe(
      "No testimonials yet.",
    );
  });

  it("limits to 12 testimonials", () => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      quote: `Quote ${i}`,
      author: `Author ${i}`,
    }));
    const { container } = render(
      <TestimonialsBlock block={makeBlock("TESTIMONIALS", { items })} />,
    );
    expect(container.querySelectorAll(".testimonial__card")).toHaveLength(12);
  });
});

describe("FeaturesBlock", () => {
  it("renders features grid with correct column class (items key)", () => {
    const { container } = render(
      <FeaturesBlock
        block={makeBlock("FEATURES", {
          title: "Features",
          subtitle: "Why choose us",
          columns: 2,
          items: [
            { icon: "star", title: "Fast", description: "Quick" },
            { icon: "shield", title: "Secure", description: "Safe" },
          ],
        })}
      />,
    );
    expect(container.querySelector(".block--features")).toBeTruthy();
    expect(container.querySelector(".features__grid--cols-2")).toBeTruthy();
    expect(container.querySelectorAll(".feature__card")).toHaveLength(2);
    expect(container.querySelector(".features__title")?.textContent).toBe(
      "Features",
    );
    expect(container.querySelector(".features__subtitle")?.textContent).toBe(
      "Why choose us",
    );
  });

  it("falls back to features key when items absent", () => {
    const { container } = render(
      <FeaturesBlock
        block={makeBlock("FEATURES", {
          features: [{ title: "Fallback Feature" }],
        })}
      />,
    );
    expect(container.querySelectorAll(".feature__card")).toHaveLength(1);
    expect(container.querySelector(".feature__title")?.textContent).toBe(
      "Fallback Feature",
    );
  });

  it("shows empty message when no features", () => {
    const { container } = render(
      <FeaturesBlock block={makeBlock("FEATURES", {})} />,
    );
    expect(container.querySelector(".features__empty")?.textContent).toBe(
      "No features listed.",
    );
  });

  it("limits to 12 features", () => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      title: `Feature ${i}`,
    }));
    const { container } = render(
      <FeaturesBlock block={makeBlock("FEATURES", { items })} />,
    );
    expect(container.querySelectorAll(".feature__card")).toHaveLength(12);
  });
});

describe("DefaultBlock", () => {
  it("renders with correct class and data attribute", () => {
    const { container } = render(
      <DefaultBlock block={makeBlock("UNKNOWN_TYPE", {})} />,
    );
    expect(container.querySelector(".block--default")).toBeTruthy();
    expect(
      container.querySelector('[data-block-type="UNKNOWN_TYPE"]'),
    ).toBeTruthy();
  });
});
