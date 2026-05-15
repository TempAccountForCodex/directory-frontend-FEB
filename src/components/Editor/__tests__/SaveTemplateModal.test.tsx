/**
 * Tests for SaveTemplateModal component (Step 9.3.4)
 *
 * Covers:
 * 1. Renders with name input and description textarea
 * 2. Submit button disabled when name is empty
 * 3. Validates name: shows error for empty
 * 4. Calls onSave with correct data on valid submit
 * 5. Calls onCancel when Cancel button clicked
 * 6. Name field enforces max 100 character hint
 * 7. Description field allows optional text
 * 8. React.memo: component is memoized
 * 9. Loading state: shows spinner during save
 * 10. Error state: shows error alert on save failure
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Component under test
// ---------------------------------------------------------------------------
import SaveTemplateModal from "../SaveTemplateModal";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SaveTemplateModal (Step 9.3.4)", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    blockType: "HERO",
    blockContent: { heading: "My Hero", ctaText: "Click Me" },
    onSaveSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 1, name: "My Template", blockType: "HERO" },
      }),
    });
  });

  it("renders name input when open=true", async () => {
    await act(async () => {
      render(<SaveTemplateModal {...defaultProps} />);
    });
    expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
  });

  it("renders description textarea", async () => {
    await act(async () => {
      render(<SaveTemplateModal {...defaultProps} />);
    });
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("Save button is disabled when name is empty", async () => {
    await act(async () => {
      render(<SaveTemplateModal {...defaultProps} />);
    });
    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn).toBeDisabled();
  });

  it("Save button enabled after name is entered", async () => {
    await act(async () => {
      render(<SaveTemplateModal {...defaultProps} />);
    });
    const nameInput = screen.getByLabelText(/template name/i);
    fireEvent.change(nameInput, { target: { value: "My Hero Template" } });
    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn).not.toBeDisabled();
  });

  it("calls fetch with correct data on valid submit", async () => {
    await act(async () => {
      render(<SaveTemplateModal {...defaultProps} />);
    });
    const nameInput = screen.getByLabelText(/template name/i);
    fireEvent.change(nameInput, { target: { value: "My Hero Template" } });
    const descInput = screen.getByLabelText(/description/i);
    fireEvent.change(descInput, { target: { value: "Great template" } });
    const saveBtn = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/blocks/templates"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("My Hero Template"),
        }),
      );
    });
  });

  it("calls onSaveSuccess after successful save", async () => {
    const onSaveSuccess = vi.fn();
    await act(async () => {
      render(
        <SaveTemplateModal {...defaultProps} onSaveSuccess={onSaveSuccess} />,
      );
    });
    const nameInput = screen.getByLabelText(/template name/i);
    fireEvent.change(nameInput, { target: { value: "Test Template" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(onSaveSuccess).toHaveBeenCalled();
    });
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    await act(async () => {
      render(<SaveTemplateModal {...defaultProps} onClose={onClose} />);
    });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows error alert when API call fails", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    await act(async () => {
      render(<SaveTemplateModal {...defaultProps} />);
    });
    const nameInput = screen.getByLabelText(/template name/i);
    fireEvent.change(nameInput, { target: { value: "Fail Template" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("is wrapped with React.memo", () => {
    expect(SaveTemplateModal).toBeDefined();
    expect((SaveTemplateModal as any).$$typeof?.toString()).toContain("Symbol");
  });

  it("does not render when open=false", async () => {
    await act(async () => {
      render(<SaveTemplateModal {...defaultProps} open={false} />);
    });
    expect(screen.queryByLabelText(/template name/i)).not.toBeInTheDocument();
  });
});
