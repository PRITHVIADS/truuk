import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const query = { role: { $ne: "admin" } };
    if (role && role !== "All") query.role = role;
    if (status && status !== "All") query.status = status;
    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    if (!body.name || !body.email || !body.password || !body.role) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    const user = await User.create({ ...body, status: "Active", approvedBy: session.user.id, approvedAt: new Date(), referralCode: Math.random().toString(36).substring(2,10).toUpperCase() });
    const safe = user.toObject(); delete safe.password;
    return NextResponse.json({ user: safe }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
