import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Conversion from "@/models/Conversion";
import Campaign from "@/models/Campaign";
import Affiliate from "@/models/Affiliate";
import Click from "@/models/Click";

// GET /api/conversions?cid=xxx&aid=xxx&txid=xxx&payout=xxx
// Called by advertiser postback (server-to-server)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("cid");
    const affiliateId = searchParams.get("aid");
    const transactionId = searchParams.get("txid");
    const clickId = searchParams.get("clickid");
    const payoutOverride = parseFloat(searchParams.get("payout") || "0");

    if (!campaignId) return NextResponse.json({ error: "Missing cid" }, { status: 400 });

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    // Prevent duplicate conversions by transactionId
    if (transactionId) {
      const exists = await Conversion.findOne({ transactionId });
      if (exists) return NextResponse.json({ status: "duplicate", message: "Already tracked" });
    }

    const payout = payoutOverride || campaign.payout;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // Find original click
    let click = null;
    if (clickId) click = await Click.findOne({ clickId });

    const conversion = await Conversion.create({
      campaignId,
      affiliateId: affiliateId || click?.affiliateId,
      clickId: click?._id,
      transactionId,
      payout,
      status: "Pending",
      ip,
      sub1: click?.sub1,
      sub2: click?.sub2,
    });

    // Update campaign & affiliate stats
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { conversions: 1, spent: payout },
    });

    if (affiliateId || click?.affiliateId) {
      await Affiliate.findByIdAndUpdate(affiliateId || click?.affiliateId, {
        $inc: { conversions: 1, totalEarnings: payout, pendingPayout: payout },
      });
    }

    if (click) {
      await Click.findByIdAndUpdate(click._id, { converted: true, conversionId: conversion._id });
    }

    return NextResponse.json({ status: "ok", conversionId: conversion._id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — manual conversion entry from dashboard
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { campaignId, affiliateId, payout, transactionId, notes } = body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    const conversion = await Conversion.create({
      campaignId, affiliateId, transactionId,
      payout: payout || campaign.payout,
      status: "Approved", notes,
    });

    await Campaign.findByIdAndUpdate(campaignId, { $inc: { conversions: 1, spent: payout || campaign.payout } });
    if (affiliateId) {
      await Affiliate.findByIdAndUpdate(affiliateId, {
        $inc: { conversions: 1, totalEarnings: payout || campaign.payout, pendingPayout: payout || campaign.payout },
      });
    }

    return NextResponse.json({ conversion }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
