import { QueryClient, QueryFunction } from "@tanstack/react-query";

const HTML_RESPONSE_MESSAGE =
  "Server returned an HTML page instead of JSON. Make sure the API server is running and the request URL is correct.";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function isJsonContentType(contentType: string | null) {
  return !!contentType && contentType.toLowerCase().includes("application/json");
}

function resolveApiUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (API_BASE_URL && API_BASE_URL.trim()) {
    const base = API_BASE_URL.replace(/\/+$/, "");
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${base}${path}`;
  }
  return url;
}

function isLikelyHtml(text: string) {
  const trimmed = text.trimStart().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}

function normalizeSnippet(text: string, maxLength = 200) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  return compact.length > maxLength ? `${compact.slice(0, maxLength)}...` : compact;
}

async function getErrorMessage(res: Response) {
  const contentType = res.headers.get("content-type");
  const text = (await res.text()) || res.statusText;

  if (isJsonContentType(contentType)) {
    try {
      const parsed = JSON.parse(text) as { message?: unknown };
      if (parsed?.message && typeof parsed.message === "string") {
        return parsed.message.trim();
      }
    } catch {
      // Ignore JSON parse failures
    }
  }

  if (isLikelyHtml(text)) {
    return HTML_RESPONSE_MESSAGE;
  }

  const snippet = normalizeSnippet(text);
  return snippet || res.statusText;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const message = await getErrorMessage(res);
    throw new Error(`${res.status}: ${message}`);
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  if (!isJsonContentType(contentType)) {
    const text = await res.text();
    if (isLikelyHtml(text)) {
      throw new Error(HTML_RESPONSE_MESSAGE);
    }
    const snippet = normalizeSnippet(text);
    throw new Error(
      snippet ? `Unexpected response from server: ${snippet}` : "Unexpected empty response from server.",
    );
  }

  return (await res.json()) as T;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };
  
  const res = await fetch(resolveApiUrl(url), {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export async function apiRequestJson<T>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  const res = await apiRequest(method, url, data);
  return await parseJsonResponse<T>(res);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export function getQueryFn<T>({ on401: unauthorizedBehavior }: { on401: UnauthorizedBehavior }): QueryFunction<T | null> {
  return async ({ queryKey }) => {
    const res = await fetch(resolveApiUrl(queryKey.join("/") as string), {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await parseJsonResponse<T>(res);
  };
}

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
