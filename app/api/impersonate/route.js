import{NextResponse}from"next/server";
import{getServerSession}from"next-auth";
import{authOptions}from"@/app/api/auth/[...nextauth]/route";
import{connectDB}from"@/lib/mongoose";
import User from"@/models/User";
import Affiliate from"@/models/Affiliate";

export async function POST(req){
  try{
    const session=await getServerSession(authOptions);
    if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});
    await connectDB();
    const{userId,affiliateId,type}=await req.json();
    let targetUser=null;

    if(type==="affiliate"&&affiliateId){
      const aff=await Affiliate.findById(affiliateId).lean();
      if(!aff)return NextResponse.json({error:"Publisher not found"},{status:404});
      if(!session.user.isSuperAdmin&&aff.organizationId?.toString()!==session.user.organizationId)
        return NextResponse.json({error:"Unauthorized"},{status:401});
      
      // Find existing user or create one
      targetUser=await User.findOne({email:aff.email});
      if(!targetUser){
        // Create user account for this affiliate
        const tempPass="truuk_temp_"+Math.random().toString(36).slice(2,8);
        targetUser=await User.create({
          name:aff.name,
          email:aff.email,
          password:tempPass,
          role:"affiliate",
          status:"Active",
          organizationId:aff.organizationId,
        });
        const tempPass2="truuk_temp_"+Math.random().toString(36).slice(2,8);
        targetUser.password=tempPass2;
        await targetUser.save();
        return NextResponse.json({success:true,email:targetUser.email,password:tempPass2,name:targetUser.name});
      }
    }else if(type==="user"&&userId){
      targetUser=await User.findById(userId);
      if(!targetUser)return NextResponse.json({error:"User not found"},{status:404});
      if(!session.user.isSuperAdmin&&targetUser?.organizationId?.toString()!==session.user.organizationId)
        return NextResponse.json({error:"Unauthorized"},{status:401});
    }

    if(!targetUser)return NextResponse.json({error:"User not found"},{status:404});
    
    const tempPass="truuk_temp_"+Math.random().toString(36).slice(2,8);
    targetUser.password=tempPass;
    await targetUser.save();
    return NextResponse.json({success:true,email:targetUser.email,password:tempPass,name:targetUser.name});
  }catch(err){
    console.error("Impersonate error:",err.message);
    return NextResponse.json({error:err.message},{status:500});
  }
}
