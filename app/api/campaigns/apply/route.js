import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import CampaignApplication from "@/models/CampaignApplication";
import Campaign from "@/models/Campaign";
import User from "@/models/User";

// Affiliate applies to join a campaign
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "affiliate") return NextResponse.json({ error: "Affiliates only" }, { status: 403 });
    await connectDB();
    const { campaignId, message } = await req.json();

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    // Public campaigns — auto approve
    if (campaign.visibility === "Public") {
      const app = await CampaignApplication.create({ campaignId, affiliateId: session.user.id, status: "Approved", message });
      await Campaign.findByIdAndUpdate(campaignId, { $addToSet: { approvedAffiliates: session.user.id } });
      return NextResponse.json({ application: app, autoApproved: true });
    }

    // Approval Required — create pending application
    const existing = await CampaignApplication.findOne({ campaignId, affiliateId: session.user.id });
    if (existing) return NextResponse.json({ error: "Already applied" }, { status: 400 });

    const app = await CampaignApplication.create({ campaignId, affiliateId: session.user.id, status: "Pending", message });
    return NextResponse.json({ application: app, autoApproved: false });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Get applications — admin/advertiser sees incoming, affiliate sees their own
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");

    let query = {};
    if (session.user.role === "affiliate") {
      query.affiliateId = session.user.id;
    } else if (session.user.role === "advertiser") {
      // get their campaign IDs first
      const campaigns = await Campaign.find({ createdBy: session.user.id }).select("_id");
      query.campaignId = { $in: campaigns.map(c => c._id) };
    }
    if (campaignId) query.campaignId = campaignId;

    const applications = await CampaignApplication.find(query)
      .populate("campaignId", "name type payout visibility")
      .populate("affiliateId", "name email company")
      .sort({ createdAt: -1 }).lean();

    return NextResponse.json({ applications });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
