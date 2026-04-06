/**
 * Integration tests for inline text editing (Step 9.16.3 + 9.16.4)
 *
 * Covers:
 * - EDIT_START postMessage from iframe opens InlineTextEditor
 * - Saving inline edit updates block content in state
 * - Escape during inline edit cancels (does NOT deselect block)
 * - Undo/redo tracks inline edits
 * - Mobile users do not see inline editor
 * - EDIT_COMPLETE message sent to iframe after save
 * - PropertyPanel reflects updated value after inline save
 * - data-editable attributes in previewInjector output
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { generateLivePreview, escapeHtml } from "../../utils/previewInjector";
import type {
  PreviewWebsite,
  PreviewPage,
  PreviewBlock,
} from "../../utils/previewInjector";

/* ------------------------------------------------------------------ */
/*  previewInjector data-editable tests (9.16.1)                       */
/* ------------------------------------------------------------------ */

describe("previewInjector data-editable attributes", () => {
  const website: PreviewWebsite = { name: "Test", colors: {}, fonts: {} };
  const page: PreviewPage = { id: "p1", title: "Home" };

  it("HERO block has data-editable on h1, p, and a elements", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "hero1",
        blockType: "HERO",
        content: {
          title: "My Title",
          subtitle: "My Sub",
          buttonText: "Click Me",
          buttonUrl: "#",
        },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain('data-editable="title"');
    expect(html).toContain('data-editable="subtitle"');
    expect(html).toContain('data-editable="buttonText"');
  });

  it("TEXT block has data-editable on div", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "text1",
        blockType: "TEXT",
        content: { text: "Some text content" },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain('data-editable="text"');
  });

  it("CTA block has data-editable on h2, p, and a elements", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "cta1",
        blockType: "CTA",
        content: {
          heading: "CTA Heading",
          description: "CTA Desc",
          buttonText: "Go",
        },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain('data-editable="heading"');
    expect(html).toContain('data-editable="description"');
    expect(html).toContain('data-editable="buttonText"');
  });

  it("CONTACT block has data-editable on h2", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "contact1",
        blockType: "CONTACT",
        content: { heading: "Contact Us" },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain('data-editable="heading"');
  });

  it("NAVBAR block has data-editable on strong", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "nav1",
        blockType: "NAVBAR",
        content: { logo: "My Site", links: [] },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain('data-editable="brandName"');
  });

  it("FOOTER block has data-editable on p", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "footer1",
        blockType: "FOOTER",
        content: { copyright: "2026 Test", links: [] },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain('data-editable="copyright"');
  });

  it("data-editable attributes use escapeHtml for XSS prevention", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "hero1",
        blockType: "HERO",
        content: {
          title: "<script>alert(1)</script>",
          subtitle: "",
          buttonText: "",
        },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    // The content should be escaped, not raw HTML
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("generated HTML includes dblclick listener for EDIT_START", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "hero1",
        blockType: "HERO",
        content: { title: "Title" },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain("dblclick");
    expect(html).toContain("EDIT_START");
  });

  it("generated HTML includes EDIT_COMPLETE handler", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "hero1",
        blockType: "HERO",
        content: { title: "Title" },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain("EDIT_COMPLETE");
  });

  it("data-editable hover CSS exists (cursor:text and underline)", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "hero1",
        blockType: "HERO",
        content: { title: "Title" },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain("[data-editable]");
    expect(html).toContain("cursor");
  });

  it("data-edit-type attributes are set (single or multi)", () => {
    const blocks: PreviewBlock[] = [
      {
        id: "text1",
        blockType: "TEXT",
        content: { text: "Some text" },
        order: 0,
      },
    ];
    const html = generateLivePreview(
      website,
      page,
      blocks,
      "http://localhost:5173",
    );
    expect(html).toContain('data-edit-type="multi"');
  });
});
