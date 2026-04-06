import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserLocation } from "../hooks/useUserLocation";
import { usePersistentState } from "../hooks/usePersistentState";
import DirectoryMap from "../components/Directory/DirectoryMap";
import axios from "axios";
import "./Directory.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const USE_DUMMY_DATA = import.meta.env.VITE_USE_DUMMY_DIRECTORY === "true";

const DUMMY_LISTINGS: DirectoryListing[] = [
  {
    id: 1,
    slug: "stellar-design",
    businessName: "Stellar Design Co.",
    businessCategory: "Design Studio",
    shortDescription: "Branding and web design for early-stage startups.",
    city: "Austin",
    region: "TX",
    country: "USA",
    priceLevel: "$$",
    tags: ["design", "branding", "web"],
    hasStore: true,
    websitePlan: "website_agency",
    score: 95,
    location: { latitude: 30.2672, longitude: -97.7431, isRemoteOnly: false },
    distance: 4.2,
  },
  {
    id: 2,
    slug: "northlight-marketing",
    businessName: "Northlight Marketing",
    businessCategory: "Marketing Agency",
    shortDescription: "Performance marketing and growth strategy.",
    city: "Chicago",
    region: "IL",
    country: "USA",
    priceLevel: "$$$",
    tags: ["marketing", "seo", "ads"],
    hasStore: false,
    websitePlan: "website_pro",
    score: 88,
    location: { latitude: 41.8781, longitude: -87.6298, isRemoteOnly: false },
    distance: 12.7,
  },
  {
    id: 3,
    slug: "cloudline-dev",
    businessName: "Cloudline Dev",
    businessCategory: "Software Studio",
    shortDescription: "Custom software, web apps, and integrations.",
    city: "Toronto",
    region: "ON",
    country: "Canada",
    priceLevel: "$$$",
    tags: ["software", "react", "integrations"],
    hasStore: true,
    websitePlan: "website_agency",
    score: 92,
    location: { latitude: 43.6532, longitude: -79.3832, isRemoteOnly: false },
    distance: 7.5,
  },
  {
    id: 4,
    slug: "brightpath-consulting",
    businessName: "Brightpath Consulting",
    businessCategory: "Business Consulting",
    shortDescription: "Operations and growth advisory for SMBs.",
    city: "London",
    region: "England",
    country: "UK",
    priceLevel: "$$$",
    tags: ["consulting", "operations", "strategy"],
    hasStore: false,
    websitePlan: "website_starter",
    score: 81,
    location: { latitude: 51.5072, longitude: -0.1276, isRemoteOnly: false },
    distance: 18.9,
  },
  {
    id: 5,
    slug: "lumen-remote",
    businessName: "Lumen Remote Studio",
    businessCategory: "UX Research",
    shortDescription: "Remote UX research and product testing.",
    city: null,
    region: null,
    country: "Remote",
    priceLevel: "$$",
    tags: ["ux", "research", "remote"],
    hasStore: false,
    websitePlan: "website_pro",
    score: 86,
    location: { latitude: null, longitude: null, isRemoteOnly: true },
    distance: null,
  },
  {
    id: 6,
    slug: "harbor-legal",
    businessName: "Harbor Legal",
    businessCategory: "Legal Services",
    shortDescription: "Business formation and contracts.",
    city: "Sydney",
    region: "NSW",
    country: "Australia",
    priceLevel: "$$$",
    tags: ["legal", "contracts", "business"],
    hasStore: false,
    websitePlan: "website_starter",
    score: 79,
    location: { latitude: -33.8688, longitude: 151.2093, isRemoteOnly: false },
    distance: 25.4,
  },
];

const DUMMY_META: DirectoryMeta = {
  locations: [
    { country: "USA", city: "Austin", count: 1 },
    { country: "USA", city: "Chicago", count: 1 },
    { country: "Canada", city: "Toronto", count: 1 },
    { country: "UK", city: "London", count: 1 },
    { country: "Australia", city: "Sydney", count: 1 },
  ],
  categories: [
    { category: "Design Studio", count: 1 },
    { category: "Marketing Agency", count: 1 },
    { category: "Software Studio", count: 1 },
    { category: "Business Consulting", count: 1 },
    { category: "UX Research", count: 1 },
    { category: "Legal Services", count: 1 },
  ],
  priceLevels: [
    { priceLevel: "$$", count: 2 },
    { priceLevel: "$$$", count: 4 },
  ],
};

const normalizeValue = (value: string | null | undefined) =>
  (value || "").toLowerCase();

const buildDummyLocationPageData = (
  country?: string,
  city?: string,
  category?: string,
): LocationPageData => {
  const labelParts = [category, city, country].filter(Boolean);
  const label = labelParts.length
    ? labelParts.join(" · ")
    : "Business Directory";
  const h1 = category
    ? `Top ${category} Businesses${city ? ` in ${city}` : ""}${country ? `, ${country}` : ""}`
    : city || country
      ? `Top Businesses in ${[city, country].filter(Boolean).join(", ")}`
      : "Find the Best Local Businesses";

  return {
    location: { country: country || null, city: city || null },
    category: category || null,
    total: DUMMY_LISTINGS.length,
    topBusinesses: DUMMY_LISTINGS.slice(0, 3),
    meta: {
      title: `${label} | TechieTribe`,
      description: `Explore trusted businesses in ${label}.`,
      h1,
      breadcrumbs: [
        { label: "Home", url: "/" },
        { label: "Directory", url: "/directory" },
      ],
    },
  };
};

interface DirectoryListing {
  id: number;
  slug: string;
  businessName: string;
  businessCategory: string | null;
  shortDescription: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  priceLevel: string | null;
  tags: string[];
  hasStore: boolean;
  websitePlan: string;
  score: number;
  location: {
    latitude: number | null;
    longitude: number | null;
    isRemoteOnly: boolean;
  };
  distance: number | null;
}

interface DirectoryMeta {
  locations: { country: string; city: string; count: number }[];
  categories: { category: string; count: number }[];
  priceLevels: { priceLevel: string; count: number }[];
}

interface LocationPageData {
  location: { country: string | null; city: string | null };
  category: string | null;
  total: number;
  topBusinesses: DirectoryListing[];
  meta: {
    title: string;
    description: string;
    h1: string;
    breadcrumbs: { label: string; url: string }[];
  };
}

interface DirectoryFilters {
  country: string;
  city: string;
  category: string;
  priceLevel: string;
  hasStore: boolean;
  searchQuery: string;
  tags: string;
  sortBy: "best" | "distance";
}

const defaultFilters: DirectoryFilters = {
  country: "",
  city: "",
  category: "",
  priceLevel: "",
  hasStore: false,
  searchQuery: "",
  tags: "",
  sortBy: "best",
};

const Directory: React.FC = () => {
  const { country, city, category } = useParams<{
    country?: string;
    city?: string;
    category?: string;
  }>();
  const navigate = useNavigate();

  // User location handling
  const {
    state: locationState,
    location: userLocation,
    error: locationError,
    requestLocation,
    clearLocation,
  } = useUserLocation();

  // State
  const [listings, setListings] = useState<DirectoryListing[]>([]);
  const [meta, setMeta] = useState<DirectoryMeta | null>(null);
  const [locationPageData, setLocationPageData] =
    useState<LocationPageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Persistent filters - survive page reloads
  const [filters, setFilters] = usePersistentState<DirectoryFilters>(
    "directory:filters:v1",
    defaultFilters,
    { scope: "global", syncAcrossTabs: true },
  );

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // Fetch directory metadata on mount
  useEffect(() => {
    const fetchMeta = async () => {
      if (USE_DUMMY_DATA) {
        setMeta(DUMMY_META);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/directory/meta`);
        setMeta(response.data);
      } catch (err) {
        console.error("Error fetching directory metadata:", err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch location page data if on location/category page
  useEffect(() => {
    if (!country && !city && !category) {
      setLocationPageData(null);
      return;
    }

    const fetchLocationPageData = async () => {
      try {
        if (USE_DUMMY_DATA) {
          const dummyData = buildDummyLocationPageData(country, city, category);
          setLocationPageData(dummyData);
          document.title = dummyData.meta.title;
          return;
        }
        const params = new URLSearchParams();
        if (country) params.append("country", country);
        if (city) params.append("city", city);
        if (category) params.append("category", category);

        const response = await axios.get(
          `${API_BASE_URL}/api/directory/location-page-data?${params.toString()}`,
        );
        setLocationPageData(response.data);

        // Update document title based on SEO meta
        document.title = response.data.meta.title;
      } catch (err) {
        console.error("Error fetching location page data:", err);
      }
    };

    fetchLocationPageData();
  }, [country, city, category]);

  // Fetch listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_DUMMY_DATA) {
        const effectiveCountry = country || filters.country;
        const effectiveCity = city || filters.city;
        const effectiveCategory = category || filters.category;

        let results = [...DUMMY_LISTINGS];

        if (effectiveCountry) {
          results = results.filter(
            (listing) =>
              normalizeValue(listing.country) ===
              normalizeValue(effectiveCountry),
          );
        }

        if (effectiveCity) {
          results = results.filter(
            (listing) =>
              normalizeValue(listing.city) === normalizeValue(effectiveCity),
          );
        }

        if (effectiveCategory) {
          results = results.filter(
            (listing) =>
              normalizeValue(listing.businessCategory) ===
              normalizeValue(effectiveCategory),
          );
        }

        if (filters.priceLevel) {
          results = results.filter(
            (listing) =>
              normalizeValue(listing.priceLevel) ===
              normalizeValue(filters.priceLevel),
          );
        }

        if (filters.hasStore) {
          results = results.filter((listing) => listing.hasStore);
        }

        if (debouncedSearch) {
          const query = debouncedSearch.toLowerCase();
          results = results.filter((listing) => {
            const haystack = [
              listing.businessName,
              listing.shortDescription,
              listing.businessCategory,
              listing.city,
              listing.country,
              listing.region,
            ]
              .map(normalizeValue)
              .join(" ");
            const tagMatch = listing.tags.some((tag) =>
              tag.toLowerCase().includes(query),
            );
            return haystack.includes(query) || tagMatch;
          });
        }

        if (filters.tags) {
          const requiredTags = filters.tags
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean);
          if (requiredTags.length > 0) {
            results = results.filter((listing) =>
              requiredTags.every((tag) =>
                listing.tags.some(
                  (listingTag) => listingTag.toLowerCase() === tag,
                ),
              ),
            );
          }
        }

        if (filters.sortBy === "distance") {
          results.sort(
            (a, b) =>
              (a.distance ?? Number.MAX_VALUE) -
              (b.distance ?? Number.MAX_VALUE),
          );
        } else {
          results.sort((a, b) => b.score - a.score);
        }

        const startIndex = (page - 1) * pageSize;
        const pagedResults = results.slice(startIndex, startIndex + pageSize);

        setListings(pagedResults);
        setTotal(results.length);
        return;
      }

      const params = new URLSearchParams();

      // Location filters (from URL params or persistent filters)
      if (country || filters.country)
        params.append("country", country || filters.country);
      if (city || filters.city) params.append("city", city || filters.city);

      // Category filter (from URL params or persistent filters)
      if (category || filters.category)
        params.append("category", category || filters.category);

      // Other filters
      if (filters.priceLevel) params.append("priceLevel", filters.priceLevel);
      if (filters.hasStore) params.append("hasStore", "true");
      if (debouncedSearch) params.append("q", debouncedSearch);
      if (filters.tags) params.append("tags", filters.tags);

      // User location for distance-based sorting
      if (userLocation.latitude && userLocation.longitude) {
        params.append("userLat", userLocation.latitude.toString());
        params.append("userLng", userLocation.longitude.toString());
      }

      // Sorting and pagination
      params.append("sort", filters.sortBy);
      params.append("page", page.toString());
      params.append("pageSize", pageSize.toString());

      const response = await axios.get(
        `${API_BASE_URL}/api/directory/listings?${params.toString()}`,
      );

      setListings(response.data.results);
      setTotal(response.data.total);
    } catch (err: any) {
      console.error("Error fetching listings:", err);
      setError(err.response?.data?.error || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  }, [
    country,
    city,
    category,
    filters,
    debouncedSearch,
    userLocation,
    page,
    pageSize,
  ]);

  // Fetch listings whenever dependencies change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle geolocation request
  const handleRequestLocation = () => {
    requestLocation();
    setFilters((prev) => ({ ...prev, sortBy: "distance" })); // Switch to distance sorting when location is granted
  };

  // Available cities for selected country
  const availableCities = useMemo(() => {
    if (!meta || !filters.country) return [];
    return meta.locations
      .filter((loc) => loc.country === filters.country)
      .map((loc) => loc.city);
  }, [meta, filters.country]);

  // Remote-only businesses (not shown on map)
  const remoteBusinesses = useMemo(() => {
    return listings.filter((listing) => listing.location.isRemoteOnly);
  }, [listings]);

  const mappableBusinesses = useMemo(() => {
    return listings.filter((listing) => !listing.location.isRemoteOnly);
  }, [listings]);

  // Page title and heading
  const pageTitle =
    locationPageData?.meta.h1 || "Find the Best Local Businesses";
  const isLandingPage = !country && !city && !category;

  return (
    <div className="directory-page">
      <div className="directory-container">
        {/* Page Header */}
        <header className="directory-header">
          <h1>{pageTitle}</h1>
          {locationPageData?.meta.description && (
            <p className="directory-description">
              {locationPageData.meta.description}
            </p>
          )}
          {!locationPageData && (
            <p className="directory-description">
              Discover the best businesses and services. Browse local
              businesses, read reviews, and find trusted services near you.
            </p>
          )}
        </header>

        {/* Location Prompt (only on landing page) */}
        {isLandingPage && (
          <section className="location-prompt">
            <h2>Where are you located?</h2>
            <p className="location-help-text">
              We'll use your location only to show nearby businesses. You can
              also type your city manually.
            </p>

            <div className="location-actions">
              <button
                onClick={handleRequestLocation}
                disabled={locationState === "requesting"}
                className="btn btn-primary"
              >
                {locationState === "requesting"
                  ? "Getting location..."
                  : "📍 Use my current location"}
              </button>

              {locationState === "granted" && (
                <div className="location-status success">
                  ✅ Location detected! Showing businesses near you.
                  <button onClick={clearLocation} className="btn-link">
                    Clear
                  </button>
                </div>
              )}

              {locationError && (
                <div className="location-status error">⚠️ {locationError}</div>
              )}
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="directory-filters">
          <h3>Filter Results</h3>

          <div className="filters-grid">
            {/* Search */}
            <div className="filter-group">
              <label htmlFor="search">Search</label>
              <input
                id="search"
                type="text"
                placeholder="Search businesses, services, tags..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchQuery: e.target.value,
                  }))
                }
                className="filter-input"
              />
            </div>

            {/* Country */}
            {!country && (
              <div className="filter-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  value={filters.country}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      country: e.target.value,
                      city: "",
                    })); // Reset city when country changes
                  }}
                  className="filter-select"
                >
                  <option value="">All Countries</option>
                  {meta?.locations
                    .reduce((acc: string[], loc) => {
                      if (!acc.includes(loc.country)) acc.push(loc.country);
                      return acc;
                    }, [])
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* City */}
            {!city && (
              <div className="filter-group">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  value={filters.city}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="filter-select"
                  disabled={!filters.country && !country}
                >
                  <option value="">All Cities</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category */}
            {!category && (
              <div className="filter-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {meta?.categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Level */}
            <div className="filter-group">
              <label htmlFor="priceLevel">Price Range</label>
              <select
                id="priceLevel"
                value={filters.priceLevel}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceLevel: e.target.value,
                  }))
                }
                className="filter-select"
              >
                <option value="">Any Price</option>
                {meta?.priceLevels.map((pl) => (
                  <option key={pl.priceLevel} value={pl.priceLevel}>
                    {pl.priceLevel} ({pl.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Has Store */}
            <div className="filter-group filter-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={filters.hasStore}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      hasStore: e.target.checked,
                    }))
                  }
                />
                <span>Only show businesses with online store</span>
              </label>
            </div>

            {/* Tags */}
            <div className="filter-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                id="tags"
                type="text"
                placeholder="e.g., plumber, emergency, 24/7"
                value={filters.tags}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, tags: e.target.value }))
                }
                className="filter-input"
              />
            </div>

            {/* Sort */}
            <div className="filter-group">
              <label htmlFor="sort">Sort By</label>
              <select
                id="sort"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as "best" | "distance",
                  }))
                }
                className="filter-select"
                disabled={
                  filters.sortBy === "distance" && !userLocation.latitude
                }
              >
                <option value="best">Best Match</option>
                <option value="distance" disabled={!userLocation.latitude}>
                  {userLocation.latitude
                    ? "Nearest to Me"
                    : "Nearest to Me (location needed)"}
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Count */}
        <div className="results-summary">
          <p>
            {loading
              ? "Loading..."
              : `Found ${total} business${total !== 1 ? "es" : ""}`}
            {userLocation.latitude &&
              filters.sortBy === "distance" &&
              " sorted by distance"}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={fetchListings} className="btn btn-secondary">
              Retry
            </button>
          </div>
        )}

        {/* Map */}
        {!loading && mappableBusinesses.length > 0 && (
          <section className="directory-map-section">
            <h3>Map View</h3>
            <DirectoryMap
              listings={mappableBusinesses}
              userLocation={
                userLocation.latitude != null && userLocation.longitude != null
                  ? {
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude,
                    }
                  : null
              }
            />
          </section>
        )}

        {/* Listings */}
        <section className="directory-listings">
          <h3>Listings</h3>

          {loading && (
            <div className="loading-spinner">Loading businesses...</div>
          )}

          {!loading && listings.length === 0 && (
            <div className="empty-state">
              <p>No businesses found matching your filters.</p>
              <p>Try adjusting your search or location filters.</p>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="listings-grid">
              {listings.map((listing) => (
                <div key={listing.id} className="listing-card">
                  <div className="listing-header">
                    <h4>{listing.businessName}</h4>
                    {listing.hasStore && (
                      <span className="badge badge-store">Online Store</span>
                    )}
                    {listing.websitePlan === "website_agency" && (
                      <span className="badge badge-featured">Featured</span>
                    )}
                  </div>

                  {listing.businessCategory && (
                    <div className="listing-category">
                      {listing.businessCategory}
                    </div>
                  )}

                  {listing.shortDescription && (
                    <p className="listing-description">
                      {listing.shortDescription}
                    </p>
                  )}

                  <div className="listing-meta">
                    {listing.location.isRemoteOnly ? (
                      <div className="listing-location">
                        📍 Remote / Online Only
                      </div>
                    ) : (
                      <div className="listing-location">
                        📍 {listing.city}, {listing.country}
                      </div>
                    )}

                    {listing.priceLevel && (
                      <div className="listing-price">{listing.priceLevel}</div>
                    )}

                    {listing.distance !== null && (
                      <div className="listing-distance">
                        📏 {listing.distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>

                  {listing.tags.length > 0 && (
                    <div className="listing-tags">
                      {listing.tags.slice(0, 5).map((tag, idx) => (
                        <span key={idx} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <a
                    href={`/s/${listing.slug}`}
                    className="btn btn-primary btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Website →
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && total > pageSize && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page} of {Math.ceil(total / pageSize)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
                className="btn btn-secondary"
              >
                Next →
              </button>
            </div>
          )}
        </section>

        {/* Remote Businesses (if any) */}
        {remoteBusinesses.length > 0 && (
          <section className="remote-businesses">
            <h3>Remote / Online-Only Businesses</h3>
            <p className="section-description">
              These businesses operate remotely and serve customers online.
            </p>
            <div className="listings-grid">
              {remoteBusinesses.map((listing) => (
                <div
                  key={listing.id}
                  className="listing-card listing-card-remote"
                >
                  <div className="listing-header">
                    <h4>{listing.businessName}</h4>
                    {listing.hasStore && (
                      <span className="badge badge-store">Online Store</span>
                    )}
                    <span className="badge badge-remote">Remote</span>
                  </div>

                  {listing.businessCategory && (
                    <div className="listing-category">
                      {listing.businessCategory}
                    </div>
                  )}

                  {listing.shortDescription && (
                    <p className="listing-description">
                      {listing.shortDescription}
                    </p>
                  )}

                  {listing.tags.length > 0 && (
                    <div className="listing-tags">
                      {listing.tags.slice(0, 5).map((tag, idx) => (
                        <span key={idx} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <a
                    href={`/s/${listing.slug}`}
                    className="btn btn-primary btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Website →
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Directory;
