import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import CampaignApplication from "@/models/CampaignApplication";
import Campaign from "@/models/Campaign";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin","advertiser"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const { status, rejectionReason } = await req.json();
    const app = await CampaignApplication.findByIdAndUpdate(params.id, { status, rejectionReason, reviewedBy: session.user.id, reviewedAt: new Date() }, { new: true });
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (status === "Approved") {
      await Campaign.findByIdAndUpdate(app.campaignId, { $addToSet: { approvedAffiliates: app.affiliateId } });
    } else if (status === "Rejected") {
      await Campaign.findByIdAndUpdate(app.campaignId, { $pull: { approvedAffiliates: app.affiliateId } });
    }
    return NextResponse.json({ application: app });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
