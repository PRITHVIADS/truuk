import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Campaign from "@/models/Campaign";
import { generateCampaignId } from "@/lib/generateId";
export async function GET(req){
  try{const session=await getServerSession(authOptions);if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});await connectDB();const{searchParams}=new URL(req.url);const status=searchParams.get("status");const query={};if(status)query.status=status;const campaigns=await Campaign.find(query).populate("advertiser","name company email shortId").sort({createdAt:-1}).lean();return NextResponse.json({campaigns});}catch(err){return NextResponse.json({error:err.message},{status:500});}
}
export async function POST(req){
  try{const session=await getServerSession(authOptions);if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});await connectDB();const body=await req.json();let shortId,attempts=0;while(!shortId&&attempts<10){const candidate=generateCampaignId();const ex=await Campaign.findOne({shortId:candidate});if(!ex)shortId=candidate;attempts++;}const campaign=await Campaign.create({...body,shortId,createdBy:session.user.id});return NextResponse.json({campaign},{status:201});}catch(err){return NextResponse.json({error:err.message},{status:500});}
}
