import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Organization from "@/models/Organization";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { emails } from "@/lib/email";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    if (secret) {
      const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
      if (expected !== signature) return new NextResponse("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    await connectDB();

    if (event.event === "payment.failed") {
      const notes = event.payload?.payment?.entity?.notes;
      if (notes?.organizationId) {
        const org = await Organization.findById(notes.organizationId);
        const owner = await User.findById(org?.ownerId).lean();
        if (owner) {
          await emails.paymentFailed({ to: owner.email, name: owner.name, orgName: org.name, plan: org.plan });
        }
        await Subscription.findOneAndUpdate({ organizationId: notes.organizationId }, { status: "pending_payment" });
      }
    }

    if (event.event === "subscription.charged") {
      // Handle auto-renewal
      const sub = event.payload?.subscription?.entity;
      if (sub?.notes?.organizationId) {
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await Subscription.findOneAndUpdate(
          { organizationId: sub.notes.organizationId },
          { status: "active", endDate, renewedAt: new Date() }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
