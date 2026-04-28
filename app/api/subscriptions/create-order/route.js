import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Organization from "@/models/Organization";
import Subscription from "@/models/Subscription";
import crypto from "crypto";

const PLANS = {
  starter: { price: 1500, clicks: 1000000, name: "Starter", duration: 30 },
  growth:  { price: 5000, clicks: 10000000, name: "Growth",  duration: 30 },
};

const GST_RATE = 0.18;

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { plan } = await req.json();

    if (!PLANS[plan]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const planConfig = PLANS[plan];
    const amountINR = planConfig.price;
    const gstAmount = Math.round(amountINR * GST_RATE);
    const totalAmount = amountINR + gstAmount;
    const amountPaise = totalAmount * 100; // Razorpay uses paise

    // Create Razorpay order
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      // Demo mode - return fake order for testing
      return NextResponse.json({
        orderId: "order_demo_" + Date.now(),
        amount: amountPaise,
        amountINR,
        gstAmount,
        totalAmount,
        currency: "INR",
        plan,
        planName: planConfig.name,
        keyId: "rzp_test_demo",
        demo: true,
      });
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `truuk_${session.user.id}_${Date.now()}`,
        notes: { plan, organizationId: session.user.organizationId?.toString(), userId: session.user.id },
      }),
    });

    const order = await response.json();
    if (!response.ok) return NextResponse.json({ error: order.error?.description || "Razorpay error" }, { status: 400 });

    return NextResponse.json({
      orderId: order.id,
      amount: amountPaise,
      amountINR,
      gstAmount,
      totalAmount,
      currency: "INR",
      plan,
      planName: planConfig.name,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
