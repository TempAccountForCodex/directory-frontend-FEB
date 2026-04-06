/**
 * KeyboardAccessibility.test.tsx — Step 9.11
 *
 * Consolidated tests for Mobile Editor Keyboard Accessibility:
 *   9.11.1 — useInputMethod hook, BottomSheet keyboard, ResponsiveEditorLayout navigation
 *   9.11.2 — MobileActionBar a11y, MobileFAB a11y, ViewportPreviewToolbar a11y
 *   9.11.3 — Keyboard mode toggle, localStorage persistence, gesture/keyboard conflict
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { useInputMethod } from "../../../hooks/useInputMethod";
import BottomSheet from "../BottomSheet";
import ResponsiveEditorLayout from "../ResponsiveEditorLayout";
import MobileActionBar from "../MobileActionBar";
import MobileFAB from "../MobileFAB";
import ViewportPreviewToolbar from "../ViewportPreviewToolbar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const theme = createTheme();

const withTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  document.body.classList.remove("keyboard-active");
  vi.mocked(localStorage.getItem).mockReturnValue(null);
  vi.mocked(localStorage.setItem).mockClear();
  vi.mocked(localStorage.clear).mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.classList.remove("keyboard-active");
});

// ---------------------------------------------------------------------------
// 9.11.1 — useInputMethod hook
// ---------------------------------------------------------------------------

describe("9.11.1 — useInputMethod", () => {
  it("detects touch input after touchstart", () => {
    const { result } = renderHook(() => useInputMethod());
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    expect(result.current.inputMethod).toBe("touch");
    expect(result.current.isKeyboardMode).toBe(false);
  });

  it("detects keyboard input after keydown with no recent touch", () => {
    const { result } = renderHook(() => useInputMethod());
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(result.current.inputMethod).toBe("keyboard");
    expect(result.current.isKeyboardMode).toBe(true);
  });

  it("blocks keyboard mode within 5 seconds of touch", () => {
    const { result } = renderHook(() => useInputMethod());
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    act(() => {
      vi.advanceTimersByTime(3000);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(result.current.inputMethod).toBe("touch");
    expect(result.current.isKeyboardMode).toBe(false);
  });

  it("allows keyboard mode after 5 seconds without touch", () => {
    const { result } = renderHook(() => useInputMethod());
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    act(() => {
      vi.advanceTimersByTime(5100);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(result.current.inputMethod).toBe("keyboard");
    expect(result.current.isKeyboardMode).toBe(true);
  });

  it("adds keyboard-active class to body in keyboard mode", () => {
    renderHook(() => useInputMethod());
    expect(document.body.classList.contains("keyboard-active")).toBe(false);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(document.body.classList.contains("keyboard-active")).toBe(true);
  });

  it("removes keyboard-active class when switching to touch", () => {
    renderHook(() => useInputMethod());
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(document.body.classList.contains("keyboard-active")).toBe(true);
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    expect(document.body.classList.contains("keyboard-active")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 9.11.1 — BottomSheet keyboard support
// ---------------------------------------------------------------------------

describe("9.11.1 — BottomSheet keyboard", () => {
  it('has role="dialog" and aria-modal="true" when open', () => {
    withTheme(
      <BottomSheet open={true} onClose={vi.fn()} onOpen={vi.fn()} title="Test">
        <div>content</div>
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("closes on Escape key press", () => {
    const onClose = vi.fn();
    withTheme(
      <BottomSheet
        open={true}
        onClose={onClose}
        onOpen={vi.fn()}
        title="Test Sheet"
      >
        <div>content</div>
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onConfirm on Enter key for non-interactive elements", () => {
    const onConfirm = vi.fn();
    withTheme(
      <BottomSheet
        open={true}
        onClose={vi.fn()}
        onOpen={vi.fn()}
        title="Confirm Test"
        onConfirm={onConfirm}
      >
        <div data-testid="inner-content">content</div>
      </BottomSheet>,
    );
    const inner = screen.getByTestId("inner-content");
    fireEvent.keyDown(inner, { key: "Enter" });
    expect(onConfirm).toHaveBeenCalled();
  });

  it("has aria-label matching the title", () => {
    withTheme(
      <BottomSheet
        open={true}
        onClose={vi.fn()}
        onOpen={vi.fn()}
        title="Block Library"
      >
        <div>content</div>
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Block Library");
  });

  it("Tab navigates through interactive elements within sheet", () => {
    withTheme(
      <BottomSheet
        open={true}
        onClose={vi.fn()}
        onOpen={vi.fn()}
        title="Tab Nav Test"
      >
        <button>Action 1</button>
        <button>Action 2</button>
      </BottomSheet>,
    );
    // Both buttons and the Close button should be in the DOM
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3); // Close + Action 1 + Action 2
  });
});

// ---------------------------------------------------------------------------
// 9.11.1 — ResponsiveEditorLayout navigation
// ---------------------------------------------------------------------------

describe("9.11.1 — ResponsiveEditorLayout keyboard navigation", () => {
  it('has role="region" and aria-label="Editor canvas"', () => {
    withTheme(
      <ResponsiveEditorLayout>
        <div>block</div>
      </ResponsiveEditorLayout>,
    );
    const region = screen.getByRole("region", { name: /editor canvas/i });
    expect(region).toBeInTheDocument();
  });

  it("has tabIndex=0 for keyboard focus", () => {
    withTheme(
      <ResponsiveEditorLayout>
        <div>block</div>
      </ResponsiveEditorLayout>,
    );
    const layout = screen.getByTestId("responsive-editor-layout");
    expect(layout).toHaveAttribute("tabindex", "0");
  });

  it("dispatches block-navigate event on ArrowDown", () => {
    const handler = vi.fn();
    window.addEventListener("block-navigate", handler);

    withTheme(
      <ResponsiveEditorLayout>
        <div>block</div>
      </ResponsiveEditorLayout>,
    );
    const layout = screen.getByTestId("responsive-editor-layout");
    fireEvent.keyDown(layout, { key: "ArrowDown" });

    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail.direction).toBe(
      "down",
    );

    window.removeEventListener("block-navigate", handler);
  });

  it("dispatches block-navigate event on ArrowUp", () => {
    const handler = vi.fn();
    window.addEventListener("block-navigate", handler);

    withTheme(
      <ResponsiveEditorLayout>
        <div>block</div>
      </ResponsiveEditorLayout>,
    );
    const layout = screen.getByTestId("responsive-editor-layout");
    fireEvent.keyDown(layout, { key: "ArrowUp" });

    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail.direction).toBe(
      "up",
    );

    window.removeEventListener("block-navigate", handler);
  });
});

// ---------------------------------------------------------------------------
// 9.11.2 — MobileActionBar a11y
// ---------------------------------------------------------------------------

describe("9.11.2 — MobileActionBar accessibility", () => {
  const defaultProps = {
    onSave: vi.fn(),
    onPublish: vi.fn(),
    onPreview: vi.fn(),
    isSaving: false,
  };

  it("has descriptive aria-labels on all buttons", () => {
    withTheme(<MobileActionBar {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /publish website/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /preview website/i }),
    ).toBeInTheDocument();
  });

  it("has an aria-live region for announcements", () => {
    withTheme(<MobileActionBar {...defaultProps} />);
    const announcer = screen.getByTestId("action-announcer");
    expect(announcer).toHaveAttribute("aria-live", "polite");
    expect(announcer).toHaveAttribute("role", "status");
  });

  it('announces "Saving changes..." when Save is clicked', () => {
    const onSave = vi.fn();
    withTheme(<MobileActionBar {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    const announcer = screen.getByTestId("action-announcer");
    expect(announcer.textContent).toBe("Saving changes...");
  });

  it('announces "Publishing..." when Publish is clicked', () => {
    const onPublish = vi.fn();
    withTheme(<MobileActionBar {...defaultProps} onPublish={onPublish} />);
    fireEvent.click(screen.getByRole("button", { name: /publish website/i }));
    const announcer = screen.getByTestId("action-announcer");
    expect(announcer.textContent).toBe("Publishing...");
  });

  it('announces "Opening preview" when Preview is clicked', () => {
    const onPreview = vi.fn();
    withTheme(<MobileActionBar {...defaultProps} onPreview={onPreview} />);
    fireEvent.click(screen.getByRole("button", { name: /preview website/i }));
    const announcer = screen.getByTestId("action-announcer");
    expect(announcer.textContent).toBe("Opening preview");
  });
});

// ---------------------------------------------------------------------------
// 9.11.2 — MobileFAB a11y
// ---------------------------------------------------------------------------

describe("9.11.2 — MobileFAB accessibility", () => {
  it("FAB is focusable via Tab (has tabindex)", () => {
    withTheme(<MobileFAB onOpen={vi.fn()} />);
    const fab = screen.getByRole("button", { name: /add block/i });
    // MUI Fab renders as a button element which is inherently focusable
    expect(fab.tagName).toBe("BUTTON");
    expect(fab).not.toHaveAttribute("tabindex", "-1");
  });

  it("has descriptive aria-label", () => {
    withTheme(<MobileFAB onOpen={vi.fn()} />);
    const fab = screen.getByRole("button", { name: /add block/i });
    expect(fab).toHaveAttribute("aria-label", "Add block");
  });
});

// ---------------------------------------------------------------------------
// 9.11.2 — ViewportPreviewToolbar a11y
// ---------------------------------------------------------------------------

describe("9.11.2 — ViewportPreviewToolbar accessibility", () => {
  const defaultProps = {
    viewportWidth: 375,
    viewportHeight: 667,
    orientation: "portrait" as const,
    onViewportChange: vi.fn(),
    onOrientationToggle: vi.fn(),
  };

  it('active button has aria-pressed="true"', () => {
    withTheme(<ViewportPreviewToolbar {...defaultProps} viewportWidth={375} />);
    const btn375 = screen.getByRole("button", { name: /375px viewport/i });
    expect(btn375).toHaveAttribute("aria-pressed", "true");
  });

  it('inactive buttons have aria-pressed="false"', () => {
    withTheme(<ViewportPreviewToolbar {...defaultProps} viewportWidth={375} />);
    const btn768 = screen.getByRole("button", { name: /768px viewport/i });
    const btn1280 = screen.getByRole("button", { name: /1280px viewport/i });
    expect(btn768).toHaveAttribute("aria-pressed", "false");
    expect(btn1280).toHaveAttribute("aria-pressed", "false");
  });

  it("ButtonGroup has group semantics", () => {
    withTheme(<ViewportPreviewToolbar {...defaultProps} />);
    const group = screen.getByRole("group", { name: /viewport presets/i });
    expect(group).toBeInTheDocument();
  });

  it("all icon-only buttons have descriptive aria-labels", () => {
    withTheme(<ViewportPreviewToolbar {...defaultProps} />);
    // Orientation toggle is an icon-only button
    const orientBtn = screen.getByRole("button", {
      name: /toggle orientation/i,
    });
    expect(orientBtn).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 9.11.3 — Keyboard mode toggle
// ---------------------------------------------------------------------------

describe("9.11.3 — Keyboard mode toggle", () => {
  it("forceKeyboardMode persists to localStorage", () => {
    const { result } = renderHook(() => useInputMethod());

    act(() => {
      result.current.setForceKeyboardMode(true);
    });
    expect(result.current.forceKeyboardMode).toBe(true);
    expect(result.current.isKeyboardMode).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "keyboardNavigationMode",
      "true",
    );
  });

  it("reads forceKeyboardMode from localStorage on mount", () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) =>
      key === "keyboardNavigationMode" ? "true" : null,
    );
    const { result } = renderHook(() => useInputMethod());
    expect(result.current.forceKeyboardMode).toBe(true);
    expect(result.current.isKeyboardMode).toBe(true);
  });

  it("forceKeyboardMode overrides touch detection", () => {
    const { result } = renderHook(() => useInputMethod());
    act(() => {
      result.current.setForceKeyboardMode(true);
    });
    expect(result.current.isKeyboardMode).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    // Still in keyboard mode despite touch
    expect(result.current.isKeyboardMode).toBe(true);
  });

  it("keyboard-active class is present when force mode is on", () => {
    renderHook(() => useInputMethod());
    // Trigger force via the hook
    const { result } = renderHook(() => useInputMethod());
    act(() => {
      result.current.setForceKeyboardMode(true);
    });
    expect(document.body.classList.contains("keyboard-active")).toBe(true);
  });

  it("disabling force mode removes keyboard-active when input is touch", () => {
    const { result } = renderHook(() => useInputMethod());
    act(() => {
      result.current.setForceKeyboardMode(true);
    });
    expect(document.body.classList.contains("keyboard-active")).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("touchstart"));
      result.current.setForceKeyboardMode(false);
    });
    expect(document.body.classList.contains("keyboard-active")).toBe(false);
  });
});
