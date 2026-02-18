import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Subscription } from "@shared/schema";

// Helper to get the correct backend URL for Capacitor apps
function getBackendUrl(path: string): string {
  const isNative = window.location.protocol === 'capacitor:';
  if (isNative) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5001';
    return `${backendUrl}${path}`;
  }
  return path;
}

export function useSubscriptions() {
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
    queryFn: async () => {
      console.log('📦 useSubscriptions: Fetching subscriptions...');
      const isNative = window.location.protocol === 'capacitor:';
      const backendSessionId = isNative ? localStorage.getItem('backend_session_id') : null;

      // Use /list endpoint with POST for native apps, regular GET for web
      const endpoint = isNative && backendSessionId ? "/api/subscriptions/list" : "/api/subscriptions";
      const targetUrl = getBackendUrl(endpoint);
      const method = isNative && backendSessionId ? 'POST' : 'GET';

      console.log('📦 useSubscriptions: Request config:', {
        isNative,
        hasSessionId: !!backendSessionId,
        endpoint,
        targetUrl,
        method,
      });

      try {
        const res = await fetch(targetUrl, {
          method,
          credentials: "include",
          headers: backendSessionId && isNative ? {
            'Content-Type': 'application/json',
          } : {},
          body: isNative && backendSessionId ? JSON.stringify({ sessionId: backendSessionId }) : undefined,
        });

        console.log('📦 useSubscriptions: Response status:', res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ useSubscriptions: Fetch failed:', res.status, errorText);
          return [];
        }

        const data = await res.json();
        console.log('✅ useSubscriptions: Got', data.length, 'subscriptions');
        return data;
      } catch (error) {
        console.error('❌ useSubscriptions: Error fetching:', error);
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Subscription>) => {
      console.log('➕ Creating subscription:', data);
      try {
        const res = await apiRequest("POST", "/api/subscriptions", data);
        const result = await res.json();
        console.log('✅ Subscription created:', result);
        return result;
      } catch (error) {
        console.error('❌ Error creating subscription:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Subscription> & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/subscriptions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
  });

  return {
    subscriptions,
    isLoading,
    createSubscription: createMutation.mutateAsync,
    updateSubscription: updateMutation.mutateAsync,
    deleteSubscription: deleteMutation.mutateAsync,
  };
}

export function useSubscription(id: string | number) {
  return useQuery<Subscription>({
    queryKey: ["/api/subscriptions", String(id)],
    queryFn: async () => {
      const endpoint = `/api/subscriptions/${id}`;
      const targetUrl = getBackendUrl(endpoint);

      console.log('🔍 useSubscription: Fetching subscription', id, '| URL:', targetUrl);

      const res = await fetch(targetUrl, { credentials: "include" });

      console.log('🔍 useSubscription: Response status:', res.status);

      if (!res.ok) {
        console.error('❌ useSubscription: Fetch failed:', res.status);
        throw new Error("Not found");
      }

      const data = await res.json();
      console.log('✅ useSubscription: Got subscription:', data.name);
      return data;
    },
    enabled: !!id,
  });
}
