import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Click from "@/models/Click";
import Conversion from "@/models/Conversion";
import Campaign from "@/models/Campaign";
import Affiliate from "@/models/Affiliate";
import User from "@/models/User";
import Payout from "@/models/Payout";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const role = session.user.role;
    const userId = session.user.id;
    const today = new Date(); today.setHours(0,0,0,0);

    if (role === "admin") {
      const [totalCampaigns,activeCampaigns,totalPublishers,activePublishers,pendingPublishers,totalAdvertisers,pendingAdvertisers,totalClicks,todayClicks,totalConversions,todayConversions,pendingPayouts,recentConversions,topCampaigns] = await Promise.all([
        Campaign.countDocuments(),Campaign.countDocuments({status:"Active"}),
        Affiliate.countDocuments(),Affiliate.countDocuments({status:"Active"}),Affiliate.countDocuments({status:"Pending"}),
        User.countDocuments({role:"advertiser"}),User.countDocuments({role:"advertiser",status:"Pending"}),
        Click.countDocuments({isBot:{$ne:true}}),Click.countDocuments({createdAt:{$gte:today},isBot:{$ne:true}}),
        Conversion.countDocuments(),Conversion.countDocuments({createdAt:{$gte:today}}),
        Payout.aggregate([{$match:{status:"Pending"}},{$group:{_id:null,total:{$sum:"$amount"}}}]),
        Conversion.find().sort({createdAt:-1}).limit(5).select("campaignId payout status createdAt").populate("campaignId","name").lean(),
        Campaign.find({status:"Active"}).sort({clicks:-1}).limit(5).select("name shortId clicks conversions payout status").lean(),
      ]);
      const timeline=[];
      for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*24*60*60*1000);const s=new Date(d);s.setHours(0,0,0,0);const e=new Date(d);e.setHours(23,59,59,999);const[dc,dconv]=await Promise.all([Click.countDocuments({createdAt:{$gte:s,$lte:e},isBot:{$ne:true}}),Conversion.countDocuments({createdAt:{$gte:s,$lte:e}})]);timeline.push({date:d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"}),clicks:dc,conversions:dconv});}
      const totalRevenue=await Conversion.aggregate([{$group:{_id:null,total:{$sum:"$payout"}}}]);
      return NextResponse.json({role:"admin",stats:{totalCampaigns,activeCampaigns,totalPublishers,activePublishers,pendingPublishers,totalAdvertisers,pendingAdvertisers,totalClicks,todayClicks,totalConversions,todayConversions,totalRevenue:totalRevenue[0]?.total||0,pendingPayouts:pendingPayouts[0]?.total||0},timeline,recentConversions,topCampaigns});
    }

    if (role === "advertiser") {
      const myCampaigns=await Campaign.find({advertiser:userId}).lean();
      const campIds=myCampaigns.map(c=>c._id);
      const[clicks,conversions,todayClicks,todayConversions,recentConversions]=await Promise.all([Click.countDocuments({campaignId:{$in:campIds},isBot:{$ne:true}}),Conversion.countDocuments({campaignId:{$in:campIds}}),Click.countDocuments({campaignId:{$in:campIds},createdAt:{$gte:today},isBot:{$ne:true}}),Conversion.countDocuments({campaignId:{$in:campIds},createdAt:{$gte:today}}),Conversion.find({campaignId:{$in:campIds}}).sort({createdAt:-1}).limit(5).select("campaignId payout status createdAt").populate("campaignId","name").lean()]);
      const revenue=await Conversion.aggregate([{$match:{campaignId:{$in:campIds}}},{$group:{_id:null,total:{$sum:"$payout"}}}]);
      const timeline=[];
      for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*24*60*60*1000);const s=new Date(d);s.setHours(0,0,0,0);const e=new Date(d);e.setHours(23,59,59,999);const[dc,dconv]=await Promise.all([Click.countDocuments({campaignId:{$in:campIds},createdAt:{$gte:s,$lte:e},isBot:{$ne:true}}),Conversion.countDocuments({campaignId:{$in:campIds},createdAt:{$gte:s,$lte:e}})]);timeline.push({date:d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"}),clicks:dc,conversions:dconv});}
      return NextResponse.json({role:"advertiser",stats:{totalCampaigns:myCampaigns.length,activeCampaigns:myCampaigns.filter(c=>c.status==="Active").length,clicks,conversions,todayClicks,todayConversions,totalRevenue:revenue[0]?.total||0},timeline,recentConversions,topCampaigns:myCampaigns.sort((a,b)=>b.clicks-a.clicks).slice(0,5)});
    }

    if (role === "affiliate") {
      const affiliate=await Affiliate.findOne({email:session.user.email}).lean();
      const affId=affiliate?._id;
      const[clicks,conversions,todayClicks,todayConversions,recentConversions,earnings]=await Promise.all([Click.countDocuments({affiliateId:affId,isBot:{$ne:true}}),Conversion.countDocuments({affiliateId:affId}),Click.countDocuments({affiliateId:affId,createdAt:{$gte:today},isBot:{$ne:true}}),Conversion.countDocuments({affiliateId:affId,createdAt:{$gte:today}}),Conversion.find({affiliateId:affId}).sort({createdAt:-1}).limit(5).select("campaignId payout status createdAt").populate("campaignId","name").lean(),Conversion.aggregate([{$match:{affiliateId:affId}},{$group:{_id:null,total:{$sum:"$payout"},pending:{$sum:{$cond:[{$eq:["$status","Pending"]},"$payout",0]}}}}])]);
      const timeline=[];
      for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*24*60*60*1000);const s=new Date(d);s.setHours(0,0,0,0);const e=new Date(d);e.setHours(23,59,59,999);const[dc,dconv]=await Promise.all([Click.countDocuments({affiliateId:affId,createdAt:{$gte:s,$lte:e},isBot:{$ne:true}}),Conversion.countDocuments({affiliateId:affId,createdAt:{$gte:s,$lte:e}})]);timeline.push({date:d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"}),clicks:dc,conversions:dconv});}
      return NextResponse.json({role:"affiliate",stats:{clicks,conversions,todayClicks,todayConversions,totalEarnings:earnings[0]?.total||0,pendingPayout:earnings[0]?.pending||0,publisherId:affiliate?.publisherId||affiliate?.referralCode||"—"},timeline,recentConversions});
    }

    return NextResponse.json({error:"Unknown role"},{status:400});
  } catch(err){return NextResponse.json({error:err.message},{status:500});}
}
