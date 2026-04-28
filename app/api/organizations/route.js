import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Organization from "@/models/Organization";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { emails } from "@/lib/email";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = status ? { status } : {};
    const orgs = await Organization.find(query).sort({ createdAt: -1 }).lean();
    // Get subscriptions for each org
    const orgIds = orgs.map(o => o._id);
    const subs = await Subscription.find({ organizationId: { $in: orgIds } }).lean();
    const subMap = {};
    subs.forEach(s => { subMap[s.organizationId.toString()] = s; });
    const result = orgs.map(o => ({ ...o, subscription: subMap[o._id.toString()] || null }));
    return NextResponse.json({ organizations: result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id, status, plan, notes, suspendReason } = await req.json();
    const org = await Organization.findById(id);
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const prevStatus = org.status;
    if (status) org.status = status;
    if (plan) org.plan = plan;
    if (notes !== undefined) org.notes = notes;
    if (suspendReason) org.suspendReason = suspendReason;
    if (status === "Active" && prevStatus !== "Active") {
      org.approvedAt = new Date();
      org.approvedBy = session.user.id;
    }
    if (status === "Suspended") org.suspendedAt = new Date();
    await org.save();

    // Update subscription plan if changed
    if (plan) {
      const PLANS = { trial: { clicks: 50000, duration: 14 }, starter: { clicks: 1000000, duration: 30 }, growth: { clicks: 10000000, duration: 30 }, enterprise: { clicks: 999999999, duration: 30 } };
      const planConfig = PLANS[plan];
      const endDate = new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000);
      await Subscription.findOneAndUpdate(
        { organizationId: id },
        { plan, clickLimit: planConfig.clicks, endDate, status: "active" },
        { upsert: true }
      );
    }

    // Send emails
    const owner = await User.findById(org.ownerId).lean();
    if (owner) {
      if (status === "Active" && prevStatus !== "Active") {
        await emails.approved({ to: owner.email, name: owner.name, orgName: org.name, plan: org.plan });
      }
      if (status === "Suspended") {
        await emails.suspended({ to: owner.email, name: owner.name, orgName: org.name, reason: suspendReason });
      }
    }

    return NextResponse.json({ success: true, organization: org });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
