import type { CompareResponse } from "./types";

export async function fetchComparison(
  query: string,
  location: string,
): Promise<CompareResponse> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compare-prices`;
  const params = new URLSearchParams({ query, location });
  const headers: Record<string, string> = {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };

  const response = await fetch(`${apiUrl}?${params.toString()}`, { headers });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  const data: CompareResponse = await response.json();
  if (!data || typeof data !== "object") {
    throw new Error("Invalid response from server");
  }

  return data;
}
