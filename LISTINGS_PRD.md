# Directory Listings Management PRD

## 1. Goal

Build an end-to-end directory listings system where a listing is always tied to a user-created website. Website owners can opt a website into the public directory, manage its listing lifecycle, and allow logged-in or anonymous visitors to discover, favorite, contact, and review published listings.

The listing is never a standalone entity and is never permanently deleted from the website. Removing a listing from the public directory means archiving/unpublishing it while preserving its listing data for future republish.

## 2. Core Product Rules

- A listing can exist only for a website.
- Website creation can include an opt-in checkbox to create/setup a directory listing.
- A website owner can manage only their own listings.
- Admins can manage all listings.
- Non-logged-in users and logged-in users see the same published public listings.
- Owners/admins additionally see management controls on listings they can manage.
- Public visibility depends on the owner plan. If a plan loses listing access, the listing is hidden immediately. If the plan regains access, eligible published listings are shown automatically again.
- Archive and unpublish are effectively the same backend state: the listing is removed from public directory but data is preserved.

## 3. Listing Statuses

- `not listed`: website has no active directory setup.
- `draft`: listing setup has started but is not published.
- `needs completion`: listing is missing required readiness fields or below minimum completeness.
- `published`: listing is visible in public directory.
- `archived`: listing is hidden from public directory but preserved for republish.

## 4. Roles And Permissions

### Anonymous Visitor

- Can view published listings.
- Can view listing detail pages.
- Can favorite listings locally in browser storage.
- Can use contact CTA/form.
- Cannot submit reviews until logging in.

### Logged-In User

- Can view published listings.
- Can favorite listings to backend account.
- Can submit reviews.
- Can optionally make review display name anonymous.
- Can manage their own website listings.
- Cannot edit/archive/publish another user's listing.

### Listing Owner

- Can setup, edit, publish, unpublish/archive, and republish own listings.
- Can reply to reviews on own listings.
- Can see listing readiness/completeness guidance.
- Can see active and archived listing counts in dashboard.

### Admin

- Can perform the same listing management actions as owners, for any listing.

## 5. Listing Setup And Management

### Website Creation

During website creation, the user should be able to check an option to add the website to the directory.

If checked:

- A directory listing setup flow should be initialized for that website.
- The user should be able to complete listing fields before publishing.
- The listing should not appear publicly until it is published and eligible.

### Dashboard Listing Setup

The setup listing area should open the same listing-editing form currently used in the frontend.

Required capabilities:

- Edit listing fields.
- Show readiness/completeness score.
- Show clear missing-field messages.
- Show preview of how the public card will look.
- Publish if completeness is at least 60%.
- Unpublish/archive while preserving data.
- Republish archived listing.
- AI Enhance button placeholder for future AI integration.

### Listing Fields

Existing fields are acceptable and should remain. Add image management:

- Upload a new listing image.
- Or use the current image/logo from the website.

Completeness threshold:

- Minimum publish readiness: `60%`.

## 6. Public Listings Page

The public listings page should show only published, plan-eligible listings.

Card content:

- Current listing card data is acceptable.
- Owner/admin management icons should appear only for manageable listings.
- Management icons should appear on both listing cards and listing detail contexts.

Filters:

- Keep current filters/categories.
- Add `Show only my listings` filter for logged-in users.
- Add `My favorite listings` filter.

Sorting:

- Add alphabetical sorting.

Empty state:

- Keep current "coming soon" style empty state.

Dummy data:

- Dummy fallback may exist only for explicit dev mode.
- Real API failures should not silently masquerade as real data outside intentional development fallback.

## 7. Listing Detail Page

The listing detail page should use real website/listing data, not generic hardcoded filler.

Required content:

- Current listing details layout/data.
- At least 5 reviews displayed when available.
- Contact CTA that opens a modal contact form.
- Similar businesses section.

Similar businesses logic:

- Prefer same-category listings.
- If no other same-category listings exist, show random published listings.

Owner/admin edit behavior:

- Edit button should navigate to the same dashboard listing setup/editing form.
- Saving changes should update listing data immediately.

## 8. Favorites

### Anonymous Favorites

- Anonymous users can favorite listings.
- Favorites are stored in local storage.
- Anonymous users do not get a separate favorites page/tab.

### Logged-In Favorites

- Logged-in users can favorite listings.
- Favorites are stored in the backend.
- Favorites appear in the user's dashboard under a favorite listings tab.

### Login/Logout Behavior

- When anonymous user logs in, backend/dashboard favorites take priority.
- When user logs out, local storage favorites are shown again.

### Archived Listings In Favorites

- If a listing is unpublished/archived, it disappears from other users' favorites tab.
- If the owner republishes it, it automatically reappears in those users' favorites tab.

## 9. Reviews

- Anonymous users cannot submit reviews.
- If anonymous user writes a review and submits, they are sent to login.
- After login, the pending review should automatically submit with the correct user info.
- Logged-in reviewers can choose to display their name anonymously.
- Owners can reply to reviews.
- Ratings should affect listing ranking.

## 10. Dashboard Requirements

Add a main dashboard directory listings area/tab.

It should show:

- User's published listings.
- User's unpublished/archived listings.
- Active listing count.
- Archived listing count.
- Clear readiness status per listing.

Clicking a listing should navigate to the same setup/edit listing area.

## 11. Backend/API Expectations

- Listing ID in public directory responses should be the website ID.
- Public directory endpoints require no auth.
- Management endpoints require authenticated session-cookie auth.
- Backend must enforce ownership/admin permissions.
- Frontend must also hide unauthorized controls.
- Public listing responses must include `ownerId` so frontend can show owner controls.
- Swagger/OpenAPI should document all listing, favorite, and review endpoints.

## 12. Acceptance Test Flow

Test account:

- Email: `beroh33343@lohinja.com`
- Password: `Test12345@`

Required end-to-end test:

1. Create a website with directory listing enabled.
2. Open listing setup form.
3. Fill required listing fields.
4. Confirm readiness reaches at least 60%.
5. Publish listing.
6. Verify listing appears on public listings page.
7. Verify owner sees edit/delete icons.
8. Edit a couple of fields and save.
9. Verify public listings page and detail page update.
10. Favorite listing as logged-in user.
11. Verify it appears in dashboard favorite listings tab.
12. Unpublish/archive listing.
13. Verify it disappears from public listings page.
14. Verify it disappears from other users' favorites views.
15. Republish listing.
16. Verify it reappears publicly and in favorites.
17. Verify dashboard active/archive counters update correctly.

## 13. Known Current Planning Gap

Backend currently appears to have only a technical API contract document:

- `backend/LISTINGS_API_CONTRACT_TEMP.md`

No comprehensive product PRD was found in the backend. This document should become the working product source of truth for listings management and favorite listings behavior.
