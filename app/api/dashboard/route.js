import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Campaign from "@/models/Campaign";
import User from "@/models/User";
import Click from "@/models/Click";
import Conversion from "@/models/Conversion";
import Payout from "@/models/Payout";
import CampaignRequest from "@/models/CampaignRequest";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const role = session.user.role;
    const userId = session.user.id;

    if (role === "admin") {
      const [campaigns, users, conversions, pendingPayouts, pendingUsers, pendingRequests] = await Promise.all([
        Campaign.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, clicks: { $sum: "$clicks" }, conversions: { $sum: "$conversions" }, revenue: { $sum: { $multiply: ["$payout","$conversions"] } } } }]),
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
        Conversion.countDocuments(),
        Payout.aggregate([{ $match: { status: "Pending" } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
        User.countDocuments({ status: "Pending" }),
        CampaignRequest.countDocuments({ status: "Pending" }),
      ]);
      const allCampaigns = { clicks:0, conversions:0, revenue:0, active:0, total:0 };
      campaigns.forEach(s => { allCampaigns.clicks+=s.clicks||0; allCampaigns.conversions+=s.conversions||0; allCampaigns.revenue+=s.revenue||0; allCampaigns.total+=s.count; if(s._id==="Active") allCampaigns.active=s.count; });
      const allUsers = { advertisers:0, affiliates:0, total:0 };
      users.forEach(u => { allUsers.total+=u.count; if(u._id==="advertiser") allUsers.advertisers=u.count; if(u._id==="affiliate") allUsers.affiliates=u.count; });
      return NextResponse.json({ role:"admin", campaigns:allCampaigns, users:allUsers, conversions, pendingPayouts:pendingPayouts[0]||{total:0,count:0}, pendingUsers, pendingRequests });
    }

    if (role === "advertiser") {
      const myCampaigns = await Campaign.find({ createdBy: userId }).lean();
      const campIds = myCampaigns.map(c => c._id);
      const [conversions, pendingRequests, recentConversions] = await Promise.all([
        Conversion.aggregate([{ $match: { campaignId: { $in: campIds } } }, { $group: { _id: null, total: { $sum: 1 }, revenue: { $sum: "$payout" } } }]),
        CampaignRequest.countDocuments({ campaignId: { $in: campIds }, status: "Pending" }),
        Conversion.find({ campaignId: { $in: campIds } }).sort({ createdAt: -1 }).limit(10).populate("campaignId","name").lean(),
      ]);
      const totalClicks = myCampaigns.reduce((s,c) => s+(c.clicks||0), 0);
      const totalConv = conversions[0]?.total || 0;
      const totalRev = conversions[0]?.revenue || 0;
      return NextResponse.json({ role:"advertiser", campaigns:{ total:myCampaigns.length, active:myCampaigns.filter(c=>c.status==="Active").length, clicks:totalClicks, conversions:totalConv, revenue:totalRev }, pendingRequests, recentConversions });
    }

    if (role === "affiliate") {
      const myConversions = await Conversion.aggregate([{ $match: { affiliateId: new (await import("mongoose")).default.Types.ObjectId(userId) } }, { $group: { _id: null, total: { $sum: 1 }, earnings: { $sum: "$payout" } } }]);
      const myClicks = await Click.countDocuments({ affiliateId: userId });
      const approvedCampaigns = await Campaign.countDocuments({ approvedAffiliates: userId, status: "Active" });
      const pendingPayout = await Payout.aggregate([{ $match: { affiliateId: new (await import("mongoose")).default.Types.ObjectId(userId), status: "Pending" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
      const pendingRequests = await CampaignRequest.countDocuments({ affiliateId: userId, status: "Pending" });
      return NextResponse.json({ role:"affiliate", clicks:myClicks, conversions:myConversions[0]?.total||0, earnings:myConversions[0]?.earnings||0, approvedCampaigns, pendingPayout:pendingPayout[0]?.total||0, pendingRequests });
    }

    return NextResponse.json({ error: "Unknown role" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
