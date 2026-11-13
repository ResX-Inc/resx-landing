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
const CARD_DESIGNS = new Set(["classic", "midnight", "celebration", "minimal"]);

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

  const statusMatch = path.match(/^\/api\/gifts\/checkout-session\/(.+)$/);
  if (req.method === "GET" && statusMatch) {
    const id = decodeURIComponent(statusMatch[1]);
    if (!id.startsWith("cs_")) return send(res, 404, { statusCode: 404 });

    const seen = (pollCounts.get(id) || 0) + 1;
    pollCounts.set(id, seen);

    if (seen <= POLLS_BEFORE_GIFT) {
      return send(res, 200, { status: "complete", gift: null });
    }
    return send(res, 200, {
      status: "complete",
      gift: {
        durationMonths: 6,
        recipientName: "Jordan Ellis",
        recipientPhoneMasked: "•••• 0142",
        sendAt: new Date(Date.now() + 86_400_000).toISOString(),
        timeZone: "America/New_York",
        amountSubtotal: 6999,
        amountTax: 621,
        amountTotal: 7620,
        currency: "usd",
        cardDesign: "classic",
      },
    });
  }

  if (req.method === "GET" && path === "/api/gifts/manage") {
    const token = url.searchParams.get("token");
    if (token !== VALID_MANAGE_TOKEN)
      return send(res, 404, { statusCode: 404 });
    return send(res, 200, {
      status: "sent",
      durationMonths: 6,
      recipientName: "Jordan Ellis",
      recipientPhoneMasked: "•••• 0142",
      sendAt: new Date(Date.now() - 3_600_000).toISOString(),
      timeZone: "America/New_York",
      canResend: resendCount < 3,
    });
  }

  if (req.method === "POST" && path === "/api/gifts/manage/resend") {
    const body = await readBody(req);
    if (body.token !== VALID_MANAGE_TOKEN) {
      return send(res, 404, { statusCode: 404 });
    }
    resendCount += 1;
    if (resendCount > 3) return send(res, 429, { statusCode: 429 });
    return send(res, 202, undefined);
  }

  return send(res, 404, { statusCode: 404, message: "Not found" });
}).listen(PORT, () => {
  console.log(`[mock gift api] listening on http://localhost:${PORT}`);
  console.log(`[mock gift api] manage token: ${VALID_MANAGE_TOKEN}`);
});
