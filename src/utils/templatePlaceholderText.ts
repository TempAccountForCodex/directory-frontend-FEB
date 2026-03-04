/**
 * Template Placeholder Processing Utility
 *
 * Processes template placeholders in the frontend for preview purposes.
 * The backend also processes these placeholders when creating actual websites.
 */

/**
 * Replaces template placeholders with actual values
 * @param content - Template content object
 * @param createdAt - Optional creation date (defaults to current date)
 * @returns Processed content with placeholders replaced
 */
export function processTemplatePlaceholders(
  content: Record<string, any>,
  createdAt: Date = new Date(),
): Record<string, any> {
  const creationDate = createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const processed: Record<string, any> = {};

  // Recursively process all values in the content object
  Object.keys(content).forEach((key) => {
    const value = content[key];

    if (typeof value === "string") {
      // Replace {{CREATION_DATE}} placeholder
      processed[key] = value.replace(/\{\{CREATION_DATE\}\}/g, creationDate);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      // Recursively process nested objects
      processed[key] = processTemplatePlaceholders(value, createdAt);
    } else if (Array.isArray(value)) {
      // Process arrays
      processed[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? processTemplatePlaceholders(item, createdAt)
          : item,
      );
    } else {
      // Keep other values as-is
      processed[key] = value;
    }
  });

  return processed;
}

/**
 * Checks if content contains any unprocessed placeholders
 * @param content - Content to check
 * @returns True if placeholders are found
 */
export function hasUnprocessedPlaceholders(content: any): boolean {
  if (typeof content === "string") {
    return /\{\{[A-Z_]+\}\}/.test(content);
  }

  if (content && typeof content === "object") {
    return Object.values(content).some((value) =>
      hasUnprocessedPlaceholders(value),
    );
  }

  return false;
}
