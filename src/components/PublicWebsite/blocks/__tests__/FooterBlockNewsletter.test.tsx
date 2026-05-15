/**
 * FooterBlockNewsletter.test.tsx — Step 14.11
 *
 * Tests the backend integration of the footer's NewsletterForm:
 *  1.  Newsletter form renders when showNewsletter: true
 *  2.  Form not rendered when showNewsletter: false
 *  3.  Form not rendered when showNewsletter is missing
 *  4.  Email input updates on change
 *  5.  Subscribe button has correct label
 *  6.  Successful submission shows success Alert
 *  7.  Network error shows connection error Alert
 *  8.  Rate limit (429) shows rate limit message
 *  9.  Empty email shows validation error without calling fetch
 *  10. Invalid email shows validation error without calling fetch
 *  11. Honeypot filled silently succeeds without calling fetch
 *  12. Form inputs hidden after successful submission
 *  13. CircularProgress shows during loading
 *  14. Subscribe button disabled while loading
 *  15. source: 'footer' sent in POST body
 *  16. websiteId passed through to POST body when provided
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import FooterBlock from "../FooterBlock";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../BlockWrapper", () => ({
  BlockWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="block-wrapper">{children}</div>
  ),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseContent = {
  variant: "simple" as const,
  showNewsletter: true,
  newsletterHeading: "Stay Updated",
  newsletterPlaceholder: "your@email.com",
};

function renderFooter(content: Record<string, unknown> = {}) {
  return render(<FooterBlock content={{ ...baseContent, ...content }} />);
}

function getEmailInput() {
  return screen.getByRole("textbox", { name: /email address/i });
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /subscribe/i });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("FooterBlock — Newsletter Form Backend Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
  });

  it("1. renders newsletter form when showNewsletter is true", () => {
    renderFooter();
    expect(document.querySelector("form")).toBeInTheDocument();
  });

  it("2. does not render form when showNewsletter is false", () => {
    renderFooter({ showNewsletter: false });
    expect(document.querySelector("form")).not.toBeInTheDocument();
  });

  it("3. does not render form when showNewsletter is missing", () => {
    renderFooter({ showNewsletter: undefined });
    expect(document.querySelector("form")).not.toBeInTheDocument();
  });

  it("4. email input updates on change", () => {
    renderFooter();
    const input = getEmailInput();
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect((input as HTMLInputElement).value).toBe("test@example.com");
  });

  it('5. submit button has label "Subscribe"', () => {
    renderFooter();
    expect(getSubmitButton()).toBeInTheDocument();
  });

  it("6. successful submission shows success alert", async () => {
    renderFooter();
    fireEvent.change(getEmailInput(), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /thanks for subscribing/i,
      );
    });
  });

  it("7. network error shows connection error alert", async () => {
    mockFetch.mockRejectedValue(new Error("Network failure"));
    renderFooter();
    fireEvent.change(getEmailInput(), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/connection/i);
    });
  });

  it("8. rate limit (429) shows rate limit message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    });
    renderFooter();
    fireEvent.change(getEmailInput(), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/too many requests/i);
    });
  });

  it("9. empty email shows validation error without calling fetch", async () => {
    renderFooter();
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("10. invalid email shows validation error without calling fetch", async () => {
    renderFooter();
    fireEvent.change(getEmailInput(), { target: { value: "not-an-email" } });
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("11. honeypot filled silently succeeds without calling fetch", async () => {
    renderFooter();
    fireEvent.change(getEmailInput(), { target: { value: "real@user.com" } });
    const honeypot = document.querySelector(
      'input[name="website"]',
    ) as HTMLInputElement;
    expect(honeypot).toBeInTheDocument();
    fireEvent.change(honeypot, { target: { value: "bot-filled" } });
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /thanks for subscribing/i,
      );
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("12. form inputs hidden after successful submission", async () => {
    renderFooter();
    fireEvent.change(getEmailInput(), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(
        screen.queryByRole("textbox", { name: /email address/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("13. CircularProgress shows during loading", async () => {
    let resolvePromise!: () => void;
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = () =>
          resolve({ ok: true, status: 200, json: async () => ({}) });
      }),
    );
    renderFooter();
    fireEvent.change(getEmailInput(), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(
        document.querySelector(".MuiCircularProgress-root"),
      ).toBeInTheDocument();
    });
    act(() => resolvePromise());
  });

  it("14. subscribe button disabled while loading", async () => {
    let resolvePromise!: () => void;
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = () =>
          resolve({ ok: true, status: 200, json: async () => ({}) });
      }),
    );
    renderFooter();
    fireEvent.change(getEmailInput(), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      const btn = document.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement;
      expect(btn).toBeDisabled();
    });
    act(() => resolvePromise());
  });

  it("15. source: footer sent in POST body", async () => {
    renderFooter();
    fireEvent.change(getEmailInput(), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(getSubmitButton());
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.source).toBe("footer");
  });

  it("16. websiteId passed through to POST body when provided", async () => {
    renderFooter({ websiteId: 42 });
    fireEvent.change(getEmailInput(), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(getSubmitButton());
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.websiteId).toBe(42);
  });
});
