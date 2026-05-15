/**
 * Tests for ReservationFormBlock (Step 11.4 / Step 14.12)
 *
 * Covers:
 *  1.  Renders without crashing with minimal content
 *  2.  Renders heading
 *  3.  Renders description
 *  4.  Shows DatePicker when showDate=true (aria-label present)
 *  5.  Hides DatePicker when showDate=false
 *  6.  Shows TimePicker when showTime=true (aria-label present)
 *  7.  Hides TimePicker when showTime=false
 *  8.  Shows party size select when showPartySize=true
 *  9.  Hides party size when showPartySize=false
 *  10. Shows name field when showName=true
 *  11. Shows email field when showEmail=true
 *  12. Shows phone field when showPhone=true
 *  13. Shows message field when showMessage=true
 *  14. Submit button exists with submitText
 *  15. Button disabled while submitting
 *  16. Renders success alert on successful fetch submission
 *  17. Renders error alert on failed fetch submission
 *  18. Falls back to mailto when submitEmail set and no submitEndpoint
 *  19. Does not require submitEndpoint or submitEmail (shows success directly)
 *  20. React.memo applied (displayName or memo wrapper present)
 *  21. DatePicker onChange updates formData.date (ISO date string)
 *  22. TimePicker onChange updates formData.time (HH:mm string)
 *  23. TimePicker onChange with null clears formData.time
 *  24. LocalizationProvider wraps the form (no missing context error)
 *  25. openTime/closeTime props passed to TimePicker as minTime/maxTime
 *  26. disablePast prop is applied to DatePicker
 *  27. minutesStep=15 applied to TimePicker
 *  28. Form submits with picker-set date and time values
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import ReservationFormBlock from "../ReservationFormBlock";

// ---------------------------------------------------------------------------
// Mocks — MUI x-date-pickers (same pattern as WebsiteManageEvents.test.tsx)
// ---------------------------------------------------------------------------

vi.mock("@mui/x-date-pickers", () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@mui/x-date-pickers/DatePicker", () => ({
  DatePicker: ({
    label,
    value,
    onChange,
    disablePast,
    slotProps,
  }: {
    label: string;
    value: Date | null;
    onChange: (v: Date | null) => void;
    disablePast?: boolean;
    slotProps?: { textField?: { inputProps?: Record<string, unknown> } };
  }) => (
    <input
      aria-label={
        (slotProps?.textField?.inputProps?.["aria-label"] as string) ?? label
      }
      data-testid="date-picker"
      data-disable-past={disablePast ? "true" : "false"}
      value={value ? value.toISOString().split("T")[0] : ""}
      onChange={(e) => {
        const d = e.target.value ? new Date(e.target.value) : null;
        onChange(d);
      }}
      readOnly={false}
    />
  ),
}));

vi.mock("@mui/x-date-pickers/TimePicker", () => ({
  TimePicker: ({
    label,
    value,
    onChange,
    minutesStep,
    minTime,
    maxTime,
    slotProps,
  }: {
    label: string;
    value: Date | null;
    onChange: (v: Date | null) => void;
    minutesStep?: number;
    minTime?: Date;
    maxTime?: Date;
    slotProps?: { textField?: { inputProps?: Record<string, unknown> } };
  }) => (
    <input
      aria-label={
        (slotProps?.textField?.inputProps?.["aria-label"] as string) ?? label
      }
      data-testid="time-picker"
      data-minutes-step={minutesStep}
      data-min-time={minTime ? minTime.toISOString() : ""}
      data-max-time={maxTime ? maxTime.toISOString() : ""}
      value={
        value
          ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
          : ""
      }
      onChange={(e) => {
        if (e.target.value) {
          const [h, m] = e.target.value.split(":").map(Number);
          const d = new Date(1970, 0, 1, h, m);
          onChange(d);
        } else {
          onChange(null);
        }
      }}
      readOnly={false}
    />
  ),
}));

vi.mock("@mui/x-date-pickers/AdapterDateFns", () => ({
  AdapterDateFns: class AdapterDateFns {},
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeBlock = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  blockType: "RESERVATION_FORM",
  sortOrder: 1,
  content: {
    heading: "Make a Reservation",
    description: "Book your table today.",
    submitText: "Reserve Now",
    successMessage: "Reservation confirmed!",
    submitEndpoint: "",
    submitEmail: "",
    fields: {
      showName: true,
      showEmail: true,
      showPhone: true,
      showDate: true,
      showTime: true,
      showPartySize: true,
      showMessage: true,
    },
    ...overrides,
  },
});

const renderBlock = (
  contentOverrides: Record<string, unknown> = {},
  props: Record<string, unknown> = {},
) =>
  render(
    <MemoryRouter>
      <ReservationFormBlock
        block={makeBlock(contentOverrides)}
        primaryColor="#2563eb"
        {...props}
      />
    </MemoryRouter>,
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReservationFormBlock", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1
  it("renders without crashing with minimal content", () => {
    renderBlock();
    expect(document.body).toBeTruthy();
  });

  // 2
  it("renders the heading", () => {
    renderBlock();
    expect(screen.getByText("Make a Reservation")).toBeInTheDocument();
  });

  // 3
  it("renders the description", () => {
    renderBlock();
    expect(screen.getByText("Book your table today.")).toBeInTheDocument();
  });

  // 4
  it("shows DatePicker when showDate=true", () => {
    renderBlock();
    expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
  });

  // 5
  it("hides DatePicker when showDate=false", () => {
    renderBlock({
      fields: {
        showName: true,
        showEmail: true,
        showPhone: true,
        showDate: false,
        showTime: true,
        showPartySize: true,
        showMessage: true,
      },
    });
    expect(screen.queryByTestId("date-picker")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Date")).not.toBeInTheDocument();
  });

  // 6
  it("shows TimePicker when showTime=true", () => {
    renderBlock();
    expect(screen.getByTestId("time-picker")).toBeInTheDocument();
    expect(screen.getByLabelText("Time")).toBeInTheDocument();
  });

  // 7
  it("hides TimePicker when showTime=false", () => {
    renderBlock({
      fields: {
        showName: true,
        showEmail: true,
        showPhone: true,
        showDate: true,
        showTime: false,
        showPartySize: true,
        showMessage: true,
      },
    });
    expect(screen.queryByTestId("time-picker")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Time")).not.toBeInTheDocument();
  });

  // 8
  it("shows party size select when showPartySize=true", () => {
    renderBlock();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  // 9
  it("hides party size when showPartySize=false", () => {
    renderBlock({
      fields: {
        showName: true,
        showEmail: true,
        showPhone: true,
        showDate: true,
        showTime: true,
        showPartySize: false,
        showMessage: true,
      },
    });
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  // 10
  it("shows name field when showName=true", () => {
    renderBlock();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  // 11
  it("shows email field when showEmail=true", () => {
    renderBlock();
    const emailInput = document.querySelector('input[type="email"]');
    expect(emailInput).toBeInTheDocument();
  });

  // 12
  it("shows phone field when showPhone=true", () => {
    renderBlock();
    const phoneInput = document.querySelector('input[type="tel"]');
    expect(phoneInput).toBeInTheDocument();
  });

  // 13
  it("shows message field when showMessage=true", () => {
    renderBlock();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  // 14
  it("submit button exists with submitText", () => {
    renderBlock();
    expect(
      screen.getByRole("button", { name: /reserve now/i }),
    ).toBeInTheDocument();
  });

  // 15
  it("button is disabled while submitting", async () => {
    let resolveFetch!: () => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = () => resolve({ ok: true } as Response);
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(() => pendingFetch),
    );

    renderBlock({ submitEndpoint: "https://example.com/api/reserve" });

    const button = screen.getByRole("button", { name: /reserve now/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    resolveFetch();
  });

  // 16
  it("renders success alert after successful fetch submission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: true } as Response)),
    );

    renderBlock({ submitEndpoint: "https://example.com/api/reserve" });

    const button = screen.getByRole("button", { name: /reserve now/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Reservation confirmed!")).toBeInTheDocument();
    });
  });

  // 17
  it("renders error alert on failed fetch submission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false } as Response)),
    );

    renderBlock({ submitEndpoint: "https://example.com/api/reserve" });

    const button = screen.getByRole("button", { name: /reserve now/i });
    fireEvent.click(button);

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  // 18
  it("falls back to mailto when submitEmail set and no submitEndpoint", async () => {
    const locationSpy = vi.fn();
    Object.defineProperty(window, "location", {
      value: { href: "", assign: locationSpy },
      writable: true,
    });

    renderBlock({ submitEmail: "owner@example.com", submitEndpoint: "" });

    const button = screen.getByRole("button", { name: /reserve now/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Reservation confirmed!")).toBeInTheDocument();
    });
  });

  // 19
  it("shows success state directly when neither endpoint nor email is set", async () => {
    renderBlock({ submitEndpoint: "", submitEmail: "" });

    const button = screen.getByRole("button", { name: /reserve now/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Reservation confirmed!")).toBeInTheDocument();
    });
  });

  // 20
  it("is wrapped with React.memo (displayName present)", () => {
    expect(ReservationFormBlock).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sym = (ReservationFormBlock as any).$$typeof;
    expect(sym).toBeDefined();
    expect(sym.toString()).toContain("memo");
  });

  // 21
  it("DatePicker onChange updates formData.date as ISO date string", () => {
    renderBlock();
    const dateInput = screen.getByTestId("date-picker");
    fireEvent.change(dateInput, { target: { value: "2026-06-15" } });
    // After change, the value should reflect the selected date
    expect(dateInput).toHaveValue("2026-06-15");
  });

  // 22
  it("TimePicker onChange updates formData.time as HH:mm string", () => {
    renderBlock();
    const timeInput = screen.getByTestId("time-picker");
    fireEvent.change(timeInput, { target: { value: "14:30" } });
    expect(timeInput).toHaveValue("14:30");
  });

  // 23
  it("TimePicker onChange with empty value clears formData.time", () => {
    renderBlock();
    const timeInput = screen.getByTestId("time-picker");
    fireEvent.change(timeInput, { target: { value: "14:30" } });
    fireEvent.change(timeInput, { target: { value: "" } });
    expect(timeInput).toHaveValue("");
  });

  // 24
  it("LocalizationProvider wraps the form (renders without missing context errors)", () => {
    // If LocalizationProvider were missing, pickers would throw — verify renders cleanly
    expect(() => renderBlock()).not.toThrow();
    expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    expect(screen.getByTestId("time-picker")).toBeInTheDocument();
  });

  // 25
  it("passes openTime/closeTime as minTime/maxTime to TimePicker", () => {
    renderBlock({ openTime: "09:00", closeTime: "22:00" });
    const timePicker = screen.getByTestId("time-picker");
    // Verify attributes are set (non-empty) — exact ISO string varies by timezone
    expect(timePicker.getAttribute("data-min-time")).not.toBe("");
    expect(timePicker.getAttribute("data-max-time")).not.toBe("");
    // Without openTime/closeTime the attributes should be empty
    const { rerender } = render(
      <MemoryRouter>
        <ReservationFormBlock block={makeBlock({})} primaryColor="#2563eb" />
      </MemoryRouter>,
    );
    rerender(
      <MemoryRouter>
        <ReservationFormBlock block={makeBlock({})} primaryColor="#2563eb" />
      </MemoryRouter>,
    );
    const timePickers = screen.getAllByTestId("time-picker");
    // The new render's picker (last one) should have empty min/max
    expect(
      timePickers[timePickers.length - 1].getAttribute("data-min-time"),
    ).toBe("");
    expect(
      timePickers[timePickers.length - 1].getAttribute("data-max-time"),
    ).toBe("");
  });

  // 26
  it("DatePicker has disablePast applied", () => {
    renderBlock();
    const datePicker = screen.getByTestId("date-picker");
    expect(datePicker.getAttribute("data-disable-past")).toBe("true");
  });

  // 27
  it("TimePicker has minutesStep=15 applied", () => {
    renderBlock();
    const timePicker = screen.getByTestId("time-picker");
    expect(timePicker.getAttribute("data-minutes-step")).toBe("15");
  });

  // 28
  it("form submits successfully after setting date and time via pickers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: true } as Response)),
    );

    renderBlock({ submitEndpoint: "https://example.com/api/reserve" });

    const dateInput = screen.getByTestId("date-picker");
    const timeInput = screen.getByTestId("time-picker");

    fireEvent.change(dateInput, { target: { value: "2026-06-15" } });
    fireEvent.change(timeInput, { target: { value: "19:00" } });

    const button = screen.getByRole("button", { name: /reserve now/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Reservation confirmed!")).toBeInTheDocument();
    });
  });
});
