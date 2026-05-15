import { describe, it, expect } from "vitest";
import { validateField, type ValidationRules } from "../validation";

describe("validateField", () => {
  // ── Happy path ──────────────────────────────────────────────────────────────

  it("returns [] when no rules are provided", () => {
    expect(validateField("anything", {})).toEqual([]);
  });

  it("returns [] when value satisfies every rule", () => {
    const rules: ValidationRules = {
      required: true,
      minLength: 3,
      maxLength: 10,
      pattern: /^\w+$/,
    };
    expect(validateField("hello", rules)).toEqual([]);
  });

  // ── required ────────────────────────────────────────────────────────────────

  it("required: pushes error for empty string", () => {
    expect(validateField("", { required: true })).toContain("Required");
  });

  it("required: pushes error for null", () => {
    expect(validateField(null, { required: true })).toContain("Required");
  });

  it("required: pushes error for undefined", () => {
    expect(validateField(undefined, { required: true })).toContain("Required");
  });

  it("required: no error for non-empty string", () => {
    expect(validateField("x", { required: true })).toEqual([]);
  });

  // ── minLength ───────────────────────────────────────────────────────────────

  it("minLength: pushes error when string is too short", () => {
    expect(validateField("ab", { minLength: 5 })).toContain("Min 5 characters");
  });

  it("minLength: no error when string meets minimum", () => {
    expect(validateField("abcde", { minLength: 5 })).toEqual([]);
  });

  it("minLength: no error when string exceeds minimum", () => {
    expect(validateField("abcdef", { minLength: 5 })).toEqual([]);
  });

  // ── maxLength ───────────────────────────────────────────────────────────────

  it("maxLength: pushes error when string is too long", () => {
    expect(validateField("abcdef", { maxLength: 5 })).toContain(
      "Max 5 characters",
    );
  });

  it("maxLength: no error when string is within maximum", () => {
    expect(validateField("abc", { maxLength: 5 })).toEqual([]);
  });

  it("maxLength: no error when string exactly equals maximum", () => {
    expect(validateField("abcde", { maxLength: 5 })).toEqual([]);
  });

  // ── min ─────────────────────────────────────────────────────────────────────

  it("min: pushes error when number is below minimum", () => {
    expect(validateField(4, { min: 5 })).toContain("Must be at least 5");
  });

  it("min: no error when number equals minimum", () => {
    expect(validateField(5, { min: 5 })).toEqual([]);
  });

  it("min: no error when number exceeds minimum", () => {
    expect(validateField(10, { min: 5 })).toEqual([]);
  });

  it("min: no error when value is not a number (non-numeric types skip min/max)", () => {
    // min/max only apply to typeof number
    expect(validateField("3", { min: 5 })).toEqual([]);
  });

  // ── max ─────────────────────────────────────────────────────────────────────

  it("max: pushes error when number exceeds maximum", () => {
    expect(validateField(11, { max: 10 })).toContain("Must be at most 10");
  });

  it("max: no error when number equals maximum", () => {
    expect(validateField(10, { max: 10 })).toEqual([]);
  });

  it("max: no error when number is below maximum", () => {
    expect(validateField(5, { max: 10 })).toEqual([]);
  });

  // ── pattern ─────────────────────────────────────────────────────────────────

  it("pattern: pushes error when value does not match", () => {
    expect(validateField("hello world", { pattern: /^\w+$/ })).toContain(
      "Invalid format",
    );
  });

  it("pattern: no error when value matches", () => {
    expect(validateField("hello", { pattern: /^\w+$/ })).toEqual([]);
  });

  // ── email ───────────────────────────────────────────────────────────────────

  it("email: pushes error for invalid email (no @)", () => {
    expect(validateField("notanemail", { email: true })).toContain(
      "Invalid email address",
    );
  });

  it("email: pushes error for invalid email (no domain)", () => {
    expect(validateField("user@", { email: true })).toContain(
      "Invalid email address",
    );
  });

  it("email: no error for valid email", () => {
    expect(validateField("user@example.com", { email: true })).toEqual([]);
  });

  it("email: no error for email with subdomain", () => {
    expect(validateField("user@mail.example.co.uk", { email: true })).toEqual(
      [],
    );
  });

  // ── url ─────────────────────────────────────────────────────────────────────

  it("url: pushes error for invalid URL", () => {
    expect(validateField("not-a-url", { url: true })).toContain("Invalid URL");
  });

  it("url: pushes error for empty string", () => {
    expect(validateField("", { url: true })).toContain("Invalid URL");
  });

  it("url: no error for valid https URL", () => {
    expect(validateField("https://example.com", { url: true })).toEqual([]);
  });

  it("url: no error for valid http URL with path", () => {
    expect(validateField("http://example.com/path?q=1", { url: true })).toEqual(
      [],
    );
  });

  // ── custom ──────────────────────────────────────────────────────────────────

  it("custom: pushes returned string when validator returns an error", () => {
    const rules: ValidationRules = {
      custom: (v) =>
        String(v).includes("bad") ? "Contains forbidden word" : null,
    };
    expect(validateField("this is bad", rules)).toContain(
      "Contains forbidden word",
    );
  });

  it("custom: no error when validator returns null", () => {
    const rules: ValidationRules = {
      custom: () => null,
    };
    expect(validateField("good value", rules)).toEqual([]);
  });

  // ── multiple rules ──────────────────────────────────────────────────────────

  it("collects multiple errors in a single call", () => {
    const rules: ValidationRules = {
      required: true,
      minLength: 3,
      email: true,
    };
    // Empty string triggers required and minLength; email check on '' also fails.
    const errors = validateField("", rules);
    expect(errors).toContain("Required");
    expect(errors).toContain("Min 3 characters");
    expect(errors).toContain("Invalid email address");
  });

  it("returns only the errors that actually fail (not unrelated rules)", () => {
    const rules: ValidationRules = {
      minLength: 2,
      maxLength: 10,
    };
    // 'hi' is 2 chars — exactly at minLength boundary, well within maxLength
    expect(validateField("hi", rules)).toEqual([]);
  });
});
