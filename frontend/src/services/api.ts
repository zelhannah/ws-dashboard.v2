const BASE_URL = "http://127.0.0.1:8000";

// ── In-memory cache ─────────────────────────────────────────────────────────
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 30_000; // 30 detik

function getCacheKey(endpoint: string, options: RequestInit = {}): string {
  return `${options.method || "GET"}:${endpoint}`;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const key = getCacheKey(endpoint, options);
  const now = Date.now();

  // Cache hit — balik langsung, instant
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

  // Simpan cache untuk GET requests
  if (options.method === undefined || options.method === "GET") {
    cache.set(key, { data, expiry: now + CACHE_TTL });
  }

  return data;
}

// Hapus cache untuk method POST (emergency, login dll) ttp jalan fresh
export function clearCache() {
  cache.clear();
}

// ── Dashboard ────────────────────────────────────────────────────────────
export function getDashboardSummary() {
  return apiFetch("/api/dashboard");
}

export function getDashboardOverview() {
  return apiFetch("/api/dashboard/overview");
}

// ── Sensors ──────────────────────────────────────────────────────────────
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

// ── Alerts ───────────────────────────────────────────────────────────────
export function getAlerts() {
  return apiFetch("/api/alerts");
}

// ── Zones / Devices ──────────────────────────────────────────────────────
export function getZones() {
  return apiFetch("/api/zones");
}

export function getDevices() {
  return apiFetch("/api/devices");
}

// ── Users ────────────────────────────────────────────────────────────────
export function getUsers() {
  return apiFetch("/api/users");
}

// ── Emergency Control ────────────────────────────────────────────────────
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
