import{NextResponse}from"next/server";
import{getServerSession}from"next-auth";
import{authOptions}from"@/app/api/auth/[...nextauth]/route";
import{connectDB}from"@/lib/mongoose";
import User from"@/models/User";
import Organization from"@/models/Organization";

export async function POST(req){
  try{
    const session=await getServerSession(authOptions);
    if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});
    await connectDB();
    const{organizationId}=await req.json();
    const org=await Organization.findById(organizationId).lean();
    if(!org)return NextResponse.json({error:"Org not found"},{status:404});
    const owner=await User.findById(org.ownerId).lean();
    if(!owner)return NextResponse.json({error:"Owner not found"},{status:404});
    const token=Math.random().toString(36).slice(2)+Date.now().toString(36);
    await User.findByIdAndUpdate(org.ownerId,{
      impersonateToken:token,
      impersonateExpiry:new Date(Date.now()+5*60*1000),
      impersonatedBy:session.user.email,
    });
    return NextResponse.json({success:true,token,name:owner.name});
  }catch(err){
    return NextResponse.json({error:err.message},{status:500});
  }
}
