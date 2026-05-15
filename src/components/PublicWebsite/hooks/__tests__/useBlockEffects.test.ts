import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBlockEffects } from "../useBlockEffects";

describe("useBlockEffects", () => {
  it("returns hasEffects=false with all defaults", () => {
    const { result } = renderHook(() => useBlockEffects({}));
    expect(result.current.hasEffects).toBe(false);
    expect(result.current.effectsSx).toEqual({});
  });

  it("shadow none returns hasEffects=false", () => {
    const { result } = renderHook(() =>
      useBlockEffects({ shadowSize: "none" }),
    );
    expect(result.current.hasEffects).toBe(false);
  });

  it("shadow sm applies correct boxShadow", () => {
    const { result } = renderHook(() => useBlockEffects({ shadowSize: "sm" }));
    expect(result.current.hasEffects).toBe(true);
    expect(result.current.effectsSx.boxShadow).toBe(
      "0 1px 2px rgba(0,0,0,0.05)",
    );
  });

  it("shadow md applies correct boxShadow", () => {
    const { result } = renderHook(() => useBlockEffects({ shadowSize: "md" }));
    expect(result.current.effectsSx.boxShadow).toBe(
      "0 4px 6px rgba(0,0,0,0.1)",
    );
  });

  it("shadow lg applies correct boxShadow", () => {
    const { result } = renderHook(() => useBlockEffects({ shadowSize: "lg" }));
    expect(result.current.effectsSx.boxShadow).toBe(
      "0 10px 15px rgba(0,0,0,0.1)",
    );
  });

  it("shadow xl applies correct boxShadow", () => {
    const { result } = renderHook(() => useBlockEffects({ shadowSize: "xl" }));
    expect(result.current.effectsSx.boxShadow).toBe(
      "0 20px 25px rgba(0,0,0,0.15)",
    );
  });

  it("border with width>0 and color applies border shorthand", () => {
    const { result } = renderHook(() =>
      useBlockEffects({ borderWidth: 2, borderColor: "#333333" }),
    );
    expect(result.current.hasEffects).toBe(true);
    expect(result.current.effectsSx.border).toBe("2px solid #333333");
  });

  it("border with width=0 does not apply border", () => {
    const { result } = renderHook(() =>
      useBlockEffects({ borderWidth: 0, borderColor: "#333333" }),
    );
    expect(result.current.effectsSx.border).toBeUndefined();
  });

  it("border without color does not apply border", () => {
    const { result } = renderHook(() => useBlockEffects({ borderWidth: 2 }));
    expect(result.current.effectsSx.border).toBeUndefined();
  });

  it("borderRadius applies borderRadius in px", () => {
    const { result } = renderHook(() => useBlockEffects({ borderRadius: 8 }));
    expect(result.current.hasEffects).toBe(true);
    expect(result.current.effectsSx.borderRadius).toBe("8px");
  });

  it("borderRadius 9999 produces pill shape", () => {
    const { result } = renderHook(() =>
      useBlockEffects({ borderRadius: 9999 }),
    );
    expect(result.current.effectsSx.borderRadius).toBe("9999px");
  });

  it("borderRadius 0 still sets borderRadius", () => {
    const { result } = renderHook(() => useBlockEffects({ borderRadius: 0 }));
    expect(result.current.effectsSx.borderRadius).toBe("0px");
    expect(result.current.hasEffects).toBe(true);
  });

  it("combines shadow and border", () => {
    const { result } = renderHook(() =>
      useBlockEffects({
        shadowSize: "md",
        borderWidth: 1,
        borderColor: "#000000",
      }),
    );
    expect(result.current.effectsSx.boxShadow).toBeDefined();
    expect(result.current.effectsSx.border).toBeDefined();
  });

  it("result is memoized across re-renders with same fields", () => {
    const fields = { shadowSize: "md" as const };
    const { result, rerender } = renderHook(() => useBlockEffects(fields));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
