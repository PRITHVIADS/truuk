import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(n, currency = "INR") {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("en-IN");
}

export function calcCR(clicks, conversions) {
  if (!clicks) return "0.00";
  return ((conversions / clicks) * 100).toFixed(2);
}

export function generateTrackingLink(campaignId, affiliateId = "{{AFF_ID}}") {
  const domain = process.env.NEXT_PUBLIC_TRACKING_DOMAIN || "https://trk.truuk.io";
  return `${domain}/c?cid=${campaignId}&aid=${affiliateId}&sub1={{SUB1}}&sub2={{SUB2}}`;
}

export function generatePostbackUrl(campaignId) {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base}/api/conversions?cid=${campaignId}&aid={{AFF_ID}}&txid={{TRANSACTION_ID}}&payout={{PAYOUT}}`;
}
