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
// ---------------------------------------------------------------------------
// Mocks — must be BEFORE WebsiteEditor import
// ---------------------------------------------------------------------------

// Mock apiClient — use vi.hoisted() so the variable is available when vi.mock factory runs
const { mockApiClient } = vi.hoisted(() => {
  const mockApiClient: Record<string, any> = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  };
  return { mockApiClient };
});
vi.mock("../../../api/client", () => ({
  apiClient: mockApiClient,
  default: mockApiClient,
}));

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

// Mock PermissionContext
vi.mock("../../../context/PermissionContext", () => ({
  usePermissionContext: () => ({
    websitePermissions: { 1: "OWNER" },
    currentWebsiteId: 1,
    setCurrentWebsite: vi.fn(),
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  PermissionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  usePermission: () => true,
  useHasRole: () => true,
  useWebsiteRole: () => "OWNER",
  WEBSITE_ACTIONS: {
    VIEW: "VIEW",
    EDIT_CONTENT: "EDIT_CONTENT",
    EDIT_SETTINGS: "EDIT_SETTINGS",
    DELETE: "DELETE",
    MANAGE_COLLABORATORS: "MANAGE_COLLABORATORS",
    PUBLISH: "PUBLISH",
    UNPUBLISH: "UNPUBLISH",
    TRANSFER_OWNERSHIP: "TRANSFER_OWNERSHIP",
    DASHBOARD_ACCESS: "DASHBOARD_ACCESS",
    VIEW_ANALYTICS: "VIEW_ANALYTICS",
    MANAGE_FORMS: "MANAGE_FORMS",
    MANAGE_INTEGRATIONS: "MANAGE_INTEGRATIONS",
    MANAGE_DOMAIN: "MANAGE_DOMAIN",
  },
  ROLE_HIERARCHY: { OWNER: 4, ADMIN: 3, EDITOR: 2, VIEWER: 1 },
  ROLE_PERMISSIONS: {},
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
  BottomSheet: ({ children }: any) => (
    <div data-testid="bottom-sheet">{children}</div>
  ),
}));

// Mock PreviewContext
vi.mock("../../../context/PreviewContext", () => ({
  PreviewProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  usePreview: () => ({
    previewHtml: "",
    previewUrl: "",
    refreshPreview: vi.fn(),
    updatePreviewContent: vi.fn(),
    isLoading: false,
  }),
}));

// Mock heavy editor components
vi.mock("../../WebsiteEditor/PreviewPanel", () => ({
  default: () => <div data-testid="preview-panel" />,
}));

vi.mock("../../Editor/DraggableBlockList", () => ({
  default: ({ blocks }: any) => (
    <div data-testid="draggable-block-list">{blocks?.length ?? 0} blocks</div>
  ),
}));

vi.mock("../../Editor/BlockLibrary", () => ({
  default: () => <div data-testid="block-library" />,
}));

vi.mock("../../Editor/InlineTextEditor", () => ({
  default: () => <div data-testid="inline-text-editor" />,
}));

vi.mock("../../Editor/ResponsiveEditorLayout", () => ({
  default: ({ children }: any) => (
    <div data-testid="responsive-editor-layout">{children}</div>
  ),
}));

vi.mock("../../Editor/MobileActionBar", () => ({
  default: () => <div data-testid="mobile-action-bar" />,
}));

vi.mock("../../Editor/MobileFAB", () => ({
  default: () => <div data-testid="mobile-fab" />,
}));

vi.mock("../../Editor/RecoveryModal", () => ({
  default: () => <div data-testid="recovery-modal" />,
}));

vi.mock("../../Editor/ConnectionStatus", () => ({
  default: () => <div data-testid="connection-status" />,
}));

vi.mock("../../Editor/ViewportPreviewSwitcher", () => ({
  default: () => <div data-testid="viewport-switcher" />,
}));

vi.mock("../ThemeManager", () => ({
  default: () => <div data-testid="theme-manager" />,
}));

vi.mock("../ApprovalStatusBanner", () => ({
  default: () => <div data-testid="approval-status-banner" />,
}));

vi.mock("../../../hooks/useLocalStorageBackup", () => ({
  useLocalStorageBackup: () => ({
    hasBackup: false,
    backupEntry: null,
    restoreBackup: vi.fn(),
    discardBackup: vi.fn(),
    clearBackup: vi.fn(),
  }),
}));

vi.mock("../../../hooks/useCollaborativeEditor", () => ({
  useCollaborativeEditor: () => ({
    connectionState: "disconnected",
    activeUsers: [],
    broadcastChange: vi.fn(),
    broadcastCursor: vi.fn(),
    requestEditAccess: vi.fn(),
  }),
}));

vi.mock("../../../hooks/useShortcutManager", () => ({
  useShortcutManager: () => ({
    registerShortcut: vi.fn(),
    unregisterShortcut: vi.fn(),
  }),
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
    mockApiClient.get.mockImplementation((url: string) => {
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
    mockApiClient.put.mockResolvedValue({
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
    await waitFor(() => expect(mockApiClient.get).toHaveBeenCalled());

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

    expect(mockApiClient.put).toHaveBeenCalledTimes(1);
    const putCall = mockApiClient.put.mock.calls[0];
    // Third argument is config with headers
    expect(putCall[2]?.headers?.["If-Match"]).toBeDefined();
  });

  it("handleAutosave stores ETag from successful response and uses it on next save", async () => {
    // GET blocks returns no ETag — so initial state has no ETag
    mockApiClient.get.mockImplementation((url: string) => {
      if (url.includes("/pages") && !url.includes("/blocks")) {
        return Promise.resolve(mockPagesResponse);
      }
      if (url.includes("/blocks")) {
        return Promise.resolve({ data: { data: [] }, headers: {} });
      }
      return Promise.resolve(mockWebsiteResponse);
    });

    // First PUT returns an ETag
    mockApiClient.put
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

    const firstPutCall = mockApiClient.put.mock.calls[0];
    // No If-Match on first PUT since GET returned no ETag
    expect(firstPutCall[2]?.headers?.["If-Match"]).toBeUndefined();

    // Second save — should use the ETag from first PUT response
    await act(async () => {
      await capturedOnSave!(saveData);
    });

    const secondPutCall = mockApiClient.put.mock.calls[1];
    expect(secondPutCall[2]?.headers?.["If-Match"]).toBe('"first-etag"');
  });

  it("handleAutosave catches 412 and returns conflict shape", async () => {
    const serverData = {
      blocks: [{ blockType: "HERO", content: { heading: "Server" } }],
    };
    const serverUpdatedAt = "2026-03-15T09:00:00Z";

    mockApiClient.put.mockRejectedValueOnce({
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
    mockApiClient.put.mockRejectedValueOnce({
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
    mockApiClient.put.mockResolvedValueOnce({
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
    mockApiClient.put.mockResolvedValueOnce({
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

    const secondPutBody = mockApiClient.put.mock.calls[1][1] as Record<
      string,
      unknown
    >;
    expect(secondPutBody.expectedUpdatedAt).toBe("2026-03-15T10:00:00Z");
  });

  it("handleAutosave works gracefully when server returns no ETag (backward compat)", async () => {
    // Mock GET blocks with no ETag header
    mockApiClient.get.mockImplementation((url: string) => {
      if (url.includes("/pages") && !url.includes("/blocks")) {
        return Promise.resolve(mockPagesResponse);
      }
      if (url.includes("/blocks")) {
        return Promise.resolve({ data: { data: [] }, headers: {} });
      }
      return Promise.resolve(mockWebsiteResponse);
    });

    // PUT returns no ETag
    mockApiClient.put.mockResolvedValueOnce({
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
    const putCall = mockApiClient.put.mock.calls[0];
    const ifMatchHeader = putCall[2]?.headers?.["If-Match"];
    expect(
      !ifMatchHeader || ifMatchHeader === null || ifMatchHeader === undefined,
    ).toBe(true);
  });
});
