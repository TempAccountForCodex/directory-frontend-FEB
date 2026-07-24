/**
 * directoryListingIntent — remembers that a user *wants* to list a website in
 * the directory when they check the opt-in box during the creation wizard.
 *
 * The wizard runs before the site has real content (only template placeholder
 * content exists), so it must NOT set up or validate the listing there. Instead
 * we record the intent and nudge the user to finish setup from the dashboard
 * Listing tab, where `extract` pulls the real content and the backend runs the
 * AI business-eligibility check.
 *
 * This is a device-local flag (localStorage): good enough for a nudge, and it
 * degrades gracefully — if it's absent the user simply sees the normal
 * "Set Up Directory Listing" prompt. Swap to a backend `wantsDirectoryListing`
 * field if the nudge should follow the user across devices.
 */

const keyFor = (websiteId: number | string) =>
  `tt_directory_listing_intent_${websiteId}`;

export function setDirectoryListingIntent(websiteId: number | string): void {
  try {
    localStorage.setItem(keyFor(websiteId), "1");
  } catch {
    // Non-fatal: the nudge is optional.
  }
}

export function hasDirectoryListingIntent(websiteId: number | string): boolean {
  try {
    return localStorage.getItem(keyFor(websiteId)) === "1";
  } catch {
    return false;
  }
}

export function clearDirectoryListingIntent(websiteId: number | string): void {
  try {
    localStorage.removeItem(keyFor(websiteId));
  } catch {
    // Non-fatal.
  }
}
