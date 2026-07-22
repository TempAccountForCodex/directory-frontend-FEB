/**
 * Insight Normalizer
 * 
 * Normalizes insight data to always have blocks[] and format{}.
 * - If the record has blocks (from backend), pass through untouched
 * - If it only has legacy headings[], derive blocks and compute format
 * - This ensures offline/fallback renders identically to backend
 */

export const slugify = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const generateBlockId = (index) => `blk_${index + 1}`;

/**
 * Derive blocks from legacy headings[]
 * Each heading becomes a section block
 * A heading titled "Conclusion" (case-insensitive) becomes the conclusion block
 */
export const deriveBlocksFromHeadings = (headings) => {
  if (!headings || !Array.isArray(headings) || headings.length === 0) {
    return [];
  }

  return headings.map((heading, index) => {
    const headingText = heading.heading || "";
    const normalizedHeading = headingText.toLowerCase().trim();
    const isConclusion = normalizedHeading === "conclusion";
    const isQuote = normalizedHeading === "quote";
    const isKeyTakeaway = normalizedHeading === "key takeaway";
    const blockType = isConclusion ? "conclusion" : "section";

    // Support both public shape ({ heading, description: [] }) and the dashboard
    // editor shape ({ heading, subsections: [{ subheading, content }] }).
    let paragraphs = [];
    if (Array.isArray(heading.description)) {
      paragraphs = heading.description;
    } else if (Array.isArray(heading.subsections)) {
      paragraphs = heading.subsections.flatMap((sub) => {
        const parts = [];
        if (sub.subheading) parts.push(sub.subheading);
        if (Array.isArray(sub.content)) parts.push(...sub.content);
        else if (typeof sub.content === "string" && sub.content.trim()) {
          parts.push(...sub.content.split("\n").filter((p) => p.trim()));
        }
        return parts;
      });
    }

    if (isQuote) {
      return {
        id: generateBlockId(index),
        type: "quote",
        text: paragraphs[0] || "",
        attribution: heading.attribution || null,
      };
    }

    if (isKeyTakeaway) {
      return {
        id: generateBlockId(index),
        type: "keyTakeaway",
        title: headingText || "Key Takeaway",
        text: paragraphs[0] || "",
      };
    }

    return {
      id: generateBlockId(index),
      type: blockType,
      anchorId: slugify(headingText),
      heading: isConclusion ? headingText || "Conclusion" : headingText,
      paragraphs,
    };
  });
};

/**
 * Derive legacy headings[] from an authored blocks[] array.
 *
 * This is the reverse of deriveBlocksFromHeadings and is used when saving to a
 * backend that has not yet adopted the blocks[] model — the blocks[] payload is
 * still sent (primary), and this derived headings[] payload keeps older backends
 * working so the content round-trips through the normalizer on read.
 *
 * Produces the dashboard/API subsections shape:
 *   { heading, subsections: [{ subheading: '', content: string[] }] }
 */
export const deriveHeadingsFromBlocks = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return [];

  return blocks
    .map((block) => {
      let heading = "";
      let paragraphs = [];

      switch (block.type) {
        case "section":
        case "conclusion":
          heading = block.heading || (block.type === "conclusion" ? "Conclusion" : "");
          paragraphs = Array.isArray(block.paragraphs) ? block.paragraphs : [];
          break;
        case "keyTakeaway":
          heading = block.title || "Key Takeaway";
          paragraphs = block.text ? [block.text] : [];
          break;
        case "quote":
          heading = "";
          paragraphs = [
            block.attribution ? `${block.text} — ${block.attribution}` : block.text,
          ].filter(Boolean);
          break;
        case "code":
          heading = "";
          paragraphs = block.code ? [block.code] : [];
          break;
        default:
          return null;
      }

      const content = paragraphs.filter((p) => p && p.trim());
      if (!heading && content.length === 0) return null;

      return {
        heading,
        subsections: [{ subheading: "", content }],
      };
    })
    .filter(Boolean);
};

/**
 * Compute format (read time, excerpt, tags)
 * Mirrors backend computation for offline/fallback consistency
 */
const computeFormat = (insight) => {
  const textParts = [
    insight.title || "",
    insight.description || "",
    insight.content || "",
  ];

  // Add text from headings if no blocks exist
  if (insight.headings && Array.isArray(insight.headings)) {
    insight.headings.forEach((section) => {
      textParts.push(section.heading || "");
      if (Array.isArray(section.description)) {
        section.description.forEach((p) => textParts.push(p || ""));
      }
    });
  }

  // Add text from blocks if they exist
  if (insight.blocks && Array.isArray(insight.blocks)) {
    insight.blocks.forEach((block) => {
      if (block.heading) textParts.push(block.heading);
      if (block.paragraphs && Array.isArray(block.paragraphs)) {
        block.paragraphs.forEach((p) => textParts.push(p || ""));
      }
      if (block.text) textParts.push(block.text);
      if (block.code) textParts.push(block.code);
    });
  }

  const words = textParts.join(" ").trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(4, Math.round(words / 190));

  // Excerpt: first ~350 chars of description on a word boundary
  const description = insight.description || insight.content || "";
  let excerpt = description;
  if (description.length > 350) {
    const truncated = description.slice(0, 350);
    const lastSpaceIndex = truncated.lastIndexOf(" ");
    excerpt = lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex) + "..." : truncated + "...";
  }

  // Tags: #Category + up to 3 title words > 3 chars
  const safeCategory = (insight.category || "").replace(/\s+/g, "");
  const titleWords = (insight.title || "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3);
  const titleTags = titleWords.map((w) => `#${w}`);
  const tags = [`#${safeCategory}`, ...titleTags].filter((tag) => tag !== "#").slice(0, 4);

  return {
    version: 1,
    readTimeMinutes,
    excerpt,
    tags,
  };
};

/**
 * Main normalizer function
 * Ensures every insight exits with blocks[] + format{}
 */
export const normalizeInsight = (item) => {
  if (!item) return null;

  const normalized = { ...item };

  // If blocks exist (from backend), pass through untouched
  if (item.blocks && Array.isArray(item.blocks) && item.blocks.length > 0) {
    // Ensure format exists
    if (!item.format || typeof item.format !== "object") {
      normalized.format = computeFormat(item);
    } else {
      normalized.format = item.format;
    }
  } else {
    // Derive blocks from legacy headings[]
    normalized.blocks = deriveBlocksFromHeadings(item.headings);
    // Compute format
    normalized.format = computeFormat(item);
  }

  // Ensure basic fields exist
  normalized.id = item.id || item.legacyId;
  normalized.slug = item.slug || item.legacyId || item.id;
  normalized.title = item.title || item.heading || "Untitled Article";
  normalized.category = item.category || "Technology";
  normalized.image = item.image || "";
  normalized.description = item.description || item.content || "";
  normalized.publishedAt = item.publishedAt || item.publishDate || new Date().toISOString();
  normalized.author = item.author || { name: "Techietribe Editorial Team" };

  // Keep legacy headings for backward compatibility
  normalized.headings = item.headings || [];

  return normalized;
};

/**
 * Normalize an array of insights
 */
export const normalizeInsights = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeInsight).filter(Boolean);
};
