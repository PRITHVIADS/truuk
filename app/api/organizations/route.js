import{NextResponse}from"next/server";
import{getServerSession}from"next-auth";
import{authOptions}from"@/app/api/auth/[...nextauth]/route";
import{connectDB}from"@/lib/mongoose";

export async function GET(req){
  try{
    const session=await getServerSession(authOptions);
    if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});
    await connectDB();
    const mongoose=await import("mongoose");
    const{searchParams}=new URL(req.url);
    const status=searchParams.get("status");
    const query=status?{status}:{};
    const Organization=(await import("@/models/Organization")).default;
    const Subscription=(await import("@/models/Subscription")).default;
    const orgs=await Organization.find(query).sort({createdAt:-1}).lean();
    const orgIds=orgs.map(o=>o._id);
    const subs=await Subscription.find({organizationId:{$in:orgIds}}).lean();
    const subMap={};
    subs.forEach(s=>{subMap[s.organizationId.toString()]=s;});
    const result=orgs.map(o=>({...o,subscription:subMap[o._id.toString()]||null}));
    return NextResponse.json({organizations:result});
  }catch(err){
    console.error("ORG API ERROR:",err.message,err.stack);
    return NextResponse.json({error:err.message,stack:err.stack},{status:500});
  }
}

export async function PATCH(req){
  try{
    const session=await getServerSession(authOptions);
    if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});
    await connectDB();
    const Organization=(await import("@/models/Organization")).default;
    const Subscription=(await import("@/models/Subscription")).default;
    const User=(await import("@/models/User")).default;
    const{id,status,plan,notes,suspendReason}=await req.json();
    const org=await Organization.findById(id);
    if(!org)return NextResponse.json({error:"Not found"},{status:404});
    const prevStatus=org.status;
    if(status)org.status=status;
    if(plan)org.plan=plan;
    if(notes!==undefined)org.notes=notes;
    if(suspendReason)org.suspendReason=suspendReason;
    if(status==="Active"&&prevStatus!=="Active")org.approvedAt=new Date();
    if(status==="Suspended")org.suspendedAt=new Date();
    await org.save();
    if(plan){
      const PLANS={trial:{clicks:50000,duration:14},starter:{clicks:1000000,duration:30},growth:{clicks:10000000,duration:30},enterprise:{clicks:999999999,duration:30}};
      const pc=PLANS[plan];
      const endDate=new Date(Date.now()+pc.duration*24*60*60*1000);
      await Subscription.findOneAndUpdate({organizationId:id},{plan,clickLimit:pc.clicks,endDate,status:"active"},{upsert:true});
    }
    if(status==="Active"&&prevStatus!=="Active"){
      await User.findByIdAndUpdate(org.ownerId,{status:"Active"});
    }
    return NextResponse.json({success:true});
  }catch(err){
    console.error("ORG PATCH ERROR:",err.message);
    return NextResponse.json({error:err.message},{status:500});
  }
}
// v5
