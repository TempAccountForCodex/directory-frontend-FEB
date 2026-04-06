/**
 * Tests for Block Insertion functionality (Step 9.3.3)
 *
 * Covers:
 * 1. "Add to Page" button calls onInsertBlock with blockType
 * 2. Position picker: 'At End' is default
 * 3. Position picker: change to 'At Beginning' works
 * 4. Position picker: 'After [block name]' option exists when blocks present
 * 5. onInsertBlock is called with correct position
 * 6. Toast notification shown after insert
 * 7. Drag source: BlockLibraryCard has draggable attribute
 * 8. historyPush is called after successful insert
 * 9. Auto-close: library closes when closeAfterInsert=true
 * 10. Empty page: position picker shows only End and Beginning
 * 11. Multiple blocks: position picker has correct number of options
 * 12. Add from template calls onInsertBlock with template content
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: { "data-draggable": "true" },
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
  DndContext: ({ children }: any) => <div>{children}</div>,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const MOCK_BLOCKS_DATA = [
  {
    key: "HERO",
    label: "Hero",
    description: "Large headline section with CTA",
    category: "core",
    icon: "hero",
    capabilities: {
      supportsBackground: true,
      isDynamic: false,
      supportsVariants: true,
      supportsCustomCss: true,
      supportsVisibility: true,
    },
    variants: ["centered", "left"],
  },
];

// ---------------------------------------------------------------------------
// Import component under test
// ---------------------------------------------------------------------------
import BlockLibrary from "../BlockLibrary";

const EXISTING_BLOCKS = [
  { id: 1, blockType: "HERO", sortOrder: 0 },
  { id: 2, blockType: "FEATURES", sortOrder: 1 },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlockInsertion (Step 9.3.3)", () => {
  const onInsertBlock = vi.fn();
  const onClose = vi.fn();
  const historyPush = vi.fn();

  const defaultProps = {
    open: true,
    onClose,
    pageId: 1,
    blocks: EXISTING_BLOCKS,
    onInsertBlock,
    historyPush,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: MOCK_BLOCKS_DATA }),
    });
  });

  it("calls onInsertBlock when Add button clicked on card", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    const addBtn = screen.getByRole("button", { name: /add hero to page/i });
    fireEvent.click(addBtn);
    expect(onInsertBlock).toHaveBeenCalledWith("HERO", "end");
  });

  it("position picker default is At End", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    // The select should display 'At End' as value text
    expect(screen.getByText("At End")).toBeInTheDocument();
  });

  it("position picker shows At Beginning option", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    // Open position select
    const positionSelect = screen.getByRole("combobox", {
      name: /insert position/i,
    });
    fireEvent.mouseDown(positionSelect);
    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: /at beginning/i }),
      ).toBeInTheDocument();
    });
  });

  it("position picker shows After [block] options when page has blocks", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    const positionSelect = screen.getByRole("combobox", {
      name: /insert position/i,
    });
    fireEvent.mouseDown(positionSelect);
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      // Should have: At End, At Beginning, After HERO #1, After FEATURES #2
      expect(options.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("shows toast after successful insert", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    const addBtn = screen.getByRole("button", { name: /add hero to page/i });
    fireEvent.click(addBtn);
    await waitFor(() => {
      expect(screen.getByText(/hero block added/i)).toBeInTheDocument();
    });
  });

  it("calls historyPush after successful insert", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    const addBtn = screen.getByRole("button", { name: /add hero to page/i });
    fireEvent.click(addBtn);
    expect(historyPush).toHaveBeenCalledWith(
      expect.objectContaining({ blockType: "HERO" }),
      expect.stringContaining("Hero"),
    );
  });

  it("closes library after insert when closeAfterInsert=true", async () => {
    const onCloseLocal = vi.fn();
    render(
      <BlockLibrary
        {...defaultProps}
        onClose={onCloseLocal}
        closeAfterInsert
      />,
    );
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    const addBtn = screen.getByRole("button", { name: /add hero to page/i });
    fireEvent.click(addBtn);
    expect(onCloseLocal).toHaveBeenCalled();
  });

  it("does not close library when closeAfterInsert=false (default)", async () => {
    const onCloseLocal = vi.fn();
    render(
      <BlockLibrary
        {...defaultProps}
        onClose={onCloseLocal}
        closeAfterInsert={false}
      />,
    );
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    const addBtn = screen.getByRole("button", { name: /add hero to page/i });
    fireEvent.click(addBtn);
    expect(onCloseLocal).not.toHaveBeenCalled();
  });

  it("position picker shows only End and Beginning when page is empty", async () => {
    render(<BlockLibrary {...defaultProps} blocks={[]} />);
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    const positionSelect = screen.getByRole("combobox", {
      name: /insert position/i,
    });
    fireEvent.mouseDown(positionSelect);
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      // Should have only: At End, At Beginning
      expect(options.length).toBe(2);
    });
  });

  it("onInsertBlock called with position when changed to beginning", async () => {
    render(<BlockLibrary {...defaultProps} blocks={[]} />);
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());

    // Change position to beginning
    const positionSelect = screen.getByRole("combobox", {
      name: /insert position/i,
    });
    fireEvent.mouseDown(positionSelect);
    await waitFor(() => {
      const beginningOption = screen.getByRole("option", {
        name: /at beginning/i,
      });
      fireEvent.click(beginningOption);
    });

    const addBtn = screen.getByRole("button", { name: /add hero to page/i });
    fireEvent.click(addBtn);
    expect(onInsertBlock).toHaveBeenCalledWith("HERO", "beginning");
  });

  it("renders cards with drag attributes from useDraggable", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());
    // After fetch, cards should be rendered — draggable attribute set by useDraggable mock
    const cards = document.querySelectorAll('[data-draggable="true"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it("inserts from template with template content", async () => {
    const onInsertFromTemplate = vi.fn();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: MOCK_BLOCKS_DATA }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 1,
              name: "My Hero",
              blockType: "HERO",
              content: { heading: "Custom Heading" },
              isShared: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });

    render(
      <BlockLibrary
        {...defaultProps}
        onInsertFromTemplate={onInsertFromTemplate}
      />,
    );
    await waitFor(() => expect(screen.getByText("Hero")).toBeInTheDocument());

    // Switch to My Templates tab
    const myTemplatesTab = screen.getByRole("tab", { name: /my templates/i });
    fireEvent.click(myTemplatesTab);
    await waitFor(() => {
      expect(screen.getByText("My Hero")).toBeInTheDocument();
    });

    // Insert from template
    const insertBtn = screen.getByRole("button", { name: /insert/i });
    fireEvent.click(insertBtn);
    expect(onInsertFromTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "My Hero" }),
      "end",
    );
  });
});
