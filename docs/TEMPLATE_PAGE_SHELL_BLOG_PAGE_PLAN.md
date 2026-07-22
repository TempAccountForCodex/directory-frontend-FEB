# Template Page Shell for Blog and Custom Pages — Implementation Plan

> **Status:** Draft plan, not started.
>
> **Last updated:** 2026-07-15
>
> This document is the source of truth for making generated Blog/custom pages reuse
> the active website template's exact header/navbar and footer while remaining editable
> and AI-targetable in the website editor.

---

## 1. Goal

When a website uses any frontend template, every non-home page created by the platform
or user should render inside that template's own shell:

1. **Home page** keeps rendering the full template exactly as it does today.
2. **Blog index page** (`/blog`) renders:
   - the same template header/navbar as Home;
   - the Blog page's own content blocks (`HERO`, `BLOG_FEED`, etc.);
   - the same template footer as Home.
3. **Blog detail pages** (`/blog/:slug`) render:
   - the same template header/navbar as Home;
   - the generated `BLOG_ARTICLE` detail block;
   - comments;
   - the same template footer as Home.
4. **Other custom pages** should be able to use the same shell behavior later.
5. Navbar/footer edits made from Home or via AI must update Blog/custom pages because
   they use the same template data, not copied page-local blocks.

---

## 2. Locked Decisions

- **Single source of truth:** template header/footer content lives in the template data
  (`templateContent.navbar`, `templateContent.footer`, theme settings, menu references,
  logo fields, etc.), not in copied Blog page blocks.
- **No cloned navbar/footer blocks on Blog pages:** Blog pages store only their page
  content blocks.
- **Renderer extraction only:** do not rename schema paths, AI edit keys, block IDs, or
  existing editor metadata as part of extracting header/footer components.
- **Incremental template rollout:** add a shared shell system first, then migrate templates
  one by one. Templates not migrated yet use the existing generic header/footer fallback.
- **Editor parity:** live site and editor preview must use the same shell strategy so the
  Blog page looks the same in both places.
- **AI safety:** AI can edit shared header/footer from any page, but Blog page content
  patches target the Blog page's own blocks. AI should never create Blog-specific navbar
  or footer copies.

---

## 3. Current Problem

`src/pages/PublicWebsite.tsx` currently has two rendering paths:

- Home page with a frontend template renders the full template through `TemplateEngine`.
- Non-home pages fall through to a generic Material UI header/footer and render their
  page blocks in the middle.

That means `/blog` and `/blog/:slug` do not automatically inherit the exact header/footer
from the active template. This also creates editor mismatch risk: a Blog page can look
different in the editor than it does in live preview.

---

## 4. Target Architecture

### 4.1 Template Chrome Exports

Each migrated template should expose reusable chrome components:

```tsx
export function SomeTemplateHeader({ data, mode }) { ... }
export function SomeTemplateFooter({ data, mode }) { ... }

export default function SomeTemplate({ data }) {
  return (
    <>
      <SomeTemplateHeader data={data} mode="full-template" />
      <HomeTemplateSections data={data} />
      <SomeTemplateFooter data={data} mode="full-template" />
    </>
  );
}
```

The header/footer components must keep the same editable wrappers and field paths they
use today.

### 4.2 Template Chrome Registry

Create a registry that maps template IDs to shell components:

```ts
const templateChromeRegistry = {
  company: {
    Header: CompanyStudioHeader,
    Footer: CompanyStudioFooter,
  },
  modern: {
    Header: ModernHeader,
    Footer: ModernFooter,
  },
};
```

### 4.3 Template Page Shell

Create a shared shell component:

```tsx
<TemplatePageShell templateId={resolvedFrontendTemplateId} data={frontendTemplateData}>
  {pageBlocks}
</TemplatePageShell>
```

Behavior:

- If template chrome exists, render template header + children + template footer.
- If no template chrome exists, use the current generic header/footer fallback.
- The shell should not mutate page blocks or persist any header/footer content.

---

## 5. Workstreams & Tasks

Legend: `[ ]` not started · `[~]` in progress · `[x]` done.

### Track A — Shared Shell Foundation

- [x] A1. Create `TemplatePageShell` under `src/landingTemplates/components/` or
      `src/landingTemplates/templateEngine/`.
- [x] A2. Create `templateChromeRegistry` near the template registry so template IDs stay
      centralized.
- [x] A3. Add a generic fallback chrome using the current `PublicWebsite.tsx` generic
      header/footer behavior.
- [x] A4. Ensure `TemplatePageShell` receives the same `BusinessData` / template data used
      by the home template.
- [x] A5. Add a helper to render page blocks inside the shell without duplicating block
      rendering logic.

### Track B — Public Website Routing

- [x] B1. Update `PublicWebsite.tsx` so Home still renders full `TemplateEngine`.
- [x] B2. Wrap non-home frontend-template pages in `TemplatePageShell`.
- [x] B3. Wrap synthetic Blog detail pages in `TemplatePageShell`.
- [x] B4. Preserve existing SEO behavior for normal pages and Blog detail pages.
- [x] B5. Preserve existing generic header/footer for websites without frontend templates.
- [ ] B6. Verify `/site/:slug/*`, subdomain, and custom-domain paths still work.

### Track C — Editor Preview Parity

- [x] C1. Update editor live preview path so non-home pages use the same `TemplatePageShell`.
- [x] C2. Ensure Blog page blocks remain selectable/editable in the preview.
- [~] C3. Ensure shell header/footer remain selectable/editable through the same template
      targets used on Home.
- [ ] C4. Verify static preview fallback remains functional.
- [x] C5. Confirm the editor does not inject navbar/footer blocks into Blog page block data.

### Track D — AI Editing Integration

- [x] D1. Audit current editable schema generation for non-home pages and Blog page blocks.
- [x] D2. Ensure AI targets can address Blog page blocks, for example:
      `pages.<blogPageId>.blocks.<heroBlockId>.content.heading`.
- [x] D3. Ensure shared navbar/footer AI targets continue to use existing template paths,
      for example `templateContent.navbar.*`, not Blog-specific paths.
- [ ] D4. Update AI patch routing if it currently assumes Home/template-only sections.
- [ ] D5. Add unsupported-target handling where Blog feed/post data is display-only.
      Blog post content should be edited in the Blog dashboard, not page editor AI.
- [ ] D6. Verify AI revert/conflict handling works for Blog page block edits and shared
      header/footer edits.

### Track E — Template Migration

Migrate templates incrementally. For each template:

- [ ] E1. Extract header/navbar JSX into an exported component without changing data paths.
- [ ] E2. Extract footer JSX into an exported component without changing data paths.
- [ ] E3. Update the full template to use the extracted components.
- [ ] E4. Register the extracted components in `templateChromeRegistry`.
- [ ] E5. Verify Home page visual output is unchanged.
- [ ] E6. Verify Blog page uses matching header/footer.
- [ ] E7. Verify editor selection and AI metadata still work.

Initial migration order:

- [x] E8. Company templates currently used by Blog QA.
- [x] E9. Modern/minimal/premium service templates.
- [ ] E10. Store templates.
- [ ] E11. Portfolio templates.
- [ ] E12. Blog/editorial templates.
- [ ] E13. Industry templates: education, plumbing, restaurant, gardening.

### Track F — Tests and QA

- [ ] F1. Unit test: `TemplatePageShell` uses registered chrome when available.
- [ ] F2. Unit test: fallback chrome renders when a template has not been migrated.
- [ ] F3. Route test: `/blog` renders template header/footer + Blog page blocks.
- [ ] F4. Route test: `/blog/:slug` renders template header/footer + `BLOG_ARTICLE`.
- [ ] F5. Editor preview test: selected Blog page displays template chrome and Blog blocks.
- [ ] F6. AI test: shared navbar/footer target paths remain unchanged after extraction.
- [ ] F7. AI test: Blog page block target paths resolve and patch correctly.
- [ ] F8. Regression: Home page visual structure and editable metadata are unchanged.
- [ ] F9. Regression: directory/global blog remains unaffected.
- [x] F10. Validation: `npm run build` passes after shell/editor/public routing changes.

---

## 6. File Touchpoints

| File | Expected Change |
|---|---|
| `src/pages/PublicWebsite.tsx` | Wrap non-home frontend-template pages and Blog detail pages in `TemplatePageShell` |
| `src/components/WebsiteEditor/PreviewPanel.tsx` | Use shell for frontend-template non-home editor preview |
| `src/landingTemplates/templateEngine/templateRegistry.ts` | Keep template IDs aligned with chrome registry |
| `src/landingTemplates/templateEngine/TemplateEngine.tsx` | No behavior change for full Home template rendering |
| `src/landingTemplates/components/TemplatePageShell.tsx` | New shell component |
| `src/landingTemplates/templateEngine/templateChromeRegistry.ts` | New registry for header/footer components |
| `src/landingTemplates/templates/**` | Incrementally extract Header/Footer exports |
| `src/templates/frontendTemplateEditorSupport.ts` | Verify/edit non-home page editable schema and template data |
| `src/components/WebsiteAI/**` | Verify AI target resolution and patch routing for Blog page blocks |
| `src/components/Dashboard/WebsiteEditor.jsx` | Verify selected Blog page preview/content bridge passes enough data |

---

## 7. Open Items

- [ ] Which templates are highest priority for the first migration batch?
- [ ] Are any templates intentionally headerless/footerless?
- [ ] Should custom non-Blog pages also use the template shell immediately, or only Blog
      pages in the first release?
- [ ] Exact AI schema shape for persisted non-home page block targets.
- [ ] Whether Blog Feed presentation fields are editable in page editor, and which fields
      are display-only.
- [ ] Whether footer editable fields already exist consistently across templates.
- [ ] Whether template chrome should expose a `mode="page-shell"` prop for minor spacing
      differences, or render exactly the same as Home.

---

## 8. Acceptance Criteria

- Blog page renders the same active-template header/navbar and footer as Home.
- Blog detail pages render the same active-template header/navbar and footer as Home.
- Changing the template navbar/footer data updates Home, Blog index, and Blog detail pages.
- Blog page does not persist copied navbar/footer blocks.
- Home page rendering remains unchanged.
- Editor preview matches live site for Blog page chrome.
- AI edits can target Blog page blocks where supported.
- AI edits to navbar/footer continue to target shared template data and update every page.
- Templates not yet migrated still render through a safe fallback.

---

## 9. Non-Goals

- Do not redesign template headers or footers.
- Do not change blog post editing to happen inside the website page editor.
- Do not rewrite AI generation/editing contracts unless a schema gap is found.
- Do not require all templates to migrate before the shell foundation can merge.
