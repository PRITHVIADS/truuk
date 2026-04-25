import{NextResponse}from"next/server";import{connectDB}from"@/lib/mongoose";import User from"@/models/User";import{generateAdvertiserId}from"@/lib/generateId";
export async function POST(req){
  try{await connectDB();const{name,email,password,company,phone,website}=await req.json();
  if(!name||!email||!password)return NextResponse.json({error:"Name, email and password required"},{status:400});
  if(password.length<8)return NextResponse.json({error:"Password must be at least 8 characters"},{status:400});
  if(await User.findOne({email:email.toLowerCase()}))return NextResponse.json({error:"Email already registered"},{status:400});
  let shortId,attempts=0;while(!shortId&&attempts<10){const c=generateAdvertiserId();if(!await User.findOne({shortId:c}))shortId=c;attempts++;}
  await User.create({name,email:email.toLowerCase(),password,company,phone,website,role:"advertiser",status:"Pending",shortId,advertiserRef:shortId});
  return NextResponse.json({success:true},{status:201});}
  catch(err){return NextResponse.json({error:err.message},{status:500});}
}
