import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Campaign from "@/models/Campaign";
import CampaignApplication from "@/models/CampaignApplication";

// Affiliate marketplace — shows Public + Approval Required campaigns
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const token = searchParams.get("token"); // for private campaigns

    // Build query — affiliates can see Public and Approval Required
    const query = { status: "Active", visibility: { $in: ["Public", "Approval Required"] } };
    if (category) query.category = category;
    if (type) query.type = type;

    // If token provided, also include matching private campaign
    let privateCampaign = null;
    if (token) privateCampaign = await Campaign.findOne({ privateToken: token, status: "Active" }).lean();

    const campaigns = await Campaign.find(query)
      .populate("createdBy", "name company")
      .sort({ createdAt: -1 }).lean();

    if (privateCampaign) campaigns.unshift(privateCampaign);

    // Get affiliate's applications
    let applications = [];
    if (session.user.role === "affiliate") {
      applications = await CampaignApplication.find({ affiliateId: session.user.id }).lean();
    }

    // Mark each campaign with affiliate's status
    const enriched = campaigns.map(c => {
      const app = applications.find(a => a.campaignId.toString() === c._id.toString());
      return { ...c, applicationStatus: app?.status || null, applicationId: app?._id || null };
    });

    return NextResponse.json({ campaigns: enriched });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
