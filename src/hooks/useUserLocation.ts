import { useState, useCallback, useEffect } from "react";

export type LocationState =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error";
export type PermissionStatus = "unknown" | "granted" | "denied";

export interface UserLocation {
  latitude: number | null;
  longitude: number | null;
}

export interface StoredLocation {
  coords: UserLocation;
  timestamp: number;
  permission: PermissionStatus;
}

export interface UseUserLocationReturn {
  state: LocationState;
  location: UserLocation;
  permission: PermissionStatus;
  error: string | null;
  requestLocation: () => void;
  clearLocation: () => void;
}

const LOCATION_STORAGE_KEY = "ttdir:global:userLocation:v1";
const LOCATION_FRESHNESS_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hook for managing user geolocation with persistence
 *
 * Handles browser Geolocation API with proper state management,
 * error handling, and localStorage persistence.
 *
 * Permission and coordinates are persisted and reused if fresh (<24h old).
 */
export const useUserLocation = (): UseUserLocationReturn => {
  // Load persisted location data on init
  const loadPersistedLocation = (): StoredLocation | null => {
    try {
      const stored = window.localStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredLocation;
        // Check if coordinates are fresh
        const age = Date.now() - parsed.timestamp;
        if (age < LOCATION_FRESHNESS_MS && parsed.coords.latitude !== null) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Failed to load persisted location:", error);
    }
    return null;
  };

  const persistedData = loadPersistedLocation();

  const [state, setState] = useState<LocationState>(
    persistedData?.permission === "granted"
      ? "granted"
      : persistedData?.permission === "denied"
        ? "denied"
        : "idle",
  );

  const [location, setLocation] = useState<UserLocation>(
    persistedData?.coords || { latitude: null, longitude: null },
  );

  const [permission, setPermission] = useState<PermissionStatus>(
    persistedData?.permission || "unknown",
  );

  const [error, setError] = useState<string | null>(null);

  // Persist location data to localStorage
  const persistLocation = useCallback((data: StoredLocation) => {
    try {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to persist location:", error);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState("error");
      setError("Geolocation is not supported by your browser");
      return;
    }

    setState("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setState("granted");
        setLocation(coords);
        setPermission("granted");
        setError(null);

        // Persist to localStorage
        persistLocation({
          coords,
          timestamp: Date.now(),
          permission: "granted",
        });
      },
      (err) => {
        setState("denied");
        setLocation({ latitude: null, longitude: null });
        setPermission("denied");

        // Persist denial (so we don't keep asking)
        persistLocation({
          coords: { latitude: null, longitude: null },
          timestamp: Date.now(),
          permission: "denied",
        });

        // Friendly error messages based on error code
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              "Location access denied. You can still search by typing your city manually.",
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError(
              "Location information is unavailable. Please type your city manually.",
            );
            break;
          case err.TIMEOUT:
            setError(
              "Location request timed out. Please type your city manually.",
            );
            break;
          default:
            setError(
              "An unknown error occurred. Please type your city manually.",
            );
            break;
        }
      },
      {
        enableHighAccuracy: false, // Don't need GPS-level accuracy for directory
        timeout: 10000, // 10 second timeout
        maximumAge: 300000, // Cache location for 5 minutes
      },
    );
  }, [persistLocation]);

  const clearLocation = useCallback(() => {
    setState("idle");
    setLocation({ latitude: null, longitude: null });
    setPermission("unknown");
    setError(null);

    // Clear from localStorage
    try {
      window.localStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear location from storage:", error);
    }
  }, []);

  return {
    state,
    location,
    permission,
    error,
    requestLocation,
    clearLocation,
  };
};
