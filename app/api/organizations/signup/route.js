import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Organization from "@/models/Organization";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { emails } from "@/lib/email";
import { generateAdvertiserId } from "@/lib/generateId";

const PLANS = {
  trial:   { clicks: 50000,    duration: 14, price: 0 },
  starter: { clicks: 1000000,  duration: 30, price: 1500 },
  growth:  { clicks: 10000000, duration: 30, price: 5000 },
};

export async function POST(req) {
  try {
    await connectDB();
    const { orgName, name, email, password, phone, website, plan = "trial" } = await req.json();
    if (!orgName || !name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (password.length < 8) return NextResponse.json({ error: "Password min 8 characters" }, { status: 400 });

    // Check email not already used
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const existingOrg = await Organization.findOne({ email: email.toLowerCase() });
    if (existingOrg) return NextResponse.json({ error: "Organization email already exists" }, { status: 400 });

    // Generate slug
    let slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 40);
    const slugExists = await Organization.findOne({ slug });
    if (slugExists) slug = slug + "-" + Math.random().toString(36).slice(2, 6);

    // Create organization
    const org = await Organization.create({
      name: orgName, slug, email: email.toLowerCase(),
      phone, website,
      ownerName: name, ownerEmail: email.toLowerCase(),
      status: "Pending",
      plan: plan === "trial" ? "trial" : "trial", // Always start as trial until payment
    });

    // Generate shortId for user
    let shortId, attempts = 0;
    while (!shortId && attempts < 10) {
      const candidate = generateAdvertiserId();
      if (!await User.findOne({ shortId: candidate })) shortId = candidate;
      attempts++;
    }

    // Create owner user
    const user = await User.create({
      name, email: email.toLowerCase(), password,
      role: "admin",
      status: "Pending",
      organizationId: org._id,
      shortId,
      phone,
    });

    // Update org with owner
    org.ownerId = user._id;
    await org.save();

    // Create trial subscription
    const planConfig = PLANS["trial"];
    const endDate = new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000);
    await Subscription.create({
      organizationId: org._id,
      plan: "trial",
      status: "active",
      endDate,
      trialEndsAt: endDate,
      clickLimit: planConfig.clicks,
      amount: 0,
      amountINR: 0,
    });

    // Send emails
    await emails.welcome({ to: email, name, orgName, plan: "Free Trial" });
    await emails.newOrgAlert({ orgName, ownerName: name, ownerEmail: email, plan: plan || "trial" });

    return NextResponse.json({ success: true, orgId: org._id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
