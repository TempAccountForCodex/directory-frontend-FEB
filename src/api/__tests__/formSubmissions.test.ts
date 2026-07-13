import { describe, expect, it } from "vitest";
import { normalizeContactFormFields } from "../formSubmissions";

describe("normalizeContactFormFields", () => {
  it("keeps required enabled when persisted as string true", () => {
    const fields = normalizeContactFormFields([
      {
        _id: "message",
        label: "Message",
        placeholder: "Message",
        fieldType: "textarea",
        required: "true",
      },
    ]);

    expect(fields[0]?.required).toBe(true);
  });

  it("treats false-like persisted values as optional", () => {
    const fields = normalizeContactFormFields([
      {
        _id: "phone",
        label: "Phone",
        placeholder: "Phone",
        fieldType: "tel",
        required: "false",
      },
    ]);

    expect(fields[0]?.required).toBe(false);
  });
});
