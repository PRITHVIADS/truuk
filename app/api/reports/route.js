import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Click from "@/models/Click";
import Conversion from "@/models/Conversion";
import Campaign from "@/models/Campaign";
import Affiliate from "@/models/Affiliate";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") || "30");
    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
    const role = session.user.role;
    const userId = session.user.id;

    // Build query based on role
    let clickQuery = { createdAt: { $gte: since }, isBot: { $ne: true } };
    let convQuery = { createdAt: { $gte: since } };

    if (role === "advertiser") {
      // Only show campaigns belonging to this advertiser
      const myCampaigns = await Campaign.find({ advertiser: userId }).select("_id").lean();
      const ids = myCampaigns.map(c => c._id);
      clickQuery.campaignId = { $in: ids };
      convQuery.campaignId = { $in: ids };
    } else if (role === "affiliate") {
      // Only show this publisher's own clicks/conversions
      clickQuery.affiliateId = userId;
      convQuery.affiliateId = userId;
    }

    const [clicks, conversions] = await Promise.all([
      Click.find(clickQuery).select("campaignId affiliateId createdAt device country").lean(),
      Conversion.find(convQuery).select("campaignId affiliateId payout saleAmount createdAt status").lean(),
    ]);

    // Build timeline data
    const timelineMap = {};
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      timelineMap[key] = { date: key.slice(5), clicks: 0, conversions: 0, revenue: 0 };
    }
    clicks.forEach(c => {
      const key = c.createdAt.toISOString().split("T")[0];
      if (timelineMap[key]) timelineMap[key].clicks++;
    });
    conversions.forEach(c => {
      const key = c.createdAt.toISOString().split("T")[0];
      if (timelineMap[key]) { timelineMap[key].conversions++; timelineMap[key].revenue += c.payout || 0; }
    });

    // Campaign breakdown — hide publisher info from advertiser, hide advertiser info from publisher
    const campMap = {};
    for (const click of clicks) {
      const cid = click.campaignId?.toString();
      if (!cid) continue;
      if (!campMap[cid]) campMap[cid] = { campaignId: cid, clicks: 0, conversions: 0, revenue: 0 };
      campMap[cid].clicks++;
    }
    for (const conv of conversions) {
      const cid = conv.campaignId?.toString();
      if (!cid) continue;
      if (!campMap[cid]) campMap[cid] = { campaignId: cid, clicks: 0, conversions: 0, revenue: 0 };
      campMap[cid].conversions++;
      campMap[cid].revenue += conv.payout || 0;
    }

    // Populate campaign names
    const campIds = Object.keys(campMap);
    const campaigns = await Campaign.find({ _id: { $in: campIds } })
      .select("_id name shortId objective currency") // NO advertiser details
      .lean();
    campaigns.forEach(c => {
      if (campMap[c._id.toString()]) {
        campMap[c._id.toString()].campaignName = c.name;
        campMap[c._id.toString()].campaignShortId = c.shortId;
      }
    });

    // Publisher breakdown — FOR ADVERTISER ONLY show publisher ID, NOT name
    let publisherBreakdown = [];
    if (role === "advertiser" || role === "admin") {
      const pubMap = {};
      for (const click of clicks) {
        const pid = click.affiliateId?.toString();
        if (!pid) continue;
        if (!pubMap[pid]) pubMap[pid] = { clicks: 0, conversions: 0, revenue: 0 };
        pubMap[pid].clicks++;
      }
      for (const conv of conversions) {
        const pid = conv.affiliateId?.toString();
        if (!pid) continue;
        if (!pubMap[pid]) pubMap[pid] = { clicks: 0, conversions: 0, revenue: 0 };
        pubMap[pid].conversions++;
        pubMap[pid].revenue += conv.payout || 0;
      }

      // Get ONLY publisher IDs — no names or personal info
      const pubIds = Object.keys(pubMap);
      const affiliates = await Affiliate.find({ _id: { $in: pubIds } })
        .select("_id publisherId referralCode") // ONLY ID — no name/email/phone
        .lean();

      publisherBreakdown = affiliates.map(a => ({
        publisherId: a.publisherId || a.referralCode || a._id.toString(), // Show ID only
        ...pubMap[a._id.toString()],
      })).sort((a, b) => b.clicks - a.clicks);
    }

    return NextResponse.json({
      timelineData: Object.values(timelineMap),
      campaignBreakdown: Object.values(campMap).sort((a, b) => b.clicks - a.clicks),
      publisherBreakdown, // Empty for publishers — they don't see this
      totalClicks: clicks.length,
      totalConversions: conversions.length,
      totalRevenue: conversions.reduce((s, c) => s + (c.payout || 0), 0),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
