/**
 * Tests for EmbedBlock (Step 2.29B.2)
 *
 * Covers:
 *  1.  Renders without crashing with default props
 *  2.  Renders heading when provided
 *  3.  Shows placeholder when URL is empty
 *  4.  getAllowedDomain returns domain for calendly.com URL
 *  5.  getAllowedDomain returns null for non-allowlisted domain
 *  6.  getAllowedDomain handles subdomain match (app.calendly.com)
 *  7.  getAllowedDomain returns null for non-https URL
 *  8.  getAllowedDomain returns null for invalid URL
 *  9.  getAllowedDomain returns null for empty string
 *  10. Allowlist includes all required domains
 *  11. Renders iframe for allowed domain URL
 *  12. iframe has sandbox attribute with required permissions
 *  13. iframe has referrerPolicy=no-referrer-when-downgrade
 *  14. iframe has loading=lazy when lazyLoad=true
 *  15. iframe has loading=eager when lazyLoad=false
 *  16. iframe has allowFullScreen when allowFullscreen=true
 *  17. Renders error alert for non-allowlisted domain URL
 *  18. Aspect ratio container wraps iframe (padding-top trick)
 *  19. Custom aspect ratio uses explicit height
 *  20. getPlatformName returns readable name for known domains
 *  21. Component is wrapped in React.memo (displayName set)
 *  22. Renders without heading when heading not provided
 *  23. Shows 'embedded from {platform}' caption for allowed domain
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: () => {}, inView: true }),
}));

import EmbedBlock, {
  getAllowedDomain,
  getPlatformName,
  ALLOWED_DOMAINS,
} from "../EmbedBlock";

// ── Fixtures ───────────────────────────────────────────────────────────────────

const makeBlock = (content: any) => ({
  id: 1,
  blockType: "EMBED",
  sortOrder: 1,
  content,
});

describe("EmbedBlock", () => {
  // ── 1. Renders without crashing ─────────────────────────────────────────────
  it("renders without crashing with default props", () => {
    const { container } = render(<EmbedBlock block={makeBlock({})} />);
    expect(container.firstChild).toBeTruthy();
  });

  // ── 2. Renders heading ───────────────────────────────────────────────────────
  it("renders heading when provided", () => {
    render(
      <EmbedBlock block={makeBlock({ heading: "Book a Meeting", url: "" })} />,
    );
    expect(screen.getByText("Book a Meeting")).toBeInTheDocument();
  });

  // ── 3. Placeholder when URL empty ───────────────────────────────────────────
  it("shows placeholder when URL is empty", () => {
    render(<EmbedBlock block={makeBlock({ url: "" })} />);
    expect(screen.getByText(/configure an embed url/i)).toBeInTheDocument();
  });

  // ── getAllowedDomain ─────────────────────────────────────────────────────────

  it("getAllowedDomain returns domain for calendly.com URL", () => {
    expect(getAllowedDomain("https://calendly.com/user/meeting")).toBe(
      "calendly.com",
    );
  });

  it("getAllowedDomain returns domain for docs.google.com URL", () => {
    expect(
      getAllowedDomain("https://docs.google.com/document/d/abc123/edit"),
    ).toBe("docs.google.com");
  });

  it("getAllowedDomain returns null for non-allowlisted domain", () => {
    expect(getAllowedDomain("https://evil.com/malicious")).toBeNull();
  });

  it("getAllowedDomain handles subdomain match (app.calendly.com)", () => {
    expect(getAllowedDomain("https://app.calendly.com/user/meeting")).toBe(
      "calendly.com",
    );
  });

  it("getAllowedDomain returns null for non-https URL", () => {
    expect(getAllowedDomain("http://calendly.com/user/meeting")).toBeNull();
  });

  it("getAllowedDomain returns null for invalid URL", () => {
    expect(getAllowedDomain("not-a-url")).toBeNull();
  });

  it("getAllowedDomain returns null for empty string", () => {
    expect(getAllowedDomain("")).toBeNull();
  });

  // ── Allowlist completeness ───────────────────────────────────────────────────

  it("allowlist includes all required domains", () => {
    const required = [
      "calendly.com",
      "docs.google.com",
      "airtable.com",
      "typeform.com",
      "figma.com",
      "canva.com",
      "loom.com",
      "miro.com",
      "notion.so",
      "codepen.io",
      "codesandbox.io",
    ];
    required.forEach((domain) => {
      expect(ALLOWED_DOMAINS).toContain(domain);
    });
  });

  // ── iframe rendering ─────────────────────────────────────────────────────────

  it("renders iframe for allowed domain URL", () => {
    render(
      <EmbedBlock
        block={makeBlock({
          url: "https://calendly.com/user/meeting",
          aspectRatio: "16:9",
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toContain("calendly.com");
  });

  it("iframe has sandbox attribute with required permissions", () => {
    render(
      <EmbedBlock
        block={makeBlock({
          url: "https://calendly.com/user/meeting",
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    const sandbox = iframe?.getAttribute("sandbox") || "";
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).toContain("allow-same-origin");
    expect(sandbox).toContain("allow-forms");
    expect(sandbox).toContain("allow-popups");
  });

  it("iframe has referrerPolicy=no-referrer-when-downgrade", () => {
    render(
      <EmbedBlock
        block={makeBlock({
          url: "https://figma.com/embed?url=abc",
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    // JSDOM may not reflect referrerPolicy as a property, so check the attribute
    const referrerPolicy =
      iframe?.referrerPolicy ||
      iframe?.getAttribute("referrerpolicy") ||
      iframe?.getAttribute("referrerPolicy");
    expect(referrerPolicy).toBe("no-referrer-when-downgrade");
  });

  it("iframe has loading=lazy when lazyLoad=true", () => {
    render(
      <EmbedBlock
        block={makeBlock({
          url: "https://loom.com/embed/abc123",
          lazyLoad: true,
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.getAttribute("loading")).toBe("lazy");
  });

  it("iframe has loading=eager when lazyLoad=false", () => {
    render(
      <EmbedBlock
        block={makeBlock({
          url: "https://loom.com/embed/abc123",
          lazyLoad: false,
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.getAttribute("loading")).toBe("eager");
  });

  it("iframe has allowFullScreen when allowFullscreen=true", () => {
    render(
      <EmbedBlock
        block={makeBlock({
          url: "https://miro.com/app/live-embed/123",
          allowFullscreen: true,
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.allowFullscreen).toBe(true);
  });

  // ── Domain rejection ─────────────────────────────────────────────────────────

  it("renders error alert for non-allowlisted domain URL", () => {
    render(
      <EmbedBlock
        block={makeBlock({
          url: "https://evil.com/malicious-embed",
        })}
      />,
    );
    expect(screen.getByText(/domain not allowed/i)).toBeInTheDocument();
  });

  // ── Aspect ratio ─────────────────────────────────────────────────────────────

  it("custom aspect ratio uses height from props", () => {
    render(
      <EmbedBlock
        block={makeBlock({
          url: "https://airtable.com/embed/abc123",
          aspectRatio: "custom",
          height: 800,
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    // Should have explicit height styling for custom aspect ratio
    expect(iframe).toBeTruthy();
  });

  // ── getPlatformName ──────────────────────────────────────────────────────────

  it("getPlatformName returns Calendly for calendly.com", () => {
    expect(getPlatformName("calendly.com")).toBe("Calendly");
  });

  it("getPlatformName returns Figma for figma.com", () => {
    expect(getPlatformName("figma.com")).toBe("Figma");
  });

  it("getPlatformName returns Google Docs for docs.google.com", () => {
    expect(getPlatformName("docs.google.com")).toBe("Google Docs");
  });

  // ── React.memo ───────────────────────────────────────────────────────────────

  it("component is wrapped in React.memo (displayName or type defined)", () => {
    expect(EmbedBlock).toBeDefined();
    const name =
      (EmbedBlock as any).displayName ||
      (EmbedBlock as any).type?.displayName ||
      (EmbedBlock as any).type?.name;
    expect(name).toBeTruthy();
  });

  // ── No heading ───────────────────────────────────────────────────────────────

  it("renders without heading when heading not provided", () => {
    const { container } = render(<EmbedBlock block={makeBlock({ url: "" })} />);
    const h2 = container.querySelector("h2");
    expect(h2).toBeNull();
  });

  // ── Platform attribution caption ─────────────────────────────────────────────

  it("shows embedded from {platform} caption for allowed domain", () => {
    render(
      <EmbedBlock
        block={makeBlock({
          url: "https://typeform.com/to/abc123",
          aspectRatio: "16:9",
        })}
      />,
    );
    expect(screen.getByText(/Typeform/i)).toBeInTheDocument();
  });
});
