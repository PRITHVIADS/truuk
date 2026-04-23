"use client";
import { useEffect, useState } from "react";
import { PageHeader, Spinner } from "@/components/ui";
import { generateTrackingLink, generatePostbackUrl } from "@/lib/utils";

export default function SettingsPage() {
  const [user,setUser]=useState(null);
  const [form,setForm]=useState({name:"",company:"",phone:"",settings:{currency:"INR",timezone:"Asia/Kolkata",notifications:true}});
  const [pwForm,setPwForm]=useState({current:"",newPw:"",confirm:""});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/settings").then(r=>r.json()).then(d=>{
      if(d.user){setUser(d.user);setForm({name:d.user.name||"",company:d.user.company||"",phone:d.user.phone||"",settings:{...d.user.settings}});}
      setLoading(false);
    });
  },[]);

  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const fs=(k,v)=>setForm(p=>({...p,settings:{...p.settings,[k]:v}}));

  const handleSave=async()=>{
    setSaving(true);setMsg("");setError("");
    const r=await fetch("/api/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json();
    if(r.ok){setMsg("Settings saved successfully!");}else{setError(d.error||"Failed to save");}
    setSaving(false);
    setTimeout(()=>setMsg(""),3000);
  };

  if(loading) return <div className="flex justify-center py-20"><Spinner size={8}/></div>;

  const trackingBase=process.env.NEXT_PUBLIC_TRACKING_DOMAIN||"https://trk.yourdomain.io";

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" subtitle="Platform and account configuration"/>

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white font-black text-xl">
            {form.name?.[0]||"A"}
          </div>
          <div><p className="text-white font-black text-lg">{form.name||"Admin"}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className="text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-semibold capitalize">{user?.role}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Full Name</label>
            <input value={form.name} onChange={e=>f("name",e.target.value)} className="input"/></div>
          <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Company</label>
            <input value={form.company} onChange={e=>f("company",e.target.value)} className="input" placeholder="Your company name"/></div>
          <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Phone</label>
            <input value={form.phone} onChange={e=>f("phone",e.target.value)} className="input" placeholder="+91 …"/></div>
          <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Currency</label>
            <select value={form.settings?.currency} onChange={e=>fs("currency",e.target.value)} className="select">
              {["INR","USD","EUR","GBP","AED"].map(c=><option key={c}>{c}</option>)}
            </select></div>
          <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Timezone</label>
            <select value={form.settings?.timezone} onChange={e=>fs("timezone",e.target.value)} className="select">
              {["Asia/Kolkata","Asia/Dubai","America/New_York","Europe/London","UTC"].map(t=><option key={t}>{t}</option>)}
            </select></div>
          <div className="flex items-center gap-3 pt-4">
            <label className="text-sm text-slate-300 font-semibold">Email Notifications</label>
            <button onClick={()=>fs("notifications",!form.settings?.notifications)}
              className={`w-11 h-6 rounded-full transition-all relative ${form.settings?.notifications?"bg-orange-500":"bg-white/10"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.settings?.notifications?"left-6":"left-1"}`}/>
            </button>
          </div>
        </div>
        {msg&&<p className="text-green-400 text-sm mt-3">✓ {msg}</p>}
        {error&&<p className="text-red-400 text-sm mt-3">{error}</p>}
        <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5 text-sm mt-5 disabled:opacity-50">{saving?"Saving…":"Save Changes"}</button>
      </div>

      {/* Tracking Info */}
      <div className="card p-6">
        <p className="text-white font-black text-base mb-1">Tracking & Integration</p>
        <p className="text-slate-500 text-sm mb-5">Use these URLs in your campaigns and advertiser postbacks</p>
        <div className="space-y-4">
          {[
            ["Click Tracking URL",`${trackingBase}/c?cid={{CAMPAIGN_ID}}&aid={{AFF_ID}}&sub1={{SUB1}}`,"Share this with affiliates as their tracking link"],
            ["Postback / S2S URL",`${process.env.NEXTAUTH_URL||"http://localhost:3000"}/api/conversions?cid={{CAMPAIGN_ID}}&aid={{AFF_ID}}&txid={{TRANSACTION_ID}}`,"Give this to advertisers to fire on conversion"],
            ["Pixel URL",`${process.env.NEXTAUTH_URL||"http://localhost:3000"}/api/conversions?cid={{CAMPAIGN_ID}}&aid={{AFF_ID}}&txid={{TRANSACTION_ID}}`,"For browser-based pixel tracking"],
          ].map(([label,url,desc])=>(
            <div key={label}>
              <p className="text-sm text-slate-300 font-semibold mb-0.5">{label}</p>
              <p className="text-xs text-slate-500 mb-1.5">{desc}</p>
              <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl px-3 py-2">
                <code className="text-xs text-orange-400 font-mono flex-1 break-all">{url}</code>
                <button onClick={()=>navigator.clipboard.writeText(url)} className="text-xs btn-ghost px-2 py-1 flex-shrink-0">Copy</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Info */}
      <div className="card p-6">
        <p className="text-white font-black text-base mb-4">Platform Information</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[["Platform","Truuk v1.0"],["Stack","Next.js 14 + MongoDB"],["Auth","NextAuth JWT"],["Environment",process.env.NODE_ENV||"development"]].map(([k,v])=>(
            <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-white font-semibold">{v}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
