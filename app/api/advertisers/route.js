import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const advertisers = await User.find({ role: "advertiser", status: "Active" })
      .select("_id name email company phone shortId advertiserRef")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ advertisers });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
