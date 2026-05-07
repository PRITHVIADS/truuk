import{NextResponse}from"next/server";
import{connectDB}from"@/lib/mongoose";
import User from"@/models/User";
import{encode}from"next-auth/jwt";

export async function GET(req){
  try{
    await connectDB();
    const{searchParams}=new URL(req.url);
    const token=searchParams.get("token");
    if(!token)return NextResponse.redirect(new URL("/login",req.url));
    const user=await User.findOne({
      impersonateToken:token,
      impersonateExpiry:{$gt:new Date()},
    }).lean();
    if(!user){
      console.error("Token not found or expired:",token);
      return NextResponse.redirect(new URL("/login?error=expired",req.url));
    }
    await User.findByIdAndUpdate(user._id,{
      $unset:{impersonateToken:1,impersonateExpiry:1}
    });
    const jwt=await encode({
      token:{
        id:user._id.toString(),
        email:user.email,
        name:user.name,
        role:user.role,
        company:user.company,
        status:"Active",
        isSuperAdmin:false,
        organizationId:user.organizationId?.toString(),
        impersonatedBy:user.impersonatedBy,
        impersonatedByRole:"superadmin",
      },
      secret:process.env.NEXTAUTH_SECRET,
      maxAge:3600,
    });
    const response=NextResponse.redirect(new URL("/dashboard",req.url));
    response.cookies.set("next-auth.session-token",jwt,{httpOnly:true,secure:false,sameSite:"lax",path:"/",maxAge:3600});
    response.cookies.set("__Secure-next-auth.session-token",jwt,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:3600});
    return response;
  }catch(err){
    console.error("Impersonate GET error:",err);
    return NextResponse.redirect(new URL("/login",req.url));
  }
}
