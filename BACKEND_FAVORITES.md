# Backend — Favourites Feature

## Overview

Users can favourite listings. The frontend currently persists favourite listing IDs in `localStorage` (key: `tt_favorite_listings`). Once these endpoints are live, swap the hook internals in `src/hooks/useFavorites.ts` to call the API instead.

---

## Data Model

```
Favourite
  id          UUID / auto-increment PK
  userId      FK → users.id   (required, indexed)
  listingId   FK → places.id  (required, indexed)
  createdAt   timestamp

UNIQUE(userId, listingId)   — one favourite per user per listing
```

---

## API Endpoints

### GET /api/favorites
Returns all favourited listings for the authenticated user.

**Auth:** required (httpOnly cookie session)

**Response 200**
```json
{
  "favorites": [
    { "listingId": "abc123", "createdAt": "2026-06-10T10:00:00Z" }
  ]
}
```

---

### POST /api/favorites
Add a listing to the authenticated user's favourites.

**Auth:** required

**Body**
```json
{ "listingId": "abc123" }
```

**Response 201**
```json
{ "message": "Added to favourites", "listingId": "abc123" }
```

**Response 409** — already favourited (idempotent: treat as success on frontend)

---

### DELETE /api/favorites/:listingId
Remove a listing from the authenticated user's favourites.

**Auth:** required

**Response 200**
```json
{ "message": "Removed from favourites" }
```

**Response 404** — not in favourites (treat as success on frontend)

---

## Frontend Integration Steps

Once endpoints are ready, update `src/hooks/useFavorites.ts`:

1. On mount, call `GET /api/favorites` to seed state (replaces `localStorage` read).
2. In `toggleFavorite`, call `POST` or `DELETE` instead of local state mutation.
3. Keep optimistic UI — update state immediately, revert on API error.
4. Gate the heart button: if user is not logged in, redirect to `/auth` on click instead of toggling.

```ts
// Rough shape of the updated hook
const toggleFavorite = async (id, e) => {
  e?.stopPropagation();
  if (!user) { navigate("/auth"); return; }
  const key = String(id);
  const alreadyFav = favorites.includes(key);

  // Optimistic update
  setFavorites(prev => alreadyFav ? prev.filter(f => f !== key) : [...prev, key]);

  try {
    if (alreadyFav) {
      await axios.delete(`/api/favorites/${key}`, { withCredentials: true });
    } else {
      await axios.post("/api/favorites", { listingId: key }, { withCredentials: true });
    }
  } catch {
    // Revert on failure
    setFavorites(prev => alreadyFav ? [...prev, key] : prev.filter(f => f !== key));
  }
};
```

---

## Nice-to-Have (later)

- `GET /api/favorites/count/:listingId` — total favourites count per listing (for social proof on the detail page)
- Favourite counts visible on the listing detail page and dashboard
- Dashboard page `/dashboard/favorites` listing all favourited businesses for the user
