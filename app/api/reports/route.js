import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Click from "@/models/Click";
import Conversion from "@/models/Conversion";
import Campaign from "@/models/Campaign";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30";
    const daysAgo = new Date(); daysAgo.setDate(daysAgo.getDate() - parseInt(range));
    const dateFormat = "%Y-%m-%d";

    // Filter by role
    let campaignIds = null;
    if (session.user.role === "advertiser") {
      const myCampaigns = await Campaign.find({ createdBy: session.user.id }).select("_id");
      campaignIds = myCampaigns.map(c => c._id);
    }

    const matchClicks = { createdAt:{ $gte:daysAgo }, isBot:false };
    const matchConv = { createdAt:{ $gte:daysAgo } };
    if (campaignIds) { matchClicks.campaignId = { $in:campaignIds }; matchConv.campaignId = { $in:campaignIds }; }
    if (session.user.role === "affiliate") {
      matchClicks.affiliateId = session.user.id;
      matchConv.affiliateId = session.user.id;
    }

    const [clicksByDate, convsByDate, byCountry, byDevice, byCampaign, byAffiliate] = await Promise.all([
      Click.aggregate([{ $match:matchClicks }, { $group:{ _id:{ $dateToString:{ format:dateFormat, date:"$createdAt" } }, clicks:{ $sum:1 } } }, { $sort:{ _id:1 } }]),
      Conversion.aggregate([{ $match:matchConv }, { $group:{ _id:{ $dateToString:{ format:dateFormat, date:"$createdAt" } }, conversions:{ $sum:1 }, revenue:{ $sum:"$payout" } } }, { $sort:{ _id:1 } }]),
      Click.aggregate([{ $match:matchClicks }, { $group:{ _id:"$country", clicks:{ $sum:1 } } }, { $sort:{ clicks:-1 } }, { $limit:10 }]),
      Click.aggregate([{ $match:matchClicks }, { $group:{ _id:"$device", clicks:{ $sum:1 } } }]),
      Conversion.aggregate([{ $match:matchConv }, { $group:{ _id:"$campaignId", conversions:{ $sum:1 }, revenue:{ $sum:"$payout" } } }, { $lookup:{ from:"campaigns", localField:"_id", foreignField:"_id", as:"campaign" } }, { $sort:{ revenue:-1 } }, { $limit:10 }]),
      Conversion.aggregate([{ $match:matchConv }, { $group:{ _id:"$affiliateId", conversions:{ $sum:1 }, revenue:{ $sum:"$payout" } } }, { $lookup:{ from:"affiliates", localField:"_id", foreignField:"_id", as:"affiliate" } }, { $sort:{ revenue:-1 } }, { $limit:10 }]),
    ]);

    const allDates = [...new Set([...clicksByDate.map(d=>d._id), ...convsByDate.map(d=>d._id)])].sort();
    const timelineData = allDates.map(date => ({
      date, clicks:clicksByDate.find(d=>d._id===date)?.clicks||0, conversions:convsByDate.find(d=>d._id===date)?.conversions||0, revenue:convsByDate.find(d=>d._id===date)?.revenue||0,
    }));

    return NextResponse.json({ timelineData, byCountry, byDevice, byCampaign, byAffiliate });
  } catch (err) {
    return NextResponse.json({ error:err.message }, { status:500 });
  }
}
