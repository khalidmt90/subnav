import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

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

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isNative = window.location.protocol === 'capacitor:';
  const backendSessionId = isNative ? localStorage.getItem('backend_session_id') : null;

  // For native apps, include sessionId in the request body
  const requestBody = data || {};
  if (isNative && backendSessionId) {
    (requestBody as any).sessionId = backendSessionId;
  }

  const res = await fetch(getBackendUrl(url), {
    method,
    headers: (data || (isNative && backendSessionId)) ? { "Content-Type": "application/json" } : {},
    body: (data || (isNative && backendSessionId)) ? JSON.stringify(requestBody) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const res = await fetch(getBackendUrl(url), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
