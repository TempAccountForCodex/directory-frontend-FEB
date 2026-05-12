import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../queryKeys';
import { useAuthMe } from './auth';

/**
 * Store / product / order React Query hooks.
 *
 * Backend routes (see backend/routes/storeRoutes.js + productRoutes.js + orderRoutes.js):
 *   GET    /api/stores                 — list stores (paginated, search)
 *   POST   /api/stores                 — create store
 *   GET    /api/stores/:storeId        — store detail
 *   PUT    /api/stores/:storeId        — update store
 *   GET    /api/products?storeId=&...  — list products for a store
 *   POST   /api/products               — create product
 *   PUT    /api/products/:id           — update product
 *   DELETE /api/products/:id           — deactivate product
 *   GET    /api/orders?storeId=&...    — list orders for a store
 *
 * All list/detail endpoints return the `{ data: ... }` envelope that the
 * existing axios consumers unwrap — each hook preserves that projection so
 * callers can rely on the same shapes they consumed before the migration.
 */

/* --------------------------------------------------------------------- */
/* Types                                                                  */
/* --------------------------------------------------------------------- */

export type Store = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  platformFeePercent: number;
  isPublished: boolean;
  isPublic: boolean;
  createdAt: string;
  deletedAt?: string;
  description?: string;
  [key: string]: unknown;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  isActive: boolean;
  stockStatus: string;
  productType: string;
  description?: string;
  imageUrls?: string[];
  createdAt: string;
  [key: string]: unknown;
};

export type OrderItem = {
  id: string;
  productName: string;
  productSlug: string | null;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  selectedOptions: unknown;
};

export type Order = {
  id: string;
  storeId: string;
  userId: string | null;
  customerEmail: string;
  customerName: string | null;
  status: string;
  totalCents: number;
  currency: string;
  platformFeePercent: number;
  paymentProcessor: string;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  items?: OrderItem[];
  shippingAddress?: unknown;
  billingAddress?: unknown;
};

export type StoreListParams = {
  page?: number;
  limit?: number;
  search?: string;
  deleted?: boolean;
};

export type StoreProductsParams = {
  search?: string;
  isActive?: string;
};

export type StoreOrdersParams = {
  status?: string;
  search?: string;
};

export type CreateStoreVars = {
  websiteId: number;
  name: string;
  slug: string;
  currency?: string;
};

export type UpdateStoreVars = {
  storeId: string;
  payload: {
    name?: string;
    description?: string;
    currency?: string;
    [key: string]: unknown;
  };
};

export type CreateProductVars = {
  storeId: string;
  payload: {
    name: string;
    slug: string;
    priceCents: number;
    description?: string;
    productType?: string;
    stockStatus?: string;
    isActive?: boolean;
    [key: string]: unknown;
  };
};

export type UpdateProductVars = {
  storeId: string;
  productId: string;
  payload: {
    name?: string;
    slug?: string;
    priceCents?: number;
    description?: string;
    productType?: string;
    stockStatus?: string;
    isActive?: boolean;
    [key: string]: unknown;
  };
};

export type DeleteProductVars = {
  storeId: string;
  productId: string;
};

/* --------------------------------------------------------------------- */
/* Helpers                                                                */
/* --------------------------------------------------------------------- */

/**
 * Drop undefined/null/empty-string params so the cache key and request URL
 * stay stable regardless of upstream form state.
 */
function cleanParams<T extends Record<string, unknown>>(input: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    out[key] = value;
  }
  return out;
}

/* --------------------------------------------------------------------- */
/* Queries                                                                */
/* --------------------------------------------------------------------- */

/**
 * `GET /api/stores`. Paginated store list used by the Stores dashboard.
 * Gated on `useAuthMe` so mount-before-login is a no-op. Returns the full
 * `{ data, pagination }` envelope so callers that paginate (like
 * `Stores.tsx` with infinite scroll) can read both fields.
 */
export function useStores(params?: StoreListParams) {
  const { data: user } = useAuthMe();
  const cleaned = cleanParams(params ?? {}) as StoreListParams;

  return useQuery({
    queryKey: queryKeys.stores.list(cleaned),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/stores', { params: cleaned, signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/stores/:storeId`. Full detail for a single store, used by
 * StoreDetail to hydrate its settings form. Returns the unwrapped store
 * object (`response.data.data`).
 */
export function useStore(storeId: string | number | null | undefined) {
  const { data: user } = useAuthMe();

  return useQuery<Store>({
    queryKey: queryKeys.stores.detail(storeId ?? ''),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/stores/${storeId}`, { signal });
      return response.data?.data ?? response.data;
    },
    enabled: !!user && !!storeId,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/products?storeId=...`. Products for a store. The list endpoint
 * is scoped server-side by the `storeId` query param; extra params (search,
 * isActive) refine the results. Returns the unwrapped product array.
 */
export function useStoreProducts(
  storeId: string | number | null | undefined,
  params?: StoreProductsParams
) {
  const { data: user } = useAuthMe();
  const cleaned = cleanParams(params ?? {});

  return useQuery<Product[]>({
    queryKey: [
      ...queryKeys.stores.products(storeId ?? ''),
      cleaned,
    ] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/products', {
        params: { storeId, ...cleaned },
        signal,
      });
      return response.data?.data ?? [];
    },
    enabled: !!user && !!storeId,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/orders?storeId=...`. Orders for a store, filtered by status +
 * search. Kept separate from products so the StoreOrders tab can mount
 * without the products cache and vice-versa.
 */
export function useStoreOrders(
  storeId: string | number | null | undefined,
  params?: StoreOrdersParams
) {
  const { data: user } = useAuthMe();
  const cleaned = cleanParams(params ?? {});

  return useQuery<Order[]>({
    queryKey: [
      ...queryKeys.stores.orders(storeId ?? ''),
      cleaned,
    ] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/orders', {
        params: { storeId, ...cleaned },
        signal,
      });
      return response.data?.data ?? [];
    },
    enabled: !!user && !!storeId,
    staleTime: 30_000,
  });
}

/* --------------------------------------------------------------------- */
/* Mutations                                                              */
/* --------------------------------------------------------------------- */

/**
 * Create a store.
 * `POST /api/stores` — body `{ websiteId, name, slug, currency }`.
 * Invalidates the full `['stores']` subtree so every live list refetches,
 * and the websites list (the `hasStore` flag flips to true on the backend).
 */
export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: CreateStoreVars) => {
      const response = await apiClient.post('/stores', vars);
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.websites.all() });
    },
  });
}

/**
 * Update a store.
 * `PUT /api/stores/:storeId` — body is a partial store payload.
 * On success we seed the detail cache with the fresh server response so the
 * StoreDetail form can keep its "source of truth" pattern, then invalidate
 * list + detail entries for other consumers.
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: UpdateStoreVars) => {
      const response = await apiClient.put(`/stores/${storeId}`, payload);
      return (response.data?.data ?? response.data) as Store;
    },
    onSuccess: (data, vars) => {
      if (data) {
        queryClient.setQueryData(queryKeys.stores.detail(vars.storeId), data);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail(vars.storeId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.list(),
        predicate: (q) => q.queryKey[0] === 'stores' && q.queryKey[1] === 'list',
      });
    },
  });
}

/**
 * Create a product under a store.
 * `POST /api/products` — body includes `storeId` plus product fields.
 * Invalidates every products cache entry for the owning store so list +
 * filtered views refresh.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, payload }: CreateProductVars) => {
      const response = await apiClient.post('/products', { ...payload, storeId });
      return (response.data?.data ?? response.data) as Product;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.products(vars.storeId) });
    },
  });
}

/**
 * Update an existing product.
 * `PUT /api/products/:productId` — body is a partial product payload.
 * Invalidates the owning store's products cache; we pass `storeId` through
 * the vars so the mutation can scope its invalidation without reading
 * response fields.
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, payload, storeId }: UpdateProductVars) => {
      const response = await apiClient.put(`/products/${productId}`, {
        ...payload,
        storeId,
      });
      return (response.data?.data ?? response.data) as Product;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.products(vars.storeId) });
    },
  });
}

/**
 * Soft-delete (deactivate) a product.
 * `DELETE /api/products/:productId`. Invalidates the owning store's
 * products cache so the UI drops or marks the product inactive.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId }: DeleteProductVars) => {
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.products(vars.storeId) });
    },
  });
}
