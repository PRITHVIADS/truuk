import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Click from "@/models/Click";
import Campaign from "@/models/Campaign";
import { nanoid } from "nanoid";

// GET /api/clicks?cid=xxx&aid=xxx&sub1=xxx
// This is the tracking endpoint that records every click
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("cid");
    const affiliateId = searchParams.get("aid");
    const sub1 = searchParams.get("sub1");
    const sub2 = searchParams.get("sub2");

    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaign ID" }, { status: 400 });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== "Active") {
      return NextResponse.redirect(new URL("/404", req.url));
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";

    // Simple device detection
    const device = /mobile/i.test(userAgent) ? "mobile" : /tablet|ipad/i.test(userAgent) ? "tablet" : "desktop";
    const isBot = /bot|crawl|spider|slurp|mediapartners/i.test(userAgent);

    // Duplicate click check (same IP + campaign in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingClick = await Click.findOne({ campaignId, ip, createdAt: { $gte: oneDayAgo } });

    const clickId = nanoid(16);
    const click = await Click.create({
      campaignId,
      affiliateId: affiliateId || undefined,
      clickId,
      ip,
      userAgent,
      device,
      referer,
      sub1: sub1 || "",
      sub2: sub2 || "",
      isBot,
      isDuplicate: !!existingClick,
    });

    if (!isBot && !existingClick) {
      await Campaign.findByIdAndUpdate(campaignId, { $inc: { clicks: 1 } });
    }

    // Redirect to landing page with click ID
    const landingUrl = campaign.landingUrl || "/";
    const redirect = `${landingUrl}${landingUrl.includes("?") ? "&" : "?"}clickid=${clickId}`;
    return NextResponse.redirect(redirect);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
