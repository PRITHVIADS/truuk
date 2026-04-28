import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Organization from "@/models/Organization";
import Subscription from "@/models/Subscription";
import { NextResponse } from "next/server";

const PLAN_LIMITS = {
  trial:      { clicks: 50000 },
  starter:    { clicks: 1000000 },   // 10 lakh
  growth:     { clicks: 10000000 },  // 1 crore
  enterprise: { clicks: 999999999 },
};

export async function getTenant(req) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized", status: 401 };

  // Super admin bypasses everything
  if (session.user.isSuperAdmin) return { session, org: null, isSuperAdmin: true };

  if (!session.user.organizationId) return { error: "No organization", status: 403 };

  await connectDB();
  const org = await Organization.findById(session.user.organizationId).lean();
  if (!org) return { error: "Organization not found", status: 404 };

  if (org.status === "Suspended") return { error: "Account suspended. Contact support.", status: 403 };
  if (org.status === "Cancelled") return { error: "Account cancelled.", status: 403 };

  return { session, org };
}

export async function checkClickLimit(organizationId) {
  await connectDB();
  const org = await Organization.findById(organizationId).lean();
  if (!org) return { allowed: false };

  // Reset monthly clicks if needed
  const now = new Date();
  const resetAt = new Date(org.clicksResetAt);
  const daysSinceReset = (now - resetAt) / (1000 * 60 * 60 * 24);

  if (daysSinceReset >= 30) {
    await Organization.findByIdAndUpdate(organizationId, {
      clicksThisMonth: 0,
      clicksResetAt: now,
    });
    return { allowed: true, clicksUsed: 0 };
  }

  const limit = PLAN_LIMITS[org.plan]?.clicks || 50000;
  const used = org.clicksThisMonth || 0;

  return {
    allowed: used < limit,
    clicksUsed: used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function incrementClickCount(organizationId) {
  await Organization.findByIdAndUpdate(organizationId, {
    $inc: { clicksThisMonth: 1, totalClicks: 1 },
  });
}
