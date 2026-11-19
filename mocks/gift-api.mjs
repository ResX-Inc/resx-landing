/**
 * Minimal stand-in for the public gift endpoints in `resx-app`, built from
 * docs/gift-backend-integration.md. For local development only — it exists so
 * the gift pages can be exercised without the real API running.
 *
 *   node mocks/gift-api.mjs          # listens on 4999
 *   PORT=5050 node mocks/gift-api.mjs
 *
 * Point the site at it with:
 *   API_BASE_URL=http://localhost:4999 PUBLIC_API_BASE_URL=http://localhost:4999
 */
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 4999);

/** Matches the server's documented defaults, in minor units, pre-tax. */
const CATALOG = process.env.MOCK_CATALOG_JSON
  ? JSON.parse(process.env.MOCK_CATALOG_JSON)
  : {
      currency: "usd",
      taxBehavior: "exclusive",
      options: [
        { durationMonths: 3, unitAmount: 3799 },
        { durationMonths: 6, unitAmount: 6999 },
        { durationMonths: 12, unitAmount: 11999 },
      ],
    };

/** How many polls a session reports `gift: null` before the "webhook" lands. */
const POLLS_BEFORE_GIFT = Number(process.env.MOCK_POLLS_BEFORE_GIFT || 2);
const pollCounts = new Map();

const VALID_MANAGE_TOKEN = process.env.MOCK_MANAGE_TOKEN || "good-token";
let resendCount = 0;
let resent = false;

function send(res, status, body, extraHeaders = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "X-Request-Id": randomUUID(),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type, Idempotency-Key, X-Request-Id",
    "Access-Control-Expose-Headers": "X-Request-Id",
    ...extraHeaders,
  });
  res.end(payload);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return {};
  }
}

const ALLOWED_CHECKOUT_KEYS = new Set([
  "durationMonths",
  "recipient",
  "message",
  "delivery",
  "buyer",
  "cardDesign",
]);
const CARD_DESIGNS = new Set(["holiday", "table", "bow", "city"]);

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  if (req.method === "OPTIONS") return send(res, 204, undefined);

  if (req.method === "GET" && path === "/api/gifts/catalog") {
    return send(res, 200, CATALOG);
  }

  if (req.method === "POST" && path === "/api/gifts/checkout-session") {
    const body = await readBody(req);

    const unknown = Object.keys(body).filter(
      (key) => !ALLOWED_CHECKOUT_KEYS.has(key),
    );
    if (unknown.length > 0) {
      return send(res, 400, {
        statusCode: 400,
        message: unknown.map((k) => `property ${k} should not exist`),
        error: "Bad Request",
      });
    }

    const errors = {};
    if (![3, 6, 12].includes(body.durationMonths)) {
      errors.durationMonths = "Pick a gift length.";
    }
    if (!body.delivery?.sendAt) {
      errors["delivery.sendAt"] = "Choose when the gift should arrive.";
    }
    if (!body.delivery?.timeZone) {
      errors["delivery.timeZone"] = "A time zone is required.";
    }
    if (body.delivery && "sendNow" in body.delivery) {
      return send(res, 400, {
        statusCode: 400,
        message: ["property delivery.sendNow should not exist"],
        error: "Bad Request",
      });
    }
    if (body.cardDesign !== undefined && !CARD_DESIGNS.has(body.cardDesign)) {
      return send(res, 400, {
        statusCode: 400,
        message: [`cardDesign must be one of ${[...CARD_DESIGNS].join(", ")}`],
        error: "Bad Request",
      });
    }
    // An invalid number and a fraud-screened number return the same error.
    if (String(body.recipient?.phone || "").includes("0000")) {
      errors["recipient.phone"] = "Enter a valid mobile number.";
    }
    if (String(body.message || "").length > 300) {
      errors.message = "Keep the message under 300 characters.";
    }
    if (Object.keys(errors).length > 0) {
      return send(res, 400, {
        statusCode: 400,
        code: "gift-checkout-invalid",
        message: "Some gift details need fixing",
        errors,
      });
    }

    const checkoutSessionId = `cs_test_${randomUUID().slice(0, 12)}`;
    return send(res, 201, {
      checkoutSessionId,
      clientSecret: `${checkoutSessionId}_secret_mock`,
    });
  }

  // The buyer's note on the card's back. A scenario word changes it:
  //   nonote   the buyer left no message (both fields empty)
  //   legacy   an API that predates the note (fields left out)
  const noteFor = (scenario, firstName) => {
    if (scenario.includes("legacy")) return {};
    if (scenario.includes("nonote")) return { message: "", buyerName: "" };
    return {
      message: `Happy birthday, ${firstName}! Dinner's on me this year, pick somewhere good.`,
      buyerName: "Sam Okafor",
    };
  };

  const statusMatch = path.match(/^\/api\/gifts\/checkout-session\/(.+)$/);
  if (req.method === "GET" && statusMatch) {
    const id = decodeURIComponent(statusMatch[1]);
    if (!id.startsWith("cs_")) return send(res, 404, { statusCode: 404 });

    // Words in the session id pick the scenario, so the Thanks page can be
    // tried without Stripe: /gift-cards/thanks?session_id=cs_test_now_city
    //   expired | open | stuck        checkout expired, unpaid, never lands
    //   now                           sends immediately (default: tomorrow)
    //   holiday | table | bow | city  the card design (default: holiday)
    //   3m | 6m | 12m                 the gift length (default: 6 months)
    //   nonote | legacy               see noteFor above
    if (id.includes("expired")) {
      return send(res, 200, { status: "expired", gift: null });
    }
    if (id.includes("open")) {
      return send(res, 200, { status: "open", gift: null });
    }

    const seen = (pollCounts.get(id) || 0) + 1;
    pollCounts.set(id, seen);

    if (id.includes("stuck") || seen <= POLLS_BEFORE_GIFT) {
      return send(res, 200, { status: "complete", gift: null });
    }
    const months = Number(id.match(/(3|6|12)m/)?.[1] ?? 6);
    const subtotal =
      CATALOG.options.find((option) => option.durationMonths === months)
        ?.unitAmount ?? 6999;
    const tax = Math.round(subtotal * 0.08875);
    return send(res, 200, {
      status: "complete",
      gift: {
        durationMonths: months,
        recipientName: "Jane Ellis",
        recipientPhoneMasked: "•••• 0142",
        sendAt: id.includes("now")
          ? new Date().toISOString()
          : new Date(Date.now() + 86_400_000).toISOString(),
        timeZone: "America/New_York",
        amountSubtotal: subtotal,
        amountTax: tax,
        amountTotal: subtotal + tax,
        currency: "usd",
        cardDesign:
          [...CARD_DESIGNS].find((design) => id.includes(design)) ?? "holiday",
        ...noteFor(id, "Jane"),
      },
    });
  }

  if (req.method === "GET" && path === "/api/gifts/manage") {
    // Words after the token pick the scenario, e.g. `good-token-scheduled-city`:
    // a status (default sent) and a card design (default holiday).
    const token = url.searchParams.get("token") ?? "";
    if (!token.startsWith(VALID_MANAGE_TOKEN))
      return send(res, 404, { statusCode: 404 });
    const status = resent
      ? "scheduled"
      : (["scheduled", "sent", "claimed", "redeemed", "voided"].find((word) =>
          token.includes(word),
        ) ?? "sent");
    return send(res, 200, {
      status,
      durationMonths: 6,
      recipientName: "Jordan Ellis",
      recipientPhoneMasked: "•••• 0142",
      sendAt:
        status === "scheduled"
          ? new Date(
              Date.now() + (resent ? 60_000 : 2 * 86_400_000),
            ).toISOString()
          : new Date(Date.now() - 3_600_000).toISOString(),
      timeZone: "America/New_York",
      canResend: status === "sent" && resendCount < 3,
      cardDesign:
        [...CARD_DESIGNS].find((design) => token.includes(design)) ?? "holiday",
      ...noteFor(token, "Jordan"),
    });
  }

  if (req.method === "POST" && path === "/api/gifts/manage/resend") {
    const body = await readBody(req);
    if (!String(body.token ?? "").startsWith(VALID_MANAGE_TOKEN)) {
      return send(res, 404, { statusCode: 404 });
    }
    resendCount += 1;
    if (resendCount > 3) return send(res, 429, { statusCode: 429 });
    // A resend puts the gift back to scheduled, due now, as the server does.
    resent = true;
    setTimeout(() => {
      resent = false;
    }, 20_000);
    return send(res, 202, undefined);
  }

  return send(res, 404, { statusCode: 404, message: "Not found" });
}).listen(PORT, () => {
  console.log(`[mock gift api] listening on http://localhost:${PORT}`);
  console.log(`[mock gift api] manage token: ${VALID_MANAGE_TOKEN}`);
});
