/**
 * previewInjector — Step 5.1.3
 *
 * Generates a complete HTML document from editor state for injection
 * into the preview iframe via srcdoc. Pure function with no side effects.
 *
 * Security: All user content is HTML-escaped before injection.
 * The generated HTML includes a postMessage listener with origin validation.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PreviewWebsite {
  name: string;
  theme?: Record<string, unknown>;
  fonts?: Record<string, string>;
  colors?: Record<string, string>;
}

export interface PreviewPage {
  id: string;
  title: string;
  slug?: string;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}

export interface GlobalComponents {
  navbar?: Record<string, unknown>;
  footer?: Record<string, unknown>;
}

export interface PreviewBlock {
  id: string;
  blockType: string;
  content: Record<string, unknown>;
  order: number;
  designTokens?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  HTML Escaping (XSS Prevention)                                     */
/* ------------------------------------------------------------------ */

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const ESCAPE_RE = /[&<>"']/g;

/**
 * Escape HTML special characters in user content.
 * Prevents XSS when injecting content into srcdoc HTML strings.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str).replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch] || ch);
}

/* ------------------------------------------------------------------ */
/*  CSS Sanitization (CSS Injection Prevention)                        */
/* ------------------------------------------------------------------ */

/**
 * Sanitize a CSS custom property key.
 * Strips all characters that are not alphanumeric or hyphen to prevent
 * CSS injection via malicious key names (e.g. "x; } body { background: ...").
 */
function sanitizeCssKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9-]/g, "");
}

/**
 * Sanitize a CSS custom property value.
 * Removes semicolons and curly braces to prevent CSS injection via values
 * that attempt to break out of the property declaration.
 * HTML-escaping alone is insufficient for CSS context.
 */
function sanitizeCssValue(value: string): string {
  // Strip ; and { } which are the primary CSS injection breakout characters.
  // Also strip backslash (CSS escape sequences) to prevent encoding tricks.
  return value.replace(/[;{}\\]/g, "");
}

/* ------------------------------------------------------------------ */
/*  URL Sanitization (Dangerous Protocol Prevention)                    */
/* ------------------------------------------------------------------ */

/** Allowed URL schemes for href and src attributes. */
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Sanitize a URL for use in href/src attributes.
 * Returns '' for dangerous schemes (javascript:, data:, vbscript:, etc.).
 * Allows http:, https:, mailto:, tel:, relative paths (/...), and fragment links (#...).
 */
export function sanitizeUrl(url: unknown): string {
  if (url === null || url === undefined) return "";
  const str = String(url).trim();
  if (!str) return "";

  // Allow relative paths and fragment-only links
  if (str.startsWith("/") || str.startsWith("#")) return escapeHtml(str);

  // Parse protocol — handle whitespace/control chars that browsers may ignore
  // Strip leading whitespace, tabs, newlines that could mask the protocol
  const normalized = str.replace(/[\x00-\x1f\x7f]/g, "").trim();

  try {
    const parsed = new URL(normalized, "https://placeholder.invalid");
    if (SAFE_URL_PROTOCOLS.has(parsed.protocol)) {
      return escapeHtml(str);
    }
  } catch {
    // If it fails to parse as absolute URL, treat as relative (safe)
    // But double-check it doesn't start with a dangerous scheme
    const lower = normalized.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("data:") ||
      lower.startsWith("vbscript:")
    ) {
      return "";
    }
    return escapeHtml(str);
  }

  // Protocol not in allowlist — block
  return "";
}

/* ------------------------------------------------------------------ */
/*  Design Tokens → CSS Custom Properties                              */
/* ------------------------------------------------------------------ */

function buildCssVariables(website: PreviewWebsite): string {
  const vars: string[] = [];

  if (website.colors) {
    for (const [key, value] of Object.entries(website.colors)) {
      const safeKey = sanitizeCssKey(key);
      const safeValue = sanitizeCssValue(escapeHtml(value));
      if (safeKey) {
        vars.push(`  --color-${safeKey}: ${safeValue};`);
      }
    }
  }

  if (website.fonts) {
    for (const [key, value] of Object.entries(website.fonts)) {
      const safeKey = sanitizeCssKey(key);
      const safeValue = sanitizeCssValue(escapeHtml(value));
      if (safeKey) {
        vars.push(`  --font-${safeKey}: ${safeValue};`);
      }
    }
  }

  return vars.length > 0 ? `:root {\n${vars.join("\n")}\n}` : "";
}

/* ------------------------------------------------------------------ */
/*  Block → HTML renderers                                             */
/* ------------------------------------------------------------------ */

function renderHeroBlock(content: Record<string, unknown>): string {
  const title = escapeHtml(content.title);
  const subtitle = escapeHtml(content.subtitle);
  const buttonText = escapeHtml(content.buttonText);
  const buttonUrl = sanitizeUrl(content.buttonUrl || "#");

  return `
    <section style="padding:60px 20px;text-align:center;background:var(--color-primary,#378C92);color:#fff;">
      ${title ? `<h1 data-editable="title" data-edit-type="single" style="margin:0 0 16px;font-family:var(--font-heading,sans-serif);font-size:2.5rem;">${title}</h1>` : ""}
      ${subtitle ? `<p data-editable="subtitle" data-edit-type="single" style="margin:0 0 24px;font-size:1.2rem;opacity:0.9;">${subtitle}</p>` : ""}
      ${buttonText ? `<a data-editable="buttonText" data-edit-type="single" href="${buttonUrl}" style="display:inline-block;padding:12px 32px;background:#fff;color:var(--color-primary,#378C92);border-radius:6px;text-decoration:none;font-weight:600;">${buttonText}</a>` : ""}
    </section>`;
}

function renderTextBlock(content: Record<string, unknown>): string {
  const text = escapeHtml(content.text);
  return `
    <section style="padding:40px 20px;max-width:800px;margin:0 auto;">
      <div data-editable="text" data-edit-type="multi" style="font-family:var(--font-body,sans-serif);line-height:1.7;color:var(--color-text,#111);">${text}</div>
    </section>`;
}

function renderCtaBlock(content: Record<string, unknown>): string {
  const heading = escapeHtml(content.heading);
  const description = escapeHtml(content.description);
  const buttonText = escapeHtml(content.buttonText);
  const buttonUrl = sanitizeUrl(content.buttonUrl || "#");

  return `
    <section style="padding:60px 20px;text-align:center;background:var(--color-secondary,#f5f5f5);">
      ${heading ? `<h2 data-editable="heading" data-edit-type="single" style="margin:0 0 12px;font-family:var(--font-heading,sans-serif);">${heading}</h2>` : ""}
      ${description ? `<p data-editable="description" data-edit-type="multi" style="margin:0 0 24px;color:var(--color-text,#444);">${description}</p>` : ""}
      ${buttonText ? `<a data-editable="buttonText" data-edit-type="single" href="${buttonUrl}" style="display:inline-block;padding:12px 32px;background:var(--color-primary,#378C92);color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">${buttonText}</a>` : ""}
    </section>`;
}

function renderImageBlock(content: Record<string, unknown>): string {
  const src = sanitizeUrl(content.src);
  const alt = escapeHtml(content.alt || "Image");

  return `
    <section style="padding:20px;text-align:center;">
      <img
        src="${src}"
        alt="${alt}"
        style="max-width:100%;height:auto;border-radius:8px;"
        onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22><rect width=%22400%22 height=%22300%22 fill=%22%23ddd%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2216%22>Image unavailable</text></svg>';this.alt='Image unavailable';"
      />
    </section>`;
}

function renderFeaturesBlock(content: Record<string, unknown>): string {
  const features = Array.isArray(content.features) ? content.features : [];
  const items = features
    .map(
      (f: Record<string, unknown>) => `
      <div style="flex:1;min-width:200px;padding:20px;text-align:center;">
        <h3 style="margin:0 0 8px;font-family:var(--font-heading,sans-serif);">${escapeHtml(f.title)}</h3>
        <p style="margin:0;color:var(--color-text,#666);">${escapeHtml(f.description)}</p>
      </div>`,
    )
    .join("");

  return `
    <section style="padding:40px 20px;">
      <div style="display:flex;flex-wrap:wrap;gap:20px;max-width:1200px;margin:0 auto;justify-content:center;">
        ${items}
      </div>
    </section>`;
}

function renderContactBlock(content: Record<string, unknown>): string {
  const heading = escapeHtml(content.heading || "Contact Us");

  return `
    <section style="padding:60px 20px;text-align:center;">
      <h2 data-editable="heading" data-edit-type="single" style="margin:0 0 24px;font-family:var(--font-heading,sans-serif);">${heading}</h2>
      <div style="max-width:500px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:8px;color:#999;">
        Contact form placeholder
      </div>
    </section>`;
}

export function renderNavbarBlock(content: Record<string, unknown>): string {
  // Support both new schema (brandName/navigationItems) and legacy (logo/links)
  const brandName = escapeHtml(content.brandName || content.logo || "My Brand");
  const navigationItems = Array.isArray(content.navigationItems)
    ? content.navigationItems
    : Array.isArray(content.links)
      ? (content.links as Record<string, unknown>[]).map((l) => ({
          label: l.text,
          link: l.url,
        }))
      : [];
  const navHtml = navigationItems
    .slice(0, 8)
    .map(
      (item: Record<string, unknown>) =>
        `<a href="${sanitizeUrl(item.link)}" style="color:inherit;text-decoration:none;margin:0 12px;">${escapeHtml(item.label)}</a>`,
    )
    .join("");

  const ctaText = escapeHtml(content.ctaText);
  const ctaLink = sanitizeUrl(content.ctaLink);
  const ctaHtml =
    ctaText && ctaLink
      ? `<a href="${ctaLink}" style="background:#fff;color:var(--color-primary,#378C92);padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:600;">${ctaText}</a>`
      : "";

  const sticky = content.sticky ? "position:sticky;top:0;z-index:1000;" : "";
  const logoImg =
    content.logo &&
    typeof content.logo === "string" &&
    content.logo.startsWith("http")
      ? `<img src="${sanitizeUrl(content.logo)}" alt="${brandName}" style="height:32px;margin-right:8px;" />`
      : "";

  return `
    <nav data-block-type="NAVBAR" data-global-component="navbar" style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;background:var(--color-primary,#378C92);color:#fff;${sticky}">
      <div style="display:flex;align-items:center;">
        ${logoImg}
        <strong data-editable="brandName" data-edit-type="single" style="font-family:var(--font-heading,sans-serif);font-size:1.2rem;">${brandName}</strong>
      </div>
      <div style="display:flex;align-items:center;">
        ${navHtml}
        ${ctaHtml}
      </div>
    </nav>`;
}

export function renderFooterBlock(content: Record<string, unknown>): string {
  const copyright = escapeHtml(content.copyright);

  // Logo
  const logoImg =
    content.logo && typeof content.logo === "string"
      ? `<img src="${sanitizeUrl(content.logo)}" alt="Logo" style="height:40px;margin-bottom:12px;" />`
      : "";

  // Columns with nested links (new schema)
  const columns = Array.isArray(content.columns)
    ? content.columns.slice(0, 4)
    : [];
  const columnsHtml = columns
    .map((col: Record<string, unknown>) => {
      const colTitle = escapeHtml(col.title);
      const colLinks = Array.isArray(col.links) ? col.links.slice(0, 8) : [];
      const colLinkHtml = colLinks
        .map(
          (link: Record<string, unknown>) =>
            `<a href="${sanitizeUrl(link.url)}" style="color:inherit;text-decoration:none;display:block;margin:4px 0;">${escapeHtml(link.label)}</a>`,
        )
        .join("");
      return `<div style="flex:1;min-width:120px;"><h4 style="margin:0 0 8px 0;font-size:0.95rem;">${colTitle}</h4>${colLinkHtml}</div>`;
    })
    .join("");

  // Social links
  const socialLinks = Array.isArray(content.socialLinks)
    ? content.socialLinks.slice(0, 5)
    : [];
  const platformLabels: Record<string, string> = {
    facebook: "FB",
    twitter: "TW",
    instagram: "IG",
    linkedin: "LI",
    youtube: "YT",
  };
  const socialHtml = socialLinks
    .map(
      (s: Record<string, unknown>) =>
        `<a href="${sanitizeUrl(s.url)}" style="color:inherit;margin:0 6px;text-decoration:none;" target="_blank" rel="noopener noreferrer">${platformLabels[String(s.platform)] || escapeHtml(s.platform)}</a>`,
    )
    .join("");

  // Legacy links support (old schema: content.links with text/url)
  const legacyLinks = Array.isArray(content.links) ? content.links : [];
  const legacyHtml = legacyLinks
    .map(
      (link: Record<string, unknown>) =>
        `<a href="${sanitizeUrl(link.url)}" style="color:inherit;margin:0 8px;">${escapeHtml(link.text || link.label)}</a>`,
    )
    .join("");

  return `
    <footer data-block-type="FOOTER" data-global-component="footer" style="padding:24px;background:#222;color:#ccc;font-size:0.9rem;">
      ${logoImg}
      ${columnsHtml ? `<div style="display:flex;gap:24px;margin-bottom:16px;flex-wrap:wrap;">${columnsHtml}</div>` : ""}
      ${legacyHtml ? `<div style="text-align:center;margin-bottom:8px;">${legacyHtml}</div>` : ""}
      ${socialHtml ? `<div style="text-align:center;margin-bottom:8px;">${socialHtml}</div>` : ""}
      ${copyright ? `<p data-editable="copyright" data-edit-type="single" style="margin:0;text-align:center;opacity:0.7;">${copyright}</p>` : ""}
    </footer>`;
}

/** Map a single block to its HTML representation based on blockType */
function blockToHtml(block: PreviewBlock): string {
  const { blockType, content, id } = block;
  let inner: string;

  switch (blockType) {
    case "HERO":
      inner = renderHeroBlock(content);
      break;
    case "TEXT":
      inner = renderTextBlock(content);
      break;
    case "CTA":
      inner = renderCtaBlock(content);
      break;
    case "IMAGE":
      inner = renderImageBlock(content);
      break;
    case "FEATURES":
      inner = renderFeaturesBlock(content);
      break;
    case "CONTACT":
      inner = renderContactBlock(content);
      break;
    case "NAVBAR":
      inner = renderNavbarBlock(content);
      break;
    case "FOOTER":
      inner = renderFooterBlock(content);
      break;
    default:
      inner = `<section style="padding:20px;color:#999;text-align:center;"><em>${escapeHtml(blockType)} block</em></section>`;
  }

  return `<div id="block-${escapeHtml(id)}" data-block-id="${escapeHtml(id)}" data-block-type="${escapeHtml(blockType)}">${inner}</div>`;
}

/* ------------------------------------------------------------------ */
/*  PostMessage listener script                                        */
/* ------------------------------------------------------------------ */

function buildPostMessageScript(parentOrigin: string): string {
  // Embed the parent's origin as a literal string so the srcdoc iframe can
  // validate incoming postMessage senders. We cannot use window.location.origin
  // inside a srcdoc document because its origin is always the string "null".
  const safeParentOrigin = escapeHtml(parentOrigin);
  return `
<script>
(function() {
  // Origin validation: only accept messages from the known parent origin.
  // window.location.origin is "null" for srcdoc documents — use the
  // parent origin injected at generation time instead.
  var allowedOrigin = "${safeParentOrigin}";

  window.addEventListener('message', function(event) {
    // Accept messages from the parent origin OR from "null" (srcdoc self-messages).
    if (event.origin !== allowedOrigin && event.origin !== 'null') return;

    var data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'CONTENT_UPDATE' && data.blockId && data.content) {
      var el = document.getElementById('block-' + data.blockId);
      if (el) {
        // Use textContent for simple updates to prevent XSS
        var contentEl = el.querySelector('[data-content]');
        if (contentEl) {
          contentEl.textContent = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
        }
      }
    }

    if (data.type === 'VIEWPORT_CHANGE') {
      // Viewport changed — iframe can react (e.g., adjust layout)
      document.documentElement.setAttribute('data-viewport', data.viewport || 'desktop');
    }

    // Step 9.14.1: Handle SELECT_BLOCK from parent — apply selection class
    if (data.type === 'SELECT_BLOCK' && data.blockId) {
      // Remove previous selection
      var prevSelected = document.querySelectorAll('.tt-block-selected');
      for (var i = 0; i < prevSelected.length; i++) {
        prevSelected[i].classList.remove('tt-block-selected');
        // Remove corner handles
        var handles = prevSelected[i].querySelectorAll('.tt-block-handle');
        for (var h = 0; h < handles.length; h++) {
          handles[h].parentNode.removeChild(handles[h]);
        }
      }
      // Apply to new target
      var target = document.querySelector('[data-block-id="' + data.blockId + '"]');
      if (target) {
        target.classList.add('tt-block-selected');
        addCornerHandles(target);
      }
    }

    // Step 9.14.1: Handle DESELECT_ALL from parent
    if (data.type === 'DESELECT_ALL') {
      var allSelected = document.querySelectorAll('.tt-block-selected');
      for (var j = 0; j < allSelected.length; j++) {
        allSelected[j].classList.remove('tt-block-selected');
        var allHandles = allSelected[j].querySelectorAll('.tt-block-handle');
        for (var k = 0; k < allHandles.length; k++) {
          allHandles[k].parentNode.removeChild(allHandles[k]);
        }
      }
    }
  });

  // Step 9.14.1: Click handler — select block on click
  document.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    var blockEl = event.target.closest('[data-block-id]');
    if (blockEl) {
      var blockId = blockEl.getAttribute('data-block-id');
      try {
        window.parent.postMessage({ type: 'BLOCK_SELECTED', blockId: blockId }, allowedOrigin);
      } catch (_) { /* silent */ }
    }
  }, true);

  // Step 9.14.1: Mouseover handler — hover block
  document.addEventListener('mouseover', function(event) {
    var blockEl = event.target.closest('[data-block-id]');
    if (blockEl) {
      var blockId = blockEl.getAttribute('data-block-id');
      try {
        window.parent.postMessage({ type: 'BLOCK_HOVER', blockId: blockId }, allowedOrigin);
      } catch (_) { /* silent */ }
    }
  });

  // Step 9.14.1: Mouseout handler — clear hover
  document.addEventListener('mouseout', function(event) {
    var blockEl = event.target.closest('[data-block-id]');
    if (blockEl) {
      try {
        window.parent.postMessage({ type: 'BLOCK_HOVER', blockId: null }, allowedOrigin);
      } catch (_) { /* silent */ }
    }
  });

  // Step 9.14.1: Add corner handles to a selected block element
  function addCornerHandles(el) {
    var positions = [
      { top: '-4px', left: '-4px' },
      { top: '-4px', right: '-4px' },
      { bottom: '-4px', left: '-4px' },
      { bottom: '-4px', right: '-4px' }
    ];
    for (var p = 0; p < positions.length; p++) {
      var handle = document.createElement('div');
      handle.className = 'tt-block-handle';
      handle.style.position = 'absolute';
      handle.style.width = '8px';
      handle.style.height = '8px';
      handle.style.background = '#1976d2';
      handle.style.zIndex = '10';
      handle.style.pointerEvents = 'none';
      var pos = positions[p];
      if (pos.top !== undefined) handle.style.top = pos.top;
      if (pos.bottom !== undefined) handle.style.bottom = pos.bottom;
      if (pos.left !== undefined) handle.style.left = pos.left;
      if (pos.right !== undefined) handle.style.right = pos.right;
      el.appendChild(handle);
    }
  }

  // Step 9.16.1: Double-click handler — inline text editing
  document.addEventListener('dblclick', function(event) {
    var editableEl = event.target.closest ? event.target.closest('[data-editable]') : null;
    if (!editableEl) return;

    event.preventDefault();
    event.stopPropagation();

    var blockEl = editableEl.closest('[data-block-id]');
    if (!blockEl) return;

    var blockId = blockEl.getAttribute('data-block-id');
    var fieldPath = editableEl.getAttribute('data-editable');
    var editType = editableEl.getAttribute('data-edit-type') || 'single';

    // Security: validate fieldPath is a safe identifier (alphanumeric + dot only)
    if (!fieldPath || !/^[a-zA-Z0-9.]+$/.test(fieldPath)) return;

    var value = editableEl.textContent || '';
    var rect = editableEl.getBoundingClientRect();

    // Add visual editing indicator
    editableEl.classList.add('tt-editing-active');

    try {
      window.parent.postMessage({
        type: 'EDIT_START',
        blockId: blockId,
        fieldPath: fieldPath,
        value: value,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        editType: editType
      }, allowedOrigin);
    } catch (_) { /* silent */ }
  }, true);

  // Step 9.16.1: Handle EDIT_COMPLETE from parent — remove editing indicator
  window.addEventListener('message', function(event) {
    if (event.origin !== allowedOrigin && event.origin !== 'null') return;
    var data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'EDIT_COMPLETE' && data.blockId && data.fieldPath) {
      var blockEl = document.getElementById('block-' + data.blockId);
      if (blockEl) {
        var editableEl = blockEl.querySelector('[data-editable="' + data.fieldPath + '"]');
        if (editableEl) {
          editableEl.classList.remove('tt-editing-active');
        }
      }
    }
  });

  // CSP violation detection
  window.addEventListener('securitypolicyviolation', function(e) {
    // Report to parent frame for observability
    try {
      window.parent.postMessage({
        type: 'CSP_VIOLATION',
        detail: { blockedURI: e.blockedURI, violatedDirective: e.violatedDirective }
      }, allowedOrigin);
    } catch (_) { /* silent */ }
  });
})();
</script>`;
}

/* ------------------------------------------------------------------ */
/*  Responsive CSS                                                     */
/* ------------------------------------------------------------------ */

function buildResponsiveCss(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      color: var(--color-text, #111);
      background: var(--color-background, #fff);
      line-height: 1.6;
    }
    img { max-width: 100%; height: auto; }

    /* Step 9.14.1: Interactive block selection styles */
    [data-block-id] {
      cursor: pointer;
      position: relative;
      transition: border-color 0.15s ease;
    }
    [data-block-id]:hover {
      border: 2px dashed rgba(25, 118, 210, 0.5);
    }
    .tt-block-selected {
      border: 2px solid #1976d2 !important;
      position: relative;
    }

    /* Step 9.16.1: Inline text editing hover indicator */
    [data-editable] {
      transition: text-decoration 0.15s ease, border-bottom 0.15s ease;
    }
    [data-editable]:hover {
      cursor: text;
      text-decoration-line: underline;
      text-decoration-style: dashed;
      text-decoration-color: rgba(25, 118, 210, 0.5);
      text-underline-offset: 3px;
    }
    .tt-editing-active {
      outline: 2px dashed rgba(25, 118, 210, 0.6);
      outline-offset: 2px;
    }

    /* Desktop-first responsive breakpoints */
    @media (max-width: 768px) {
      body { font-size: 15px; }
      h1 { font-size: 2rem !important; }
      h2 { font-size: 1.5rem !important; }
      section { padding: 30px 16px !important; }
    }
    @media (max-width: 375px) {
      body { font-size: 14px; }
      h1 { font-size: 1.6rem !important; }
      h2 { font-size: 1.3rem !important; }
      section { padding: 20px 12px !important; }
    }
  `;
}

/* ------------------------------------------------------------------ */
/*  Main: generateLivePreview                                          */
/* ------------------------------------------------------------------ */

/**
 * Generate a complete HTML document from editor state.
 * Pure function — safe to memoize by caller.
 *
 * @param website      - Website metadata (theme, fonts, colors)
 * @param page         - Current page data
 * @param blocks       - Array of blocks to render (sorted by order)
 * @param parentOrigin - The parent window origin for postMessage validation.
 *                       Defaults to window.location.origin (caller should pass
 *                       explicitly so srcdoc iframe can validate correctly).
 * @returns Complete HTML document string for iframe srcdoc
 */
export function generateLivePreview(
  website: PreviewWebsite,
  page: PreviewPage,
  blocks: PreviewBlock[],
  parentOrigin?: string,
  globalComponents?: GlobalComponents,
): string {
  // Callers should pass window.location.origin. Fall back safely if omitted.
  const resolvedParentOrigin =
    parentOrigin ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const cssVars = buildCssVariables(website);
  const responsiveCss = buildResponsiveCss();

  // Sort blocks by order
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  // Render blocks or empty placeholder
  const bodyContent =
    sorted.length > 0
      ? sorted.map((b) => blockToHtml(b)).join("\n")
      : `<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;color:#999;font-size:1.1rem;">Add blocks to see a preview</div>`;

  // Global component injection (navbar before content, footer after)
  let navbarHtml = "";
  let footerHtml = "";
  try {
    if (globalComponents?.navbar && !page.hideNavbar) {
      navbarHtml = renderNavbarBlock(globalComponents.navbar);
    }
    if (globalComponents?.footer && !page.hideFooter) {
      footerHtml = renderFooterBlock(globalComponents.footer);
    }
  } catch {
    // Graceful degradation — skip injection on invalid config
  }

  const postMessageScript = buildPostMessageScript(resolvedParentOrigin);

  return `<!DOCTYPE html>
<html lang="en" data-viewport="desktop">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.title || website.name || "Preview")}</title>
  <style>
    ${cssVars}
    ${responsiveCss}
  </style>
</head>
<body>
${navbarHtml}
${bodyContent}
${footerHtml}
${postMessageScript}
</body>
</html>`;
}
