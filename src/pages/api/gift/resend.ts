import type { APIRoute } from "astro";

import { GiftApiError, resendGift } from "@/lib/gift/api";
import { GIFT_MANAGE_COOKIE } from "@/lib/gift/manageCookie";

export const prerender = false;

/**
 * Forwards a resend request using the token held in the HttpOnly cookie.
 *
 * Proxying through the server keeps the token out of the browser entirely —
 * the page never renders it into a hidden field, so it cannot leak through the
 * DOM, analytics or an extension. SameSite=Lax on the cookie means a
 * cross-site POST arrives without it and fails closed.
 */
export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get(GIFT_MANAGE_COOKIE)?.value;

  if (!token) return redirect("/gift-cards/status?resend=expired", 303);

  try {
    await resendGift(token);
    return redirect("/gift-cards/status?resend=ok", 303);
  } catch (error) {
    if (error instanceof GiftApiError) {
      if (error.isConflict) {
        return redirect("/gift-cards/status?resend=conflict", 303);
      }
      if (error.isRateLimited) {
        return redirect("/gift-cards/status?resend=limited", 303);
      }
      if (error.isNotFound) {
        return redirect("/gift-cards/status?resend=expired", 303);
      }
      console.error(
        `[gift] resend failed (X-Request-Id: ${error.requestId ?? "none"}):`,
        error.message,
      );
    } else {
      console.error("[gift] resend failed:", error);
    }
    return redirect("/gift-cards/status?resend=error", 303);
  }
};
