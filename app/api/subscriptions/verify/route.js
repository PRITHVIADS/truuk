import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Organization from "@/models/Organization";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { emails } from "@/lib/email";
import crypto from "crypto";

const PLANS = {
  starter: { clicks: 1000000, duration: 30, price: 1500 },
  growth:  { clicks: 10000000, duration: 30, price: 5000 },
};

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan, demo } = await req.json();

    // Verify signature (skip for demo)
    if (!demo) {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSig = crypto.createHmac("sha256", secret).update(body).digest("hex");
      if (expectedSig !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    const planConfig = PLANS[plan];
    const endDate = new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000);
    const invoiceId = "INV-" + Date.now();
    const gst = Math.round(planConfig.price * 0.18);
    const total = planConfig.price + gst;

    // Update organization
    const org = await Organization.findByIdAndUpdate(
      session.user.organizationId,
      { plan, status: "Active" },
      { new: true }
    );

    // Update subscription
    await Subscription.findOneAndUpdate(
      { organizationId: session.user.organizationId },
      {
        plan, status: "active",
        endDate, clickLimit: planConfig.clicks,
        razorpayOrderId, razorpayPaymentId,
        amount: total * 100,
        amountINR: planConfig.price,
        gstAmount: gst,
        renewedAt: new Date(),
        $push: { invoices: { invoiceId, amount: total, paidAt: new Date(), razorpayPaymentId } }
      },
      { upsert: true, new: true }
    );

    // Update user status to active
    await User.findByIdAndUpdate(session.user.id, { status: "Active" });

    // Send confirmation email
    const user = await User.findById(session.user.id).lean();
    if (user) {
      await emails.paymentSuccess({
        to: user.email, name: user.name, orgName: org.name,
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
        amount: total, invoiceId, expiresAt: endDate,
      });
    }

    return NextResponse.json({ success: true, plan, endDate });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
