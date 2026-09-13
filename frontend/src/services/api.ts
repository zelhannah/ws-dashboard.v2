const BASE_URL = "http://127.0.0.1:8000";

const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 1_000; // 1 detik — harus lebih pendek dari interval polling tercepat (Dashboard: 2 detik)

function getCacheKey(endpoint: string, options: RequestInit = {}): string {
  return `${options.method || "GET"}:${endpoint}`;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const key = getCacheKey(endpoint, options);
  const now = Date.now();

  if (options.method === undefined || options.method === "GET") {
    const hit = cache.get(key);
    if (hit && now < hit.expiry) {
      return hit.data;
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw data;
  }

  if (options.method === undefined || options.method === "GET") {
    cache.set(key, { data, expiry: now + CACHE_TTL });
  }

  return data;
}

export function clearCache() {
  cache.clear();
}

export function getDashboardSummary() {
  return apiFetch("/api/dashboard");
}

export function getDashboardOverview() {
  return apiFetch("/api/dashboard/overview");
}

export function getOfficeSensors() {
  return apiFetch("/api/sensors/office");
}

export function getWarehouseSensors() {
  return apiFetch("/api/sensors/warehouse");
}

export function getOfficeHistory() {
  return apiFetch("/api/sensors/office/history");
}

export function getWarehouseHistory() {
  return apiFetch("/api/sensors/warehouse/history");
}

export function getAlerts() {
  return apiFetch("/api/alerts");
}

export function getZones() {
  return apiFetch("/api/zones");
}

export function getDevices() {
  return apiFetch("/api/devices");
}

export function getUsers() {
  return apiFetch("/api/users");
}

export async function restoreOfficeMonitoring() {
  const r = await apiFetch("/api/emergency/restore-office", { method: "POST" });
  clearCache();
  return r;
}

export async function restoreWarehouseMonitoring() {
  const r = await apiFetch("/api/emergency/restore-warehouse", { method: "POST" });
  clearCache();
  return r;
}

export async function restoreEntireSystem() {
  const r = await apiFetch("/api/emergency/restore-all", { method: "POST" });
  clearCache();
  return r;
}

export async function silenceAlarm() {
  const r = await apiFetch("/api/emergency/silence-alarm", { method: "POST" });
  clearCache();
  return r;
}
