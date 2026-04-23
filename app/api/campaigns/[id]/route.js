import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Campaign from "@/models/Campaign";
import Click from "@/models/Click";
import Conversion from "@/models/Conversion";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const campaign = await Campaign.findById(params.id).lean();
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // get last 7 days click data for chart
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const clicksByDay = await Click.aggregate([
      { $match: { campaignId: campaign._id, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({ campaign, clicksByDay });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const campaign = await Campaign.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ campaign });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    await Campaign.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
