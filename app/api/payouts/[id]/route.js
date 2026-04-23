import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Payout from "@/models/Payout";
import Affiliate from "@/models/Affiliate";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { status, transactionId, notes } = await req.json();

    const payout = await Payout.findById(params.id);
    if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });

    payout.status = status;
    if (transactionId) payout.transactionId = transactionId;
    if (notes) payout.notes = notes;
    payout.processedBy = session.user.id;
    payout.processedAt = new Date();
    await payout.save();

    // If paid, reduce pendingPayout from affiliate
    if (status === "Paid") {
      await Affiliate.findByIdAndUpdate(payout.affiliateId, {
        $inc: { pendingPayout: -payout.amount },
      });
    }

    return NextResponse.json({ payout });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    await Payout.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
