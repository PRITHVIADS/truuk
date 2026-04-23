import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Click from "@/models/Click";
import Campaign from "@/models/Campaign";
import { nanoid } from "nanoid";

// All supported macros and their sources
function resolveMacros(url, data) {
  const {
    clickId, campId, campaignTitle, publisherId, publisherName,
    source, subSource, ip, country, city, region, device, os, osVersion,
    userAgent, referer, gaid, idfa, androidId, appId, appName,
    p1, p2, p3, p4, p5, p6, p7, p8, p9, p10,
    sub1, sub2, sub3, sub4, sub5,
    advId, advertiserName, trackingDomain,
    clickTime, fbclid, gclid, isp, connType, deviceLang,
  } = data;

  const now = new Date();
  const clickDatetime = now.toISOString().replace("T", " ").substring(0, 19);
  const unixTimestamp = Math.floor(now.getTime() / 1000);
  const random = () => Math.random().toString(36).substring(2, 10);

  const macros = {
    // Campaign
    "{camp_id}": campId || "",
    "{campaign_id}": campId || "",
    "{campaign_title}": encodeURIComponent(campaignTitle || ""),
    // Publisher
    "{publisher_id}": publisherId || "",
    "{aff_id}": publisherId || "",
    "{aff_name}": encodeURIComponent(publisherName || ""),
    "{aff_username}": encodeURIComponent(publisherName || ""),
    "{affiliate_ref}": publisherId || "",
    "{publisher_ref}": publisherId || "",
    // Source
    "{source}": source || "",
    "{sub_source}": subSource || "",
    // Click
    "{click_id}": clickId || "",
    "{click_time}": String(unixTimestamp),
    "{click_datetime}": clickDatetime,
    // Device & Location
    "{device}": device || "",
    "{device_lang}": deviceLang || "",
    "{ip}": ip || "",
    "{country_id}": country || "",
    "{region}": region || "",
    "{city}": city || "",
    "{os}": os || "",
    "{os_version}": osVersion || "",
    "{user_agent}": encodeURIComponent(userAgent || ""),
    "{referer}": encodeURIComponent(referer || ""),
    "{isp}": isp || "",
    "{conn_type}": connType || "",
    // Mobile IDs
    "{gaid}": gaid || "",
    "{idfa}": idfa || "",
    "{android_id}": androidId || "",
    // App
    "{app_id}": appId || "",
    "{app_name}": encodeURIComponent(appName || ""),
    // Advertiser
    "{adv_id}": advId || "",
    "{advertiser_id}": advId || "",
    "{advertiser_name}": encodeURIComponent(advertiserName || ""),
    "{tdomain}": trackingDomain || "",
    // Custom params p1-p10
    "{p1}": p1 || "", "{p2}": p2 || "", "{p3}": p3 || "",
    "{p4}": p4 || "", "{p5}": p5 || "", "{p6}": p6 || "",
    "{p7}": p7 || "", "{p8}": p8 || "", "{p9}": p9 || "",
    "{p10}": p10 || "",
    // Sub params
    "{sub1}": sub1 || "", "{sub2}": sub2 || "", "{sub3}": sub3 || "",
    "{sub4}": sub4 || "", "{sub5}": sub5 || "",
    // Social
    "{fbclid}": fbclid || "",
    "{gclid}": gclid || "",
    "{wbraid}": "",
    "{gbraid}": "",
    // Random
    "{random}": random(),
    "{random4}": String(Math.floor(1000 + Math.random() * 9000)),
    "{random5}": String(Math.floor(10000 + Math.random() * 90000)),
    "{random6}": String(Math.floor(100000 + Math.random() * 900000)),
    "{random_10}": String(Math.floor(Math.random() * 11)),
    "{random_25}": String(Math.floor(Math.random() * 26)),
    "{random_50}": String(Math.floor(Math.random() * 51)),
    "{random_100}": String(Math.floor(Math.random() * 101)),
    "{unix_time_stamp}": String(unixTimestamp),
  };

  let resolved = url;
  for (const [macro, value] of Object.entries(macros)) {
    resolved = resolved.split(macro).join(value);
  }
  return resolved;
}

function parseDevice(ua = "") {
  if (/mobile|android|iphone|ipod/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

function parseOS(ua = "") {
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/mac/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown";
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const campaignId = searchParams.get("cid") || searchParams.get("camp_id");
    const publisherId = searchParams.get("aid") || searchParams.get("pub_id") || searchParams.get("publisher_id");

    // Extract all possible params
    const p1 = searchParams.get("p1") || searchParams.get("sub1") || "";
    const p2 = searchParams.get("p2") || searchParams.get("sub2") || "";
    const p3 = searchParams.get("p3") || "";
    const p4 = searchParams.get("p4") || "";
    const p5 = searchParams.get("p5") || "";
    const source = searchParams.get("source") || searchParams.get("s") || "";
    const gaid = searchParams.get("gaid") || searchParams.get("gclid") || "";
    const idfa = searchParams.get("idfa") || "";
    const fbclid = searchParams.get("fbclid") || "";
    const gclid = searchParams.get("gclid") || "";
    const appId = searchParams.get("app_id") || "";
    const appName = searchParams.get("app_name") || "";

    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaign ID (cid)" }, { status: 400 });
    }

    const campaign = await Campaign.findById(campaignId).populate("createdBy", "name company");
    if (!campaign || campaign.status !== "Active") {
      return NextResponse.redirect(new URL("/404", req.url));
    }

    // Extract request metadata
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const device = parseDevice(userAgent);
    const os = parseOS(userAgent);
    const isBot = /bot|crawl|spider|slurp|mediapartners|bingbot|googlebot/i.test(userAgent);

    // Duplicate click check (same IP + campaign in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingClick = await Click.findOne({ campaignId, ip, createdAt: { $gte: oneDayAgo } });

    // Generate unique click ID
    const clickId = nanoid(16);

    // Save click record
    const click = await Click.create({
      campaignId,
      affiliateId: publisherId || undefined,
      clickId,
      ip,
      userAgent,
      device,
      os,
      referer,
      country: searchParams.get("country") || "",
      sub1: p1, sub2: p2, sub3: p3, sub4: p4, sub5: p5,
      source,
      gaid,
      idfa,
      fbclid,
      gclid,
      appId,
      appName,
      isBot,
      isDuplicate: !!existingClick,
    });

    // Increment campaign clicks (only real, non-duplicate clicks)
    if (!isBot && !existingClick) {
      await Campaign.findByIdAndUpdate(campaignId, { $inc: { clicks: 1 } });
    }

    // Build macro data
    const macroData = {
      clickId,
      campId: campaign._id.toString(),
      campaignTitle: campaign.name,
      publisherId: publisherId || "",
      publisherName: "",
      source,
      subSource: "",
      ip,
      country: "",
      city: "",
      region: "",
      device,
      os,
      osVersion: "",
      userAgent,
      referer,
      gaid,
      idfa,
      androidId: searchParams.get("android_id") || "",
      appId,
      appName,
      p1, p2, p3, p4, p5,
      p6: searchParams.get("p6") || "",
      p7: searchParams.get("p7") || "",
      p8: searchParams.get("p8") || "",
      p9: searchParams.get("p9") || "",
      p10: searchParams.get("p10") || "",
      sub1: p1, sub2: p2, sub3: p3, sub4: p4, sub5: p5,
      advId: campaign.createdBy?._id?.toString() || "",
      advertiserName: campaign.createdBy?.company || campaign.createdBy?.name || "",
      trackingDomain: campaign.trackingDomain || "",
      fbclid,
      gclid,
      isp: "",
      connType: "",
      deviceLang: req.headers.get("accept-language")?.split(",")[0] || "",
    };

    // Resolve all macros in the landing URL
    const landingUrl = campaign.landingUrl || "/";
    const resolvedUrl = resolveMacros(landingUrl, macroData);

    // Add click_id as fallback if not already in URL
    const finalUrl = resolvedUrl.includes(clickId)
      ? resolvedUrl
      : `${resolvedUrl}${resolvedUrl.includes("?") ? "&" : "?"}click_id=${clickId}`;

    return NextResponse.redirect(finalUrl);
  } catch (err) {
    console.error("Click tracking error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
