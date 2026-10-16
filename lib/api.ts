const LOCAL_API = "http://127.0.0.1:8000";
const PRODUCTION_API = "https://lilian-backend-production-dd74.up.railway.app";

const FETCH_MS = 8_000;

function usableApi(raw: string | undefined): string | null {
  const value = (raw || "").trim().replace(/\/$/, "");
  if (!value || value.includes("<") || value.includes(">") || value.includes("your-railway-domain")) {
    return null;
  }
  try {
    const url = new URL(value.replace("localhost", "127.0.0.1"));
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function apiBase() {
  const fromEnv = usableApi(process.env.NEXT_PUBLIC_API_URL);
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const onLocalhost = host === "localhost" || host === "127.0.0.1";
  if (host && !onLocalhost) {
    if (fromEnv && !fromEnv.includes("127.0.0.1")) return fromEnv;
    return PRODUCTION_API;
  }
  if (!host && process.env.NODE_ENV === "production") {
    return fromEnv && !fromEnv.includes("127.0.0.1") ? fromEnv : PRODUCTION_API;
  }
  return fromEnv || LOCAL_API;
}

export function apiUrl(path: string) {
  const base = apiBase();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function withTimeout(init?: RequestInit): RequestInit {
  const signal =
    init?.signal ??
    (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
      ? AbortSignal.timeout(FETCH_MS)
      : undefined);
  return { ...init, signal };
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...withTimeout(init),
    headers: { Accept: "application/json", ...(init?.headers || {}) },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...withTimeout({ method: "POST" }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  token: string
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...withTimeout({ method: "PATCH" }),
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
