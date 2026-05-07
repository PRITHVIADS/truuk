import{NextResponse}from"next/server";
import{getServerSession}from"next-auth";
import{authOptions}from"@/app/api/auth/[...nextauth]/route";
import{connectDB}from"@/lib/mongoose";
import User from"@/models/User";
import Organization from"@/models/Organization";
import{encode}from"next-auth/jwt";

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

    const tokenData={
      id:owner._id.toString(),
      email:owner.email,
      name:owner.name,
      role:owner.role,
      company:owner.company,
      status:"Active",
      isSuperAdmin:false,
      organizationId:org._id.toString(),
      impersonatedBy:session.user.email,
      impersonatedByRole:"superadmin",
    };

    const token=await encode({
      token:tokenData,
      secret:process.env.NEXTAUTH_SECRET,
      maxAge:3600,
    });

    const response=NextResponse.json({success:true,name:owner.name});
    
    // Try all possible cookie names
    const cookieConfig={httpOnly:true,sameSite:"lax",path:"/",maxAge:3600};
    response.cookies.set("next-auth.session-token",token,{...cookieConfig,secure:false});
    response.cookies.set("__Secure-next-auth.session-token",token,{...cookieConfig,secure:true});
    response.cookies.set("__Host-next-auth.session-token",token,{...cookieConfig,secure:true});
    
    return response;
  }catch(err){
    console.error("Impersonate error:",err);
    return NextResponse.json({error:err.message},{status:500});
  }
}
// v3
