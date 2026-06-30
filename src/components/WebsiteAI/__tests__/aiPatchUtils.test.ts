import { describe, it, expect } from "vitest";
import {
  extractEditableSchemaTargets,
  findEditableSchemaTarget,
  getPatchEditorPath,
  resolveStyleTargetsForSelection,
  toFieldPath,
  valuesEqual,
  normalizeChatPatches,
  toPersistedBlockContentPath,
  toPersistedContentPath,
} from "../aiPatchUtils";
import { patchMapToList } from "../../../api/websiteAI";

describe("aiPatchUtils", () => {
  it("extracts and resolves editable schema targets", () => {
    const targets = extractEditableSchemaTargets({
      editableSchema: {
        targets: [
          {
            aiEditKey: "home.hero.heading",
            fieldPath: "content.heading",
            kind: "content",
            pageId: 10,
            blockId: 9,
          },
        ],
      },
    });
    expect(
      findEditableSchemaTarget(targets, {
        pageId: 10,
        blockId: 9,
        fieldPath: "heading",
      })?.aiEditKey,
    ).toBe("home.hero.heading");
  });

  it("strips a leading content. prefix for editor field paths", () => {
    expect(toFieldPath("content.heading")).toBe("heading");
    expect(toFieldPath("content.buttonStyle.borderColor")).toBe(
      "buttonStyle.borderColor",
    );
    // non-content paths pass through unchanged
    expect(toFieldPath("heading")).toBe("heading");
  });

  it("converts editor content paths into persisted schema paths", () => {
    expect(toPersistedContentPath("heading")).toBe("content.heading");
    expect(toPersistedContentPath("buttonStyle.borderColor")).toBe(
      "content.buttonStyle.borderColor",
    );
    expect(toPersistedContentPath("content.heading")).toBe("content.heading");
    expect(toPersistedContentPath("pages.10.blocks.9.content.heading")).toBe(
      "pages.10.blocks.9.content.heading",
    );
  });

  it("converts editor content paths into full page/block persisted paths", () => {
    expect(toPersistedBlockContentPath("heading", 10, 9)).toBe(
      "pages.10.blocks.9.content.heading",
    );
    expect(toPersistedBlockContentPath("content.heading", 10, 9)).toBe(
      "pages.10.blocks.9.content.heading",
    );
    expect(
      toPersistedBlockContentPath("pages.10.blocks.9.content.heading", 10, 9),
    ).toBe("pages.10.blocks.9.content.heading");
  });

  it("resolves editable schema targets even when the selected page id is stale", () => {
    const targets = extractEditableSchemaTargets({
      editableSchema: {
        targets: [
          {
            aiEditKey: "home.hero.heading",
            fieldPath: "content.heading",
            kind: "content",
            pageId: 777,
            blockId: 9,
          },
        ],
      },
    });

    expect(
      findEditableSchemaTarget(targets, {
        pageId: 10,
        blockId: 9,
        fieldPath: "heading",
      })?.aiEditKey,
    ).toBe("home.hero.heading");
  });

  it("compares primitive and object field values", () => {
    expect(valuesEqual("a", "a")).toBe(true);
    expect(valuesEqual(null, undefined)).toBe(true);
    expect(valuesEqual({ x: 1 }, { x: 1 })).toBe(true);
    expect(valuesEqual("a", "b")).toBe(false);
  });

  it("normalizes chat patches into editor-applicable patches", () => {
    const out = normalizeChatPatches([
      { blockId: 789, path: "content.heading", value: "Hi" },
    ]);
    expect(out).toEqual([
      {
        aiEditKey: undefined,
        blockId: 789,
        pageId: undefined,
        fieldPath: "heading",
        persistedFieldPath: "content.heading",
        value: "Hi",
        before: undefined,
      },
    ]);
  });

  it("converts a patch map into a patch list", () => {
    const out = patchMapToList({ "content.heading": "Hi" }, 789);
    expect(out).toEqual([
      { blockId: 789, path: "content.heading", value: "Hi" },
    ]);
  });

  describe("unified contract — editorPath + schema-driven style resolution", () => {
    it("prefers the backend editorPath over deriving it from the fieldPath", () => {
      expect(
        getPatchEditorPath({
          path: "pages.10.blocks.9.content.headingStyle.fontSize",
          editorPath: "headingStyle.fontSize",
          value: "4rem",
        }),
      ).toBe("headingStyle.fontSize");
    });

    it("falls back to stripping the persisted prefix when editorPath is absent", () => {
      expect(
        getPatchEditorPath({
          path: "pages.10.blocks.9.content.heading",
          value: "Hi",
        }),
      ).toBe("heading");
    });

    it("normalizeChatPatches uses the authoritative editorPath when present", () => {
      const out = normalizeChatPatches([
        {
          blockId: 9,
          path: "pages.10.blocks.9.content.headingStyle.color",
          editorPath: "headingStyle.color",
          value: "#008080",
        },
      ]);
      expect(out[0].fieldPath).toBe("headingStyle.color");
      expect(out[0].persistedFieldPath).toBe(
        "pages.10.blocks.9.content.headingStyle.color",
      );
    });

    it("resolves style targets from metadata.styleObjects (no local guessing)", () => {
      const targets = extractEditableSchemaTargets({
        editableSchema: {
          targets: [
            {
              aiEditKey: "k.heading",
              fieldPath: "pages.10.blocks.9.content.heading",
              kind: "block_content",
              blockId: 9,
              elementType: "text",
              contentPath: "heading",
              metadata: { group: "content", styleObjects: ["headingStyle"] },
            },
            {
              aiEditKey: "k.headingStyle.color",
              fieldPath: "pages.10.blocks.9.content.headingStyle.color",
              kind: "block_style",
              blockId: 9,
              stylePath: "headingStyle",
            },
            {
              aiEditKey: "k.headingStyle.fontSize",
              fieldPath: "pages.10.blocks.9.content.headingStyle.fontSize",
              kind: "block_style",
              blockId: 9,
              stylePath: "headingStyle",
            },
            {
              // A different style object on the same block must NOT be selected.
              aiEditKey: "k.buttonStyle.borderColor",
              fieldPath: "pages.10.blocks.9.content.buttonStyle.borderColor",
              kind: "block_style",
              blockId: 9,
              stylePath: "buttonStyle",
            },
          ],
        },
      });

      const contentTarget = targets.find((t) => t.aiEditKey === "k.heading");
      const resolved = resolveStyleTargetsForSelection(targets, contentTarget, 9);
      const paths = resolved.map((t) => t.fieldPath);
      expect(paths).toContain("pages.10.blocks.9.content.headingStyle.color");
      expect(paths).toContain("pages.10.blocks.9.content.headingStyle.fontSize");
      expect(paths).not.toContain(
        "pages.10.blocks.9.content.buttonStyle.borderColor",
      );
    });

    it("returns no style targets when the content target declares none", () => {
      const targets = extractEditableSchemaTargets({
        editableSchema: {
          targets: [
            {
              aiEditKey: "k.heading",
              fieldPath: "pages.10.blocks.9.content.heading",
              kind: "block_content",
              blockId: 9,
              metadata: { group: "content" },
            },
          ],
        },
      });
      const contentTarget = targets[0];
      expect(resolveStyleTargetsForSelection(targets, contentTarget, 9)).toEqual(
        [],
      );
    });
  });
});
