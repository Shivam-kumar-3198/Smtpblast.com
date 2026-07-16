export interface ProofRow {
  label: string;
  shared: string;
  dedicated: string;
}

/**
 * Structural comparison only — no invented percentages. Section 8 requires
 * a source for every stat; until a measured study exists, this stays
 * qualitative rather than fabricating an inbox-rate delta.
 */
export const proofRows: ProofRow[] = [
  {
    label: "Reputation",
    shared: "Pooled with every other sender on the IP",
    dedicated: "Tied only to your own sending history",
  },
  {
    label: "Throughput",
    shared: "Throttled by provider limits set for the whole pool",
    dedicated: "Rate limits set for your volume alone",
  },
  {
    label: "Blocklist risk",
    shared: "One sender's spam complaints can blocklist the pool",
    dedicated: "Only your own sending behavior affects the IP",
  },
];

export const proofFootnote =
  "Structural differences between shared and dedicated IP infrastructure, not a measured inbox-rate comparison.";
