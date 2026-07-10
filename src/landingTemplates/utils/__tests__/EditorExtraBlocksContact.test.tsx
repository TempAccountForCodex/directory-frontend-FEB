import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EditorExtraBlocks } from "../editableComponents";

/**
 * Regression: a Contact block's editable `formFields` list must render on the
 * canvas — for both a flat CONTACT block and a SECTION-wrapped one (the shape
 * the editor persists once a block gets an editorBlockType). Previously the
 * wrapper resolved to type "section" and rendered nothing, so custom fields
 * never appeared.
 */
const FORM_FIELDS = [
  { _id: "1", label: "Full name", placeholder: "Full name", fieldType: "text", required: true, options: "" },
  { _id: "2", label: "Email address", placeholder: "Email address", fieldType: "email", required: true, options: "" },
  { _id: "3", label: "Message", placeholder: "Message", fieldType: "textarea", required: true, options: "" },
  { _id: "custom", label: "Phone", placeholder: "Phone #", fieldType: "tel", required: false, options: "" },
];

const placeholdersOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("input,textarea")).map(
    (el) => (el as HTMLInputElement).placeholder,
  );

describe("EditorExtraBlocks — Contact formFields", () => {
  it("renders custom fields for a flat CONTACT block", () => {
    const block = {
      id: "flat",
      blockType: "CONTACT",
      type: "contact",
      content: { formTitle: "Send a message", buttonText: "Contact us", formFields: FORM_FIELDS },
    };
    const { container } = render(<EditorExtraBlocks blocks={[block as any]} websiteId={49} />);
    expect(placeholdersOf(container)).toContain("Phone #");
  });

  it("renders custom fields for a SECTION-wrapped CONTACT block", () => {
    const block = {
      id: "wrap",
      blockType: "SECTION",
      type: "section",
      content: {
        editorBlockType: "CONTACT",
        editorLabel: "Contact",
        formTitle: "Send a message",
        buttonText: "Contact us",
        formFields: FORM_FIELDS,
        innerBlocks: [
          { id: "inner", type: "contact", blockType: "CONTACT", content: { formFields: FORM_FIELDS } },
        ],
      },
    };
    const { container } = render(<EditorExtraBlocks blocks={[block as any]} websiteId={49} />);
    expect(placeholdersOf(container)).toContain("Phone #");
  });
});
