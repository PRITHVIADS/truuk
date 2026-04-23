import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Campaign from "@/models/Campaign";
import { nanoid } from "nanoid";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = {};
    // Advertiser sees only their own campaigns
    if (session.user.role === "advertiser") query.createdBy = session.user.id;
    // Admin sees all
    if (status && status !== "All") query.status = status;
    const campaigns = await Campaign.find(query).populate("createdBy", "name company email").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ campaigns });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["admin","advertiser"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await connectDB();
    const body = await req.json();
    const campaign = await Campaign.create({
      ...body,
      createdBy: session.user.id,
      clicks: 0, conversions: 0, spent: 0,
      privateToken: body.visibility === "Private" ? nanoid(12) : undefined,
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
