import{NextResponse}from"next/server";import{connectDB}from"@/lib/mongoose";import Affiliate from"@/models/Affiliate";import{generatePublisherId}from"@/lib/generateId";
export async function POST(req){
  try{await connectDB();const{name,email,password,company,phone,website,paymentMethod}=await req.json();
  if(!name||!email||!password)return NextResponse.json({error:"Name, email and password required"},{status:400});
  if(password.length<8)return NextResponse.json({error:"Password must be at least 8 characters"},{status:400});
  if(await Affiliate.findOne({email:email.toLowerCase()}))return NextResponse.json({error:"Email already registered"},{status:400});
  let shortId,attempts=0;while(!shortId&&attempts<10){const c=generatePublisherId();if(!await Affiliate.findOne({publisherId:c}))shortId=c;attempts++;}
  await Affiliate.create({name,email:email.toLowerCase(),company,phone,website,paymentMethod:paymentMethod||"Bank Transfer",status:"Pending",publisherId:shortId,referralCode:shortId});
  return NextResponse.json({success:true},{status:201});}
  catch(err){return NextResponse.json({error:err.message},{status:500});}
}
