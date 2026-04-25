import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Payout from "@/models/Payout";
import Affiliate from "@/models/Affiliate";
import Conversion from "@/models/Conversion";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const query = {};
    if (status) query.status = status;

    if (session.user.role === "affiliate") {
      const aff = await Affiliate.findOne({ email: session.user.email }).lean();
      query.affiliateId = aff?._id;
    }

    const payouts = await Payout.find(query)
      .populate("affiliateId", "name email publisherId referralCode paymentMethod")
      .sort({ createdAt: -1 }).lean();

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
    const { affiliateId, amount, method, notes } = await req.json();
    const payout = await Payout.create({ affiliateId, amount, method, notes, status: "Pending", requestedBy: session.user.id });
    return NextResponse.json({ payout }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { payoutId, status, transactionId, notes } = await req.json();
    const payout = await Payout.findByIdAndUpdate(payoutId, { status, transactionId, notes, processedAt: new Date() }, { new: true });
    return NextResponse.json({ payout });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
