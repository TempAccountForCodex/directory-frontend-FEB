/**
 * Tests for Step 2.1.2 — FieldWrapper Component
 * Covers: label display, required asterisk, help text, error messages, ARIA attributes.
 */
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldWrapper } from "../FieldWrapper";

// Helper — renders FieldWrapper with a child sentinel div
function renderWrapper(
  props: Partial<React.ComponentProps<typeof FieldWrapper>> = {},
) {
  const defaults: React.ComponentProps<typeof FieldWrapper> = {
    label: "Test Label",
    children: <div data-testid="child">Child Content</div>,
    ...props,
  };
  return render(<FieldWrapper {...defaults} />);
}

describe("FieldWrapper — label", () => {
  it("renders the label text", () => {
    renderWrapper({ label: "Username" });
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("renders without required asterisk by default", () => {
    renderWrapper({ label: "Username", required: false });
    // The * span should not be present when required is false
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders asterisk when required is true", () => {
    renderWrapper({ label: "Email", required: true });
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});

describe("FieldWrapper — help text", () => {
  it("renders short help text as visible text", () => {
    renderWrapper({ help: "Enter your full name." });
    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
  });

  it("does not render a help element when help is not provided", () => {
    renderWrapper({ help: undefined });
    // No "caption" span with help content
    const captions = document.querySelectorAll("span.MuiTypography-caption");
    expect(captions.length).toBe(0);
  });

  it("renders long help text truncated with ellipsis", () => {
    const longHelp = "A".repeat(90);
    renderWrapper({ help: longHelp });
    // Should show first 80 chars followed by ellipsis character
    const truncated = longHelp.slice(0, 80) + "…";
    expect(screen.getByText(truncated)).toBeInTheDocument();
  });

  it("SECURITY: help text has no innerHTML injection (plain text only)", () => {
    const xssAttempt = '<script>alert("xss")</script>';
    renderWrapper({ help: xssAttempt });
    // The script tag text should appear as literal text, not executed
    expect(screen.getByText(xssAttempt)).toBeInTheDocument();
    // Verify no script elements were created
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });
});

describe("FieldWrapper — errors", () => {
  it("renders no error when errors array is empty", () => {
    renderWrapper({ errors: [] });
    expect(document.querySelector('[role="alert"]')).not.toBeInTheDocument();
  });

  it("renders a single error message", () => {
    renderWrapper({ errors: ["This field is required."] });
    expect(screen.getByText("This field is required.")).toBeInTheDocument();
  });

  it("renders multiple error messages", () => {
    renderWrapper({ errors: ["Too short.", "Invalid format."] });
    expect(screen.getByText("Too short.")).toBeInTheDocument();
    expect(screen.getByText("Invalid format.")).toBeInTheDocument();
  });

  it('renders errors with role="alert" and aria-live="polite"', () => {
    renderWrapper({ errors: ["Required"] });
    const alertEl = document.querySelector('[role="alert"]');
    expect(alertEl).toBeInTheDocument();
    expect(alertEl?.getAttribute("aria-live")).toBe("polite");
  });
});

describe("FieldWrapper — ARIA attributes", () => {
  it("sets aria-required on the field container when required", () => {
    renderWrapper({ required: true });
    // aria-required appears on the inner Box wrapping children
    const ariaRequired = document.querySelector('[aria-required="true"]');
    expect(ariaRequired).toBeInTheDocument();
  });

  it("sets aria-invalid on the field container when there are errors", () => {
    renderWrapper({ errors: ["Oops"] });
    const ariaInvalid = document.querySelector('[aria-invalid="true"]');
    expect(ariaInvalid).toBeInTheDocument();
  });

  it("sets aria-describedby when help text is provided", () => {
    renderWrapper({ help: "Some help text" });
    const described = document.querySelector("[aria-describedby]");
    expect(described).toBeInTheDocument();
  });

  it("sets aria-describedby linking to error container when errors exist", () => {
    renderWrapper({ errors: ["Error here"] });
    const described = document.querySelector("[aria-describedby]");
    expect(described).toBeInTheDocument();
  });
});

describe("FieldWrapper — children", () => {
  it("renders children inside the wrapper", () => {
    renderWrapper();
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });
});

describe("FieldWrapper — memoization", () => {
  it("has displayName set", () => {
    expect(FieldWrapper.displayName).toBe("FieldWrapper");
  });
});
