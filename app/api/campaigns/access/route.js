import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import CampaignApplication from "@/models/CampaignApplication";
import Campaign from "@/models/Campaign";
import Affiliate from "@/models/Affiliate";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const query = {};
    if (status) query.status = status;

    // Admin sees all, advertiser sees their campaigns only
    if (session.user.role === "advertiser") {
      const myCampaigns = await Campaign.find({ advertiser: session.user.id }).select("_id").lean();
      query.campaignId = { $in: myCampaigns.map(c => c._id) };
    }

    const apps = await CampaignApplication.find(query)
      .populate("campaignId", "name shortId payout currency")
      .populate("affiliateId", "name email publisherId referralCode")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ applications: apps });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { applicationId, status } = await req.json();
    const app = await CampaignApplication.findByIdAndUpdate(applicationId, { status }, { new: true });
    if (status === "Approved") {
      await Campaign.findByIdAndUpdate(app.campaignId, { $addToSet: { approvedAffiliates: app.affiliateId } });
    } else if (status === "Rejected") {
      await Campaign.findByIdAndUpdate(app.campaignId, { $pull: { approvedAffiliates: app.affiliateId } });
    }
    return NextResponse.json({ success: true, application: app });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
