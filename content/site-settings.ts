/**
 * Domain is infrastructure config (tied to actual DNS/hosting), not
 * editable content — it stays in code. Everything else (contact info,
 * social links, trust stat) lives in Firestore now; see
 * lib/site-settings-content.ts and the Site Settings admin module.
 */
export const domain = "smtpblast.com";
