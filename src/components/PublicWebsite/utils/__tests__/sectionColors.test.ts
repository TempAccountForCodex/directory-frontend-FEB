import { describe, it, expect } from "vitest";
import {
  resolveSectionColors,
  hasSectionColorOverride,
} from "../sectionColors";

describe("resolveSectionColors", () => {
  it("returns empty object for mode=default", () => {
    expect(resolveSectionColors("default")).toEqual({});
  });

  it("returns empty object for undefined mode", () => {
    expect(resolveSectionColors(undefined)).toEqual({});
  });

  it("returns empty object for unknown mode", () => {
    expect(resolveSectionColors("unknown-value")).toEqual({});
  });

  it("returns white bg + dark text for mode=light", () => {
    const result = resolveSectionColors("light");
    expect(result.backgroundColor).toBe("#ffffff");
    expect(result.color).toBe("#1a1a1a");
  });

  it("returns dark bg + light text for mode=dark", () => {
    const result = resolveSectionColors("dark");
    expect(result.backgroundColor).toBe("#1a1a1a");
    expect(result.color).toBe("#ffffff");
  });

  it("mode=custom returns only color when sectionTextColor provided", () => {
    const result = resolveSectionColors("custom", "#ff6600");
    expect(result.color).toBe("#ff6600");
    expect(result.backgroundColor).toBeUndefined();
  });

  it("mode=custom with no color returns empty object", () => {
    expect(resolveSectionColors("custom")).toEqual({});
  });

  it("mode=custom ignores sectionTextColor=undefined", () => {
    expect(resolveSectionColors("custom", undefined)).toEqual({});
  });

  it("light mode ignores sectionTextColor (preset colors apply)", () => {
    const result = resolveSectionColors("light", "#ff0000");
    expect(result.color).toBe("#1a1a1a");
    expect(result.backgroundColor).toBe("#ffffff");
  });

  it("dark mode ignores sectionTextColor (preset colors apply)", () => {
    const result = resolveSectionColors("dark", "#ff0000");
    expect(result.color).toBe("#ffffff");
    expect(result.backgroundColor).toBe("#1a1a1a");
  });
});

describe("hasSectionColorOverride", () => {
  it("returns false for mode=default", () => {
    expect(hasSectionColorOverride("default")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasSectionColorOverride(undefined)).toBe(false);
  });

  it("returns true for mode=light", () => {
    expect(hasSectionColorOverride("light")).toBe(true);
  });

  it("returns true for mode=dark", () => {
    expect(hasSectionColorOverride("dark")).toBe(true);
  });

  it("returns true for mode=custom", () => {
    expect(hasSectionColorOverride("custom")).toBe(true);
  });
});
