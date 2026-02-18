import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

// Helper to get the correct backend URL for Capacitor apps
function getBackendUrl(path: string): string {
  const isNative = window.location.protocol === 'capacitor:';
  if (isNative) {
    // Use configured backend URL from environment variable
    // Default to localhost for iOS simulator if not set
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5001';
    return `${backendUrl}${path}`;
  }
  return path;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      console.log('🔍 useAuth: Fetching auth data...');
      try {
        // For Capacitor apps, include sessionId from localStorage
        const backendSessionId = localStorage.getItem('backend_session_id');
        const isNative = window.location.protocol === 'capacitor:';

        const targetUrl = getBackendUrl("/api/auth/me");
        const method = isNative && backendSessionId ? 'POST' : 'GET';

        console.log('🔍 useAuth: Session check -', {
          isNative,
          hasSessionId: !!backendSessionId,
          protocol: window.location.protocol,
          targetUrl,
          method,
        });

        const res = await fetch(targetUrl, {
          method,
          credentials: "include",
          headers: backendSessionId && isNative ? {
            'Content-Type': 'application/json',
          } : {},
          body: isNative && backendSessionId ? JSON.stringify({ sessionId: backendSessionId }) : undefined,
        });

        console.log('🔍 useAuth: Response status:', res.status);

        if (res.status === 401) {
          console.log('❌ useAuth: Unauthorized (401)');
          return null;
        }
        if (!res.ok) {
          console.log('❌ useAuth: Not OK -', res.status, res.statusText);
          return null;
        }

        // Get response text first to debug JSON parsing issues
        const responseText = await res.text();
        console.log('📄 useAuth: Response text:', responseText.substring(0, 200));

        try {
          const userData = JSON.parse(responseText);
          console.log('✅ useAuth: User authenticated:', userData.email);
          return userData;
        } catch (jsonError) {
          console.error('❌ useAuth: JSON parse error:', jsonError);
          console.error('📄 Full response:', responseText);
          return null;
        }
      } catch (error) {
        console.error('❌ useAuth: Error during auth check:', error);
        console.error('❌ Error details:', JSON.stringify(error));
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; displayName?: string; provider?: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PATCH", "/api/auth/me", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
  };
}
