import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Payout from "@/models/Payout";
import Affiliate from "@/models/Affiliate";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query = {};
    if (status && status !== "All") query.status = status;

    const payouts = await Payout.find(query)
      .populate("affiliateId", "name email paymentMethod")
      .sort({ createdAt: -1 })
      .lean();

    const summary = await Payout.aggregate([
      { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    return NextResponse.json({ payouts, summary });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { affiliateId, amount, method, period, notes } = body;

    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });

    const payout = await Payout.create({
      affiliateId, amount, method: method || affiliate.paymentMethod,
      period, notes, status: "Pending",
    });

    return NextResponse.json({ payout }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
