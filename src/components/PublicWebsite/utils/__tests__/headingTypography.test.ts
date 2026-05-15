import { describe, it, expect } from "vitest";
import {
  TEXT_SHADOW_MAP,
  TEXT_SHADOW_MAP_SUBHEADING,
  LINE_HEIGHT_MAP,
  resolveHeadingTypographySx,
  resolveSubheadingTypographySx,
  resolveGradientTextSx,
  resolveTextStrokeSx,
} from "../headingTypography";

// ── Map integrity ──────────────────────────────────────────────────────────────

describe("TEXT_SHADOW_MAP", () => {
  it('maps none to "none"', () => {
    expect(TEXT_SHADOW_MAP.none).toBe("none");
  });

  it("maps subtle to correct rgba value", () => {
    expect(TEXT_SHADOW_MAP.subtle).toBe("0 2px 8px rgba(0,0,0,0.15)");
  });

  it("maps medium to correct rgba value", () => {
    expect(TEXT_SHADOW_MAP.medium).toBe("0 4px 16px rgba(0,0,0,0.25)");
  });

  it("maps dramatic to correct rgba value", () => {
    expect(TEXT_SHADOW_MAP.dramatic).toBe("0 8px 32px rgba(0,0,0,0.35)");
  });
});

describe("TEXT_SHADOW_MAP_SUBHEADING", () => {
  it('maps none to "none"', () => {
    expect(TEXT_SHADOW_MAP_SUBHEADING.none).toBe("none");
  });

  it("maps subtle to 70% alpha value", () => {
    expect(TEXT_SHADOW_MAP_SUBHEADING.subtle).toBe(
      "0 2px 8px rgba(0,0,0,0.10)",
    );
  });

  it("maps medium to 70% alpha value", () => {
    expect(TEXT_SHADOW_MAP_SUBHEADING.medium).toBe(
      "0 4px 16px rgba(0,0,0,0.17)",
    );
  });

  it("maps dramatic to 70% alpha value", () => {
    expect(TEXT_SHADOW_MAP_SUBHEADING.dramatic).toBe(
      "0 8px 32px rgba(0,0,0,0.25)",
    );
  });
});

describe("LINE_HEIGHT_MAP", () => {
  it("maps tight to 0.9", () => {
    expect(LINE_HEIGHT_MAP.tight).toBe(0.9);
  });

  it("maps normal to 1.2", () => {
    expect(LINE_HEIGHT_MAP.normal).toBe(1.2);
  });

  it("maps relaxed to 1.5", () => {
    expect(LINE_HEIGHT_MAP.relaxed).toBe(1.5);
  });
});

// ── resolveHeadingTypographySx ─────────────────────────────────────────────────

describe("resolveHeadingTypographySx", () => {
  it("returns only lineHeight:1.2 for all defaults (empty fields)", () => {
    const result = resolveHeadingTypographySx({});
    expect(result).toEqual({ lineHeight: 1.2 });
    expect(result.textShadow).toBeUndefined();
    expect(result.opacity).toBeUndefined();
  });

  it("returns only lineHeight:1.2 for explicit defaults", () => {
    const result = resolveHeadingTypographySx({
      headingTextShadow: "none",
      headingOpacity: 100,
      headingLineHeight: "normal",
    });
    expect(result).toEqual({ lineHeight: 1.2 });
    expect(result.textShadow).toBeUndefined();
    expect(result.opacity).toBeUndefined();
  });

  it("returns full sx for dramatic shadow + 80 opacity + tight lineHeight", () => {
    const result = resolveHeadingTypographySx({
      headingTextShadow: "dramatic",
      headingOpacity: 80,
      headingLineHeight: "tight",
    });
    expect(result).toEqual({
      textShadow: "0 8px 32px rgba(0,0,0,0.35)",
      opacity: 0.8,
      lineHeight: 0.9,
    });
  });

  it("maps subtle shadow correctly", () => {
    const result = resolveHeadingTypographySx({ headingTextShadow: "subtle" });
    expect(result.textShadow).toBe("0 2px 8px rgba(0,0,0,0.15)");
    expect(result.lineHeight).toBe(1.2);
  });

  it("maps medium shadow correctly", () => {
    const result = resolveHeadingTypographySx({ headingTextShadow: "medium" });
    expect(result.textShadow).toBe("0 4px 16px rgba(0,0,0,0.25)");
  });

  it("maps tight lineHeight correctly", () => {
    const result = resolveHeadingTypographySx({ headingLineHeight: "tight" });
    expect(result.lineHeight).toBe(0.9);
    expect(result.textShadow).toBeUndefined();
    expect(result.opacity).toBeUndefined();
  });

  it("maps relaxed lineHeight correctly", () => {
    const result = resolveHeadingTypographySx({ headingLineHeight: "relaxed" });
    expect(result.lineHeight).toBe(1.5);
  });

  it("converts opacity 50 to 0.5", () => {
    const result = resolveHeadingTypographySx({ headingOpacity: 50 });
    expect(result.opacity).toBe(0.5);
  });

  it("opacity 100 returns undefined (no-op)", () => {
    const result = resolveHeadingTypographySx({ headingOpacity: 100 });
    expect(result.opacity).toBeUndefined();
  });

  it("converts opacity 75 to 0.75", () => {
    const result = resolveHeadingTypographySx({ headingOpacity: 75 });
    expect(result.opacity).toBe(0.75);
  });

  it("invalid shadow enum falls back to default (no textShadow emitted)", () => {
    const result = resolveHeadingTypographySx({
      headingTextShadow: "unknown-value",
    });
    // unknown-value not in map, falls back to 'none' which is omitted
    expect(result.textShadow).toBeUndefined();
    expect(result.lineHeight).toBe(1.2);
  });

  it("invalid lineHeight enum falls back to normal (1.2)", () => {
    const result = resolveHeadingTypographySx({
      headingLineHeight: "ultra-tight",
    });
    expect(result.lineHeight).toBe(1.2);
  });

  it("undefined fields individually default correctly", () => {
    const r1 = resolveHeadingTypographySx({ headingTextShadow: undefined });
    expect(r1.textShadow).toBeUndefined();

    const r2 = resolveHeadingTypographySx({ headingOpacity: undefined });
    expect(r2.opacity).toBeUndefined();

    const r3 = resolveHeadingTypographySx({ headingLineHeight: undefined });
    expect(r3.lineHeight).toBe(1.2);
  });
});

// ── resolveSubheadingTypographySx ──────────────────────────────────────────────

describe("resolveSubheadingTypographySx", () => {
  it("returns only lineHeight:1.2 for all defaults", () => {
    const result = resolveSubheadingTypographySx({});
    expect(result).toEqual({ lineHeight: 1.2 });
    expect(result.textShadow).toBeUndefined();
    expect(result.opacity).toBeUndefined();
  });

  it("subtle shadow uses 70% alpha (0.10)", () => {
    const result = resolveSubheadingTypographySx({
      headingTextShadow: "subtle",
    });
    expect(result.textShadow).toBe("0 2px 8px rgba(0,0,0,0.10)");
  });

  it("medium shadow uses 70% alpha (0.17)", () => {
    const result = resolveSubheadingTypographySx({
      headingTextShadow: "medium",
    });
    expect(result.textShadow).toBe("0 4px 16px rgba(0,0,0,0.17)");
  });

  it("dramatic shadow uses 70% alpha (0.25)", () => {
    const result = resolveSubheadingTypographySx({
      headingTextShadow: "dramatic",
    });
    expect(result.textShadow).toBe("0 8px 32px rgba(0,0,0,0.25)");
  });

  it("inherits lineHeight from heading fields", () => {
    const result = resolveSubheadingTypographySx({
      headingLineHeight: "relaxed",
    });
    expect(result.lineHeight).toBe(1.5);
  });

  it("inherits opacity from heading fields", () => {
    const result = resolveSubheadingTypographySx({ headingOpacity: 60 });
    expect(result.opacity).toBe(0.6);
  });

  it("subheading dramatic shadow differs from heading dramatic shadow", () => {
    const heading = resolveHeadingTypographySx({
      headingTextShadow: "dramatic",
    });
    const subheading = resolveSubheadingTypographySx({
      headingTextShadow: "dramatic",
    });
    expect(heading.textShadow).toBe("0 8px 32px rgba(0,0,0,0.35)");
    expect(subheading.textShadow).toBe("0 8px 32px rgba(0,0,0,0.25)");
    expect(heading.textShadow).not.toBe(subheading.textShadow);
  });

  it("subheading subtle shadow differs from heading subtle shadow", () => {
    const heading = resolveHeadingTypographySx({ headingTextShadow: "subtle" });
    const subheading = resolveSubheadingTypographySx({
      headingTextShadow: "subtle",
    });
    expect(heading.textShadow).not.toBe(subheading.textShadow);
  });

  it("invalid shadow falls back to default (no textShadow emitted)", () => {
    const result = resolveSubheadingTypographySx({
      headingTextShadow: "super-strong",
    });
    expect(result.textShadow).toBeUndefined();
  });
});

// ── resolveGradientTextSx ─────────────────────────────────────────────────────

describe("resolveGradientTextSx", () => {
  it("returns empty object when disabled (default)", () => {
    expect(resolveGradientTextSx({})).toEqual({});
  });

  it("returns empty object when explicitly false", () => {
    expect(resolveGradientTextSx({ headingGradientText: false })).toEqual({});
  });

  it("returns gradient properties when enabled with defaults", () => {
    const result = resolveGradientTextSx({ headingGradientText: true });
    expect(result).toEqual({
      background: "linear-gradient(90deg, #ff6b6b, #4ecdc4)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    });
  });

  it("uses custom from/to colors", () => {
    const result = resolveGradientTextSx({
      headingGradientText: true,
      headingGradientFrom: "#C9A84C",
      headingGradientTo: "#2563eb",
    });
    expect(result.background).toBe("linear-gradient(90deg, #C9A84C, #2563eb)");
  });

  it("maps to-r direction to 90deg", () => {
    const result = resolveGradientTextSx({
      headingGradientText: true,
      headingGradientDirection: "to-r",
    });
    expect(result.background).toContain("90deg");
  });

  it("maps to-b direction to 180deg", () => {
    const result = resolveGradientTextSx({
      headingGradientText: true,
      headingGradientDirection: "to-b",
    });
    expect(result.background).toContain("180deg");
  });

  it("maps to-br direction to 135deg", () => {
    const result = resolveGradientTextSx({
      headingGradientText: true,
      headingGradientDirection: "to-br",
    });
    expect(result.background).toContain("135deg");
  });

  it("maps to-bl direction to 225deg", () => {
    const result = resolveGradientTextSx({
      headingGradientText: true,
      headingGradientDirection: "to-bl",
    });
    expect(result.background).toContain("225deg");
  });

  it("falls back to 90deg for unknown direction", () => {
    const result = resolveGradientTextSx({
      headingGradientText: true,
      headingGradientDirection: "invalid",
    });
    expect(result.background).toContain("90deg");
  });

  it("always sets backgroundClip and WebkitTextFillColor", () => {
    const result = resolveGradientTextSx({ headingGradientText: true });
    expect(result.WebkitBackgroundClip).toBe("text");
    expect(result.WebkitTextFillColor).toBe("transparent");
    expect(result.backgroundClip).toBe("text");
  });
});

// ── resolveTextStrokeSx ───────────────────────────────────────────────────────

describe("resolveTextStrokeSx", () => {
  it("returns empty object when disabled (default)", () => {
    expect(resolveTextStrokeSx({})).toEqual({});
  });

  it("returns empty object when explicitly false", () => {
    expect(resolveTextStrokeSx({ headingTextStroke: false })).toEqual({});
  });

  it("returns stroke properties with defaults when enabled", () => {
    const result = resolveTextStrokeSx({ headingTextStroke: true });
    expect(result).toEqual({
      WebkitTextStroke: "2px #ffffff",
      color: "transparent",
    });
  });

  it("uses custom stroke width", () => {
    const result = resolveTextStrokeSx({
      headingTextStroke: true,
      headingTextStrokeWidth: "1",
    });
    expect(result.WebkitTextStroke).toBe("1px #ffffff");
  });

  it("uses custom stroke color", () => {
    const result = resolveTextStrokeSx({
      headingTextStroke: true,
      headingTextStrokeColor: "#C9A84C",
    });
    expect(result.WebkitTextStroke).toBe("2px #C9A84C");
  });

  it("uses 3px width when specified", () => {
    const result = resolveTextStrokeSx({
      headingTextStroke: true,
      headingTextStrokeWidth: "3",
    });
    expect(result.WebkitTextStroke).toBe("3px #ffffff");
  });

  it("sets color to transparent when gradient is NOT active", () => {
    const result = resolveTextStrokeSx({ headingTextStroke: true });
    expect(result.color).toBe("transparent");
  });

  it("does NOT set color when gradient IS active (gradient handles fill)", () => {
    const result = resolveTextStrokeSx({
      headingTextStroke: true,
      headingGradientText: true,
    });
    expect(result.WebkitTextStroke).toBe("2px #ffffff");
    expect(result.color).toBeUndefined();
  });

  it("combines custom width and color", () => {
    const result = resolveTextStrokeSx({
      headingTextStroke: true,
      headingTextStrokeWidth: "3",
      headingTextStrokeColor: "#000000",
    });
    expect(result.WebkitTextStroke).toBe("3px #000000");
    expect(result.color).toBe("transparent");
  });
});
