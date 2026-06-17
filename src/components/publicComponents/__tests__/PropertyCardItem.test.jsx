/**
 * Tests for PropertyCardItem (Step 10.8.10)
 *
 * NOTE: Heart/favourite, rating display, and share button tests were removed
 * because the component no longer renders those features. The current component
 * renders a simple card with banner, logo, title, description, address, phone,
 * website, and owner/admin edit/unpublish buttons.
 *
 * Covers:
 * 1. Card renders with title and description
 * 2. Card renders category tag and background-card metadata
 * 3. Admin users see edit/unpublish buttons
 * 4. Non-admin users do not see edit/unpublish buttons
 * 5. Unpublish modal opens on archive icon click
 * 6. Card click navigates to listing detail
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";

/* ---- Mocks ---- */
vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: 1, name: "Test User", role: "user" },
    token: null,
  })),
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

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

vi.mock("../../../hooks/useFormattedPhoneNo", () => ({
  default: (phone) => phone || "",
}));

import { useAuth } from "../../../context/AuthContext";
import PropertyItemCard from "../Listing/PropertyCardItem";

const theme = createTheme();

const defaultItem = {
  id: "101",
  title: "Sample Business",
  desc: "A sample business description for testing.",
  address: "100 Test Street",
  phone: "+44 20 1234 5678",
  website: "https://sample.example.com",
  image: "https://via.placeholder.com/300x180",
  image1: "https://via.placeholder.com/63x63",
};

const renderCard = (itemOverrides = {}, props = {}) => {
  const item = { ...defaultItem, ...itemOverrides };
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <PropertyItemCard
          item={item}
          handleDeleteItem={vi.fn()}
          totalPages={1}
          currentPage={1}
          setCurrentPage={vi.fn()}
          {...props}
        />
      </ThemeProvider>
    </MemoryRouter>,
  );
};

describe("PropertyCardItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: "Test User", role: "user" },
      token: null,
    });
  });

  it("1: renders card with title and description", () => {
    renderCard();
    expect(screen.getByText("Sample Business")).toBeInTheDocument();
    expect(
      screen.getByText(/A sample business description/),
    ).toBeInTheDocument();
  });

  it("2: renders category tag and background-card metadata without extra contact metadata", () => {
    renderCard();
    expect(screen.getByText("Directory")).toBeInTheDocument();
    expect(screen.queryByText("100 Test Street")).not.toBeInTheDocument();
    expect(screen.queryByText("+44 20 1234 5678")).not.toBeInTheDocument();
    expect(screen.queryByText(/sample\.example\.com/)).not.toBeInTheDocument();
  });

  it("3: admin users see edit and unpublish buttons", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: "Admin", role: "admin" },
      token: null,
    });
    renderCard();
    expect(screen.getByRole("button", { name: /edit listing/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /unpublish listing/i })).toBeInTheDocument();
    expect(document.querySelector('[data-testid="EditIcon"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ArchiveOutlinedIcon"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="DeleteIcon"]')).not.toBeInTheDocument();
  });

  it("4: non-admin users do not see edit/unpublish buttons", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: "User", role: "user" },
      token: null,
    });
    renderCard();
    expect(
      document.querySelector('[data-testid="EditIcon"]'),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-testid="DeleteIcon"]'),
    ).not.toBeInTheDocument();
  });

  it("5: unpublish modal opens on archive icon click", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: "Admin", role: "admin" },
      token: null,
    });
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: /unpublish listing/i }));
    expect(screen.getByText(/Unpublish this listing/i)).toBeInTheDocument();
    expect(
      screen.getByText(/disappear from the public directory/i),
    ).toBeInTheDocument();
  });

  it("6: card click navigates to listing detail", () => {
    renderCard();
    const card = document.querySelector(".MuiCard-root");
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith("/listings/101?type=listing");
  });

  it("7: does not render website metadata for placeholder URL", () => {
    renderCard({ website: "https://www.example.com/" });
    expect(screen.queryByText("-")).not.toBeInTheDocument();
  });
});
