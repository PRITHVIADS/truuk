"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

const OBJECTIVES=["Conversions","Sales","App Installs","Leads","Impressions","Clicks"];
const TRAFFIC=["Social Media","Search","Email","Push Notification","Native","Display","SEO","Influencer","SMS"];
const CURRENCIES=["INR","USD","EUR","GBP","AED","SGD"];
const GEOS=["IN","US","GB","AE","AU","CA","SG","MY"];
const TOKENS=["{click_id}","{camp_id}","{pub_id}","{payout}","{geo}","{device}","{p1}","{p2}"];

export default function CreateCampaign() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [geoInput, setGeoInput] = useState("");
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
  const [type, setType] = useState("CPA");
  const [notes, setNotes] = useState("");
  const [objective, setObjective] = useState("Conversions");
  const [trafficChannels, setTrafficChannels] = useState([]);
  const [currency, setCurrency] = useState("INR");
  const [revenue, setRevenue] = useState("");
  const [geo, setGeo] = useState(["IN"]);
  const [payout, setPayout] = useState("");
  const [budget, setBudget] = useState("");
  const [dailyCap, setDailyCap] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [advSection, setAdvSection] = useState(false);

  const toggleChannel = (ch) => setTrafficChannels(p=>p.includes(ch)?p.filter(c=>c!==ch):[...p,ch]);
  const addGeo = (g) => { if(g&&g.length===2&&!geo.includes(g)){setGeo(p=>[...p,g]);} setGeoInput(""); };
  const removeGeo = (g) => setGeo(p=>p.filter(x=>x!==g));

  const handleSubmit = async () => {
    if(!name){setError("Campaign title is required");return;}
    if(!payout){setError("Payout is required");return;}
    setSaving(true);setError("");
    const r = await fetch("/api/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,description,kpi,objective,type,status,visibility,category,notes,landingUrl,previewUrl,terms,requireTerms,advertiser,trafficChannels,currency,geo:geo.join(","),payout:+payout,budget:+budget||999999,dailyCap:+dailyCap||0,revenue:+revenue||0})});
    const d = await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    router.push("/campaigns/manage");
  };

  const s = {background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  const row = "grid grid-cols-1 md:grid-cols-3 gap-3 items-start py-4 border-b border-white/5 last:border-0";

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

      <div className="rounded-2xl border overflow-hidden mb-4" style={s}>
        <div className="px-6 py-4 border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}><p className="text-white font-black text-sm">Details</p></div>
        <div className="px-6">
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Objective</p><div className="md:col-span-2 flex flex-wrap gap-2">{OBJECTIVES.map(o=><button key={o} onClick={()=>setObjective(o)} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${objective===o?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{o}</button>)}</div></div>
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Advertiser</p><div className="md:col-span-2"><input value={advertiser} onChange={e=>setAdvertiser(e.target.value)} className="input" placeholder="Advertiser name"/></div></div>
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Title <span className="text-orange-400">*</span></p><div className="md:col-span-2"><input value={name} onChange={e=>setName(e.target.value)} className="input" placeholder="Campaign title"/></div></div>
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Description</p><p className="text-xs text-slate-600">Optional</p></div><div className="md:col-span-2"><textarea value={description} onChange={e=>setDescription(e.target.value)} className="input resize-none" rows={4} placeholder="Describe the campaign…"/></div></div>
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">KPI</p><p className="text-xs text-slate-600">Optional</p></div><div className="md:col-span-2"><textarea value={kpi} onChange={e=>setKpi(e.target.value)} className="input resize-none" rows={3} placeholder="Key performance indicators…"/></div></div>
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Traffic Channels</p><div className="md:col-span-2 flex flex-wrap gap-2">{TRAFFIC.map(ch=><button key={ch} onClick={()=>toggleChannel(ch)} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${trafficChannels.includes(ch)?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{ch}</button>)}</div></div>
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Preview URL</p><div className="md:col-span-2"><input value={previewUrl} onChange={e=>setPreviewUrl(e.target.value)} className="input" placeholder="https://advertiser.com/preview"/></div></div>
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Campaign URL <span className="text-orange-400">*</span></p><p className="text-xs text-slate-600">With tracking tokens</p></div><div className="md:col-span-2"><input value={landingUrl} onChange={e=>setLandingUrl(e.target.value)} className="input mb-2" placeholder="https://advertiser.com/lp?click_id={click_id}"/><p className="text-xs text-slate-500 mb-1.5">Insert tokens:</p><div className="flex flex-wrap gap-1.5">{TOKENS.map(t=><button key={t} onClick={()=>setLandingUrl(p=>p+t)} type="button" className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-orange-400 font-mono transition-all">{t}</button>)}</div></div></div>
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Terms</p><div className="md:col-span-2"><textarea value={terms} onChange={e=>setTerms(e.target.value)} className="input resize-none" rows={2} placeholder="Terms for publishers…"/><label className="flex items-center gap-2 mt-2 cursor-pointer"><input type="checkbox" checked={requireTerms} onChange={e=>setRequireTerms(e.target.checked)}/><span className="text-xs text-slate-400">Require publishers to accept</span></label></div></div>
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Category / Status / Type</p><div className="md:col-span-2 grid grid-cols-3 gap-3"><input value={category} onChange={e=>setCategory(e.target.value)} className="input" placeholder="eCommerce…"/><select value={status} onChange={e=>setStatus(e.target.value)} className="select">{["Active","Paused","Draft"].map(s=><option key={s}>{s}</option>)}</select><select value={type} onChange={e=>setType(e.target.value)} className="select">{["CPA","CPC","CPL","CPS","CPM","CPI"].map(t=><option key={t}>{t}</option>)}</select></div></div>
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Notes</p><p className="text-xs text-slate-600">Internal only</p></div><div className="md:col-span-2"><textarea value={notes} onChange={e=>setNotes(e.target.value)} className="input resize-none" rows={2} placeholder="Internal notes…"/></div></div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden mb-4" style={s}>
        <div className="px-6 py-4 border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}><p className="text-white font-black text-sm">Revenue and Payout</p></div>
        <div className="px-6">
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Currency</p><div className="md:col-span-2 flex gap-2">{CURRENCIES.map(c=><button key={c} onClick={()=>setCurrency(c)} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${currency===c?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{c}</button>)}</div></div>
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Revenue <span className="text-orange-400">*</span></p><p className="text-xs text-slate-600">From advertiser</p></div><div className="md:col-span-2 flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{currency}</span><input type="number" value={revenue} onChange={e=>setRevenue(e.target.value)} className="input flex-1" placeholder="e.g. 150"/></div></div>
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Geo Coverage</p><div className="md:col-span-2"><div className="flex flex-wrap gap-2 mb-2">{geo.map(g=><span key={g} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">{g}<button onClick={()=>removeGeo(g)}><X size={10}/></button></span>)}</div><div className="flex gap-2 mb-2"><input value={geoInput} onChange={e=>setGeoInput(e.target.value.toUpperCase().slice(0,2))} onKeyDown={e=>{if(e.key==="Enter")addGeo(geoInput);}} className="input flex-1 text-xs" placeholder="Country code e.g. US" maxLength={2}/><button onClick={()=>addGeo(geoInput)} className="btn-primary px-3 py-2 text-xs"><Plus size={14}/></button></div><div className="flex flex-wrap gap-1.5">{GEOS.map(g=><button key={g} onClick={()=>addGeo(g)} type="button" className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all ${geo.includes(g)?"border-orange-500/30 bg-orange-500/10 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{g}</button>)}</div></div></div>
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Payout <span className="text-orange-400">*</span></p><p className="text-xs text-slate-600">Paid to publisher</p></div><div className="md:col-span-2 flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{currency}</span><input type="number" value={payout} onChange={e=>setPayout(e.target.value)} className="input flex-1" placeholder="e.g. 120"/></div></div>
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Budget</p><p className="text-xs text-slate-600">0 = unlimited</p></div><div className="md:col-span-2 flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{currency}</span><input type="number" value={budget} onChange={e=>setBudget(e.target.value)} className="input flex-1" placeholder="e.g. 50000"/></div></div>
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Daily Cap</p><p className="text-xs text-slate-600">0 = unlimited</p></div><div className="md:col-span-2 flex gap-2"><span className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">{currency}</span><input type="number" value={dailyCap} onChange={e=>setDailyCap(e.target.value)} className="input flex-1" placeholder="0"/></div></div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden mb-4" style={s}>
        <button onClick={()=>setAdvSection(p=>!p)} className="w-full flex items-center justify-between px-6 py-4" style={{background:"rgba(255,255,255,0.03)"}}>
          <p className="text-white font-black text-sm">Advanced Settings</p>
          <span className="text-xs text-slate-500">{advSection?"▲ Hide":"▼ Show"}</span>
        </button>
        {advSection&&<div className="px-6">
          <div className={row}><p className="text-sm text-slate-300 font-semibold pt-1">Visibility</p><div className="md:col-span-2 grid grid-cols-3 gap-3">{[["Public","🌐","All join instantly"],["Private","🔒","Invite only"],["Ask for Permission","🔐","Request access"]].map(([v,icon,desc])=><button key={v} onClick={()=>setVisibility(v)} type="button" className={`p-3 rounded-xl border text-left transition-all ${visibility===v?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5"}`}><div className="text-lg mb-1">{icon}</div><p className={`text-xs font-bold ${visibility===v?"text-orange-400":"text-white"}`}>{v}</p><p className="text-xs text-slate-500 mt-0.5">{desc}</p></button>)}</div></div>
        </div>}
      </div>

      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={saving} className="btn-primary px-6 py-3 text-sm disabled:opacity-50">{saving?"Creating…":"Create Campaign"}</button>
        <button onClick={()=>router.back()} className="btn-ghost px-6 py-3 text-sm">Cancel</button>
      </div>
    </div>
  );
}
