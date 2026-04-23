"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ChevronDown } from "lucide-react";

const TRAFFIC=["Social Media","Search","Email","Push Notification","Native","Display","SEO","Influencer","SMS"];
const CURRENCIES=["INR","USD","EUR","GBP","AED","SGD"];
const CURRENCY_SYMBOLS={"INR":"₹","USD":"$","EUR":"€","GBP":"£","AED":"AED","SGD":"S$"};
const GEOS=["IN","US","GB","AE","AU","CA","SG","MY","PH","BD"];

// All macros from PDF grouped by category
const MACRO_GROUPS = [
  {
    label: "Most Used",
    color: "orange",
    tokens: ["{click_id}","{publisher_id}","{camp_id}","{source}","{p1}","{p2}","{p3}","{sale_amount}","{payout}"]
  },
  {
    label: "Campaign",
    color: "blue",
    tokens: ["{camp_id}","{campaign_id}","{campaign_title}","{tdomain}","{adv_id}","{advertiser_name}"]
  },
  {
    label: "Publisher",
    color: "green",
    tokens: ["{publisher_id}","{aff_id}","{aff_name}","{aff_username}","{source}","{sub_source}","{pub_camp_id}","{pub_group_id}"]
  },
  {
    label: "Click & Device",
    color: "purple",
    tokens: ["{click_id}","{click_time}","{click_datetime}","{device}","{os}","{os_version}","{ip}","{country_id}","{region}","{city}","{user_agent}","{referer}","{isp}","{conn_type}","{device_lang}"]
  },
  {
    label: "Mobile IDs",
    color: "pink",
    tokens: ["{gaid}","{idfa}","{android_id}","{app_id}","{app_name}","{fbclid}","{gclid}","{wbraid}","{gbraid}"]
  },
  {
    label: "Custom Params",
    color: "yellow",
    tokens: ["{p1}","{p2}","{p3}","{p4}","{p5}","{p6}","{p7}","{p8}","{p9}","{p10}","{sub1}","{sub2}","{sub3}","{sub4}","{sub5}"]
  },
  {
    label: "Random & Time",
    color: "slate",
    tokens: ["{random}","{random4}","{random5}","{random6}","{random_10}","{random_100}","{unix_time_stamp}"]
  },
];

const COLOR_MAP = {
  orange: "border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
  blue: "border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
  green: "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20",
  purple: "border-purple-500/50 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
  pink: "border-pink-500/50 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20",
  yellow: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
  slate: "border-slate-500/50 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20",
};

export default function CreateCampaign() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [geoInput, setGeoInput] = useState("");
  const [showAllMacros, setShowAllMacros] = useState(false);
  const [activeMacroGroup, setActiveMacroGroup] = useState("Most Used");

  const [objective, setObjective] = useState("Conversions");
  const [name, setName] = useState("");
  const [advertiser, setAdvertiser] = useState("");
  const [description, setDescription] = useState("");
  const [kpi, setKpi] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [landingUrl, setLandingUrl] = useState("");
  const [terms, setTerms] = useState("");
  const [requireTerms, setRequireTerms] = useState(false);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");
  const [trafficChannels, setTrafficChannels] = useState([]);
  const [conversionTracking, setConversionTracking] = useState("Server Postback");

  const [currency, setCurrency] = useState("INR");
  const [geo, setGeo] = useState(["IN"]);
  const [budget, setBudget] = useState("");
  const [dailyCap, setDailyCap] = useState("");

  // Conversions
  const [flatPayout, setFlatPayout] = useState("");
  const [flatRevenue, setFlatRevenue] = useState("");

  // Sale
  const [saleCommissionPct, setSaleCommissionPct] = useState("");
  const [saleRevenuePct, setSaleRevenuePct] = useState("");
  const [minPayout, setMinPayout] = useState("");
  const [maxPayout, setMaxPayout] = useState("");

  const [visibility, setVisibility] = useState("Public");
  const [advSection, setAdvSection] = useState(false);

  const sym = CURRENCY_SYMBOLS[currency] || currency;

  const toggleChannel = (ch) => setTrafficChannels(p=>p.includes(ch)?p.filter(c=>c!==ch):[...p,ch]);
  const addGeo = (g) => { if(g&&g.length===2&&!geo.includes(g)){setGeo(p=>[...p,g]);} setGeoInput(""); };
  const removeGeo = (g) => setGeo(p=>p.filter(x=>x!==g));
  const insertMacro = (token) => setLandingUrl(p => p + token);

  const handleSubmit = async () => {
    if(!name){setError("Campaign title is required");return;}
    if(objective==="Conversions"&&!flatPayout){setError("Payout is required");return;}
    if(objective==="Sale"&&!saleCommissionPct){setError("Commission % is required");return;}
    setSaving(true);setError("");
    const r = await fetch("/api/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      name,description,kpi,objective,status,visibility,category,notes,
      landingUrl,previewUrl,conversionTracking,terms,requireTerms,
      advertiser,trafficChannels,currency,geo:geo.join(","),
      budget:+budget||999999,dailyCap:+dailyCap||0,
      payoutType: objective==="Conversions"?"flat":"percentage",
      payout: objective==="Conversions"?+flatPayout:+saleCommissionPct,
      revenue: objective==="Conversions"?+flatRevenue||0:+saleRevenuePct||0,
      ...(objective==="Sale"&&{saleCommissionPct:+saleCommissionPct,saleRevenuePct:+saleRevenuePct||0,minPayout:+minPayout||0,maxPayout:+maxPayout||0}),
    })});
    const d = await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    router.push("/campaigns/manage");
  };

  const s = {background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  const row = "grid grid-cols-1 md:grid-cols-3 gap-3 items-start py-4 border-b border-white/5 last:border-0";
  const lbl = "text-sm text-slate-300 font-semibold";
  const hint = "text-xs text-slate-600 mt-0.5";

  const activeGroup = MACRO_GROUPS.find(g=>g.label===activeMacroGroup) || MACRO_GROUPS[0];

  return (
    <div className="max-w-4xl pb-10">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-2xl font-black text-white">Create Campaign</h1><p className="text-slate-500 text-sm">Set up a new performance campaign</p></div>
        <div className="flex gap-3">
          <button onClick={()=>router.back()} className="btn-ghost px-4 py-2 text-sm">Back</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{saving?"Creating…":"Create"}</button>
        </div>
      </div>
      {error&&<div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}

      {/* DETAILS */}
      <div className="rounded-2xl border overflow-hidden mb-4" style={s}>
        <div className="px-6 py-4 border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}><p className="text-white font-black text-sm">Details</p></div>
        <div className="px-6">
          <div className={row}>
            <div><p className={lbl}>Objective</p><p className={hint}>Determines payout calculation</p></div>
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              {[["Conversions","🎯","Flat amount per conversion","₹120 per lead"],["Sale","💰","% of sale amount","10% of ₹5,000 sale"]].map(([obj,icon,desc,ex])=>(
                <button key={obj} onClick={()=>setObjective(obj)} type="button"
                  className={`p-4 rounded-xl border text-left transition-all ${objective===obj?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5 hover:border-white/20"}`}>
                  <div className="flex items-center gap-2 mb-1"><span className="text-xl">{icon}</span><span className={`font-black text-sm ${objective===obj?"text-orange-400":"text-white"}`}>{obj}</span></div>
                  <p className="text-xs text-slate-400">{desc}</p>
                  <p className="text-xs text-slate-600 mt-0.5 font-mono">{ex}</p>
                </button>
              ))}
            </div>
          </div>
          <div className={row}><p className={lbl+" pt-1"}>Advertiser</p><div className="md:col-span-2"><input value={advertiser} onChange={e=>setAdvertiser(e.target.value)} className="input" placeholder="Advertiser name"/></div></div>
          <div className={row}><p className={lbl+" pt-1"}>Title <span className="text-orange-400">*</span></p><div className="md:col-span-2"><input value={name} onChange={e=>setName(e.target.value)} className="input" placeholder="Campaign title"/></div></div>
          <div className={row}><div><p className={lbl}>Description</p><p className={hint}>Optional</p></div><div className="md:col-span-2"><textarea value={description} onChange={e=>setDescription(e.target.value)} className="input resize-none" rows={3} placeholder="Describe the campaign for publishers…"/></div></div>
          <div className={row}><p className={lbl+" pt-1"}>Traffic Channels</p><div className="md:col-span-2 flex flex-wrap gap-2">{TRAFFIC.map(ch=><button key={ch} onClick={()=>toggleChannel(ch)} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${trafficChannels.includes(ch)?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{ch}</button>)}</div></div>
          <div className={row}><p className={lbl+" pt-1"}>Preview URL</p><div className="md:col-span-2"><input value={previewUrl} onChange={e=>setPreviewUrl(e.target.value)} className="input" placeholder="https://advertiser.com/preview"/></div></div>
          <div className={row}><p className={lbl+" pt-1"}>Conversion Tracking</p><div className="md:col-span-2"><select value={conversionTracking} onChange={e=>setConversionTracking(e.target.value)} className="select">{["Server Postback","Pixel","Hybrid"].map(v=><option key={v}>{v}</option>)}</select></div></div>

          {/* Campaign URL with full macro system */}
          <div className={row}>
            <div><p className={lbl}>Default Campaign URL <span className="text-orange-400">*</span></p><p className={hint}>Traffic redirects here with macros replaced</p></div>
            <div className="md:col-span-2">
              <input value={landingUrl} onChange={e=>setLandingUrl(e.target.value)} className="input mb-3" placeholder="https://advertiser.com/lp?utm_source={click_id}&pub={publisher_id}&s1={p1}"/>

              {/* Macro selector */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 flex-wrap" style={{background:"rgba(0,0,0,0.3)"}}>
                  <span className="text-xs text-slate-500 font-semibold mr-1">URL Macros:</span>
                  {MACRO_GROUPS.map(g=>(
                    <button key={g.label} onClick={()=>setActiveMacroGroup(g.label)} type="button"
                      className={`text-xs px-2 py-0.5 rounded-md font-semibold transition-all ${activeMacroGroup===g.label?"bg-orange-500 text-white":"text-slate-500 hover:text-white"}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
                <div className="p-3 flex flex-wrap gap-1.5">
                  {activeGroup.tokens.map(t=>(
                    <button key={t} onClick={()=>insertMacro(t)} type="button"
                      className={`px-2 py-1 rounded-lg border text-xs font-mono transition-all ${COLOR_MAP[activeGroup.color]}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live preview */}
              {landingUrl&&(
                <div className="mt-2 p-2 rounded-lg bg-black/30 border border-white/5">
                  <p className="text-xs text-slate-500 mb-1">Preview (sample values):</p>
                  <code className="text-xs text-green-400 break-all">
                    {landingUrl
                      .replace("{click_id}","abc123xyz")
                      .replace("{publisher_id}","pub456")
                      .replace("{camp_id}","camp789")
                      .replace("{p1}","social")
                      .replace("{p2}","banner")
                      .replace("{source}","fb")
                      .replace("{device}","mobile")
                      .replace("{country_id}","IN")
                    }
                  </code>
                </div>
              )}

              {/* Postback URL hint */}
              <div className="mt-2 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <p className="text-xs text-blue-400 font-bold mb-1">📬 Advertiser Postback URL (give this to advertiser)</p>
                <code className="text-xs text-slate-300 break-all">
                  {typeof window!=="undefined"?window.location.origin:"https://truuk.vercel.app"}/api/conversions?cid=CAMPAIGN_ID&aid={"{publisher_id}"}&txid={"{txn_id}"}{objective==="Sale"?"&sale_amount={sale_amount}":""}
                </code>
              </div>
            </div>
          </div>

          <div className={row}><p className={lbl+" pt-1"}>Category / Status</p><div className="md:col-span-2 grid grid-cols-2 gap-3"><input value={category} onChange={e=>setCategory(e.target.value)} className="input" placeholder="eCommerce, Finance…"/><select value={status} onChange={e=>setStatus(e.target.value)} className="select">{["Active","Paused","Draft"].map(s=><option key={s}>{s}</option>)}</select></div></div>
          <div className={row}><div><p className={lbl}>Notes</p><p className={hint}>Internal only</p></div><div className="md:col-span-2"><textarea value={notes} onChange={e=>setNotes(e.target.value)} className="input resize-none" rows={2} placeholder="Internal notes…"/></div></div>
        </div>
      </div>

      {/* REVENUE & PAYOUT */}
      <div className="rounded-2xl border overflow-hidden mb-4" style={s}>
        <div className="px-6 py-4 border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}><p className="text-white font-black text-sm">Revenue and Payout</p></div>
        <div className="px-6">
          <div className={row}><p className={lbl+" pt-1"}>Currency</p><div className="md:col-span-2 flex gap-2">{CURRENCIES.map(c=><button key={c} onClick={()=>setCurrency(c)} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${currency===c?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{c}</button>)}</div></div>

          {objective==="Conversions"&&<>
            <div className={row}><div><p className={lbl}>Revenue <span className="text-orange-400">*</span></p><p className={hint}>Charged to advertiser per conversion</p></div><div className="md:col-span-2 flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{sym}</span><input type="number" value={flatRevenue} onChange={e=>setFlatRevenue(e.target.value)} className="input flex-1" placeholder="e.g. 150"/></div></div>
            <div className={row}><div><p className={lbl}>Payout <span className="text-orange-400">*</span></p><p className={hint}>Paid to publisher per conversion</p></div><div className="md:col-span-2"><div className="flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{sym}</span><input type="number" value={flatPayout} onChange={e=>setFlatPayout(e.target.value)} className="input flex-1" placeholder="e.g. 120"/></div>{flatRevenue&&flatPayout&&<p className="text-xs text-green-400 mt-1">Your margin: {sym}{(+flatRevenue - +flatPayout).toFixed(2)} per conversion</p>}</div></div>
          </>}

          {objective==="Sale"&&<>
            <div className={row}><div><p className={lbl}>Revenue % <span className="text-orange-400">*</span></p><p className={hint}>% of sale charged to advertiser</p></div><div className="md:col-span-2 flex gap-2 items-center"><input type="number" value={saleRevenuePct} onChange={e=>setSaleRevenuePct(e.target.value)} className="input flex-1" placeholder="e.g. 15" min="0" max="100"/><span className="text-slate-400 font-bold text-lg">%</span></div></div>
            <div className={row}><div><p className={lbl}>Commission % <span className="text-orange-400">*</span></p><p className={hint}>% of sale paid to publisher</p></div><div className="md:col-span-2"><div className="flex gap-2 items-center"><input type="number" value={saleCommissionPct} onChange={e=>setSaleCommissionPct(e.target.value)} className="input flex-1" placeholder="e.g. 10" min="0" max="100"/><span className="text-slate-400 font-bold text-lg">%</span></div>{saleRevenuePct&&saleCommissionPct&&<p className="text-xs text-green-400 mt-1">Your margin: {(+saleRevenuePct - +saleCommissionPct).toFixed(1)}% of each sale</p>}</div></div>
            <div className={row}><div><p className={lbl}>Min Payout</p><p className={hint}>Floor amount</p></div><div className="md:col-span-2 flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{sym}</span><input type="number" value={minPayout} onChange={e=>setMinPayout(e.target.value)} className="input flex-1" placeholder="0 = no minimum"/></div></div>
            <div className={row}><div><p className={lbl}>Max Payout</p><p className={hint}>Cap amount</p></div><div className="md:col-span-2 flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{sym}</span><input type="number" value={maxPayout} onChange={e=>setMaxPayout(e.target.value)} className="input flex-1" placeholder="0 = no cap"/></div></div>
            {saleCommissionPct&&(
              <div className="py-4">
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                  <p className="text-orange-400 font-bold text-xs mb-3">💡 PAYOUT CALCULATOR</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[1000,5000,10000,25000,50000,100000].map(sale=>{
                      let pay=(sale*(+saleCommissionPct/100));
                      if(minPayout&&pay<+minPayout)pay=+minPayout;
                      if(maxPayout&&+maxPayout>0&&pay>+maxPayout)pay=+maxPayout;
                      return(<div key={sale} className="bg-black/20 rounded-lg p-2 text-center"><p className="text-xs text-slate-500">{sym}{sale.toLocaleString("en-IN")}</p><p className="text-sm font-black text-orange-400">{sym}{pay.toFixed(0)}</p></div>);
                    })}
                  </div>
                </div>
              </div>
            )}
          </>}

          <div className={row}><p className={lbl+" pt-1"}>Geo Coverage</p><div className="md:col-span-2"><div className="flex flex-wrap gap-2 mb-2">{geo.map(g=><span key={g} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">{g}<button onClick={()=>removeGeo(g)}><X size={10}/></button></span>)}</div><div className="flex gap-2 mb-2"><input value={geoInput} onChange={e=>setGeoInput(e.target.value.toUpperCase().slice(0,2))} onKeyDown={e=>{if(e.key==="Enter")addGeo(geoInput);}} className="input flex-1 text-xs" placeholder="Country code" maxLength={2}/><button onClick={()=>addGeo(geoInput)} className="btn-primary px-3 py-2 text-xs"><Plus size={14}/></button></div><div className="flex flex-wrap gap-1.5">{GEOS.map(g=><button key={g} onClick={()=>addGeo(g)} type="button" className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all ${geo.includes(g)?"border-orange-500/30 bg-orange-500/10 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{g}</button>)}</div></div></div>
          <div className={row}><div><p className={lbl}>Budget</p><p className={hint}>0 = unlimited</p></div><div className="md:col-span-2 flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{sym}</span><input type="number" value={budget} onChange={e=>setBudget(e.target.value)} className="input flex-1" placeholder="50000"/></div></div>
          <div className={row}><div><p className={lbl}>Daily Cap</p><p className={hint}>0 = unlimited</p></div><div className="md:col-span-2 flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{sym}</span><input type="number" value={dailyCap} onChange={e=>setDailyCap(e.target.value)} className="input flex-1" placeholder="0"/></div></div>
        </div>
      </div>

      {/* ADVANCED */}
      <div className="rounded-2xl border overflow-hidden mb-4" style={s}>
        <button onClick={()=>setAdvSection(p=>!p)} className="w-full flex items-center justify-between px-6 py-4" style={{background:"rgba(255,255,255,0.03)"}}>
          <p className="text-white font-black text-sm">Advanced Settings</p>
          <span className="text-xs text-slate-500">{advSection?"▲ Hide":"▼ Show"}</span>
        </button>
        {advSection&&<div className="px-6">
          <div className={row}><p className={lbl+" pt-1"}>Visibility</p><div className="md:col-span-2 grid grid-cols-3 gap-3">{[["Public","🌐","All publishers"],["Private","🔒","Invite only"],["Ask for Permission","🔐","Request access"]].map(([v,icon,desc])=><button key={v} onClick={()=>setVisibility(v)} type="button" className={`p-3 rounded-xl border text-left transition-all ${visibility===v?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5"}`}><div className="text-lg mb-1">{icon}</div><p className={`text-xs font-bold ${visibility===v?"text-orange-400":"text-white"}`}>{v}</p></button>)}</div></div>
          <div className={row}><p className={lbl+" pt-1"}>Terms</p><div className="md:col-span-2"><textarea value={terms} onChange={e=>setTerms(e.target.value)} className="input resize-none" rows={2} placeholder="Terms for publishers…"/><label className="flex items-center gap-2 mt-2 cursor-pointer"><input type="checkbox" checked={requireTerms} onChange={e=>setRequireTerms(e.target.checked)}/><span className="text-xs text-slate-400">Require publishers to accept</span></label></div></div>
        </div>}
      </div>

      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={saving} className="btn-primary px-6 py-3 text-sm disabled:opacity-50">{saving?"Creating…":"Create Campaign"}</button>
        <button onClick={()=>router.back()} className="btn-ghost px-6 py-3 text-sm">Cancel</button>
      </div>
    </div>
  );
}
