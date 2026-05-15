/**
 * Tests for useAIQuestionnaire hook — Step 3.17
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAIQuestionnaire } from "../useAIQuestionnaire";

// The global test setup mocks sessionStorage with vi.fn(), so we need
// to provide a real in-memory implementation for these tests.
const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  (sessionStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation(
    (key: string) => store[key] ?? null,
  );
  (sessionStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(
    (key: string, val: string) => {
      store[key] = val;
    },
  );
  (sessionStorage.removeItem as ReturnType<typeof vi.fn>).mockImplementation(
    (key: string) => {
      delete store[key];
    },
  );
  (sessionStorage.clear as ReturnType<typeof vi.fn>).mockImplementation(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  });
});

describe("useAIQuestionnaire", () => {
  it("initializes with default empty state", () => {
    const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
    expect(result.current.data.websiteName).toBe("");
    expect(result.current.data.businessType).toBe("");
    expect(result.current.data.email).toBe("");
    expect(result.current.data.services).toBe("");
    expect(result.current.data.socialLinks).toEqual({
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    });
  });

  it("updateField updates a single field", () => {
    const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
    act(() => {
      result.current.updateField("websiteName", "My Site");
    });
    expect(result.current.data.websiteName).toBe("My Site");
  });

  it("updateSocialLink updates a specific social platform", () => {
    const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
    act(() => {
      result.current.updateSocialLink("facebook", "https://fb.com/test");
    });
    expect(result.current.data.socialLinks.facebook).toBe(
      "https://fb.com/test",
    );
    expect(result.current.data.socialLinks.instagram).toBe("");
  });

  describe("validateRequired", () => {
    it("returns errors for all empty required fields", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      let validation: any;
      act(() => {
        validation = result.current.validateRequired();
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors.websiteName).toBeTruthy();
      expect(validation.errors.businessType).toBeTruthy();
      expect(validation.errors.email).toBeTruthy();
      expect(validation.errors.services).toBeTruthy();
    });

    it("rejects websiteName < 3 chars", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      act(() => {
        result.current.updateField("websiteName", "AB");
      });
      let validation: any;
      act(() => {
        validation = result.current.validateRequired();
      });
      expect(validation.errors.websiteName).toContain("at least 3");
    });

    it("rejects websiteName > 255 chars", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      act(() => {
        result.current.updateField("websiteName", "A".repeat(256));
      });
      let validation: any;
      act(() => {
        validation = result.current.validateRequired();
      });
      expect(validation.errors.websiteName).toContain("255");
    });

    it("rejects invalid email", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      act(() => {
        result.current.updateField("email", "not-an-email");
      });
      let validation: any;
      act(() => {
        validation = result.current.validateRequired();
      });
      expect(validation.errors.email).toContain("valid email");
    });

    it("rejects services < 10 chars", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      act(() => {
        result.current.updateField("services", "Short");
      });
      let validation: any;
      act(() => {
        validation = result.current.validateRequired();
      });
      expect(validation.errors.services).toContain("at least 10");
    });

    it("passes with all valid required fields", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      act(() => {
        result.current.updateField("websiteName", "My Business");
        result.current.updateField("businessType", "restaurant");
        result.current.updateField("email", "test@example.com");
        result.current.updateField(
          "services",
          "We offer great food and dining experiences",
        );
      });
      let validation: any;
      act(() => {
        validation = result.current.validateRequired();
      });
      expect(validation.valid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });
  });

  describe("getCompletionPercentage", () => {
    it("returns 0 when no optional fields filled", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      expect(result.current.getCompletionPercentage()).toBe(0);
    });

    it("returns percentage based on filled optional fields", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      act(() => {
        result.current.updateField("phone", "555-1234");
        result.current.updateField("address", "123 Main St");
        result.current.updateField("brandPersonality", "professional");
      });
      // 3 of 9 = 33%
      expect(result.current.getCompletionPercentage()).toBe(33);
    });

    it("counts socialLinks as filled when any link is set", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      act(() => {
        result.current.updateSocialLink("facebook", "https://fb.com/biz");
      });
      // 1 of 9 = 11%
      expect(result.current.getCompletionPercentage()).toBe(11);
    });
  });

  describe("optionalFieldsFilled", () => {
    it("returns count of filled optional fields", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      expect(result.current.optionalFieldsFilled()).toBe(0);
      act(() => {
        result.current.updateField("phone", "555");
        result.current.updateField("targetAudience", "Everyone");
      });
      expect(result.current.optionalFieldsFilled()).toBe(2);
    });
  });

  describe("isComplete", () => {
    it("returns false when required fields are missing", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      expect(result.current.isComplete()).toBe(false);
    });

    it("returns true when all required fields are valid", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      act(() => {
        result.current.updateField("websiteName", "My Business");
        result.current.updateField("businessType", "restaurant");
        result.current.updateField("email", "test@example.com");
        result.current.updateField(
          "services",
          "We offer great food and dining experiences",
        );
      });
      expect(result.current.isComplete()).toBe(true);
    });
  });

  describe("sessionStorage persistence", () => {
    it("persists state to sessionStorage on field update", async () => {
      const { result, rerender } = renderHook(() =>
        useAIQuestionnaire("tpl-42"),
      );
      act(() => {
        result.current.updateField("websiteName", "Persisted");
      });
      // Rerender to flush the useEffect that persists
      rerender();
      const raw = sessionStorage.getItem("ai_questionnaire_tpl-42");
      expect(raw).toBeTruthy();
      const stored = JSON.parse(raw!);
      expect(stored.websiteName).toBe("Persisted");
    });

    it("loads from sessionStorage on init", () => {
      // Pre-populate the backing store before hook init
      store["ai_questionnaire_tpl-99"] = JSON.stringify({
        websiteName: "Restored",
        businessType: "saas",
        email: "a@b.com",
        services: "Testing services",
        phone: "",
        address: "",
        logoFileName: "",
        brandPersonality: "",
        targetAudience: "",
        usp: "",
        socialLinks: { facebook: "", instagram: "", twitter: "", linkedin: "" },
        businessHours: "",
        serviceArea: "",
      });
      const { result } = renderHook(() => useAIQuestionnaire("tpl-99"));
      expect(result.current.data.websiteName).toBe("Restored");
      expect(result.current.data.businessType).toBe("saas");
    });

    it("reset clears state and sessionStorage", () => {
      const { result, rerender } = renderHook(() =>
        useAIQuestionnaire("tpl-50"),
      );
      act(() => {
        result.current.updateField("websiteName", "Before Reset");
      });
      rerender();
      expect(sessionStorage.getItem("ai_questionnaire_tpl-50")).toBeTruthy();
      act(() => {
        result.current.reset();
      });
      expect(result.current.data.websiteName).toBe("");
      expect(sessionStorage.getItem("ai_questionnaire_tpl-50")).toBeNull();
    });
  });

  describe("logo handling", () => {
    it("tracks logoFileName when logoFile is set", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      const mockFile = new File(["logo"], "logo.png", { type: "image/png" });
      act(() => {
        result.current.updateField("logoFile", mockFile);
      });
      expect(result.current.data.logoFile).toBe(mockFile);
      expect(result.current.data.logoFileName).toBe("logo.png");
    });

    it("clears logoFileName when logoFile set to null", () => {
      const { result } = renderHook(() => useAIQuestionnaire("tpl-1"));
      const mockFile = new File(["logo"], "logo.png", { type: "image/png" });
      act(() => {
        result.current.updateField("logoFile", mockFile);
      });
      act(() => {
        result.current.updateField("logoFile", null);
      });
      expect(result.current.data.logoFileName).toBe("");
    });
  });
});
