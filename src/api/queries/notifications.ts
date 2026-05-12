import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../queryKeys';
import { useAuthMe } from './auth';

/**
 * Shape of `GET /api/notifications` — paginated list + unread count.
 * Matches the response read by NotificationPopup prior to this migration:
 * `{ notifications: [...], unreadCount: number }`.
 */
export type NotificationItem = {
  id: number | string;
  type: string;
  title?: string;
  message?: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  [key: string]: unknown;
};

export type NotificationsListResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
};

/**
 * Shape of `GET /api/notifications/preferences` — master toggles + per-type
 * preferences map. Matches the response NotificationPreferences previously
 * read from axios.
 */
export type NotificationPreferencesResponse = {
  emailNotificationsEnabled: boolean;
  marketingEmailsEnabled: boolean;
  preferences: Record<string, { emailEnabled: boolean; inAppEnabled: boolean }>;
};

export type UpdateNotificationPreferencesPayload = {
  emailNotificationsEnabled: boolean;
  marketingEmailsEnabled: boolean;
  preferences: Array<{
    notificationType: string;
    emailEnabled: boolean;
    inAppEnabled: boolean;
  }>;
};

export type NotificationsListParams = {
  page?: number;
  limit?: number;
};

/**
 * React Query hook for `GET /api/notifications`.
 *
 * Replaces the `fetchNotifications` axios call in NotificationPopup. The popup
 * uses this for the "fresh page 1" load that's shown when the bell opens; the
 * component still maintains its own SSE stream + adaptive polling for unread
 * counts and its own append-state for infinite scroll beyond page 1.
 *
 * Gated on `useAuthMe().data` — the query is disabled until the user is
 * loaded, matching the prior component gating.
 *
 * Polling: `refetchInterval: 60_000` preserves a background refresh cadence so
 * the list stays in sync even if the SSE stream drops. `refetchIntervalInBackground:
 * false` avoids burning cycles on hidden tabs.
 */
export function useNotifications(params?: NotificationsListParams) {
  const { data: user } = useAuthMe();

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 6;

  return useQuery<NotificationsListResponse>({
    queryKey: [...queryKeys.notifications.list(), { page, limit }] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/notifications', {
        params: { page, limit },
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

/**
 * Mark a single notification as read.
 *
 * Endpoint: `PATCH /api/notifications/:id/read`.
 *
 * Optimistic update: we flip `isRead: true` and decrement `unreadCount` in the
 * `notifications.list()` cache before the request fires, so the bell badge and
 * the popup row update instantly. On error we roll back with the snapshot, and
 * on settle we invalidate the list key to re-sync with the server.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number | string) => {
      const response = await apiClient.patch(
        `/notifications/${notificationId}/read`,
        {}
      );
      return response.data;
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });

      // Snapshot every list-shaped cache entry (different pages live under
      // `[notifications, list, { page, limit }]`) so a rollback restores each.
      const snapshots = queryClient.getQueriesData<NotificationsListResponse>({
        queryKey: queryKeys.notifications.list(),
      });

      for (const [key, prev] of snapshots) {
        if (!prev) continue;
        const notifications = prev.notifications ?? [];
        let didFlip = false;
        const next = notifications.map((n) => {
          if (n.id === notificationId && !n.isRead) {
            didFlip = true;
            return { ...n, isRead: true };
          }
          return n;
        });
        const unreadCount = didFlip
          ? Math.max(0, (prev.unreadCount ?? 0) - 1)
          : prev.unreadCount ?? 0;
        queryClient.setQueryData<NotificationsListResponse>(key, {
          ...prev,
          notifications: next,
          unreadCount,
        });
      }

      return { snapshots };
    },
    onError: (_err, _id, context) => {
      if (!context?.snapshots) return;
      for (const [key, prev] of context.snapshots) {
        queryClient.setQueryData(key, prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}

/**
 * React Query hook for `GET /api/notifications/preferences`.
 *
 * Replaces the axios call in NotificationPreferences. Preferences change
 * rarely, so `staleTime: 5min` avoids redundant refetches while still picking
 * up server-side changes on window focus or manual invalidation.
 */
export function useNotificationPreferences() {
  const { data: user } = useAuthMe();

  return useQuery<NotificationPreferencesResponse>({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/notifications/preferences', { signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
}

/**
 * Update notification preferences.
 *
 * Endpoint: `PUT /api/notifications/preferences`.
 *
 * On success, we both seed the preferences cache with the server's response
 * (the API echoes back the canonical shape) and invalidate the key so any
 * other consumer refetches cleanly. This matches the prior component behavior
 * where the save response was treated as the new source of truth.
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateNotificationPreferencesPayload) => {
      const response = await apiClient.put('/notifications/preferences', payload);
      return response.data as NotificationPreferencesResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.notifications.preferences(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preferences() });
    },
  });
}
