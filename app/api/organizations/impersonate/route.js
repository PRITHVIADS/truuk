import{NextResponse}from"next/server";import{getServerSession}from"next-auth";import{authOptions}from"@/app/api/auth/[...nextauth]/route";import{connectDB}from"@/lib/mongoose";import User from"@/models/User";import Organization from"@/models/Organization";import{encode}from"next-auth/jwt";
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
    const token=await encode({
      token:{id:owner._id.toString(),email:owner.email,name:owner.name,role:owner.role,status:"Active",isSuperAdmin:false,organizationId:org._id.toString(),impersonatedBy:session.user.email,impersonatedByRole:"superadmin"},
      secret:process.env.NEXTAUTH_SECRET
    });
    const response=NextResponse.json({success:true});
    // Set both cookie names to cover all environments
    const cookieOpts={httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:3600};
    response.cookies.set("__Secure-next-auth.session-token",token,cookieOpts);
    response.cookies.set("next-auth.session-token",token,{...cookieOpts,secure:false});
    return response;
  }catch(err){return NextResponse.json({error:err.message},{status:500});}
}
