import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Affiliate from "@/models/Affiliate";
import Conversion from "@/models/Conversion";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const affiliate = await Affiliate.findById(params.id).populate("campaigns").lean();
    if (!affiliate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const recentConversions = await Conversion.find({ affiliateId: params.id })
      .sort({ createdAt: -1 }).limit(20).populate("campaignId", "name").lean();

    return NextResponse.json({ affiliate, recentConversions });
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
    const affiliate = await Affiliate.findByIdAndUpdate(params.id, body, { new: true });
    if (!affiliate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ affiliate });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    await Affiliate.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
