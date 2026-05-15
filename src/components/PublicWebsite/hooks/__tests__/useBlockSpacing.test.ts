import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBlockSpacing } from "../useBlockSpacing";

describe("useBlockSpacing", () => {
  it("defaults to md (4) for all when fields empty", () => {
    const { result } = renderHook(() => useBlockSpacing({}));
    expect(result.current.spacingSx.pt).toBe(4);
    expect(result.current.spacingSx.pb).toBe(4);
  });

  it("none token maps to 0", () => {
    const { result } = renderHook(() =>
      useBlockSpacing({ paddingTop: "none", paddingBottom: "none" }),
    );
    expect(result.current.spacingSx.pt).toBe(0);
    expect(result.current.spacingSx.pb).toBe(0);
  });

  it("sm token maps to 2", () => {
    const { result } = renderHook(() =>
      useBlockSpacing({ paddingTop: "sm", paddingBottom: "sm" }),
    );
    expect(result.current.spacingSx.pt).toBe(2);
    expect(result.current.spacingSx.pb).toBe(2);
  });

  it("lg token maps to 6", () => {
    const { result } = renderHook(() =>
      useBlockSpacing({ paddingTop: "lg", paddingBottom: "lg" }),
    );
    expect(result.current.spacingSx.pt).toBe(6);
    expect(result.current.spacingSx.pb).toBe(6);
  });

  it("xl token maps to 8", () => {
    const { result } = renderHook(() =>
      useBlockSpacing({ paddingTop: "xl", paddingBottom: "xl" }),
    );
    expect(result.current.spacingSx.pt).toBe(8);
    expect(result.current.spacingSx.pb).toBe(8);
  });

  it("margin 0 (none) is omitted from spacingSx", () => {
    const { result } = renderHook(() =>
      useBlockSpacing({ marginTop: "none", marginBottom: "none" }),
    );
    expect(result.current.spacingSx.mt).toBeUndefined();
    expect(result.current.spacingSx.mb).toBeUndefined();
  });

  it("non-zero margin is included in spacingSx", () => {
    const { result } = renderHook(() =>
      useBlockSpacing({ marginTop: "md", marginBottom: "lg" }),
    );
    expect(result.current.spacingSx.mt).toBe(4);
    expect(result.current.spacingSx.mb).toBe(6);
  });

  it("padding always present even when 0", () => {
    const { result } = renderHook(() =>
      useBlockSpacing({ paddingTop: "none", paddingBottom: "none" }),
    );
    expect("pt" in result.current.spacingSx).toBe(true);
    expect("pb" in result.current.spacingSx).toBe(true);
  });

  it("mixed tokens work independently", () => {
    const { result } = renderHook(() =>
      useBlockSpacing({
        paddingTop: "sm",
        paddingBottom: "xl",
        marginTop: "lg",
      }),
    );
    expect(result.current.spacingSx.pt).toBe(2);
    expect(result.current.spacingSx.pb).toBe(8);
    expect(result.current.spacingSx.mt).toBe(6);
    expect(result.current.spacingSx.mb).toBeUndefined();
  });

  it("result is memoized across re-renders with same fields", () => {
    const fields = { paddingTop: "md" as const };
    const { result, rerender } = renderHook(() => useBlockSpacing(fields));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
