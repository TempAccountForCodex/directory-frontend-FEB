/**
 * Tests for ETag conflict wiring in WebsiteEditor autosave callback (Step 5.9.6)
 *
 * Verifies that the handleAutosave callback in WebsiteEditor.jsx:
 * 1. Sends If-Match header with stored ETag on PUT requests
 * 2. Stores ETag from successful response headers
 * 3. Catches 412 status and returns conflict shape for useAutosave
 * 4. Sends expectedUpdatedAt in request body as fallback
 * 5. Works gracefully when no ETag is available (backward compat)
 * 6. Populates initial ETag from GET blocks response
 *
 * These tests exercise the handleAutosave callback in isolation via
 * the useAutosave onSave integration, using axios mocks.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

// ---------------------------------------------------------------------------
// Mocks — must be BEFORE WebsiteEditor import
// ---------------------------------------------------------------------------

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

// Mock ThemeContext
vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({
    actualTheme: "dark",
    themeMode: "dark",
    changeTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock AuthContext
vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, name: "Test" }, token: "test-token" }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock useUnsavedChanges to avoid useBlocker (needs data router)
vi.mock("../../../hooks/useUnsavedChanges", () => ({
  useUnsavedChanges: () => ({
    showDialog: false,
    confirmNavigation: vi.fn(),
    cancelNavigation: vi.fn(),
    saveAndNavigate: vi.fn(),
  }),
}));

// Mock useAutosave to capture the onSave callback
let capturedOnSave: ((data: Record<string, unknown>) => Promise<any>) | null =
  null;
vi.mock("../../../hooks/useAutosave", () => ({
  useAutosave: (params: any) => {
    capturedOnSave = params.onSave;
    return {
      hasUnsavedChanges: false,
      saveStatus: "idle" as const,
      conflictData: null,
      triggerSave: vi.fn(),
      clearDirty: vi.fn(),
      resolveConflict: vi.fn(),
    };
  },
}));

// Mock SaveStatus
vi.mock("../../Editor/SaveStatus", () => ({
  default: () => <div data-testid="save-status" />,
}));

// Mock ConflictModal
vi.mock("../../Editor/ConflictModal", () => ({
  default: () => <div data-testid="conflict-modal" />,
}));

// Mock RegenerateButton
vi.mock("../../Editor/RegenerateButton", () => ({
  default: () => <div data-testid="regenerate-button" />,
}));

// Mock dashboardTheme with all color properties used in WebsiteEditor
vi.mock("../../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    background: "#1a1a1a",
    bgDefault: "#1a1a1a",
    card: "#2a2a2a",
    dark: "#111111",
    text: "#ffffff",
    textSecondary: "#999999",
    border: "#333333",
    primary: "#4a9eff",
  }),
}));

// Mock shared components
vi.mock("../shared", () => ({
  DashboardInput: (props: any) => <input {...props} />,
  DashboardSelect: (props: any) => <select {...props} />,
  ConfirmationDialog: () => <div data-testid="confirmation-dialog" />,
}));

// Import after mocks
import WebsiteEditor from "../WebsiteEditor";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderWithRouter = (websiteId = "123") => {
  return render(
    <MemoryRouter initialEntries={[`/dashboard/websites/${websiteId}/edit`]}>
      <Routes>
        <Route
          path="/dashboard/websites/:websiteId/edit"
          element={<WebsiteEditor />}
        />
      </Routes>
    </MemoryRouter>,
  );
};

const mockWebsiteResponse = {
  data: { data: { id: 123, name: "Test Website", slug: "test-website" } },
};

const mockPagesResponse = {
  data: {
    data: [{ id: 1, title: "Home", slug: "home", isHome: true, blocks: [] }],
  },
};

const mockBlocksResponse = (etag?: string) => ({
  data: {
    data: [
      {
        id: 1,
        blockType: "HERO",
        content: { heading: "Hello" },
        isVisible: true,
        sortOrder: 0,
      },
    ],
  },
  headers: etag ? { etag } : {},
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WebsiteEditor Autosave ETag Wiring", () => {
  beforeEach(() => {
    capturedOnSave = null;
    vi.clearAllMocks();

    // Default GET mocks
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/pages") && !url.includes("/blocks")) {
        return Promise.resolve(mockPagesResponse);
      }
      if (url.includes("/blocks")) {
        return Promise.resolve(mockBlocksResponse('"abc123"'));
      }
      // website details
      return Promise.resolve(mockWebsiteResponse);
    });

    // Default PUT mock
    mockedAxios.put.mockResolvedValue({
      data: { data: { updatedAt: "2026-03-15T10:00:00Z" } },
      headers: { etag: '"def456"' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders WebsiteEditor and captures onSave callback", async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(capturedOnSave).not.toBeNull();
    });
  });

  it("handleAutosave sends If-Match header with stored ETag on PUT", async () => {
    renderWithRouter();
    await waitFor(() => expect(capturedOnSave).not.toBeNull());

    // Wait for initial blocks fetch to populate ETag
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

    // Call the captured onSave
    await act(async () => {
      await capturedOnSave!({
        blocks: [
          {
            blockType: "HERO",
            content: { heading: "Updated" },
            isVisible: true,
            sortOrder: 0,
          },
        ],
      });
    });

    expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    const putCall = mockedAxios.put.mock.calls[0];
    // Third argument is config with headers
    expect(putCall[2]?.headers?.["If-Match"]).toBeDefined();
  });

  it("handleAutosave stores ETag from successful response and uses it on next save", async () => {
    // GET blocks returns no ETag — so initial state has no ETag
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/pages") && !url.includes("/blocks")) {
        return Promise.resolve(mockPagesResponse);
      }
      if (url.includes("/blocks")) {
        return Promise.resolve({ data: { data: [] }, headers: {} });
      }
      return Promise.resolve(mockWebsiteResponse);
    });

    // First PUT returns an ETag
    mockedAxios.put
      .mockResolvedValueOnce({
        data: { data: { updatedAt: "2026-03-15T10:00:00Z" } },
        headers: { etag: '"first-etag"' },
      })
      .mockResolvedValueOnce({
        data: { data: { updatedAt: "2026-03-15T10:01:00Z" } },
        headers: { etag: '"second-etag"' },
      });

    renderWithRouter();
    await waitFor(() => expect(capturedOnSave).not.toBeNull());

    const saveData = {
      blocks: [
        {
          blockType: "HERO",
          content: { heading: "V1" },
          isVisible: true,
          sortOrder: 0,
        },
      ],
    };

    // First save — no If-Match (no initial ETag from GET)
    await act(async () => {
      await capturedOnSave!(saveData);
    });

    const firstPutCall = mockedAxios.put.mock.calls[0];
    // No If-Match on first PUT since GET returned no ETag
    expect(firstPutCall[2]?.headers?.["If-Match"]).toBeUndefined();

    // Second save — should use the ETag from first PUT response
    await act(async () => {
      await capturedOnSave!(saveData);
    });

    const secondPutCall = mockedAxios.put.mock.calls[1];
    expect(secondPutCall[2]?.headers?.["If-Match"]).toBe('"first-etag"');
  });

  it("handleAutosave catches 412 and returns conflict shape", async () => {
    const serverData = {
      blocks: [{ blockType: "HERO", content: { heading: "Server" } }],
    };
    const serverUpdatedAt = "2026-03-15T09:00:00Z";

    mockedAxios.put.mockRejectedValueOnce({
      response: {
        status: 412,
        data: { serverData, serverUpdatedAt },
      },
    });

    renderWithRouter();
    await waitFor(() => expect(capturedOnSave).not.toBeNull());

    let result: any;
    await act(async () => {
      result = await capturedOnSave!({
        blocks: [
          {
            blockType: "HERO",
            content: { heading: "Local" },
            isVisible: true,
            sortOrder: 0,
          },
        ],
      });
    });

    expect(result).toEqual({
      conflict: true,
      serverData,
      serverUpdatedAt,
    });
  });

  it("handleAutosave re-throws non-412 errors", async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { message: "Internal Server Error" },
      },
    });

    renderWithRouter();
    await waitFor(() => expect(capturedOnSave).not.toBeNull());

    await expect(
      capturedOnSave!({
        blocks: [
          {
            blockType: "HERO",
            content: { heading: "Fail" },
            isVisible: true,
            sortOrder: 0,
          },
        ],
      }),
    ).rejects.toBeDefined();
  });

  it("handleAutosave sends expectedUpdatedAt in request body", async () => {
    mockedAxios.put.mockResolvedValueOnce({
      data: { data: { updatedAt: "2026-03-15T10:00:00Z" } },
      headers: { etag: '"etag1"' },
    });

    renderWithRouter();
    await waitFor(() => expect(capturedOnSave).not.toBeNull());

    // First save
    await act(async () => {
      await capturedOnSave!({
        blocks: [
          {
            blockType: "HERO",
            content: { heading: "V1" },
            isVisible: true,
            sortOrder: 0,
          },
        ],
      });
    });

    // Second save should send expectedUpdatedAt from first save result
    mockedAxios.put.mockResolvedValueOnce({
      data: { data: { updatedAt: "2026-03-15T10:01:00Z" } },
      headers: { etag: '"etag2"' },
    });

    await act(async () => {
      await capturedOnSave!({
        blocks: [
          {
            blockType: "HERO",
            content: { heading: "V2" },
            isVisible: true,
            sortOrder: 0,
          },
        ],
      });
    });

    const secondPutBody = mockedAxios.put.mock.calls[1][1] as Record<
      string,
      unknown
    >;
    expect(secondPutBody.expectedUpdatedAt).toBe("2026-03-15T10:00:00Z");
  });

  it("handleAutosave works gracefully when server returns no ETag (backward compat)", async () => {
    // Mock GET blocks with no ETag header
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/pages") && !url.includes("/blocks")) {
        return Promise.resolve(mockPagesResponse);
      }
      if (url.includes("/blocks")) {
        return Promise.resolve({ data: { data: [] }, headers: {} });
      }
      return Promise.resolve(mockWebsiteResponse);
    });

    // PUT returns no ETag
    mockedAxios.put.mockResolvedValueOnce({
      data: { data: { updatedAt: "2026-03-15T10:00:00Z" } },
      headers: {},
    });

    renderWithRouter();
    await waitFor(() => expect(capturedOnSave).not.toBeNull());

    let result: any;
    await act(async () => {
      result = await capturedOnSave!({
        blocks: [
          {
            blockType: "HERO",
            content: { heading: "V1" },
            isVisible: true,
            sortOrder: 0,
          },
        ],
      });
    });

    // Should succeed even without ETag
    expect(result).toHaveProperty("updatedAt", "2026-03-15T10:00:00Z");

    // If-Match header should not be sent when no ETag is stored
    const putCall = mockedAxios.put.mock.calls[0];
    const ifMatchHeader = putCall[2]?.headers?.["If-Match"];
    expect(
      !ifMatchHeader || ifMatchHeader === null || ifMatchHeader === undefined,
    ).toBe(true);
  });
});
