const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("ae_token");
  
  const isFormData = options.body instanceof FormData;
  
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Safely parse JSON — 204 No Content or empty bodies would crash response.json()
  const contentType = response.headers.get("content-type");
  const hasJson = contentType?.includes("application/json");
  const result = hasJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error((result as any)?.message || "Something went wrong");
  }

  // Handle standardized backend wrapper: { status: "success", message: "...", data: { ... } }
  if (result && typeof result === "object" && (result as any).status === "success") {
    return (result as any).data;
  }

  return result;
}
