/**
 * Tests for previewInjector selection enhancements (Step 9.14.1)
 *
 * Covers:
 * - blockToHtml includes data-block-id attribute
 * - Click handler sends BLOCK_SELECTED postMessage
 * - Mouseover/mouseout sends BLOCK_HOVER postMessage
 * - Parent can send SELECT_BLOCK to apply .tt-block-selected
 * - Parent can send DESELECT_ALL to clear selection
 * - CSS hover state: dashed blue border (2px, 50% opacity)
 * - CSS selected state: solid blue border (2px, #1976d2) with corner handles
 * - Corner handles: 8x8px blue squares via absolute positioning
 * - All [data-block-id] elements have cursor:pointer
 * - Click handler calls preventDefault + stopPropagation
 * - Existing CONTENT_UPDATE, VIEWPORT_CHANGE, CSP_VIOLATION handlers unmodified
 * - No user-supplied content in injected JavaScript (PAT-004)
 */
import { describe, it, expect } from "vitest";
import {
  generateLivePreview,
  type PreviewWebsite,
  type PreviewPage,
  type PreviewBlock,
} from "../previewInjector";

/* ------------------------------------------------------------------ */
/*  Factories                                                          */
/* ------------------------------------------------------------------ */
const makeWebsite = (overrides?: Partial<PreviewWebsite>): PreviewWebsite => ({
  name: "Test Site",
  theme: {},
  fonts: { heading: "Inter", body: "Roboto" },
  colors: {
    primary: "#378C92",
    secondary: "#2A6B70",
    background: "#FFFFFF",
    text: "#111111",
  },
  ...overrides,
});

const makePage = (overrides?: Partial<PreviewPage>): PreviewPage => ({
  id: "page-1",
  title: "Home",
  slug: "home",
  ...overrides,
});

const makeBlock = (overrides?: Partial<PreviewBlock>): PreviewBlock => ({
  id: "block-1",
  blockType: "HERO",
  content: { title: "Welcome", subtitle: "Hello" },
  order: 0,
  ...overrides,
});

describe("previewInjector selection enhancements (Step 9.14.1)", () => {
  /* ------------------------------------------------------------------ */
  /*  data-block-id attribute                                            */
  /* ------------------------------------------------------------------ */

  it("blockToHtml output includes data-block-id attribute with escaped block id", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [
      makeBlock({ id: "hero-42" }),
    ]);

    expect(html).toContain('data-block-id="hero-42"');
  });

  it("data-block-id is HTML-escaped to prevent XSS", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [
      makeBlock({ id: '"><script>xss</script>' }),
    ]);

    // Angle brackets must be escaped
    expect(html).not.toContain("<script>xss</script>");
    expect(html).toContain("data-block-id=");
  });

  /* ------------------------------------------------------------------ */
  /*  PostMessage script contains click handler                          */
  /* ------------------------------------------------------------------ */

  it("injected script contains click event listener for BLOCK_SELECTED", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("BLOCK_SELECTED");
    expect(html).toContain("data-block-id");
    expect(html).toContain("click");
  });

  it("injected script contains mouseover handler for BLOCK_HOVER", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("BLOCK_HOVER");
    expect(html).toContain("mouseover");
  });

  it("injected script contains mouseout handler for BLOCK_HOVER null", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("mouseout");
  });

  /* ------------------------------------------------------------------ */
  /*  Incoming message handlers (SELECT_BLOCK / DESELECT_ALL)            */
  /* ------------------------------------------------------------------ */

  it("injected script handles SELECT_BLOCK message from parent", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("SELECT_BLOCK");
    expect(html).toContain("tt-block-selected");
  });

  it("injected script handles DESELECT_ALL message from parent", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("DESELECT_ALL");
  });

  /* ------------------------------------------------------------------ */
  /*  CSS hover state                                                    */
  /* ------------------------------------------------------------------ */

  it("CSS includes hover state with dashed blue border (2px, 50% opacity)", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    // Check for hover styling on data-block-id elements
    expect(html).toContain("[data-block-id]:hover");
    expect(html).toContain("dashed");
    expect(html).toContain("rgba(25, 118, 210, 0.5)");
  });

  /* ------------------------------------------------------------------ */
  /*  CSS selected state                                                 */
  /* ------------------------------------------------------------------ */

  it("CSS includes selected state with solid blue border (2px, #1976d2)", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain(".tt-block-selected");
    expect(html).toContain("#1976d2");
    expect(html).toContain("solid");
  });

  it("CSS includes corner handles as 8x8px blue squares", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("8px");
    expect(html).toContain("tt-block-handle");
  });

  /* ------------------------------------------------------------------ */
  /*  cursor: pointer                                                    */
  /* ------------------------------------------------------------------ */

  it("all [data-block-id] elements have cursor:pointer", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("[data-block-id]");
    expect(html).toContain("cursor");
    expect(html).toContain("pointer");
  });

  /* ------------------------------------------------------------------ */
  /*  preventDefault + stopPropagation                                   */
  /* ------------------------------------------------------------------ */

  it("click handler calls preventDefault and stopPropagation", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("preventDefault");
    expect(html).toContain("stopPropagation");
  });

  /* ------------------------------------------------------------------ */
  /*  Existing handlers unmodified                                       */
  /* ------------------------------------------------------------------ */

  it("existing CONTENT_UPDATE handler still present", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("CONTENT_UPDATE");
  });

  it("existing VIEWPORT_CHANGE handler still present", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("VIEWPORT_CHANGE");
  });

  it("existing CSP_VIOLATION handler still present", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("CSP_VIOLATION");
    expect(html).toContain("securitypolicyviolation");
  });

  /* ------------------------------------------------------------------ */
  /*  Security: No user-supplied content in JS (PAT-004)                 */
  /* ------------------------------------------------------------------ */

  it("injected script reads block IDs from DOM data attributes, not embedding user content", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    // The script section should reference data-block-id via DOM access
    // and NOT embed any user content strings in JavaScript
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).toBeTruthy();
    const scriptContent = scriptMatch![1];

    // Script reads from DOM: closest('[data-block-id]') or getAttribute('data-block-id')
    expect(scriptContent).toContain("data-block-id");
    // Should NOT contain any block content values
    expect(scriptContent).not.toContain("Welcome");
    expect(scriptContent).not.toContain("Hello");
  });

  /* ------------------------------------------------------------------ */
  /*  Origin validation reuse                                            */
  /* ------------------------------------------------------------------ */

  it("selection postMessages use existing allowedOrigin variable", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "http://localhost:5173",
    );

    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).toBeTruthy();
    const scriptContent = scriptMatch![1];

    // allowedOrigin is defined once and reused
    expect(scriptContent).toContain("allowedOrigin");
    // Only one declaration of allowedOrigin
    const declarations = scriptContent.match(/var allowedOrigin/g);
    expect(declarations).toHaveLength(1);
  });
});
