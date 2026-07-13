import { useCallback, useRef, useState } from "react";
import type React from "react";
import {
  classifyContactField,
  fieldTypeForKind,
  isEditorPreviewEnvironment,
  isValidEmail,
  submitWebsiteFormSubmission,
} from "../../api/formSubmissions";

/**
 * Reusable contact/inquiry form logic for landing templates.
 *
 * Every template-built form should use this hook instead of its own submit
 * logic, so all forms share the single dashboard Forms flow
 * (POST /forms/websites/:websiteId/submissions). The hook keeps templates free
 * to render whatever markup they want — it only owns state, validation, editor
 * gating, and the network call.
 *
 * Usage:
 *   const FIELDS = [{ label: "Your Name" }, { label: "Email Address" }, ...];
 *   const { status, errorMessage, getFieldProps, handleSubmit } =
 *     useTemplateContactForm(FIELDS, data.websiteId, "consulting-form");
 *
 *   <Box component="form" onSubmit={handleSubmit}>
 *     <Box component="input" {...getFieldProps("Your Name")} />
 *     <Button type="submit" disabled={status === "loading"}>Send</Button>
 *   </Box>
 *
 * Fields are keyed by their visible label. `fieldType` is inferred from the
 * label (name / email / phone / message / text) unless explicitly provided.
 */

export interface TemplateContactField {
  /** Visible label — also the key used by getFieldProps and the stored fieldName. */
  label: string;
  /** Force required. Defaults to true for name/email/message fields. */
  required?: boolean;
  /** Override the inferred field type. */
  fieldType?: string;
}

export type TemplateFormStatus = "idle" | "loading" | "success" | "error";

export function useTemplateContactForm(
  fields: TemplateContactField[],
  websiteId?: string | number,
  source = "template-form",
  /**
   * Optional per-form identity so the dashboard Forms tab can attribute and
   * filter these submissions. `formId` is the source block's id; `formName` its
   * heading. Both are optional and backward-compatible — omitting them keeps the
   * previous behaviour (submission still records, just unattributed to a form).
   */
  formIdentity?: { formId?: string | number; formName?: string },
) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<TemplateFormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  // Synchronous guard: setState is async, so two handler calls in the same
  // click tick (e.g. a submit button that also fires onClick) would both pass a
  // status check and POST twice. A ref blocks the second call immediately.
  const submittingRef = useRef(false);

  const getFieldProps = useCallback(
    (label: string) => ({
      name: label,
      value: values[label] || "",
      disabled: status === "loading",
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        const nextValue = event.target.value;
        setValues((prev) => ({ ...prev, [label]: nextValue }));
      },
    }),
    [values, status],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent | React.MouseEvent) => {
      event.preventDefault();
      // Block a duplicate submit from the same click before anything async runs.
      if (submittingRef.current) return;

      // Editor preview: never validate or persist while designing.
      if (isEditorPreviewEnvironment()) return;

      const built = fields.map((field) => {
        const kind = classifyContactField(field.label);
        const required =
          field.required ??
          (kind === "name" || kind === "email" || kind === "message");
        return {
          label: field.label,
          kind,
          required,
          value: (values[field.label] || "").trim(),
          fieldType: field.fieldType || fieldTypeForKind(kind),
        };
      });

      const emailField = built.find((f) => f.kind === "email");
      const nameField = built.find((f) => f.kind === "name");

      // Prevent empty/invalid submissions.
      if (
        built.some((f) => f.required && !f.value) ||
        built.every((f) => !f.value)
      ) {
        setErrorMessage("Please fill in all required fields.");
        setStatus("error");
        return;
      }
      if (emailField?.value && !isValidEmail(emailField.value)) {
        setErrorMessage("Please enter a valid email address.");
        setStatus("error");
        return;
      }
      if (!websiteId) {
        setErrorMessage(
          "This form isn't connected yet. Please try again later.",
        );
        setStatus("error");
        return;
      }

      submittingRef.current = true;
      setStatus("loading");
      setErrorMessage("");
      try {
        await submitWebsiteFormSubmission(websiteId, {
          submitterName: nameField?.value || undefined,
          submitterEmail: emailField?.value || undefined,
          source,
          ...(formIdentity?.formId != null
            ? { formId: String(formIdentity.formId) }
            : {}),
          ...(formIdentity?.formName
            ? { formName: formIdentity.formName }
            : {}),
          formData: built.map((f) => ({
            fieldName: f.label,
            fieldValue: f.value,
            fieldType: f.fieldType,
          })),
        });
        setStatus("success");
        setValues({});
      } catch {
        setErrorMessage("Something went wrong. Please try again.");
        setStatus("error");
      } finally {
        submittingRef.current = false;
      }
    },
    [fields, values, websiteId, source, formIdentity?.formId, formIdentity?.formName],
  );

  return { values, status, errorMessage, getFieldProps, handleSubmit };
}
