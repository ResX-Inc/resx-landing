# Web gift cards — integration guide for `resx-landing`

Everything the marketing site needs to build the gift purchase, thanks and manage pages against
this server. The server owns pricing, tax, delivery, fraud screening and the gift lifecycle; the
site owns the form, the Stripe mount and the three pages.

Canonical contract: `apps/api/openapi.json` in `ResX-Inc/resx-app` (generate a typed client from
it rather than hand-writing types). The internal spec is
`docs/domains/promotion/features/web-gift-card-sales/spec.md` §5.1. If this document and
`openapi.json` ever disagree, `openapi.json` wins.

---

## 1. The five endpoints

All public (no account, no auth header), all under `/api/gifts`, all rate limited per IP.

| Method | Path                                             | Purpose                                     |
| ------ | ------------------------------------------------ | ------------------------------------------- |
| `GET`  | `/api/gifts/catalog`                             | Sellable durations and pre-tax prices       |
| `POST` | `/api/gifts/checkout-session`                    | Create the embedded Stripe Checkout Session |
| `GET`  | `/api/gifts/checkout-session/:checkoutSessionId` | Thanks-page status, masked                  |
| `GET`  | `/api/gifts/manage?token=…`                      | Receipt-link gift status                    |
| `POST` | `/api/gifts/manage/resend`                       | Resend the gift text                        |

### 1.1 `GET /api/gifts/catalog`

```ts
{
  currency: string; // ISO 4217, lower-case ('usd')
  taxBehavior: "exclusive"; // tax is added at checkout, not included here
  options: {
    durationMonths: 3 | 6 | 12;
    unitAmount: number;
  }
  []; // minor units (cents)
}
```

**Never hardcode prices or durations.** They are operator-editable settings in the database and
change without a deploy. Today's defaults are 3mo `3799`, 6mo `6999`, 12mo `11999` USD, but read
them at runtime. `unitAmount` is pre-tax: the total the buyer pays is higher and is only known
after Stripe computes tax from their billing address.

### 1.2 `POST /api/gifts/checkout-session`

```ts
// request
{
  durationMonths: 3 | 6 | 12;
  recipient: { name: string; phone: string };   // phone: any form that normalises to E.164
  message: string;                              // may be '' — see the length rule below
  delivery: {
    sendAt: string;                             // ISO-8601 instant, REQUIRED — every gift is scheduled
    timeZone: string;                           // IANA zone, e.g. 'America/New_York'
  };
  buyer: { name: string; email: string };
  cardDesign?: 'holiday' | 'table' | 'bow' | 'city';   // optional; omitted = 'holiday'
}

// 201 response
{ checkoutSessionId: string; clientSecret: string }
```

**`cardDesign` is a fixed enum, and those four ids are the contract.** Since 2026-11-18 they are
the picker's own skin ids (`GIFT_SKINS` in `src/lib/gift/skins.ts`), and `buildCheckoutPayload`
sends the picked id as it is. The server rejects anything else with a 400; adding a skin is one
line on the server plus a release.

**What the design does and does not do.** It is stored on the gift and shown back to the **buyer**
on the thanks page and the emailed receipt, and to staff in admin. **The recipient never sees it**
— they receive a plain SMS with the promo code and an app link, not a rendered card. Please do not
present the picker as "choose what they'll receive"; "choose your card" is accurate.

**The request carries no price.** The server prices the gift from its own settings. A `price`
field would be rejected outright (see "unknown fields" below).

Mount Stripe with `clientSecret`. **As of 2026-11-12 the session uses `ui_mode: 'elements'`**
(changed from `embedded_page` precisely so you can style checkout with the Appearance API —
Embedded Checkout only exposes Dashboard branding settings and could not match the design).

That choice moves work to you. With `elements` you own:

- mounting and styling the Payment Element (Appearance API);
- wallet buttons (Apple Pay / Google Pay);
- 3DS and any `next_action` handling;
- the Address Element that collects the billing address.

The billing address still matters: the session sets `automatic_tax: { enabled: true }`, and Stripe
computes tax from that address, so the buyer must supply it before paying. Card fields stay inside
Stripe's iframes, so the PCI posture is still SAQ-A.

Send an `Idempotency-Key` header, one per checkout attempt: 8–128 characters of
`A-Z a-z 0-9 _ -` (a UUID is ideal). Repeating a request with the same key and the same body
returns the same session instead of creating a second one. Without the header the server falls
back to a 10-minute window keyed on the body digest, which still protects against double-submit
but is coarser. **Generate the key once when the form is first submitted and reuse it across
retries** — a fresh key per retry defeats the purpose.

### 1.3 `GET /api/gifts/checkout-session/:checkoutSessionId`

The thanks page has only the session id from the return URL.

```ts
{
  status: 'open' | 'complete' | 'expired';
  gift: null | {
    durationMonths: 3 | 6 | 12;
    recipientName: string;
    recipientPhoneMasked: string;   // '•••• 4567' — last four only
    sendAt: string;                 // ISO-8601
    timeZone: string;
    amountSubtotal: number; amountTax: number; amountTotal: number; currency: string;
    cardDesign: 'holiday' | 'table' | 'bow' | 'city';
  };
}
```

**`gift` is `null` until the Stripe webhook has created it**, which is normally a second or two
after payment but is not instant and is not guaranteed before the buyer lands. Poll this endpoint
(the 60/min limit is sized for it) and show a "finishing up" state rather than treating `null` as
failure. A session id that is not a web gift returns **404**.

### 1.4 `GET /api/gifts/manage?token=…` and `POST /api/gifts/manage/resend`

The buyer's emailed receipt carries a signed link to your manage page with `?token=`.

```ts
// GET response
{
  status: "scheduled" | "sent" | "claimed" | "redeemed" | "voided";
  durationMonths: 3 | 6 | 12;
  recipientName: string;
  recipientPhoneMasked: string;
  sendAt: string;
  timeZone: string;
  canResend: boolean; // true only while sent, unredeemed and under the resend limit
}

// POST body: { token: string }  → 202 Accepted (the text goes out within five minutes)
```

**Treat the token as an opaque credential.** It is a signed, expiring HMAC (default lifetime 365
days). Do not parse it, do not log it, do not put it in analytics, and do not place it in a URL
path — keep it in the query string or the request body, which is how the server's access log
redacts it. Any bad, expired or unknown token is a flat **404** that reveals nothing; do not try
to distinguish those cases in the UI.

Resend answers **409** when the gift is not `sent` or is already redeemed, and **429** when the
per-gift resend limit (default 3, shared with admin resends) is reached.

---

## 2. Error handling — read this before building the form

The checkout endpoint returns **two different 400 shapes**, and the form has to handle both.

**(a) Business validation**, from the service — the one you map onto form fields:

```ts
{
  statusCode: 400,
  code: 'gift-checkout-invalid',
  message: 'Some gift details need fixing',
  errors: {                      // keyed by request path
    'durationMonths'?: string,
    'recipient.phone'?: string,
    'message'?: string,
    'delivery.timeZone'?: string,
    'delivery.sendAt'?: string,
  }
}
```

Every bad field is reported at once, so show them together rather than one per round trip.

**(b) DTO validation**, from the framework, when a field is the wrong _type_ or is missing, when
`message` exceeds 500 characters, when `buyer.email` is not an email, or when the body contains
**any property the contract does not define**:

```ts
{ statusCode: 400, message: string[], error: 'Bad Request' }
```

Branch on the presence of `code === 'gift-checkout-invalid'`. Shape (b) is a flat array of
sentences with no field keys — treat it as a bug in your payload, not as user-correctable input,
because a correct form should never produce it.

Two message-length rules exist and they differ: the DTO rejects anything over **500** characters
outright (shape b), while the operator-configured cap (**300** by default, readable only as
server behaviour) produces a friendly `errors.message` (shape a). Enforce 300 client-side and let
the server be the authority.

**Other statuses:** `429` on any route when the IP is over its limit; `409` on resend; `404` on an
unknown session id or a bad manage token.

### The one deliberate ambiguity

An invalid mobile number and a number blocked by the SMS-pumping fraud screen return **exactly the
same** `recipient.phone` error. This is intentional — do not try to surface the difference, and do
not retry a rejected number automatically.

---

## 3. Wiring and environment

**CORS.** The site's origin must be listed in the server's `API_CORS_ORIGINS`. The API allows
request headers `X-Request-Id`, `Content-Type` and `Idempotency-Key`, exposes `X-Request-Id`, and
runs with **`credentials: false`** — so do not send cookies or set `credentials: 'include'`.
Adding a new origin (preview deployments included) requires a server env change and redeploy, so
get preview/staging origins registered early.

**Capture `X-Request-Id`** from every response and log it on your side. It is the single id that
ties a buyer's failed checkout to the server logs, and support will ask for it.

**Stripe.** You need your own publishable key for Stripe.js. It must belong to the **same Stripe
account** as the server's secret key, and the same mode (test vs live) — a mismatch fails at mount
time with a confusing client secret error.

**URLs the server holds, not you.** These are server env vars and must match your real routes:

| Server var                 | Default                                                                  | What it is                                                           |
| -------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `GIFT_CHECKOUT_RETURN_URL` | `https://www.resx.co/gift-cards/thanks?session_id={CHECKOUT_SESSION_ID}` | Where Stripe returns the buyer. Must contain `{CHECKOUT_SESSION_ID}` |
| `GIFT_MANAGE_PAGE_URL`     | `https://www.resx.co/gift-cards/status`                                  | Your manage page; the receipt appends `?token=`                      |

If your routes differ from those defaults, say so now — they are set per environment on the
server side, and a mismatch means buyers land on a 404 after paying.

**Rate limits** (per IP, current values):

| Route            | Limit                     |
| ---------------- | ------------------------- |
| catalog          | 120 / min                 |
| checkout-session | 10 / 10 min (env-tunable) |
| checkout status  | 60 / min                  |
| manage           | 30 / min                  |
| resend           | 5 / 10 min                |

The checkout limit is the tight one. Do not create a session on every keystroke or form step —
create it when the buyer is ready to pay.

---

## 4. Behaviour worth knowing

- **Scheduling — `sendAt` is always required (changed 2026-11-12).** There is no "send now" flag
  any more; the field was removed from the contract and sending `sendNow` is now a 400. Default
  your picker to **today's date and the current time** — that reproduces the old send-now
  behaviour, because the due sweep runs every five minutes and picks up anything already due.
  A time up to 5 minutes in the past is accepted as "now", which is what stops a buyer who sat on
  the payment form for two minutes from being rejected. `sendAt` may be up to **12 months** ahead
  (operator-configurable). The `timeZone` is the buyer's chosen IANA zone and is stored for
  display on the receipt, the manage page and admin — send the zone the buyer actually picked,
  not the browser default, if your form lets them choose.
- **Nothing exists until payment completes.** No gift row is written at checkout; the purchase
  travels in Stripe session metadata and the webhook creates the gift. An abandoned checkout
  leaves no trace, which is why the thanks page can briefly see `gift: null`.
- **Purchase limits.** A buyer email over the velocity limit (default 5 per 24h) is refused at
  checkout with **429** before any Stripe session exists. A card over its limit is _not_ refused —
  the purchase succeeds and the gift is quietly held for admin review, so the buyer's receipt and
  manage page will show it as `scheduled` and it simply will not send until released. Your UI
  does not need to model this, but support will ask about it.
- **Refunds** are issued by staff in the Stripe Dashboard, not from your pages. A full refund
  before redemption voids the gift automatically.

---

## 5. Checklist before launch

- [ ] Your production, staging and preview origins are in `API_CORS_ORIGINS`
- [ ] `GIFT_CHECKOUT_RETURN_URL` and `GIFT_MANAGE_PAGE_URL` match your real routes
- [ ] Stripe publishable key is from the same account and mode as the server's secret key
- [ ] `delivery.sendAt` is always sent, defaulted to now; no `sendNow` field anywhere
- [ ] Prices and durations are read from `/api/gifts/catalog`, never hardcoded
- [ ] `cardDesign` sends one of the four enum ids, and the picker copy does not promise the
      recipient will see it
- [ ] Payment Element, wallets, 3DS and the Address Element are wired (`ui_mode: 'elements'`)
- [ ] One `Idempotency-Key` per checkout attempt, reused across retries
- [ ] Both 400 shapes handled; `recipient.phone` errors not second-guessed
- [ ] Thanks page polls and tolerates `gift: null`
- [ ] The manage token is never logged, parsed, or placed in a URL path
- [ ] `X-Request-Id` captured in your logs
