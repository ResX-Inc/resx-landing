/**
 * Client for the public gift endpoints documented in
 * `docs/gift-backend-integration.md`.
 *
 * Request shapes mirror the DTOs in `apps/api/openapi.json` (resx-app).
 * Response shapes are hand-written: that spec documents every success response
 * by name only — `{"description": "GiftCatalogResponse"}` with no `content` —
 * so there is nothing to generate a typed response from. If the response DTOs
 * are ever annotated, replace these with generated types.
 */

export const GIFT_DURATIONS = [3, 6, 12] as const;
export type GiftDurationMonths = (typeof GIFT_DURATIONS)[number];

/**
 * The server's enum. These ids do NOT currently match the four designs in the
 * Figma picker (holiday / table / bow / city), so nothing sends this field yet
 * — it is optional, and omitting it keeps the server's default.
 */
export type GiftCardDesign = "classic" | "midnight" | "celebration" | "minimal";

export interface GiftCatalogOption {
  durationMonths: GiftDurationMonths;
  /** Minor units (cents), pre-tax. */
  unitAmount: number;
}

export interface GiftCatalog {
  /** ISO 4217, lower-case. */
  currency: string;
  taxBehavior: "exclusive";
  options: GiftCatalogOption[];
}

export interface GiftCheckoutStatus {
  status: "open" | "complete" | "expired";
  gift: null | {
    durationMonths: GiftDurationMonths;
    recipientName: string;
    recipientPhoneMasked: string;
    sendAt: string;
    timeZone: string;
    amountSubtotal: number;
    amountTax: number;
    amountTotal: number;
    currency: string;
    cardDesign: GiftCardDesign;
  };
}

export interface GiftManageStatus {
  status: "scheduled" | "sent" | "claimed" | "redeemed" | "voided";
  durationMonths: GiftDurationMonths;
  recipientName: string;
  recipientPhoneMasked: string;
  sendAt: string;
  timeZone: string;
  canResend: boolean;
}

/**
 * Carries the server's `X-Request-Id` so it can be logged — support asks for
 * it, and it is the only id tying a failure here to the server's logs.
 */
export class GiftApiError extends Error {
  readonly status: number;
  readonly requestId: string | null;
  /** Shape (a): business validation, keyed by request path. */
  readonly fieldErrors: Record<string, string> | null;
  /** Shape (b): DTO validation. A correct payload should never produce this. */
  readonly payloadErrors: string[] | null;

  constructor(
    message: string,
    status: number,
    requestId: string | null,
    fieldErrors: Record<string, string> | null = null,
    payloadErrors: string[] | null = null,
  ) {
    super(message);
    this.name = "GiftApiError";
    this.status = status;
    this.requestId = requestId;
    this.fieldErrors = fieldErrors;
    this.payloadErrors = payloadErrors;
  }

  get isNotFound() {
    return this.status === 404;
  }
  get isRateLimited() {
    return this.status === 429;
  }
  get isConflict() {
    return this.status === 409;
  }
}

/**
 * Only `PUBLIC_`-prefixed vars reach the browser bundle, so client callers need
 * PUBLIC_API_BASE_URL; the server falls back to the private API_BASE_URL.
 */
export function giftApiBase(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  return env.PUBLIC_API_BASE_URL || env.API_BASE_URL || "http://localhost:3000";
}

interface GiftFetchOptions {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

async function giftFetch<T>(
  path: string,
  { method = "GET", body, signal, headers = {} }: GiftFetchOptions = {},
): Promise<T> {
  const response = await fetch(`${giftApiBase()}${path}`, {
    method,
    signal,
    // The API runs with `credentials: false`; sending cookies fails CORS.
    credentials: "omit",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const requestId = response.headers.get("X-Request-Id");

  if (!response.ok) {
    let fieldErrors: Record<string, string> | null = null;
    let payloadErrors: string[] | null = null;
    let message = `Gift API ${response.status}`;

    try {
      const problem = (await response.json()) as Record<string, unknown>;
      if (problem.code === "gift-checkout-invalid") {
        fieldErrors = (problem.errors as Record<string, string>) ?? {};
        message = String(problem.message ?? message);
      } else if (Array.isArray(problem.message)) {
        payloadErrors = problem.message as string[];
        message = payloadErrors.join("; ");
      } else if (typeof problem.message === "string") {
        message = problem.message;
      }
    } catch {
      // Non-JSON error body; the status is all we have.
    }

    throw new GiftApiError(
      message,
      response.status,
      requestId,
      fieldErrors,
      payloadErrors,
    );
  }

  if (response.status === 202 || response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export interface CreateGiftCheckoutBody {
  durationMonths: GiftDurationMonths;
  recipient: { name: string; phone: string };
  message: string;
  delivery: {
    /** ISO-8601 instant. Always required — there is no "send now" flag. */
    sendAt: string;
    /** IANA zone. */
    timeZone: string;
  };
  buyer: { name: string; email: string };
  /** Omitted until the server enum matches the Figma picker. */
  cardDesign?: GiftCardDesign;
}

export interface CreateGiftCheckoutResult {
  checkoutSessionId: string;
  clientSecret: string;
}

/**
 * The Idempotency-Key must be generated once per checkout attempt and reused
 * across retries — a fresh key per retry defeats the purpose and can create a
 * second session.
 */
export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `gift-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function createGiftCheckoutSession(
  body: CreateGiftCheckoutBody,
  idempotencyKey: string,
  signal?: AbortSignal,
) {
  return giftFetch<CreateGiftCheckoutResult>("/api/gifts/checkout-session", {
    method: "POST",
    body,
    signal,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function fetchGiftCatalog(signal?: AbortSignal) {
  return giftFetch<GiftCatalog>("/api/gifts/catalog", { signal });
}

export function fetchGiftCheckoutStatus(
  checkoutSessionId: string,
  signal?: AbortSignal,
) {
  return giftFetch<GiftCheckoutStatus>(
    `/api/gifts/checkout-session/${encodeURIComponent(checkoutSessionId)}`,
    { signal },
  );
}

/**
 * The manage token is an opaque credential: it stays in the query string (where
 * the server's access log redacts it) and is never logged or parsed here.
 */
export function fetchGiftManageStatus(token: string, signal?: AbortSignal) {
  return giftFetch<GiftManageStatus>(
    `/api/gifts/manage?token=${encodeURIComponent(token)}`,
    { signal },
  );
}

export function resendGift(token: string, signal?: AbortSignal) {
  return giftFetch<void>("/api/gifts/manage/resend", {
    method: "POST",
    body: { token },
    signal,
  });
}
