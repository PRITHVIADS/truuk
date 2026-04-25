import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Campaign from "@/models/Campaign";
import Affiliate from "@/models/Affiliate";
import CampaignApplication from "@/models/CampaignApplication";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const query = { status: "Active", visibility: { $in: ["Public", "Ask for Permission"] } };
    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };

    const campaigns = await Campaign.find(query)
      .select("_id name shortId description objective payout revenue currency geo category trafficChannels visibility clicks conversions createdAt")
      .sort({ clicks: -1 })
      .lean();

    // Get affiliate's existing applications
    const aff = await Affiliate.findOne({ email: session.user.email }).lean();
    let myApplications = [];
    if (aff) {
      const apps = await CampaignApplication.find({ affiliateId: aff._id }).select("campaignId status").lean();
      myApplications = apps.map(a => ({ campaignId: a.campaignId.toString(), status: a.status }));
    }

    return NextResponse.json({ campaigns, myApplications, affiliateId: aff?._id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { campaignId } = await req.json();
    const aff = await Affiliate.findOne({ email: session.user.email }).lean();
    if (!aff) return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    const existing = await CampaignApplication.findOne({ campaignId, affiliateId: aff._id });
    if (existing) return NextResponse.json({ error: "Already applied" }, { status: 400 });

    const status = campaign.visibility === "Public" ? "Approved" : "Pending";
    await CampaignApplication.create({ campaignId, affiliateId: aff._id, status });

    if (status === "Approved") {
      await Campaign.findByIdAndUpdate(campaignId, { $addToSet: { approvedAffiliates: aff._id } });
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
