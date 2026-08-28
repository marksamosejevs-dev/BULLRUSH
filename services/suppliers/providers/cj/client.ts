// Thin HTTP client for CJ Dropshipping API 2.0, grounded in CJ's own
// developer docs (developers.cjdropshipping.com/en/api/api2/). This
// environment could not fetch those docs live (network policy blocks the
// domain), so endpoint paths/fields here were verified via search-engine
// snippets of the official docs rather than a direct read. If your account
// returns differently-shaped responses, adjust the `map*` functions in
// `./mapping.ts` — the request plumbing here (auth, rate limiting, error
// handling) should not need to change.
//
// Auth: POST /authentication/getAccessToken {apiKey} -> {accessToken, ...}
//       all other requests carry header `CJ-Access-Token: <token>`
// Docs section structure: 1 Auth, 2 Setting, 3 Product, 4 Storage,
//   5 Shopping, 6 Logistic, 7 Dispute, 8 Webhook.

import { SupplierProviderError } from "../../supplierProvider";

const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const PROVIDER_KEY = "CJ";

interface CjEnvelope<T> {
  code?: number;
  result?: boolean;
  message?: string;
  data?: T;
}

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

let cachedToken: CachedToken | null = null;
let lastRequestAt = 0;
const MIN_REQUEST_INTERVAL_MS = 1100; // stay comfortably under CJ's documented per-second limits

export function cjIsConfigured(): boolean {
  return Boolean(process.env.CJ_ACCESS_TOKEN || process.env.CJ_API_KEY);
}

async function throttle() {
  const wait = MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

async function getAccessToken(): Promise<string> {
  if (process.env.CJ_ACCESS_TOKEN) return process.env.CJ_ACCESS_TOKEN;

  const apiKey = process.env.CJ_API_KEY;
  if (!apiKey) {
    throw new SupplierProviderError(PROVIDER_KEY, "Neither CJ_ACCESS_TOKEN nor CJ_API_KEY is set");
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  await throttle();
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
  } catch (err) {
    throw new SupplierProviderError(PROVIDER_KEY, `Network error requesting access token: ${String(err)}`);
  }

  const body = (await safeJson(res)) as CjEnvelope<{
    accessToken: string;
    accessTokenExpiryDate: string;
  }>;

  if (!res.ok || body.result === false || !body.data?.accessToken) {
    throw new SupplierProviderError(
      PROVIDER_KEY,
      `getAccessToken failed (${res.status}): ${body.message ?? res.statusText}`,
    );
  }

  const expiresAt = body.data.accessTokenExpiryDate
    ? new Date(body.data.accessTokenExpiryDate).getTime()
    : Date.now() + 12 * 60 * 60 * 1000; // conservative fallback: 12h

  cachedToken = { token: body.data.accessToken, expiresAt };
  return cachedToken.token;
}

export async function cjRequest<T>(
  path: string,
  init: { method?: "GET" | "POST"; query?: Record<string, string>; body?: unknown } = {},
): Promise<T> {
  const token = await getAccessToken();
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(init.query ?? {})) {
    url.searchParams.set(key, value);
  }

  await throttle();
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: init.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "CJ-Access-Token": token,
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch (err) {
    throw new SupplierProviderError(PROVIDER_KEY, `Network error calling ${path}: ${String(err)}`);
  }

  const body = (await safeJson(res)) as CjEnvelope<T>;

  if (!res.ok || body.result === false) {
    throw new SupplierProviderError(PROVIDER_KEY, `${path} failed (${res.status}): ${body.message ?? res.statusText}`);
  }

  if (body.data === undefined) {
    throw new SupplierProviderError(PROVIDER_KEY, `${path} returned no data field`);
  }

  return body.data;
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}
