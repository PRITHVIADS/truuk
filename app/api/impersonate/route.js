import{NextResponse}from"next/server";import{getServerSession}from"next-auth";import{authOptions}from"@/app/api/auth/[...nextauth]/route";import{connectDB}from"@/lib/mongoose";import User from"@/models/User";import Affiliate from"@/models/Affiliate";import{encode}from"next-auth/jwt";
export async function POST(req){
  try{
    const session=await getServerSession(authOptions);if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});
    await connectDB();const{userId,affiliateId,type}=await req.json();
    let targetUser=null,targetEmail=null,targetName=null,targetRole=null,targetOrgId=null;
    if(type==="user"&&userId){
      targetUser=await User.findById(userId).lean();if(!targetUser)return NextResponse.json({error:"User not found"},{status:404});
      if(!session.user.isSuperAdmin&&targetUser.organizationId?.toString()!==session.user.organizationId)return NextResponse.json({error:"Unauthorized"},{status:401});
      targetEmail=targetUser.email;targetName=targetUser.name;targetRole=targetUser.role;targetOrgId=targetUser.organizationId?.toString();
    }else if(type==="affiliate"&&affiliateId){
      const aff=await Affiliate.findById(affiliateId).lean();if(!aff)return NextResponse.json({error:"Publisher not found"},{status:404});
      if(!session.user.isSuperAdmin&&aff.organizationId?.toString()!==session.user.organizationId)return NextResponse.json({error:"Unauthorized"},{status:401});
      targetUser=await User.findOne({email:aff.email}).lean();
      targetEmail=aff.email;targetName=aff.name;targetRole="affiliate";targetOrgId=aff.organizationId?.toString();
    }
    if(!targetEmail)return NextResponse.json({error:"Target not found"},{status:404});
    const token=await encode({token:{id:targetUser?._id?.toString(),email:targetEmail,name:targetName,role:targetRole,status:"Active",isSuperAdmin:false,organizationId:targetOrgId,impersonatedBy:session.user.email,impersonatedByRole:session.user.isSuperAdmin?"superadmin":"admin"},secret:process.env.NEXTAUTH_SECRET});
    const cookieName=process.env.NODE_ENV==="production"?"__Secure-next-auth.session-token":"next-auth.session-token";
    const response=NextResponse.json({success:true,name:targetName,role:targetRole});
    response.cookies.set(cookieName,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60});
    return response;
  }catch(err){return NextResponse.json({error:err.message},{status:500});}
}
