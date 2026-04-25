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
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const role = session.user.role;
    const userId = session.user.id;

    const since = from ? new Date(from) : new Date(Date.now() - 30*24*60*60*1000);
    const until = to ? new Date(to + "T23:59:59.999Z") : new Date();

    const clickQuery = { createdAt: { $gte: since, $lte: until }, isBot: { $ne: true } };
    const convQuery = { createdAt: { $gte: since, $lte: until } };

    if (role === "advertiser") {
      const mc = await Campaign.find({ advertiser: userId }).select("_id").lean();
      const ids = mc.map(c => c._id);
      clickQuery.campaignId = { $in: ids };
      convQuery.campaignId = { $in: ids };
    } else if (role === "affiliate") {
      const aff = await Affiliate.findOne({ email: session.user.email }).lean();
      clickQuery.affiliateId = aff?._id;
      convQuery.affiliateId = aff?._id;
    }

    const [clicks, conversions] = await Promise.all([
      Click.find(clickQuery).select("createdAt isDuplicate").lean(),
      Conversion.find(convQuery).select("createdAt payout saleAmount status").lean(),
    ]);

    // Build daily map
    const dayMap = {};
    const d = new Date(since);
    while (d <= until) {
      const key = d.toISOString().split("T")[0];
      dayMap[key] = { date: key, clicks: 0, uniqueClicks: 0, conversions: 0, revenue: 0, cr: 0 };
      d.setDate(d.getDate() + 1);
    }

    clicks.forEach(c => {
      const key = c.createdAt.toISOString().split("T")[0];
      if (dayMap[key]) {
        dayMap[key].clicks++;
        if (!c.isDuplicate) dayMap[key].uniqueClicks++;
      }
    });

    conversions.forEach(c => {
      const key = c.createdAt.toISOString().split("T")[0];
      if (dayMap[key]) {
        dayMap[key].conversions++;
        dayMap[key].revenue += c.payout || 0;
      }
    });

    const rows = Object.values(dayMap).map(row => ({
      ...row,
      cr: row.clicks ? ((row.conversions / row.clicks) * 100).toFixed(2) : "0.00",
    })).reverse();

    const totals = {
      clicks: rows.reduce((s, r) => s + r.clicks, 0),
      uniqueClicks: rows.reduce((s, r) => s + r.uniqueClicks, 0),
      conversions: rows.reduce((s, r) => s + r.conversions, 0),
      revenue: rows.reduce((s, r) => s + r.revenue, 0),
    };
    totals.cr = totals.clicks ? ((totals.conversions / totals.clicks) * 100).toFixed(2) : "0.00";

    return NextResponse.json({ rows, totals });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
