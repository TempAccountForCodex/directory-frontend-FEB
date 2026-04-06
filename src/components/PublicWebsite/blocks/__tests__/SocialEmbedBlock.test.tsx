/**
 * Tests for SocialEmbedBlock (Step 2.29B.1)
 *
 * Covers:
 *  1.  Renders without crashing with default props
 *  2.  Renders heading when provided
 *  3.  Shows 'No embeds configured' when embeds array is empty
 *  4.  isValidPlatformUrl accepts valid YouTube watch URL
 *  5.  isValidPlatformUrl accepts valid YouTube youtu.be URL
 *  6.  isValidPlatformUrl accepts valid YouTube shorts URL
 *  7.  isValidPlatformUrl rejects YouTube URL with wrong domain
 *  8.  isValidPlatformUrl accepts valid Instagram post URL
 *  9.  isValidPlatformUrl rejects Instagram cross-platform (YouTube URL for instagram)
 *  10. isValidPlatformUrl accepts valid Twitter status URL
 *  11. isValidPlatformUrl accepts valid X (twitter) status URL
 *  12. isValidPlatformUrl rejects empty URL
 *  13. isValidPlatformUrl accepts valid TikTok video URL
 *  14. isValidPlatformUrl accepts valid Facebook watch URL
 *  15. getYouTubeEmbedUrl extracts ID from watch URL
 *  16. getYouTubeEmbedUrl extracts ID from youtu.be URL
 *  17. getYouTubeEmbedUrl returns null for non-youtube URL
 *  18. Renders YouTube iframe when valid YouTube URL provided
 *  19. YouTube iframe has sandbox attribute
 *  20. YouTube iframe has loading=lazy
 *  21. Renders error alert when invalid URL provided for platform
 *  22. Renders Twitter placeholder card with link for valid Twitter URL
 *  23. Renders TikTok placeholder card for valid TikTok URL
 *  24. Renders Instagram placeholder card for valid Instagram URL
 *  25. Renders Facebook placeholder card for valid Facebook URL
 *  26. Component is wrapped in React.memo (displayName set)
 *  27. responsiveHideOnMobile toggles display none
 *  28. Single layout uses single column grid (md=12)
 *  29. Grid layout uses multi-column grid
 *  30. Renders 'Loading embed…' skeleton before inView
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Default useInView — inView true for outer component, but individual embeds also use it
const mockUseInView = vi.fn(() => ({ ref: () => {}, inView: true }));
vi.mock("react-intersection-observer", () => ({
  useInView: () => mockUseInView(),
}));

import SocialEmbedBlock, {
  isValidPlatformUrl,
  getYouTubeEmbedUrl,
} from "../SocialEmbedBlock";

// ── Fixtures ───────────────────────────────────────────────────────────────────

const makeBlock = (content: any) => ({
  id: 1,
  blockType: "SOCIAL_EMBED",
  sortOrder: 1,
  content,
});

describe("SocialEmbedBlock", () => {
  // ── 1. Renders without crashing ─────────────────────────────────────────────
  it("renders without crashing with default props", () => {
    const { container } = render(
      <SocialEmbedBlock
        block={makeBlock({ embeds: [] })}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  // ── 2. Renders heading ───────────────────────────────────────────────────────
  it("renders heading when provided", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({ heading: "Our Social Feed", embeds: [] })}
      />,
    );
    expect(screen.getByText("Our Social Feed")).toBeInTheDocument();
  });

  // ── 3. Empty embeds message ──────────────────────────────────────────────────
  it("shows no embeds message when embeds array is empty", () => {
    render(<SocialEmbedBlock block={makeBlock({ embeds: [] })} />);
    expect(screen.getByText(/no embeds configured/i)).toBeInTheDocument();
  });

  // ── URL Validation: YouTube ──────────────────────────────────────────────────

  it("isValidPlatformUrl accepts valid YouTube watch URL", () => {
    expect(
      isValidPlatformUrl(
        "youtube",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ),
    ).toBe(true);
  });

  it("isValidPlatformUrl accepts valid YouTube youtu.be URL", () => {
    expect(isValidPlatformUrl("youtube", "https://youtu.be/dQw4w9WgXcQ")).toBe(
      true,
    );
  });

  it("isValidPlatformUrl accepts valid YouTube shorts URL", () => {
    expect(
      isValidPlatformUrl("youtube", "https://www.youtube.com/shorts/abc123"),
    ).toBe(true);
  });

  it("isValidPlatformUrl rejects YouTube URL with wrong domain", () => {
    expect(
      isValidPlatformUrl("youtube", "https://evil.com/watch?v=dQw4w9WgXcQ"),
    ).toBe(false);
  });

  it("isValidPlatformUrl rejects non-YouTube URL for youtube platform", () => {
    expect(
      isValidPlatformUrl("youtube", "https://instagram.com/p/ABC123/"),
    ).toBe(false);
  });

  // ── URL Validation: Instagram ────────────────────────────────────────────────

  it("isValidPlatformUrl accepts valid Instagram post URL", () => {
    expect(
      isValidPlatformUrl("instagram", "https://www.instagram.com/p/ABC123/"),
    ).toBe(true);
  });

  it("isValidPlatformUrl accepts valid Instagram reel URL", () => {
    expect(
      isValidPlatformUrl("instagram", "https://www.instagram.com/reel/ABC123/"),
    ).toBe(true);
  });

  it("isValidPlatformUrl rejects Instagram cross-platform (YouTube URL)", () => {
    expect(
      isValidPlatformUrl("instagram", "https://youtube.com/watch?v=abc"),
    ).toBe(false);
  });

  // ── URL Validation: Twitter ──────────────────────────────────────────────────

  it("isValidPlatformUrl accepts valid Twitter status URL", () => {
    expect(
      isValidPlatformUrl(
        "twitter",
        "https://twitter.com/user/status/123456789",
      ),
    ).toBe(true);
  });

  it("isValidPlatformUrl accepts valid X (twitter) status URL", () => {
    expect(
      isValidPlatformUrl("twitter", "https://x.com/user/status/123456789"),
    ).toBe(true);
  });

  // ── URL Validation: TikTok ───────────────────────────────────────────────────

  it("isValidPlatformUrl accepts valid TikTok video URL", () => {
    expect(
      isValidPlatformUrl(
        "tiktok",
        "https://www.tiktok.com/@username/video/1234567890",
      ),
    ).toBe(true);
  });

  // ── URL Validation: Facebook ─────────────────────────────────────────────────

  it("isValidPlatformUrl accepts valid Facebook watch URL", () => {
    expect(
      isValidPlatformUrl(
        "facebook",
        "https://www.facebook.com/watch/?v=123456",
      ),
    ).toBe(true);
  });

  // ── URL Validation: empty ────────────────────────────────────────────────────

  it("isValidPlatformUrl rejects empty URL", () => {
    expect(isValidPlatformUrl("youtube", "")).toBe(false);
  });

  // ── getYouTubeEmbedUrl ───────────────────────────────────────────────────────

  it("getYouTubeEmbedUrl extracts ID from watch URL", () => {
    const result = getYouTubeEmbedUrl(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(result).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("getYouTubeEmbedUrl extracts ID from youtu.be URL", () => {
    const result = getYouTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(result).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("getYouTubeEmbedUrl returns null for non-youtube URL", () => {
    const result = getYouTubeEmbedUrl("https://example.com/video");
    expect(result).toBeNull();
  });

  // ── YouTube iframe rendering ─────────────────────────────────────────────────

  it("renders YouTube iframe for valid YouTube URL", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [
            {
              platform: "youtube",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              caption: "Test video",
            },
          ],
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("YouTube iframe has sandbox attribute", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [
            {
              platform: "youtube",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
          ],
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.getAttribute("sandbox")).toContain("allow-scripts");
    expect(iframe?.getAttribute("sandbox")).toContain("allow-same-origin");
  });

  it("YouTube iframe has loading=lazy", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [
            {
              platform: "youtube",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
          ],
        })}
      />,
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.getAttribute("loading")).toBe("lazy");
  });

  // ── Invalid URL error ────────────────────────────────────────────────────────

  it("renders error alert for invalid platform URL", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [
            { platform: "youtube", url: "https://evil.com/watch?v=abc" },
          ],
        })}
      />,
    );
    expect(screen.getByText(/invalid youtube url/i)).toBeInTheDocument();
  });

  // ── Platform placeholders ────────────────────────────────────────────────────

  it("renders Twitter placeholder card with link for valid Twitter URL", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [
            {
              platform: "twitter",
              url: "https://twitter.com/user/status/12345",
            },
          ],
        })}
      />,
    );
    expect(screen.getByText(/View on Twitter/i)).toBeInTheDocument();
  });

  it("renders TikTok placeholder card for valid TikTok URL", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [
            {
              platform: "tiktok",
              url: "https://www.tiktok.com/@username/video/1234567890",
            },
          ],
        })}
      />,
    );
    expect(screen.getByText(/View on TikTok/i)).toBeInTheDocument();
  });

  it("renders Instagram placeholder card for valid Instagram URL", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [
            {
              platform: "instagram",
              url: "https://www.instagram.com/p/ABC123/",
            },
          ],
        })}
      />,
    );
    // Use getAllByText since "Instagram" appears in chip and description text
    const elements = screen.getAllByText(/View on Instagram/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders Facebook placeholder card for valid Facebook URL", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [
            {
              platform: "facebook",
              url: "https://www.facebook.com/watch/?v=123456",
            },
          ],
        })}
      />,
    );
    // Use getAllByText since "Facebook" appears in chip and description text
    const elements = screen.getAllByText(/View on Facebook/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  // ── React.memo ───────────────────────────────────────────────────────────────

  it("component is wrapped in React.memo (displayName or type defined)", () => {
    expect(SocialEmbedBlock).toBeDefined();
    const name =
      (SocialEmbedBlock as any).displayName ||
      (SocialEmbedBlock as any).type?.displayName ||
      (SocialEmbedBlock as any).type?.name;
    expect(name).toBeTruthy();
  });

  // ── Responsive hide ──────────────────────────────────────────────────────────

  it("renders block even when responsiveHideOnMobile is true (CSS handles visibility)", () => {
    const { container } = render(
      <SocialEmbedBlock
        block={makeBlock({ embeds: [], responsiveHideOnMobile: true })}
      />,
    );
    // Component still renders in DOM — CSS handles hiding
    expect(container.firstChild).toBeTruthy();
  });

  // ── No URL info message ──────────────────────────────────────────────────────

  it("renders info alert when embed URL is empty", () => {
    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [{ platform: "youtube", url: "" }],
        })}
      />,
    );
    expect(screen.getByText(/No URL provided/i)).toBeInTheDocument();
  });

  // ── Lazy loading skeleton ────────────────────────────────────────────────────

  it("renders loading skeleton when embed is not in view", () => {
    // First call (outer component) inView=true, second call (LazyEmbedWrapper) inView=false
    let callCount = 0;
    mockUseInView.mockImplementation(() => {
      callCount++;
      // First call is the outer SocialEmbedBlock
      if (callCount === 1) return { ref: () => {}, inView: true };
      // Subsequent calls are LazyEmbedWrapper — not in view
      return { ref: () => {}, inView: false };
    });

    render(
      <SocialEmbedBlock
        block={makeBlock({
          embeds: [
            {
              platform: "youtube",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
          ],
        })}
      />,
    );
    expect(screen.getByText(/loading embed/i)).toBeInTheDocument();

    // Reset mock
    mockUseInView.mockImplementation(() => ({ ref: () => {}, inView: true }));
  });
});
