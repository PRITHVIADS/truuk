import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Subscription from "@/models/Subscription";
import Organization from "@/models/Organization";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const org = await Organization.findById(session.user.organizationId).lean();
    const sub = await Subscription.findOne({ organizationId: session.user.organizationId }).lean();
    return NextResponse.json({ ...sub, org });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
