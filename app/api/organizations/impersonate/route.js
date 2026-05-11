import{NextResponse}from"next/server";
import{getServerSession}from"next-auth";
import{authOptions}from"@/app/api/auth/[...nextauth]/route";
import{connectDB}from"@/lib/mongoose";
import User from"@/models/User";
import Organization from"@/models/Organization";
import bcrypt from"bcryptjs";

export async function POST(req){
  try{
    const session=await getServerSession(authOptions);
    if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});
    await connectDB();
    const{organizationId}=await req.json();
    const org=await Organization.findById(organizationId).lean();
    if(!org)return NextResponse.json({error:"Org not found"},{status:404});
    const owner=await User.findById(org.ownerId);
    if(!owner)return NextResponse.json({error:"Owner not found"},{status:404});
    
    // Set a temporary password
    const tempPass="truuk_temp_"+Math.random().toString(36).slice(2,8);
    owner.password=tempPass;
    await owner.save();
    
    // Return credentials for auto-login
    return NextResponse.json({
      success:true,
      email:owner.email,
      password:tempPass,
      name:owner.name,
    });
  }catch(err){
    return NextResponse.json({error:err.message},{status:500});
  }
}
