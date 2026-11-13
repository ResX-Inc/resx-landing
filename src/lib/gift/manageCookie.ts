/**
 * Where the manage token is held between the receipt link and the page.
 *
 * It is an HttpOnly cookie rather than a query parameter so the token stays
 * out of the address bar, browser history, referrer headers, analytics and
 * client-side JavaScript. Only the Astro server reads it, and only to pass it
 * to the gift API.
 */
export const GIFT_MANAGE_COOKIE = "gift_manage_token";
