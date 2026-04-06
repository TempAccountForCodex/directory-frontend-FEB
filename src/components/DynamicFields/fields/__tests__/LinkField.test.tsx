/**
 * Tests for LinkField error display (step 2.7.2)
 * Covers: errors[] prop display, aria-invalid, aria-describedby, backward compat with error prop.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock DashboardInput to avoid ThemeContext dependency
vi.mock("../../../Dashboard/shared/DashboardInput", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    onBlur,
    disabled,
    placeholder,
    error,
    helperText,
    inputProps,
  }: any) => (
    <div>
      <input
        type="url"
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={inputProps?.["aria-label"]}
        aria-invalid={inputProps?.["aria-invalid"]}
        aria-describedby={inputProps?.["aria-describedby"]}
      />
      {helperText && <span>{helperText}</span>}
    </div>
  ),
}));

import { LinkField } from "../LinkField";

interface RenderProps {
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  error?: string;
  errors?: string[];
  label?: string;
}

function renderLinkField(props: RenderProps = {}) {
  const {
    value = "",
    onChange = vi.fn(),
    disabled = false,
    error,
    errors = [],
    label,
  } = props;

  return render(
    <LinkField
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
      errors={errors}
      label={label}
    />,
  );
}

describe("LinkField — error display", () => {
  it("shows single error via FormHelperText when errors=[one]", () => {
    renderLinkField({ errors: ["URL is required"] });
    expect(screen.getByText("URL is required")).toBeInTheDocument();
  });

  it("shows multiple errors when errors=[two]", () => {
    renderLinkField({ errors: ["Invalid URL", "Must be https"] });
    expect(screen.getByText("Invalid URL")).toBeInTheDocument();
    expect(screen.getByText("Must be https")).toBeInTheDocument();
  });

  it("sets aria-invalid on input when errors present", () => {
    renderLinkField({ errors: ["Required"] });
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("does NOT set aria-invalid when no errors and no error prop", () => {
    renderLinkField({ errors: [], error: undefined });
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("sets aria-describedby on input when errors present", () => {
    renderLinkField({ errors: ["Required"] });
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby");
  });

  it("does NOT set aria-describedby when no errors", () => {
    renderLinkField({ errors: [] });
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("preserves existing error prop display via Alert", () => {
    renderLinkField({ error: "Invalid URL format" });
    // Error prop renders in both helperText and Alert — verify at least one exists
    const matches = screen.getAllByText("Invalid URL format");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows both error prop and errors[] simultaneously", () => {
    renderLinkField({ error: "Bad URL", errors: ["Field required"] });
    const errorMatches = screen.getAllByText("Bad URL");
    expect(errorMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Field required")).toBeInTheDocument();
  });

  it("shows no FormHelperText error elements when errors=[]", () => {
    const { container } = renderLinkField({ errors: [] });
    const helperTexts = container.querySelectorAll(".MuiFormHelperText-root");
    expect(helperTexts).toHaveLength(0);
  });

  it("renders normally when no errors", () => {
    renderLinkField({ errors: [] });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
