import { createContext, useContext, useState, type ReactNode } from "react";
import axios from "axios";

// -------------------- Types --------------------
export interface Place {
  id: string;
  creator: string;
  title: string;
  desc: string;
  address: string;
  slug: string;
  phone: string;
  category: string;
  city: string;
  region: string;
  status: "active" | "pending";
  createdAt: string;
  updatedAt: string;

  // Optional fields
  website?: string | null;
  priceRange?: string | null;
  accountingAndTaxService?: string | null;
  area?: string | null;
  businessLogo?: string | null;
  businessBanner?: string | null;
  image?: string | null;
  images?: string[] | null;
  intro?: string | null;
  aboutUs?: string | null;
  whyUs?: string | null;
  latestProjectIntro?: string | null;
  ourMission?: string | null;
  contactUsIntro?: string | null;
  mapUrl?: string | null;
  featured?: boolean;

  // Related user
  user?: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ListingsContextType {
  listings: Place[];
  loading: boolean;
  error: string | null;

  fetchListings: (
    page?: number,
    limit?: number,
    filters?: Record<string, string>,
  ) => Promise<Pagination | null>;
  fetchListingById: (id: string) => Promise<Place | null>;
  fetchListingBySlug: (slug: string) => Promise<Place | null>;
  createListing: (data: Partial<Place>) => Promise<Place | null>;
  updateListing: (id: string, data: Partial<Place>) => Promise<Place | null>;
  deleteListing: (id: string) => Promise<void>;
}

// -------------------- Context --------------------
const ListingsContext = createContext<ListingsContextType | undefined>(
  undefined,
);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  // -------------------- API Functions --------------------

  const fetchListings = async (
    page: number = 1,
    limit: number = 10,
    filters: Record<string, string> = {},
  ) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/places`, {
        params: { page, limit, ...filters },
      });

      const data = res.data?.data;
      const places = data?.data ?? [];
      const pagination: Pagination = data?.pagination ?? {
        page,
        limit,
        total: 0,
        totalPages: 0,
      };

      setListings(places);
      return pagination;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchListingById = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/places/${id}`);
      return res.data?.data as Place;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchListingBySlug = async (slug: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/places/slug/${slug}`);
      return res.data?.data as Place;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createListing = async (data: Partial<Place>) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/places`, data);
      const place = res.data?.data as Place;
      setListings((prev) => [...prev, place]);
      return place;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateListing = async (id: string, data: Partial<Place>) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/places/${id}`, data);
      const updated = res.data?.data as Place;
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updated } : l)),
      );
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/places/${id}`);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ListingsContext.Provider
      value={{
        listings,
        loading,
        error,
        fetchListings,
        fetchListingById,
        fetchListingBySlug,
        createListing,
        updateListing,
        deleteListing,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
};

// -------------------- Hook --------------------
export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error("useListings must be used within ListingsProvider");
  }
  return context;
};
