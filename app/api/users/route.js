import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { generateAdvertiserId, generatePublisherId } from "@/lib/generateId";
export async function GET(req){
  try{const session=await getServerSession(authOptions);if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});await connectDB();const{searchParams}=new URL(req.url);const role=searchParams.get("role");const query={};if(role)query.role=role;const users=await User.find(query).select("-password").sort({createdAt:-1}).lean();return NextResponse.json({users});}catch(err){return NextResponse.json({error:err.message},{status:500});}
}
export async function POST(req){
  try{const session=await getServerSession(authOptions);if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});await connectDB();const body=await req.json();const{name,email,password,role,company,phone,status,notes}=body;if(!name||!email||!password)return NextResponse.json({error:"Name, email and password required"},{status:400});const exists=await User.findOne({email});if(exists)return NextResponse.json({error:"Email already exists"},{status:400});let shortId,attempts=0;while(!shortId&&attempts<10){const candidate=role==="advertiser"?generateAdvertiserId():generatePublisherId();const ex=await User.findOne({shortId:candidate});if(!ex)shortId=candidate;attempts++;}const user=await User.create({name,email,password,role:role||"advertiser",company,phone,status:status||"Active",shortId,advertiserRef:role==="advertiser"?shortId:undefined,publisherRef:role==="affiliate"?shortId:undefined,notes});const obj=user.toObject();delete obj.password;return NextResponse.json({user:obj},{status:201});}catch(err){return NextResponse.json({error:err.message},{status:500});}
}
