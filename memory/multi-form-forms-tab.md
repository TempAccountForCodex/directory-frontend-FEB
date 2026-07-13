---
name: multi-form-forms-tab
description: Forms tab multi-form filtering — frontend done, backend still needs formId storage/filter
metadata:
  type: project
---

Multi-form support was added to the dashboard Forms tab (FormsTab.jsx): a "Form" dropdown detected from the site's live page blocks (`getContactFormMeta` → Contact-type blocks, keyed by block id), plus "All Forms". The `formId` filter is wired into the submissions list, stats, and CSV export.

Every Contact submit path now sends `formId` (source block id) + `formName` (heading) in the `submitWebsiteFormSubmission` payload: EditorSharedBlockRenderer, public ContactBlock, and `useTemplateContactForm` (all 10 templates pass `data.templateContent.contact.blockId`). The landing `src/landingTemplates/blocks/ContactBlock.tsx` was skipped — it's imported nowhere (dead path).

**Pending backend (given to the user as a prompt):** the submissions API must (1) accept + persist `formId`/`formName` on POST — verify it does NOT strict-reject unknown fields or live submissions break; (2) return them in list/detail; (3) support a `formId` query filter on list, `/submissions/export`, and stats. Until then only "All Forms" is meaningful; per-form filtering no-ops.

Newsletter blocks (`/newsletter/subscribe`) and custom FormBuilder blocks (own endpoint) do NOT feed this tab. Old submissions have no `formId` → appear only under All Forms.
