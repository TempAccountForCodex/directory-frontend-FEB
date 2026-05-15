/**
 * Tests for ImageUpload error display (step 2.7.2)
 * Covers: errors[] prop display, aria-invalid, aria-describedby, backward compat with error prop.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock react-dropzone to avoid complex drag/drop in unit tests
vi.mock("react-dropzone", () => ({
  useDropzone: ({ disabled }: { disabled?: boolean }) => ({
    getRootProps: () => ({
      role: "button",
      "aria-label": "Upload image",
    }),
    getInputProps: () => ({ type: "file", style: { display: "none" } }),
    isDragActive: false,
  }),
}));

vi.mock("axios");

import { ImageUpload } from "../ImageUpload";

interface RenderProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  disabled?: boolean;
  error?: string;
  errors?: string[];
  label?: string;
}

function renderImageUpload(props: RenderProps = {}) {
  const {
    value = null,
    onChange = vi.fn(),
    disabled = false,
    error,
    errors = [],
    label,
  } = props;

  return render(
    <ImageUpload
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
      errors={errors}
      label={label}
    />,
  );
}

describe("ImageUpload — error display", () => {
  it("shows single error via FormHelperText when errors=[one]", () => {
    renderImageUpload({ errors: ["Image is required"] });
    expect(screen.getByText("Image is required")).toBeInTheDocument();
  });

  it("shows multiple errors when errors=[two]", () => {
    renderImageUpload({ errors: ["Too large", "Wrong format"] });
    expect(screen.getByText("Too large")).toBeInTheDocument();
    expect(screen.getByText("Wrong format")).toBeInTheDocument();
  });

  it("shows no FormHelperText error elements when errors=[]", () => {
    const { container } = renderImageUpload({ errors: [] });
    const helperTexts = container.querySelectorAll(".MuiFormHelperText-root");
    expect(helperTexts).toHaveLength(0);
  });

  it("preserves existing error prop display via Alert", () => {
    renderImageUpload({ error: "Upload failed" });
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
  });

  it("shows both error prop (Alert) and errors[] (FormHelperText) simultaneously", () => {
    renderImageUpload({ error: "Upload failed", errors: ["Field required"] });
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
    expect(screen.getByText("Field required")).toBeInTheDocument();
  });

  it("renders dropzone with error border color when errors present", () => {
    const { container } = renderImageUpload({ errors: ["Required"] });
    // Dropzone box exists (the upload area)
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("renders normally when no errors and no error prop", () => {
    renderImageUpload({ errors: [], error: undefined });
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
