/**
 * Tests for DetailedCustomPanel component (Step 9.13.5)
 *
 * Covers:
 * 1. Renders Website Details section with name and slug fields
 * 2. Slug validation error displayed
 * 3. Slug helper text shows URL preview
 * 4. BlockEditor rendered
 * 5. SaveStatus shown conditionally
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../BlockEditor/BlockEditor", () => ({
  default: ({ blocks, onChange }: any) => (
    <div data-testid="block-editor">
      <span data-testid="block-count">{blocks?.length ?? 0}</span>
      <button onClick={() => onChange([])}>clear</button>
    </div>
  ),
}));

vi.mock("../../Editor/SaveStatus", () => ({
  default: ({ status }: any) => (
    <div data-testid="save-status" data-status={status}>
      {status}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------

import DetailedCustomPanel from "../DetailedCustomPanel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockColors = {
  text: "#ffffff",
  textSecondary: "#aaaaaa",
  primary: "#378C92",
  dark: "#0a0a0a",
  border: "#333333",
  bgDefault: "#111111",
};

const baseProps = {
  websiteName: "My Website",
  slug: "my-website",
  onWebsiteNameChange: vi.fn(),
  onSlugChange: vi.fn(),
  editorBlocks: [],
  onBlockEditorChange: vi.fn(),
  colors: mockColors,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DetailedCustomPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Website Details section heading", () => {
    render(<DetailedCustomPanel {...baseProps} />);
    expect(screen.getByText("Website Details")).toBeInTheDocument();
  });

  it("renders website name text field with current value", () => {
    render(<DetailedCustomPanel {...baseProps} />);
    const nameInput = screen.getByDisplayValue("My Website");
    expect(nameInput).toBeInTheDocument();
  });

  it("renders slug text field with current value", () => {
    render(<DetailedCustomPanel {...baseProps} />);
    const slugInput = screen.getByDisplayValue("my-website");
    expect(slugInput).toBeInTheDocument();
  });

  it("fires onWebsiteNameChange when name input changes", () => {
    render(<DetailedCustomPanel {...baseProps} />);
    const nameInput = screen.getByDisplayValue("My Website");
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    expect(baseProps.onWebsiteNameChange).toHaveBeenCalledWith("New Name");
  });

  it("fires onSlugChange when slug input changes", () => {
    render(<DetailedCustomPanel {...baseProps} />);
    const slugInput = screen.getByDisplayValue("my-website");
    fireEvent.change(slugInput, { target: { value: "new-slug" } });
    expect(baseProps.onSlugChange).toHaveBeenCalledWith("new-slug");
  });

  it("shows slug validation error when slugError prop provided", () => {
    render(
      <DetailedCustomPanel
        {...baseProps}
        slugError="Slug can only contain lowercase letters"
      />,
    );
    expect(
      screen.getByText("Slug can only contain lowercase letters"),
    ).toBeInTheDocument();
  });

  it("shows URL preview in slug helper text", () => {
    render(<DetailedCustomPanel {...baseProps} slug="my-website" />);
    expect(screen.getByText(/\/site\/my-website/)).toBeInTheDocument();
  });

  it("renders Block Content Editor section heading", () => {
    render(<DetailedCustomPanel {...baseProps} />);
    expect(screen.getByText("Block Content Editor")).toBeInTheDocument();
  });

  it("renders BlockEditor component", () => {
    render(<DetailedCustomPanel {...baseProps} />);
    expect(screen.getByTestId("block-editor")).toBeInTheDocument();
  });

  it("passes editorBlocks to BlockEditor", () => {
    const blocks = [
      {
        id: "1",
        blockType: "HERO",
        content: {},
        isVisible: true,
        sortOrder: 0,
      },
    ];
    render(<DetailedCustomPanel {...baseProps} editorBlocks={blocks} />);
    expect(screen.getByTestId("block-count")).toHaveTextContent("1");
  });

  it("does NOT render SaveStatus when blockEditorWebsiteId is not provided", () => {
    render(<DetailedCustomPanel {...baseProps} />);
    expect(screen.queryByTestId("save-status")).not.toBeInTheDocument();
  });

  it("renders SaveStatus when blockEditorWebsiteId is provided", () => {
    render(
      <DetailedCustomPanel
        {...baseProps}
        blockEditorWebsiteId={5}
        blockSaveStatus="saved"
      />,
    );
    expect(screen.getByTestId("save-status")).toBeInTheDocument();
  });

  it("passes blockSaveStatus to SaveStatus component", () => {
    render(
      <DetailedCustomPanel
        {...baseProps}
        blockEditorWebsiteId={5}
        blockSaveStatus="saving"
      />,
    );
    expect(screen.getByTestId("save-status")).toHaveAttribute(
      "data-status",
      "saving",
    );
  });
});
