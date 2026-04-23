import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Conversion from "@/models/Conversion";
import Campaign from "@/models/Campaign";
import Affiliate from "@/models/Affiliate";
import Click from "@/models/Click";

// GET /api/conversions?cid=xxx&aid=xxx&txid=xxx&sale_amount=xxx&clickid=xxx
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("cid");
    const affiliateId = searchParams.get("aid");
    const transactionId = searchParams.get("txid");
    const clickId = searchParams.get("clickid");
    const saleAmount = parseFloat(searchParams.get("sale_amount") || "0");

    if (!campaignId) return NextResponse.json({ error: "Missing cid" }, { status: 400 });

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    // Prevent duplicate conversions
    if (transactionId) {
      const exists = await Conversion.findOne({ transactionId });
      if (exists) return NextResponse.json({ status: "duplicate", message: "Already tracked" });
    }

    // ── Calculate payout based on objective ──────────────────
    let payout = 0;
    let calculatedSaleAmount = saleAmount;

    if (campaign.objective === "Sale") {
      // Sale: payout = sale_amount × (commission% / 100)
      if (!saleAmount) return NextResponse.json({ error: "sale_amount is required for Sale campaigns" }, { status: 400 });
      payout = saleAmount * ((campaign.payout || 0) / 100);
      // Apply min/max caps
      if (campaign.minPayout && payout < campaign.minPayout) payout = campaign.minPayout;
      if (campaign.maxPayout && campaign.maxPayout > 0 && payout > campaign.maxPayout) payout = campaign.maxPayout;
    } else {
      // Conversions: flat payout
      payout = campaign.payout || 0;
    }

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
      saleAmount: calculatedSaleAmount,
      objective: campaign.objective,
      status: "Pending",
      ip,
      sub1: click?.sub1,
      sub2: click?.sub2,
    });

    // Update campaign stats
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { conversions: 1, spent: payout },
    });

    // Update affiliate stats
    const affId = affiliateId || click?.affiliateId;
    if (affId) {
      await Affiliate.findByIdAndUpdate(affId, {
        $inc: { conversions: 1, totalEarnings: payout, pendingPayout: payout },
      });
    }

    if (click) {
      await Click.findByIdAndUpdate(click._id, { converted: true, conversionId: conversion._id });
    }

    return NextResponse.json({
      status: "ok",
      conversionId: conversion._id,
      objective: campaign.objective,
      payout,
      ...(campaign.objective === "Sale" && { saleAmount, commissionPct: campaign.payout }),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { campaignId, affiliateId, transactionId, notes, saleAmount } = body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    let payout = 0;
    if (campaign.objective === "Sale") {
      payout = (saleAmount || 0) * ((campaign.payout || 0) / 100);
      if (campaign.minPayout && payout < campaign.minPayout) payout = campaign.minPayout;
      if (campaign.maxPayout && campaign.maxPayout > 0 && payout > campaign.maxPayout) payout = campaign.maxPayout;
    } else {
      payout = campaign.payout || 0;
    }

    const conversion = await Conversion.create({
      campaignId, affiliateId, transactionId,
      payout, saleAmount: saleAmount || 0,
      objective: campaign.objective,
      status: "Approved", notes,
    });

    await Campaign.findByIdAndUpdate(campaignId, { $inc: { conversions: 1, spent: payout } });
    if (affiliateId) {
      await Affiliate.findByIdAndUpdate(affiliateId, {
        $inc: { conversions: 1, totalEarnings: payout, pendingPayout: payout },
      });
    }

    return NextResponse.json({ conversion }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
