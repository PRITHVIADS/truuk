import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, role, company, phone, website } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!["advertiser", "affiliate"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const user = await User.create({
      name, email, password, role, company, phone, website,
      status: "Pending", // needs admin approval
      referralCode,
    });

    return NextResponse.json({
      message: "Account created! Waiting for admin approval.",
      userId: user._id,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
