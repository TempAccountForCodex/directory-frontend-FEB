import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBlockAnimation, getStaggerDelay } from "../useBlockAnimation";

describe("useBlockAnimation", () => {
  it("returns shouldAnimate=false for none", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({ animationEntranceType: "none" }),
    );
    expect(result.current.shouldAnimate).toBe(false);
    expect(result.current.motionProps).toEqual({});
  });

  it("returns shouldAnimate=false when type omitted", () => {
    const { result } = renderHook(() => useBlockAnimation({}));
    expect(result.current.shouldAnimate).toBe(false);
  });

  it("fade-in maps to opacity 0→1", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({ animationEntranceType: "fade-in" }),
    );
    expect(result.current.shouldAnimate).toBe(true);
    expect(result.current.motionProps.initial).toEqual({ opacity: 0 });
    expect(result.current.motionProps.animate).toEqual({ opacity: 1 });
  });

  it("slide-up maps to y 40→0", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({ animationEntranceType: "slide-up" }),
    );
    expect(
      (result.current.motionProps.initial as Record<string, unknown>).y,
    ).toBe(40);
    expect(
      (result.current.motionProps.animate as Record<string, unknown>).y,
    ).toBe(0);
  });

  it("slide-down maps to y -40→0", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({ animationEntranceType: "slide-down" }),
    );
    expect(
      (result.current.motionProps.initial as Record<string, unknown>).y,
    ).toBe(-40);
    expect(
      (result.current.motionProps.animate as Record<string, unknown>).y,
    ).toBe(0);
  });

  it("scale-up maps to scale 0.8→1", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({ animationEntranceType: "scale-up" }),
    );
    expect(
      (result.current.motionProps.initial as Record<string, unknown>).scale,
    ).toBe(0.8);
    expect(
      (result.current.motionProps.animate as Record<string, unknown>).scale,
    ).toBe(1);
  });

  it("bounce uses spring transition", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({ animationEntranceType: "bounce" }),
    );
    const transition = result.current.motionProps.transition as Record<
      string,
      unknown
    >;
    expect(transition.type).toBe("spring");
    expect(transition.stiffness).toBe(300);
    expect(transition.damping).toBe(20);
  });

  it("non-bounce uses cubic bezier ease", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({ animationEntranceType: "fade-in" }),
    );
    const transition = result.current.motionProps.transition as Record<
      string,
      unknown
    >;
    expect(transition.ease).toEqual([0.22, 0.61, 0.36, 1]);
  });

  it("converts animationDuration ms to seconds", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "fade-in",
        animationDuration: 600,
      }),
    );
    const transition = result.current.motionProps.transition as Record<
      string,
      unknown
    >;
    expect(transition.duration).toBeCloseTo(0.6);
  });

  it("converts animationDelay ms to seconds", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "fade-in",
        animationDelay: 200,
      }),
    );
    const transition = result.current.motionProps.transition as Record<
      string,
      unknown
    >;
    expect(transition.delay).toBeCloseTo(0.2);
  });

  it("scroll triggered uses whileInView", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "fade-in",
        animationScrollTriggered: true,
      }),
    );
    expect(result.current.motionProps.whileInView).toBeDefined();
    expect(result.current.motionProps.viewport).toEqual({
      once: true,
      margin: "-60px 0px",
    });
    expect(result.current.motionProps.animate).toBeUndefined();
  });

  it("mount animation uses animate (not whileInView)", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "fade-in",
        animationScrollTriggered: false,
      }),
    );
    expect(result.current.motionProps.animate).toBeDefined();
    expect(result.current.motionProps.whileInView).toBeUndefined();
  });

  it("result is memoized across re-renders with same fields", () => {
    const fields = { animationEntranceType: "fade-in" as const };
    const { result, rerender } = renderHook(() => useBlockAnimation(fields));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  // Direction control tests
  it("slide-up direction=left uses x:40 offset", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "slide-up",
        animationDirection: "left",
      }),
    );
    const initial = result.current.motionProps.initial as Record<
      string,
      unknown
    >;
    expect(initial.x).toBe(40);
    expect(initial.y).toBeUndefined();
  });

  it("slide-up direction=right uses x:-40 offset", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "slide-up",
        animationDirection: "right",
      }),
    );
    const initial = result.current.motionProps.initial as Record<
      string,
      unknown
    >;
    expect(initial.x).toBe(-40);
    expect(initial.y).toBeUndefined();
  });

  it("slide-up direction=down uses y:-40 offset", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "slide-up",
        animationDirection: "down",
      }),
    );
    const initial = result.current.motionProps.initial as Record<
      string,
      unknown
    >;
    expect(initial.y).toBe(-40);
  });

  it("slide-down backward compat: no direction defaults to y:-40", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({ animationEntranceType: "slide-down" }),
    );
    const initial = result.current.motionProps.initial as Record<
      string,
      unknown
    >;
    expect(initial.y).toBe(-40);
  });

  it("slide-down direction=up overrides to y:40", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "slide-down",
        animationDirection: "up",
      }),
    );
    const initial = result.current.motionProps.initial as Record<
      string,
      unknown
    >;
    expect(initial.y).toBe(40);
  });

  it("fade-in ignores animationDirection", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "fade-in",
        animationDirection: "left",
      }),
    );
    expect(result.current.motionProps.initial).toEqual({ opacity: 0 });
    expect(result.current.motionProps.animate).toEqual({ opacity: 1 });
  });

  it("scale-up ignores animationDirection", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "scale-up",
        animationDirection: "right",
      }),
    );
    const initial = result.current.motionProps.initial as Record<
      string,
      unknown
    >;
    expect(initial.scale).toBe(0.8);
    expect(initial.x).toBeUndefined();
    expect(initial.y).toBeUndefined();
  });

  it("bounce direction=left includes x:40 in initial", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({
        animationEntranceType: "bounce",
        animationDirection: "left",
      }),
    );
    const initial = result.current.motionProps.initial as Record<
      string,
      unknown
    >;
    expect(initial.x).toBe(40);
    expect(initial.scale).toBe(0.8);
  });

  it("bounce direction=up (default) includes y:40 in initial", () => {
    const { result } = renderHook(() =>
      useBlockAnimation({ animationEntranceType: "bounce" }),
    );
    const initial = result.current.motionProps.initial as Record<
      string,
      unknown
    >;
    expect(initial.y).toBe(40);
    expect(initial.scale).toBe(0.8);
  });
});

describe("getStaggerDelay", () => {
  it("returns baseDelay + index * staggerMs", () => {
    expect(getStaggerDelay(0)).toBe(0);
    expect(getStaggerDelay(1)).toBe(60);
    expect(getStaggerDelay(2)).toBe(120);
  });

  it("accepts custom baseDelay and staggerMs", () => {
    expect(getStaggerDelay(3, 100, 50)).toBe(250);
  });

  it("returns baseDelay for index 0 with custom baseDelay", () => {
    expect(getStaggerDelay(0, 200, 60)).toBe(200);
  });
});
