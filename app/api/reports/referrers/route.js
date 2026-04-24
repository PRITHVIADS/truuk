import{NextResponse}from"next/server";import{getServerSession}from"next-auth";import{authOptions}from"@/app/api/auth/[...nextauth]/route";import{connectDB}from"@/lib/mongoose";import Click from"@/models/Click";import Conversion from"@/models/Conversion";import Campaign from"@/models/Campaign";import Affiliate from"@/models/Affiliate";
function getDomain(r=""){try{return new URL(r).hostname.replace("www.","").toLowerCase();}catch{return r.replace(/https?:\/\//i,"").split("/")[0]?.replace("www.","").toLowerCase()||"direct";}}
export async function GET(req){
  try{const session=await getServerSession(authOptions);if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});await connectDB();const{searchParams}=new URL(req.url);const range=parseInt(searchParams.get("range")||"30");const role=session.user.role;const userId=session.user.id;const since=new Date(Date.now()-range*24*60*60*1000);const query={createdAt:{$gte:since},isBot:{$ne:true}};
  if(role==="advertiser"){const mc=await Campaign.find({advertiser:userId,shareReferrerWithAdvertiser:true}).select("_id").lean();if(mc.length===0)return NextResponse.json({referrers:[],message:"disabled"});query.campaignId={$in:mc.map(c=>c._id)};}
  else if(role==="affiliate"){const aff=await Affiliate.findOne({email:session.user.email}).lean();query.affiliateId=aff?._id;}
  const clicks=await Click.find(query).select("referer campaignId affiliateId createdAt converted _id").lean();
  const convs=await Conversion.find({createdAt:{$gte:since}}).select("campaignId affiliateId payout clickId").lean();
  const dm={};
  for(const c of clicks){const d=c.referer?getDomain(c.referer):"direct";if(!dm[d])dm[d]={domain:d,clicks:0,conversions:0,revenue:0};dm[d].clicks++;}
  for(const v of convs){const c=clicks.find(x=>x._id.toString()===v.clickId?.toString());const d=c?.referer?getDomain(c.referer):"direct";if(!dm[d])dm[d]={domain:d,clicks:0,conversions:0,revenue:0};dm[d].conversions++;dm[d].revenue+=v.payout||0;}
  return NextResponse.json({referrers:Object.values(dm).sort((a,b)=>b.clicks-a.clicks)});}catch(err){return NextResponse.json({error:err.message},{status:500});}}
