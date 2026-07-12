export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.argly.com.ar";

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  return fetch(url, options);
}
