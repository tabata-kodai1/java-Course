const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(BASE_URL + path);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
