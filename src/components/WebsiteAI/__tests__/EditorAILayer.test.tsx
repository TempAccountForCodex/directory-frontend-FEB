import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---- Theme + shared component mocks (jsdom-friendly) ----
vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({ actualTheme: "dark" }),
}));
vi.mock("../../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    primary: "#378C92",
    text: "#fff",
    textSecondary: "#9aa",
    border: "#333",
    panelBg: "#111",
    bgCard: "#111",
    error: "#f00",
  }),
}));
vi.mock("../../Dashboard/shared/DashboardGradientButton", () => ({
  default: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
vi.mock("../../Dashboard/shared/DashboardActionButton", () => ({
  default: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
vi.mock("../../Dashboard/shared/DashboardCancelButton", () => ({
  default: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
vi.mock("../../Dashboard/shared/ConfirmationDialog", () => ({
  default: ({ open, onConfirm }: any) =>
    open ? (
      <button data-testid="confirm-fullsite" onClick={onConfirm}>
        confirm
      </button>
    ) : null,
}));

// ---- Service mock ----
vi.mock("../../../api/websiteAI", async () => {
  const actual = await vi.importActual<any>("../../../api/websiteAI");
  return {
    ...actual,
    editElement: vi.fn(),
    editorChat: vi.fn(),
    revertAITurn: vi.fn(),
    recordAppliedEdit: vi.fn(),
    applyWebsiteAIPatches: vi.fn(),
    recreateWebsiteWithAI: vi.fn(),
    restoreWebsiteAIVersion: vi.fn(),
  };
});

import {
  applyWebsiteAIPatches,
  editElement,
  recordAppliedEdit,
} from "../../../api/websiteAI";
import EditorAILayer from "../EditorAILayer";

const mockEdit = editElement as unknown as ReturnType<typeof vi.fn>;
const mockRecord = recordAppliedEdit as unknown as ReturnType<typeof vi.fn>;
const mockApplyPatches = applyWebsiteAIPatches as unknown as ReturnType<
  typeof vi.fn
>;

const baseProps = {
  websiteId: 1,
  pageId: 10,
  getCurrentValue: vi.fn(() => "Original"),
  applyPatch: vi.fn(),
};

const selection = {
  editable: {
    blockId: 9,
    fieldPath: "heading",
    persistedFieldPath: "content.heading",
    aiEditKey: "home.hero.heading",
    label: "Hero heading",
  },
  section: null,
  page: { id: 10, title: "Home" },
};

beforeEach(() => {
  mockEdit.mockReset();
  mockRecord.mockReset();
  mockRecord.mockResolvedValue({ success: true, turnId: "rec_1", recorded: 1 });
  mockApplyPatches.mockReset();
  mockApplyPatches.mockResolvedValue({
    success: true,
    mode: "patch",
    applied: [{ fieldPath: "content.heading" }],
  });
  baseProps.applyPatch.mockReset();
});

describe("EditorAILayer", () => {
  it("disables Ask AI and explains why when access is denied", () => {
    render(
      <EditorAILayer
        {...baseProps}
        canUseAI={false}
        disabledReason="Only the website owner or an admin can use AI on this site."
        selection={selection}
      />,
    );
    // The Ask AI pill is present but clicking should not open the dialog.
    fireEvent.click(screen.getByText("Ask AI"));
    expect(screen.queryByText("Proposed change")).not.toBeInTheDocument();
  });

  it("runs the Ask AI → immediate apply flow (no Proposed/Apply step)", async () => {
    mockEdit.mockResolvedValue({
      turnId: "turn_1",
      patches: [
        {
          aiEditKey: "home.hero.heading",
          blockId: 9,
          pageId: 10,
          path: "pages.10.blocks.9.content.heading",
          editorPath: "heading",
          value: "Premium homes",
          after: "Premium homes",
        },
      ],
      previewText: "Premium homes",
      summary: "Shortened the hero headline.",
    });

    render(
      <EditorAILayer
        {...baseProps}
        canUseAI
        disabledReason={null}
        selection={selection}
      />,
    );

    // Open the Ask AI dialog
    fireEvent.click(screen.getByText("Ask AI"));
    const textbox = await screen.findByPlaceholderText(/Make this headline/i);
    fireEvent.change(textbox, { target: { value: "make it premium" } });

    // Submit (the dialog's Ask AI button)
    const askButtons = screen.getAllByText("Ask AI");
    fireEvent.click(askButtons[askButtons.length - 1]);

    expect(mockEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          aiEditKey: "home.hero.heading",
          fieldPath: "content.heading",
        }),
      }),
    );

    // Immediate apply: the change lands in local editor state at the backend
    // editorPath. There is NO "Proposed change"/"Apply" confirmation step and it
    // is NOT persisted via generate-content patch mode.
    await waitFor(() =>
      expect(baseProps.applyPatch).toHaveBeenCalledWith(
        9,
        "heading",
        "Premium homes",
      ),
    );
    expect(screen.queryByText("Proposed change")).not.toBeInTheDocument();
    expect(mockApplyPatches).not.toHaveBeenCalled();
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it("discloses the two-turn revert limit in the dialog", async () => {
    render(
      <EditorAILayer
        {...baseProps}
        canUseAI
        disabledReason={null}
        selection={selection}
      />,
    );
    fireEvent.click(screen.getByText("Ask AI"));
    expect(
      await screen.findByText(/Only the last two AI changes can be reverted/i),
    ).toBeInTheDocument();
  });

  it("falls back to content-prefixed field paths when a selected field has no schema match attached", async () => {
    mockEdit.mockResolvedValue({
      turnId: "turn_2",
      patch: { "content.heading": "Bright headline" },
      previewText: "Bright headline",
      summary: "Updated the hero headline.",
    });

    render(
      <EditorAILayer
        {...baseProps}
        canUseAI
        disabledReason={null}
        selection={{
          editable: {
            blockId: 9,
            fieldPath: "heading",
            label: "Hero heading",
          },
          section: null,
          page: { id: 10, title: "Home" },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Ask AI"));
    const textbox = await screen.findByPlaceholderText(/Make this headline/i);
    fireEvent.change(textbox, { target: { value: "make it yellow" } });
    const askButtons = screen.getAllByText("Ask AI");
    fireEvent.click(askButtons[askButtons.length - 1]);

    await waitFor(() =>
      expect(mockEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            fieldPath: "pages.10.blocks.9.content.heading",
          }),
        }),
      ),
    );
  });

  it("routes style instructions on selected text to the paired style target", async () => {
    mockEdit.mockResolvedValue({
      turnId: "turn_3",
      patch: {
        "content.headingStyle": { color: "#facc15" },
      },
      previewText: "Updated heading style.",
      summary: "Changed the heading color.",
    });

    render(
      <EditorAILayer
        {...baseProps}
        canUseAI
        disabledReason={null}
        selection={{
          editable: {
            blockId: 9,
            fieldPath: "heading",
            persistedFieldPath: "content.heading",
            aiEditKey: "home.hero.heading",
            label: "Hero heading",
            styleTarget: {
              fieldPath: "headingStyle",
              persistedFieldPath: "content.headingStyle",
              aiEditKey: "home.hero.headingStyle",
              label: "Hero heading style",
            },
          },
          section: null,
          page: { id: 10, title: "Home" },
        }}
      />,
    );

    fireEvent.click(screen.getByText("Ask AI"));
    const textbox = await screen.findByPlaceholderText(/Make this headline/i);
    fireEvent.change(textbox, {
      target: { value: "make the text color bright yellow" },
    });
    const askButtons = screen.getAllByText("Ask AI");
    fireEvent.click(askButtons[askButtons.length - 1]);

    await waitFor(() =>
      expect(mockEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            aiEditKey: "home.hero.headingStyle",
            fieldPath: "content.headingStyle",
          }),
        }),
      ),
    );
  });
});
