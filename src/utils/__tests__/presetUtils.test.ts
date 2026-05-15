/**
 * Tests for presetUtils.ts (Step 7.10.3)
 *
 * Frontend utility tests for preset labels, descriptions,
 * isActionBlockedByPreset, and getBlockedActionMessage.
 */

import { describe, it, expect } from "vitest";
import {
  PRESET_LABELS,
  PRESET_DESCRIPTIONS,
  isActionBlockedByPreset,
  getBlockedActionMessage,
  getBlockedActionsForPreset,
  getPresetLabel,
  getPresetDescription,
  type CollaboratorPreset,
  type WebsiteAction,
} from "../presetUtils";

// ── PRESET_LABELS ─────────────────────────────────────────────────────────────

describe("PRESET_LABELS", () => {
  it("exports label for CONTENT_ONLY", () => {
    expect(PRESET_LABELS.CONTENT_ONLY).toBeTruthy();
    expect(typeof PRESET_LABELS.CONTENT_ONLY).toBe("string");
  });

  it("exports label for REVIEWER", () => {
    expect(PRESET_LABELS.REVIEWER).toBeTruthy();
    expect(typeof PRESET_LABELS.REVIEWER).toBe("string");
  });

  it("CONTENT_ONLY and REVIEWER labels are different", () => {
    expect(PRESET_LABELS.CONTENT_ONLY).not.toBe(PRESET_LABELS.REVIEWER);
  });
});

// ── PRESET_DESCRIPTIONS ───────────────────────────────────────────────────────

describe("PRESET_DESCRIPTIONS", () => {
  it("exports description for CONTENT_ONLY", () => {
    expect(PRESET_DESCRIPTIONS.CONTENT_ONLY).toBeTruthy();
    expect(PRESET_DESCRIPTIONS.CONTENT_ONLY.length).toBeGreaterThan(10);
  });

  it("exports description for REVIEWER", () => {
    expect(PRESET_DESCRIPTIONS.REVIEWER).toBeTruthy();
    expect(PRESET_DESCRIPTIONS.REVIEWER.length).toBeGreaterThan(10);
  });

  it("CONTENT_ONLY description mentions content", () => {
    expect(PRESET_DESCRIPTIONS.CONTENT_ONLY.toLowerCase()).toMatch(/content/);
  });

  it("REVIEWER description mentions read-only or analytics", () => {
    expect(PRESET_DESCRIPTIONS.REVIEWER.toLowerCase()).toMatch(
      /read-only|analytics/,
    );
  });
});

// ── isActionBlockedByPreset ───────────────────────────────────────────────────

describe("isActionBlockedByPreset", () => {
  describe("null/undefined preset", () => {
    it("returns false for null preset (no restriction)", () => {
      expect(isActionBlockedByPreset(null, "PUBLISH")).toBe(false);
    });

    it("returns false for undefined preset", () => {
      expect(isActionBlockedByPreset(undefined, "EDIT_CONTENT")).toBe(false);
    });
  });

  describe("CONTENT_ONLY preset", () => {
    const preset: CollaboratorPreset = "CONTENT_ONLY";

    it("allows VIEW", () => {
      expect(isActionBlockedByPreset(preset, "VIEW")).toBe(false);
    });

    it("allows EDIT_CONTENT", () => {
      expect(isActionBlockedByPreset(preset, "EDIT_CONTENT")).toBe(false);
    });

    it("allows DASHBOARD_ACCESS", () => {
      expect(isActionBlockedByPreset(preset, "DASHBOARD_ACCESS")).toBe(false);
    });

    it("allows MANAGE_FORMS", () => {
      expect(isActionBlockedByPreset(preset, "MANAGE_FORMS")).toBe(false);
    });

    it("blocks PUBLISH", () => {
      expect(isActionBlockedByPreset(preset, "PUBLISH")).toBe(true);
    });

    it("blocks UNPUBLISH", () => {
      expect(isActionBlockedByPreset(preset, "UNPUBLISH")).toBe(true);
    });

    it("blocks VIEW_ANALYTICS", () => {
      expect(isActionBlockedByPreset(preset, "VIEW_ANALYTICS")).toBe(true);
    });

    it("blocks EDIT_SETTINGS", () => {
      expect(isActionBlockedByPreset(preset, "EDIT_SETTINGS")).toBe(true);
    });

    it("blocks DELETE", () => {
      expect(isActionBlockedByPreset(preset, "DELETE")).toBe(true);
    });

    it("blocks MANAGE_COLLABORATORS", () => {
      expect(isActionBlockedByPreset(preset, "MANAGE_COLLABORATORS")).toBe(
        true,
      );
    });

    it("blocks TRANSFER_OWNERSHIP", () => {
      expect(isActionBlockedByPreset(preset, "TRANSFER_OWNERSHIP")).toBe(true);
    });

    it("blocks MANAGE_INTEGRATIONS", () => {
      expect(isActionBlockedByPreset(preset, "MANAGE_INTEGRATIONS")).toBe(true);
    });

    it("blocks MANAGE_DOMAIN", () => {
      expect(isActionBlockedByPreset(preset, "MANAGE_DOMAIN")).toBe(true);
    });
  });

  describe("REVIEWER preset", () => {
    const preset: CollaboratorPreset = "REVIEWER";

    it("allows VIEW", () => {
      expect(isActionBlockedByPreset(preset, "VIEW")).toBe(false);
    });

    it("allows VIEW_ANALYTICS", () => {
      expect(isActionBlockedByPreset(preset, "VIEW_ANALYTICS")).toBe(false);
    });

    it("allows DASHBOARD_ACCESS", () => {
      expect(isActionBlockedByPreset(preset, "DASHBOARD_ACCESS")).toBe(false);
    });

    it("blocks EDIT_CONTENT", () => {
      expect(isActionBlockedByPreset(preset, "EDIT_CONTENT")).toBe(true);
    });

    it("blocks PUBLISH", () => {
      expect(isActionBlockedByPreset(preset, "PUBLISH")).toBe(true);
    });

    it("blocks MANAGE_FORMS", () => {
      expect(isActionBlockedByPreset(preset, "MANAGE_FORMS")).toBe(true);
    });
  });
});

// ── getBlockedActionMessage ───────────────────────────────────────────────────

describe("getBlockedActionMessage", () => {
  it("returns empty string for null preset", () => {
    expect(getBlockedActionMessage(null, "PUBLISH")).toBe("");
  });

  it("returns empty string for undefined preset", () => {
    expect(getBlockedActionMessage(undefined, "PUBLISH")).toBe("");
  });

  it("CONTENT_ONLY+PUBLISH returns specific message", () => {
    const msg = getBlockedActionMessage("CONTENT_ONLY", "PUBLISH");
    expect(msg.length).toBeGreaterThan(10);
    expect(typeof msg).toBe("string");
  });

  it("REVIEWER+EDIT_CONTENT returns specific message", () => {
    const msg = getBlockedActionMessage("REVIEWER", "EDIT_CONTENT");
    expect(msg.length).toBeGreaterThan(10);
    expect(typeof msg).toBe("string");
  });

  it("CONTENT_ONLY+VIEW_ANALYTICS returns specific message", () => {
    const msg = getBlockedActionMessage("CONTENT_ONLY", "VIEW_ANALYTICS");
    expect(msg.length).toBeGreaterThan(10);
  });

  it("messages reference the restriction reason", () => {
    const publishMsg = getBlockedActionMessage("CONTENT_ONLY", "PUBLISH");
    expect(publishMsg.toLowerCase()).toMatch(/content|permission|level/);
  });

  it("REVIEWER message mentions read-only", () => {
    const msg = getBlockedActionMessage("REVIEWER", "EDIT_CONTENT");
    expect(msg.toLowerCase()).toMatch(/read-only|reviewer|editing/);
  });
});

// ── getBlockedActionsForPreset ────────────────────────────────────────────────

describe("getBlockedActionsForPreset", () => {
  it("returns empty array for null preset", () => {
    expect(getBlockedActionsForPreset(null)).toHaveLength(0);
  });

  it("CONTENT_ONLY blocks 9 actions (13 total - 4 allowed)", () => {
    const blocked = getBlockedActionsForPreset("CONTENT_ONLY");
    expect(blocked).toHaveLength(9);
    expect(blocked).toContain("PUBLISH");
    expect(blocked).toContain("VIEW_ANALYTICS");
    expect(blocked).not.toContain("EDIT_CONTENT");
    expect(blocked).not.toContain("VIEW");
  });

  it("REVIEWER blocks 10 actions (13 total - 3 allowed)", () => {
    const blocked = getBlockedActionsForPreset("REVIEWER");
    expect(blocked).toHaveLength(10);
    expect(blocked).toContain("EDIT_CONTENT");
    expect(blocked).toContain("PUBLISH");
    expect(blocked).not.toContain("VIEW");
    expect(blocked).not.toContain("VIEW_ANALYTICS");
  });
});

// ── getPresetLabel ────────────────────────────────────────────────────────────

describe("getPresetLabel", () => {
  it("returns empty string for null preset", () => {
    expect(getPresetLabel(null)).toBe("");
  });

  it("returns empty string for undefined preset", () => {
    expect(getPresetLabel(undefined)).toBe("");
  });

  it("returns label for CONTENT_ONLY", () => {
    expect(getPresetLabel("CONTENT_ONLY")).toBe(PRESET_LABELS.CONTENT_ONLY);
  });

  it("returns label for REVIEWER", () => {
    expect(getPresetLabel("REVIEWER")).toBe(PRESET_LABELS.REVIEWER);
  });
});

// ── getPresetDescription ──────────────────────────────────────────────────────

describe("getPresetDescription", () => {
  it("returns empty string for null preset", () => {
    expect(getPresetDescription(null)).toBe("");
  });

  it("returns description for CONTENT_ONLY", () => {
    expect(getPresetDescription("CONTENT_ONLY")).toBe(
      PRESET_DESCRIPTIONS.CONTENT_ONLY,
    );
  });

  it("returns description for REVIEWER", () => {
    expect(getPresetDescription("REVIEWER")).toBe(PRESET_DESCRIPTIONS.REVIEWER);
  });
});
