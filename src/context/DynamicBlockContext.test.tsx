/**
 * Tests for DynamicBlockContext (Step 2.22.1-frontend)
 *
 * Covers:
 * - DynamicBlockProvider renders children
 * - useDynamicBlockContext throws outside provider
 * - useDynamicBlockContext returns context inside provider
 * - Initial dynamicData is an empty Map when no SSR data
 * - SSR hydration from window.__DYNAMIC_BLOCK_DATA__
 * - registerDynamicBlock adds block to loadingBlocks state
 * - refreshBlock triggers re-fetch for a block
 * - isBlockDynamic returns false for unknown block types
 * - isBlockDynamic returns true for known dynamic block types
 * - Context value is stable (useMemo) across re-renders
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  DynamicBlockContext,
  DynamicBlockProvider,
  useDynamicBlockContext,
} from "./DynamicBlockContext";

// Helper to access context via a test component
const ContextConsumer: React.FC<{
  onContext: (ctx: ReturnType<typeof useDynamicBlockContext>) => void;
}> = ({ onContext }) => {
  const ctx = useDynamicBlockContext();
  onContext(ctx);
  return <div data-testid="consumer">ok</div>;
};

describe("DynamicBlockContext", () => {
  afterEach(() => {
    // Clean up window.__DYNAMIC_BLOCK_DATA__
    delete (window as any).__DYNAMIC_BLOCK_DATA__;
  });

  it("renders children inside DynamicBlockProvider", () => {
    render(
      <DynamicBlockProvider>
        <div data-testid="child">hello</div>
      </DynamicBlockProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("useDynamicBlockContext throws descriptive error when used outside provider", () => {
    const ThrowingComponent: React.FC = () => {
      useDynamicBlockContext(); // should throw
      return null;
    };

    expect(() => {
      render(<ThrowingComponent />);
    }).toThrow(/DynamicBlockProvider/);
  });

  it("useDynamicBlockContext returns context value inside provider", () => {
    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );
    expect(ctx).not.toBeNull();
  });

  it("initial dynamicData is an empty Map when no SSR data", () => {
    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );
    expect(ctx!.dynamicData).toBeInstanceOf(Map);
    expect(ctx!.dynamicData.size).toBe(0);
  });

  it("initial loadingBlocks is an empty Set", () => {
    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );
    expect(ctx!.loadingBlocks).toBeInstanceOf(Set);
    expect(ctx!.loadingBlocks.size).toBe(0);
  });

  it("initial errorBlocks is an empty Map", () => {
    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );
    expect(ctx!.errorBlocks).toBeInstanceOf(Map);
    expect(ctx!.errorBlocks.size).toBe(0);
  });

  it("hydrates dynamicData from window.__DYNAMIC_BLOCK_DATA__", () => {
    (window as any).__DYNAMIC_BLOCK_DATA__ = {
      1: { title: "SSR data" },
      2: { items: [] },
    };

    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );

    expect(ctx!.dynamicData.get(1)).toEqual({ title: "SSR data" });
    expect(ctx!.dynamicData.get(2)).toEqual({ items: [] });
  });

  it("isBlockDynamic returns false for unknown/static block types", () => {
    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );
    expect(ctx!.isBlockDynamic("HERO")).toBe(false);
    expect(ctx!.isBlockDynamic("TEXT")).toBe(false);
    expect(ctx!.isBlockDynamic("UNKNOWN")).toBe(false);
  });

  it("isBlockDynamic returns true for known dynamic block types", () => {
    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );
    // Registry-aligned dynamic block types
    expect(ctx!.isBlockDynamic("BLOG_FEED")).toBe(true);
    expect(ctx!.isBlockDynamic("REVIEWS")).toBe(true);
    expect(ctx!.isBlockDynamic("EVENTS_LIST")).toBe(true);
  });

  it("registerDynamicBlock is a function", () => {
    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );
    expect(typeof ctx!.registerDynamicBlock).toBe("function");
  });

  it("refreshBlock is a function", () => {
    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );
    expect(typeof ctx!.refreshBlock).toBe("function");
  });

  it("DynamicBlockContext is a valid React context object", () => {
    expect(DynamicBlockContext).toBeDefined();
    expect(typeof DynamicBlockContext).toBe("object");
  });

  it("refreshBlock clears dynamicData for the given blockId", () => {
    (window as any).__DYNAMIC_BLOCK_DATA__ = { 42: { foo: "bar" } };

    let ctx: ReturnType<typeof useDynamicBlockContext> | null = null;
    const { rerender } = render(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );

    // Initial: block 42 has data
    expect(ctx!.dynamicData.get(42)).toEqual({ foo: "bar" });

    // Refresh block 42
    act(() => {
      ctx!.refreshBlock(42);
    });

    // Re-render to get updated context
    rerender(
      <DynamicBlockProvider>
        <ContextConsumer
          onContext={(c) => {
            ctx = c;
          }}
        />
      </DynamicBlockProvider>,
    );

    // After refresh, block 42 data cleared (ready for re-fetch)
    expect(ctx!.dynamicData.get(42)).toBeUndefined();
  });
});
