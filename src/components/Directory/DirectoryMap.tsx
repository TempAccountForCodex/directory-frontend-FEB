import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface DirectoryListing {
  id: number;
  slug: string;
  businessName: string;
  businessCategory: string | null;
  city: string | null;
  country: string | null;
  priceLevel: string | null;
  location: {
    latitude: number | null;
    longitude: number | null;
    isRemoteOnly: boolean;
  };
}

interface DirectoryMapProps {
  listings: DirectoryListing[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerClick?: (listingId: number) => void;
}

/**
 * DirectoryMap Component
 *
 * Renders an interactive map with markers for directory listings using Leaflet + OpenStreetMap.
 * Only shows businesses with valid lat/lng and isRemoteOnly=false.
 */
const DirectoryMap: React.FC<DirectoryMapProps> = ({
  listings,
  userLocation,
  onMarkerClick,
}) => {
  // Filter listings that have valid coordinates and are not remote-only
  const mappableListings = useMemo(() => {
    return listings.filter(
      (listing) =>
        listing.location.latitude !== null &&
        listing.location.longitude !== null &&
        !listing.location.isRemoteOnly,
    );
  }, [listings]);

  // Calculate map center and bounds
  const { center, bounds } = useMemo<{
    center: [number, number];
    bounds: LatLngBoundsExpression | null;
  }>(() => {
    // If user location is provided, center around it
    if (userLocation) {
      return {
        center: [userLocation.latitude, userLocation.longitude],
        bounds: null,
      };
    }

    // If no mappable listings, use default center (Pakistan as default)
    if (mappableListings.length === 0) {
      return {
        center: [30.3753, 69.3451], // Pakistan center
        bounds: null,
      };
    }

    // If one listing, center on it
    if (mappableListings.length === 1) {
      return {
        center: [
          mappableListings[0].location.latitude!,
          mappableListings[0].location.longitude!,
        ],
        bounds: null,
      };
    }

    // Multiple listings: calculate bounds to fit all markers
    const lats = mappableListings.map((l) => l.location.latitude!);
    const lngs = mappableListings.map((l) => l.location.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      center: [(minLat + maxLat) / 2, (minLng + maxLng) / 2],
      bounds: [
        [minLat, minLng],
        [maxLat, maxLng],
      ] as LatLngBoundsExpression,
    };
  }, [mappableListings, userLocation]);

  // Calculate appropriate zoom level
  const zoom = useMemo(() => {
    if (userLocation) return 11; // City-level zoom for user location
    if (mappableListings.length === 0) return 5; // Country-level zoom (default)
    if (mappableListings.length === 1) return 12; // City-level zoom for single listing
    return 10; // Multi-listing default
  }, [mappableListings, userLocation]);

  if (mappableListings.length === 0 && !userLocation) {
    return (
      <div
        className="directory-map-empty"
        style={{
          padding: "2rem",
          textAlign: "center",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: 0, color: "#666" }}>
          No mappable businesses found. Remote/online-only businesses are listed
          below the map.
        </p>
      </div>
    );
  }

  return (
    <div
      className="directory-map"
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        bounds={bounds || undefined}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker (if provided) */}
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>
              <strong>Your Location</strong>
            </Popup>
          </Marker>
        )}

        {/* Business markers */}
        {mappableListings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.location.latitude!, listing.location.longitude!]}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(listing.id);
                }
              },
            }}
          >
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <strong
                  style={{
                    fontSize: "1.1rem",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  {listing.businessName}
                </strong>
                {listing.businessCategory && (
                  <div style={{ color: "#666", marginBottom: "0.25rem" }}>
                    {listing.businessCategory}
                  </div>
                )}
                {listing.city && listing.country && (
                  <div style={{ color: "#666", marginBottom: "0.5rem" }}>
                    {listing.city}, {listing.country}
                  </div>
                )}
                {listing.priceLevel && (
                  <div style={{ color: "#666", marginBottom: "0.5rem" }}>
                    {listing.priceLevel}
                  </div>
                )}
                <a
                  href={`/s/${listing.slug}`}
                  style={{
                    color: "#1976d2",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Website →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DirectoryMap;
