"use client";
import { useEffect, useState } from "react";
import { PageHeader, Spinner } from "@/components/ui";
import { Plus, X, Shield, EyeOff, Save } from "lucide-react";
const POPULAR=["facebook.com","instagram.com","telegram.org","whatsapp.com","twitter.com","x.com","tiktok.com","reddit.com","adsterra.com","propellerads.com"];
export default function CampaignSettings(){
  const [campaigns,setCampaigns]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [tab,setTab]=useState("referrer");
  const [newDomain,setNewDomain]=useState("");
  const [hideReferrer,setHideReferrer]=useState(false);
  const [blockedReferrers,setBlockedReferrers]=useState([]);
  const [blockMode,setBlockMode]=useState("302");
  const [blockRedirectUrl,setBlockRedirectUrl]=useState("https://google.com");
  const [name,setName]=useState("");
  const [status,setStatus]=useState("Active");
  const [payout,setPayout]=useState("");
  const [budget,setBudget]=useState("");
  const [dailyCap,setDailyCap]=useState("");
  const [visibility,setVisibility]=useState("Public");
  const [landingUrl,setLandingUrl]=useState("");
  useEffect(()=>{fetch("/api/campaigns").then(r=>r.json()).then(d=>{setCampaigns(d.campaigns||[]);setLoading(false);}).catch(()=>setLoading(false));},[]);
  const select=(c)=>{setSelected(c);setSaved(false);setHideReferrer(c.hideReferrer||false);setBlockedReferrers(c.blockedReferrers||[]);setBlockMode(c.blockMode||"302");setBlockRedirectUrl(c.blockRedirectUrl||"https://google.com");setName(c.name||"");setStatus(c.status||"Active");setPayout(c.payout||"");setBudget(c.budget||"");setDailyCap(c.dailyCap||"");setVisibility(c.visibility||"Public");setLandingUrl(c.landingUrl||"");};
  const addDomain=()=>{if(!newDomain.trim())return;const d=newDomain.trim().toLowerCase().replace(/https?:\/\//i,"").replace("www.","").split("/")[0];if(!blockedReferrers.includes(d))setBlockedReferrers(p=>[...p,d]);setNewDomain("");};
  const save=async()=>{if(!selected)return;setSaving(true);await fetch(`/api/campaigns/${selected._id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,status,payout:+payout,budget:+budget,dailyCap:+dailyCap,visibility,landingUrl,hideReferrer,blockedReferrers,blockMode,blockRedirectUrl})});setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),3000);setCampaigns(p=>p.map(c=>c._id===selected._id?{...c,name,status,hideReferrer,blockedReferrers,blockMode,blockRedirectUrl}:c));};
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  return(
    <div className="space-y-6">
      <PageHeader title="Campaign Settings" subtitle="Edit campaign configuration and referrer protection"/>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="px-4 py-3 border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}><p className="text-sm font-black text-white">Select Campaign</p></div>
          {loading?<div className="flex justify-center py-10"><Spinner/></div>:
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {campaigns.map(c=>(
              <button key={c._id} onClick={()=>select(c)} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${selected?._id===c._id?"bg-orange-500/10":"hover:bg-white/5"}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status==="Active"?"bg-green-400":"bg-slate-600"}`}/>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${selected?._id===c._id?"text-orange-400":"text-white"}`}>{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {c.shortId&&<code className="text-xs text-slate-500 font-mono">{c.shortId}</code>}
                    {c.hideReferrer&&<span className="text-xs text-purple-400">🔒 Hidden</span>}
                    {c.blockedReferrers?.length>0&&<span className="text-xs text-red-400">🚫 {c.blockedReferrers.length}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>}
        </div>
        <div className="lg:col-span-2">
          {!selected?<div className="rounded-2xl border p-12 text-center" style={card}><div className="text-5xl mb-4">👈</div><p className="text-slate-400 font-bold">Select a campaign to edit settings</p></div>:<>
            <div className="flex gap-2 mb-4">
              {[["referrer","🛡️ Referrer & Blocking"],["general","⚙️ General"]].map(([t,l])=>(
                <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===t?"bg-orange-500 text-white":"bg-white/5 text-slate-400 hover:text-white"}`}>{l}</button>
              ))}
            </div>
            {tab==="referrer"&&<div className="space-y-4">
              <div className="rounded-2xl border p-5" style={card}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <EyeOff size={18} className={hideReferrer?"text-purple-400":"text-slate-500"} style={{marginTop:2}}/>
                    <div>
                      <p className="text-white font-black">Hide Referrer from Advertiser</p>
                      <p className="text-xs text-slate-500 mt-1">Strips the Referer header — advertiser won't see traffic source</p>
                      {hideReferrer&&<p className="text-xs text-purple-400 mt-1">✅ Active on this campaign</p>}
                    </div>
                  </div>
                  <button onClick={()=>setHideReferrer(p=>!p)} type="button" className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ml-4 ${hideReferrer?"bg-purple-500":"bg-slate-700"}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hideReferrer?"left-7":"left-1"}`}/>
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border p-5 space-y-4" style={card}>
                <div className="flex items-center gap-2"><Shield size={16} className="text-red-400"/><p className="text-white font-black">Block Traffic Sources</p>{blockedReferrers.length>0&&<span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">{blockedReferrers.length} active</span>}</div>
                <div className="grid grid-cols-2 gap-3">
                  {[["302","🔀 302 Redirect","Send to another URL"],["200","⬛ 200 Blank Page","Empty page (invisible)"]].map(([val,label,desc])=>(
                    <button key={val} onClick={()=>setBlockMode(val)} type="button" className={`p-3 rounded-xl border text-left transition-all ${blockMode===val?"border-red-500 bg-red-500/10":"border-white/10 bg-white/5"}`}>
                      <p className={`text-xs font-black ${blockMode===val?"text-red-400":"text-white"}`}>{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
                {blockMode==="302"&&<div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Redirect blocked to:</label><input value={blockRedirectUrl} onChange={e=>setBlockRedirectUrl(e.target.value)} className="input text-sm" placeholder="https://google.com"/></div>}
                {blockedReferrers.length>0&&<div className="flex flex-wrap gap-2">{blockedReferrers.map(d=><span key={d} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">🚫 {d}<button onClick={()=>setBlockedReferrers(p=>p.filter(x=>x!==d))} type="button"><X size={11}/></button></span>)}</div>}
                <div className="flex gap-2"><input value={newDomain} onChange={e=>setNewDomain(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addDomain();}} className="input flex-1 text-sm" placeholder="e.g. facebook.com"/><button onClick={addDomain} type="button" className="btn-primary px-3 py-2 text-xs flex items-center gap-1"><Plus size={14}/>Add</button></div>
                <div><p className="text-xs text-slate-500 mb-2">Quick add:</p><div className="flex flex-wrap gap-1.5">{POPULAR.filter(d=>!blockedReferrers.includes(d)).map(d=><button key={d} onClick={()=>setBlockedReferrers(p=>[...p,d])} type="button" className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all">+ {d}</button>)}</div></div>
              </div>
            </div>}
            {tab==="general"&&<div className="rounded-2xl border p-5 space-y-4" style={card}>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Campaign Name</label><input value={name} onChange={e=>setName(e.target.value)} className="input"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Status</label><select value={status} onChange={e=>setStatus(e.target.value)} className="select">{["Active","Paused","Draft","Archived"].map(s=><option key={s}>{s}</option>)}</select></div>
                <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Visibility</label><select value={visibility} onChange={e=>setVisibility(e.target.value)} className="select">{["Public","Private","Ask for Permission"].map(v=><option key={v}>{v}</option>)}</select></div>
                <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Payout</label><input type="number" value={payout} onChange={e=>setPayout(e.target.value)} className="input"/></div>
                <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Budget</label><input type="number" value={budget} onChange={e=>setBudget(e.target.value)} className="input"/></div>
                <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Daily Cap</label><input type="number" value={dailyCap} onChange={e=>setDailyCap(e.target.value)} className="input" placeholder="0=unlimited"/></div>
              </div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Landing URL</label><textarea value={landingUrl} onChange={e=>setLandingUrl(e.target.value)} className="input resize-none" rows={2}/></div>
            </div>}
            <button onClick={save} disabled={saving} className={`mt-4 w-full flex items-center justify-center gap-2 btn-primary px-6 py-3 text-sm ${saved?"!bg-green-500":""}`}>
              <Save size={16}/>{saving?"Saving…":saved?"✓ Saved!":"Save Settings"}
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}
