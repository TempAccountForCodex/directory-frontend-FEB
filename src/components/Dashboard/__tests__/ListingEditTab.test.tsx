/**
 * Tests for ListingEditTab (Step 10.7.10)
 *
 * Covers:
 * 1. Status badge renders correctly for each state
 * 2. Form fields render and save correctly
 * 3. Tag add/remove works, max 10 enforced
 * 4. Publish blocked when completeness < 60%
 * 5. Archive shows confirmation dialog
 * 6. Word counter for shortDescription
 * 7. Empty state when not opted in
 * 8. AI enhance calls correct API
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render as rtlRender, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User", role: "user" },
  }),
}));

vi.mock("../../../context/DashboardContext", () => ({
  DashboardContext: React.createContext({ setSelectedSection: vi.fn() }),
}));

vi.mock("../../../hooks/useFavorites", () => ({
  useFavorites: () => ({
    isFavorited: () => false,
    toggleFavorite: vi.fn(),
  }),
}));

vi.mock("react-quill-new", () => {
  class FakeBlockEmbed {
    static create() {
      return document.createElement("video");
    }
  }

  return {
    Quill: {
      import: vi.fn(() => FakeBlockEmbed),
      register: vi.fn(),
    },
    default: React.forwardRef(
      ({ value, onChange, placeholder }: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({
          getEditor: () => ({
            getSelection: () => ({ index: 0 }),
            getLength: () => 1,
            insertEmbed: vi.fn(),
            setSelection: vi.fn(),
          }),
        }));
        return (
          <textarea
            data-testid="mock-rich-description-editor"
            value={value || ""}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        );
      },
    ),
  };
});

// Mock ThemeContext
vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({
    actualTheme: "dark",
    themeMode: "dark",
    changeTheme: vi.fn(),
  }),
}));

// Mock dashboardTheme
vi.mock("../../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    bgDefault: "#1a1a2e",
    bgCard: "#252542",
    text: "#ffffff",
    textSecondary: "#888888",
    textTertiary: "#555555",
    primary: "#6c63ff",
    primaryDark: "#5a52e0",
    primaryLight: "#8b84ff",
    border: "#333355",
    panelBg: "#1e1e3f",
    panelText: "#ffffff",
    panelMuted: "#888888",
    panelSubtle: "#555555",
    panelAccent: "#6c63ff",
    panelDanger: "#ef4444",
    panelBorder: "#333355",
    panelIcon: "#888888",
    panelShadow: "none",
    mode: "dark",
    error: "#ef4444",
    sidebarActiveBg: "#6c63ff",
    sidebarActiveText: "#ffffff",
  }),
}));

// Mock axios
vi.mock("axios", () => {
  const axiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} }, withCredentials: true },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return {
    default: {
      ...axiosInstance,
      create: vi.fn(() => axiosInstance),
    },
  };
});
import axios from "axios";
const mockedAxios = axios as any;

// Mock shared components
vi.mock("../shared", () => ({
  DashboardCard: ({ title, children }: any) => (
    <div data-testid="dashboard-card">
      <h3>{title}</h3>
      {children}
    </div>
  ),
  EmptyState: ({ title, subtitle }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  ),
  ConfirmationDialog: ({
    open,
    onConfirm,
    onCancel,
    title,
    confirmLabel,
    loading,
  }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <p>{title}</p>
        <button
          data-testid="confirm-action"
          onClick={onConfirm}
          disabled={loading}
        >
          {confirmLabel}
        </button>
        <button data-testid="cancel-action" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

vi.mock("../shared/DashboardInput", () => ({
  default: ({ label, value, onChange, error, helperText, ...props }: any) => (
    <div data-testid={`input-${label?.replace(/\s+/g, "-").toLowerCase()}`}>
      <label>{label}</label>
      <input
        value={value || ""}
        onChange={onChange}
        aria-invalid={error}
        maxLength={props.inputProps?.maxLength}
      />
      {helperText && <span>{helperText}</span>}
    </div>
  ),
}));

vi.mock("../shared/DashboardSelect", () => ({
  default: ({ label, value, onChange, children, error, helperText }: any) => (
    <div data-testid={`select-${label?.replace(/\s+/g, "-").toLowerCase()}`}>
      <label>{label}</label>
      <select value={value || ""} onChange={onChange} aria-invalid={error}>
        {children}
      </select>
      {helperText && <span>{helperText}</span>}
    </div>
  ),
}));

vi.mock("../shared/DashboardActionButton", () => ({
  default: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props["data-testid"] || "action-btn"}
    >
      {children}
    </button>
  ),
}));

vi.mock("../shared/DashboardGradientButton", () => ({
  default: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props["data-testid"] || "gradient-btn"}
    >
      {children}
    </button>
  ),
}));

vi.mock("../shared/DashboardConfirmButton", () => ({
  default: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props["data-testid"] || "confirm-btn"}
    >
      {children}
    </button>
  ),
}));

vi.mock("../shared/DashboardCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="dashboard-card">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

import ListingEditTab from "../ListingEditTab";

function render(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return rtlRender(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("ListingEditTab", () => {
  const validLongDescription = Array.from(
    { length: 800 },
    (_, index) => `service${index + 1}`,
  ).join(" ");

  const baseWebsiteData = {
    name: "Test Business",
    businessName: "Test Business",
    shortDescription: validLongDescription,
    businessCategory: "Technology",
    priceLevel: "$$",
    phone: "+1 555 1234",
    contactEmail: "test@example.com",
    fullAddress: "123 Test St",
    city: "Test City",
    region: "Test Region",
    country: "Test Country",
    tags: ["tech", "startup"],
    directoryOptedIn: true,
    isPublic: false,
    isDirectoryArchived: false,
  };

  const defaultProps = {
    websiteId: 1,
    websiteData: baseWebsiteData,
    planCode: "website_core",
    aiGenerationsUsed: 0,
    aiGenerationsLimit: 10,
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: { score: 80, missing: ["phone"], suggestions: [] },
      },
    });
  });

  it("renders status badge as Draft for opted-in but not public website", async () => {
    render(<ListingEditTab {...defaultProps} />);
    await waitFor(() => {
      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Draft");
    });
  });

  it("renders status badge as Published when isPublic is true", async () => {
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, isPublic: true }}
      />,
    );
    await waitFor(() => {
      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Published");
    });
  });

  it("shows Needs completion instead of Published when readiness is below 60%", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          score: 50,
          missing: ["businessCategory", "contact", "location"],
          suggestions: {},
        },
      },
    });

    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{
          ...baseWebsiteData,
          businessCategory: "",
          phone: "",
          contactEmail: "",
          city: "",
          country: "",
          isPublic: true,
        }}
      />,
    );

    await waitFor(() => {
      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Needs completion");
    });
  });

  it("renders status badge as Not Listed when directoryOptedIn is false", async () => {
    // When not opted in, shows the setup card instead of the management form.
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, directoryOptedIn: false }}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Set Up Directory Listing")).toBeInTheDocument();
    });
  });

  it("keeps setup form open after opting into directory listing", async () => {
    const onUpdate = vi.fn();
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, data: { directoryOptedIn: true } },
    });

    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, directoryOptedIn: false }}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(await screen.findByText("Set Up Directory Listing"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing/extract"),
      );
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ directoryOptedIn: true }),
      );
    });
  });

  it("renders status badge as Archived", async () => {
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, isDirectoryArchived: true }}
      />,
    );
    await waitFor(() => {
      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Archived");
    });
  });

  it("renders form fields with pre-populated data", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      const nameInput = screen
        .getByTestId("input-business-name")
        .querySelector("input")!;
      expect(nameInput.value).toBe("Test Business");
      expect(screen.getByTestId("description-rich-editor")).toBeInTheDocument();
    });
  });

  it("saves form data on Save Changes click", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("save-btn"));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing"),
        expect.objectContaining({
          businessName: "Test Business",
          descriptionContent: expect.stringContaining("<p>"),
        }),
      );
    });
  });

  it("saves rich description content with inline image markup", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-rich-description-editor")).toBeInTheDocument();
    });

    const richEditor = screen.getByTestId("mock-rich-description-editor");
    fireEvent.change(richEditor, {
      target: {
        value: `<p>${validLongDescription}</p><p><img src="https://example.com/listing.jpg" alt="Office" /></p>`,
      },
    });
    fireEvent.click(screen.getByTestId("save-btn"));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing"),
        expect.objectContaining({
          shortDescription: validLongDescription,
          descriptionContent: expect.stringContaining("<img"),
        }),
      );
    });
  });

  it("saves allowed rich description content with one image and one video", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-rich-description-editor")).toBeInTheDocument();
    });

    const richEditor = screen.getByTestId("mock-rich-description-editor");
    fireEvent.change(richEditor, {
      target: {
        value: `<p>${validLongDescription}</p><p><img src="https://example.com/listing.jpg" alt="Office" /></p><p><video src="https://example.com/tour.mp4" controls="controls"></video></p>`,
      },
    });
    fireEvent.click(screen.getByTestId("save-btn"));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing"),
        expect.objectContaining({
          shortDescription: validLongDescription,
          descriptionContent: expect.stringContaining("<video"),
        }),
      );
    });
  });

  it("blocks save when rich description exceeds media limits", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-rich-description-editor")).toBeInTheDocument();
    });

    const richEditor = screen.getByTestId("mock-rich-description-editor");
    fireEvent.change(richEditor, {
      target: {
        value: `<p>${validLongDescription}</p><p><img src="https://example.com/one.jpg" /></p><p><img src="https://example.com/two.jpg" /></p><p><video src="https://example.com/tour.mp4" controls="controls"></video></p>`,
      },
    });
    fireEvent.click(screen.getByTestId("save-btn"));

    expect(
      await screen.findByText(
        "Description can include up to 2 images, or 1 image and 1 video.",
      ),
    ).toBeInTheDocument();
    expect(mockedAxios.patch).not.toHaveBeenCalled();
  });

  it("shows backend listing validation errors on matching fields", async () => {
    mockedAxios.patch.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: "Listing content failed validation",
          code: "LISTING_CONTENT_INVALID",
          fields: {
            shortDescription: ["Description contains spam-like content."],
            contactEmail: ["Email looks suspicious."],
            tags: ["Tags contain unrelated or repetitive keywords."],
          },
        },
      },
    });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("save-btn"));

    expect(
      await screen.findByText("Listing content failed validation"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Description contains spam-like content."),
    ).toBeInTheDocument();
    expect(screen.getByText("Email looks suspicious.")).toBeInTheDocument();
    expect(
      screen.getByText("Tags contain unrelated or repetitive keywords."),
    ).toBeInTheDocument();
  });

  it("renders object-shaped backend errors as text", async () => {
    mockedAxios.patch.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message: {
            message: "Description must be at least 250 words.",
            code: "LISTING_CONTENT_INVALID",
            statusCode: 400,
            requestId: "test-request",
          },
          fields: {
            shortDescription: [
              {
                message: "Description must be at least 250 words.",
                code: "LISTING_CONTENT_INVALID",
              },
            ],
          },
        },
      },
    });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("save-btn"));

    expect(
      await screen.findAllByText("Description must be at least 250 words."),
    ).toHaveLength(2);
  });

  it("preserves existing contact fields when saving a partial listing edit", async () => {
    const onUpdate = vi.fn();
    mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{
          ...baseWebsiteData,
        }}
        onUpdate={onUpdate}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
    });

    const phoneInput = screen
      .getByTestId("input-phone")
      .querySelector("input")!;
    fireEvent.change(phoneInput, { target: { value: "" } });
    fireEvent.click(screen.getByTestId("save-btn"));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing"),
        expect.objectContaining({
          phone: "+1 555 1234",
          contactEmail: "test@example.com",
          fullAddress: "123 Test St",
          city: "Test City",
          region: "Test Region",
          country: "Test Country",
          tags: ["tech", "startup"],
        }),
      );
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: "+1 555 1234",
          contactEmail: "test@example.com",
          fullAddress: "123 Test St",
          city: "Test City",
          region: "Test Region",
          country: "Test Country",
          tags: ["tech", "startup"],
        }),
      );
    });
  });

  it("shows location inputs and hides contact/location missing guidance when values are filled", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          score: 70,
          missing: ["contact", "location"],
          suggestions: {
            contact: "Add an email or phone number so customers can reach you.",
            location: "Add your city and country to appear in location-based searches.",
          },
        },
      },
    });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("input-city")).toBeInTheDocument();
      expect(screen.getByTestId("input-country")).toBeInTheDocument();
      expect(screen.queryByText("Contact")).not.toBeInTheDocument();
      expect(screen.queryByText("Location")).not.toBeInTheDocument();
    });
  });

  it("adds a tag when typing and pressing Enter", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("tag-input")).toBeInTheDocument();
    });

    const tagInput = screen.getByTestId("tag-input").querySelector("input")!;
    fireEvent.change(tagInput, { target: { value: "newtag" } });
    fireEvent.keyDown(tagInput, { key: "Enter" });

    await waitFor(() => {
      const chips = screen.getAllByTestId("tag-chip");
      expect(chips.length).toBe(3); // 2 initial + 1 new
    });
  });

  it("removes a tag when delete is clicked", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      const chips = screen.getAllByTestId("tag-chip");
      expect(chips.length).toBe(2);
    });

    // Click the delete button on the first chip
    const deleteButtons = screen.getAllByLabelText(/Remove tag/);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      const chips = screen.getAllByTestId("tag-chip");
      expect(chips.length).toBe(1);
    });
  });

  it("enforces max 10 tags", async () => {
    const tenTags = [
      "t1",
      "t2",
      "t3",
      "t4",
      "t5",
      "t6",
      "t7",
      "t8",
      "t9",
      "t10",
    ];
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, tags: tenTags }}
      />,
    );

    await waitFor(() => {
      const tagInput = screen.getByTestId("tag-input").querySelector("input")!;
      expect(tagInput).toBeDisabled();
    });

    expect(screen.getByText(/Maximum of 10 tags reached/)).toBeInTheDocument();
  });

  it("blocks publish when completeness < 60%", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          score: 45,
          missing: ["phone", "email", "address"],
          suggestions: [],
        },
      },
    });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("publish-btn"));

    await waitFor(() => {
      expect(
        screen.getByText(/readiness must be at least 60%/i),
      ).toBeInTheDocument();
    });
  });

  it("shows archive confirmation dialog", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("archive-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("archive-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      expect(screen.getByText("Archive Listing?")).toBeInTheDocument();
    });
  });

  it("calls archive API when confirmed", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("archive-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("archive-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-action")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("confirm-action"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing/archive"),
      );
    });
  });

  it("renders word counter for shortDescription", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      const counter = screen.getByTestId("word-counter");
      expect(counter).toHaveTextContent("800 words. Required: 250-2000.");
    });
  });

  it("blocks save when description is below the minimum word count", async () => {
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{
          ...baseWebsiteData,
          shortDescription: "Too short",
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("save-btn"));

    expect(
      await screen.findByText(/Description must be at least 250 words/i),
    ).toBeInTheDocument();
    expect(mockedAxios.patch).not.toHaveBeenCalled();
  });

  it("blocks save when description is above the maximum word count", async () => {
    const tooLongDescription = Array.from(
      { length: 2001 },
      (_, index) => `service${index + 1}`,
    ).join(" ");

    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{
          ...baseWebsiteData,
          shortDescription: tooLongDescription,
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("save-btn"));

    expect(
      await screen.findByText(/Description must be 2000 words or fewer/i),
    ).toBeInTheDocument();
    expect(mockedAxios.patch).not.toHaveBeenCalled();
  });

  it("renders live preview card", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("listing-preview")).toBeInTheDocument();
      expect(screen.getByText("Test Business")).toBeInTheDocument();
    });
  });

  it("shows empty state when not opted in", () => {
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, directoryOptedIn: false }}
      />,
    );

    expect(screen.getByText("Directory Listing")).toBeInTheDocument();
    expect(screen.getByText("Set Up Directory Listing")).toBeInTheDocument();
  });

  it("calls AI enhance endpoint", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { shortDescription: "Enhanced desc", tags: ["ai"] },
      },
    });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("enhance-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("enhance-btn"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing/enhance"),
      );
    });
  });
});
