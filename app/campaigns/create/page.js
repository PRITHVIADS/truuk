"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Search } from "lucide-react";

export default function CreateCampaign(){
  const router=useRouter();
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [geoInput,setGeoInput]=useState("");
  const [activeMG,setActiveMG]=useState("Most Used");
  const [advertisers,setAdvertisers]=useState([]);
  const [advLoading,setAdvLoading]=useState(true);
  const [advSearch,setAdvSearch]=useState("");
  const [advOpen,setAdvOpen]=useState(false);
  const [selectedAdv,setSelectedAdv]=useState(null);
  const advRef=useRef(null);
  const [objective,setObjective]=useState("Conversions");
  const [name,setName]=useState("");
  const [description,setDescription]=useState("");
  const [landingUrl,setLandingUrl]=useState("");
  const [category,setCategory]=useState("");
  const [status,setStatus]=useState("Active");
  const [trafficChannels,setTrafficChannels]=useState([]);
  const [currency,setCurrency]=useState("INR");
  const [geo,setGeo]=useState(["ALL"]);
  const [budget,setBudget]=useState("");
  const [flatPayout,setFlatPayout]=useState("");
  const [flatRevenue,setFlatRevenue]=useState("");
  const [saleCommissionPct,setSaleCommissionPct]=useState("");
  const [saleRevenuePct,setSaleRevenuePct]=useState("");
  const [visibility,setVisibility]=useState("Public");

  useEffect(()=>{
    fetch("/api/advertisers").then(r=>r.json()).then(d=>{setAdvertisers(d.advertisers||[]);setAdvLoading(false);}).catch(()=>setAdvLoading(false));
  },[]);

  useEffect(()=>{
    const fn=(e)=>{if(advRef.current&&!advRef.current.contains(e.target))setAdvOpen(false);};
    document.addEventListener("mousedown",fn);
    return()=>document.removeEventListener("mousedown",fn);
  },[]);

  const filteredAdvs=advertisers.filter(a=>(a.name+a.email+(a.company||"")).toLowerCase().includes(advSearch.toLowerCase()));
  const TRAFFIC=["Social Media","Search","Email","Push Notification","Display","SEO","Influencer","SMS"];
  const CURRENCIES=[{code:"INR",s:"₹"},{code:"USD",s:"$"},{code:"EUR",s:"€"},{code:"GBP",s:"£"},{code:"AED",s:"AED"}];
  const MACROS=["{click_id}","{publisher_id}","{camp_id}","{source}","{p1}","{p2}","{device}","{country_id}","{gaid}","{idfa}","{fbclid}","{gclid}","{sale_amount}","{random}"];
  const sym=CURRENCIES.find(c=>c.code===currency)?.s||currency;
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  const row="grid grid-cols-1 md:grid-cols-3 gap-4 items-start py-4 border-b border-white/5 last:border-0";

  const addGeo=(g)=>{const v=g.toUpperCase().trim();if(!v)return;if(v==="ALL"){setGeo(["ALL"]);setGeoInput("");return;}setGeo(p=>p.includes("ALL")?[v]:p.includes(v)?p:[...p,v]);setGeoInput("");};
  const removeGeo=(g)=>{const n=geo.filter(x=>x!==g);setGeo(n.length===0?["ALL"]:n);};

  const handleSubmit=async()=>{
    if(!name){setError("Title required");return;}
    if(!selectedAdv){setError("Select an advertiser");return;}
    if(objective==="Conversions"&&!flatPayout){setError("Payout required");return;}
    if(objective==="Sale"&&!saleCommissionPct){setError("Commission % required");return;}
    setSaving(true);setError("");
    const r=await fetch("/api/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,description,objective,status,visibility,category,landingUrl,advertiser:selectedAdv._id,advertiserName:selectedAdv.company||selectedAdv.name,trafficChannels,currency,geo:geo.includes("ALL")?"ALL":geo.join(","),budget:+budget||999999,payoutType:objective==="Conversions"?"flat":"percentage",payout:objective==="Conversions"?+flatPayout:+saleCommissionPct,revenue:objective==="Conversions"?+flatRevenue||0:+saleRevenuePct||0,...(objective==="Sale"&&{saleCommissionPct:+saleCommissionPct,saleRevenuePct:+saleRevenuePct||0})})});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    router.push("/campaigns/manage");
  };

  return(
    <div className="max-w-4xl pb-10">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-2xl font-black text-white">Create Campaign</h1><p className="text-slate-500 text-sm">Set up a new performance campaign</p></div>
        <div className="flex gap-3"><button onClick={()=>router.back()} className="btn-ghost px-4 py-2 text-sm">Back</button><button onClick={handleSubmit} disabled={saving} className="btn-primary px-5 py-2.5 text-sm">{saving?"Creating…":"Create"}</button></div>
      </div>
      {error&&<div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}

      <div className="rounded-2xl border overflow-hidden mb-4" style={card}>
        <div className="px-6 py-4 border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}><p className="text-white font-black">Details</p></div>
        <div className="px-6">

          <div className={row}>
            <p className="text-sm text-slate-300 font-semibold">Objective</p>
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              {[["Conversions","🎯","Flat payout per conversion"],["Sale","💰","% of tracked sale amount"]].map(([obj,icon,desc])=>(
                <button key={obj} onClick={()=>setObjective(obj)} type="button" className={`p-4 rounded-xl border text-left transition-all ${objective===obj?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5"}`}>
                  <div className="flex items-center gap-2 mb-1"><span className="text-xl">{icon}</span><span className={`font-black text-sm ${objective===obj?"text-orange-400":"text-white"}`}>{obj}</span></div>
                  <p className="text-xs text-slate-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className={row}>
            <div><p className="text-sm text-slate-300 font-semibold">Advertiser <span className="text-red-400">*</span></p><p className="text-xs text-slate-600 mt-0.5">Select from database</p></div>
            <div className="md:col-span-2" ref={advRef}>
              {selectedAdv?(
                <div className="input flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">{selectedAdv.name[0]}</div>
                    <div><p className="text-sm text-white font-semibold">{selectedAdv.company||selectedAdv.name}</p><p className="text-xs text-slate-500">{selectedAdv.email}</p></div>
                  </div>
                  <button type="button" onClick={()=>{setSelectedAdv(null);setAdvSearch("");}} className="text-slate-500 hover:text-red-400 p-1"><X size={14}/></button>
                </div>
              ):(
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
                  <input value={advSearch} onChange={e=>{setAdvSearch(e.target.value);setAdvOpen(true);}} onFocus={()=>setAdvOpen(true)} className="input pl-8" placeholder="Search advertiser by name, company or email…" autoComplete="off"/>
                  {advOpen&&(
                    <div className="absolute z-50 w-full mt-1 rounded-xl border overflow-hidden shadow-2xl" style={{background:"#0a0f1a",borderColor:"rgba(255,255,255,0.1)"}}>
                      {advLoading?(
                        <div className="p-6 text-center text-slate-500 text-sm">Loading advertisers…</div>
                      ):filteredAdvs.length===0?(
                        <div className="p-6 text-center">
                          <p className="text-slate-400 text-sm">{advertisers.length===0?"No advertisers yet — add one first":"No match found"}</p>
                          {advertisers.length===0&&<button type="button" onClick={()=>router.push("/advertisers/manage")} className="mt-2 text-xs text-orange-400">+ Add Advertiser →</button>}
                        </div>
                      ):(
                        <div className="max-h-56 overflow-y-auto">
                          {filteredAdvs.map(a=>(
                            <button key={a._id} type="button" onClick={()=>{setSelectedAdv(a);setAdvOpen(false);setAdvSearch("");}}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">{a.name[0]}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold">{a.company||a.name}</p>
                                <p className="text-slate-500 text-xs">{a.name} · {a.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="px-4 py-2 border-t border-white/5 flex justify-between items-center" style={{background:"rgba(0,0,0,0.4)"}}>
                        <span className="text-xs text-slate-600">{advertisers.length} advertiser(s)</span>
                        <button type="button" onClick={()=>router.push("/advertisers/manage")} className="text-xs text-orange-400">+ Add New</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {selectedAdv&&<div className="mt-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 grid grid-cols-3 gap-2 text-center">
                {[["Company",selectedAdv.company||"—"],["Email",selectedAdv.email],["Phone",selectedAdv.phone||"—"]].map(([k,v])=>(
                  <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-xs text-white font-semibold truncate">{v}</p></div>
                ))}
              </div>}
            </div>
          </div>

          <div className={row}><p className="text-sm text-slate-300 font-semibold">Title <span className="text-red-400">*</span></p><div className="md:col-span-2"><input value={name} onChange={e=>setName(e.target.value)} className="input" placeholder="Campaign title"/></div></div>
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Description</p><p className="text-xs text-slate-600 mt-0.5">Optional</p></div><div className="md:col-span-2"><textarea value={description} onChange={e=>setDescription(e.target.value)} className="input resize-none" rows={3} placeholder="Describe campaign for publishers…"/></div></div>
          <div className={row}><p className="text-sm text-slate-300 font-semibold">Traffic Channels</p><div className="md:col-span-2 flex flex-wrap gap-2">{TRAFFIC.map(ch=><button key={ch} onClick={()=>setTrafficChannels(p=>p.includes(ch)?p.filter(c=>c!==ch):[...p,ch])} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${trafficChannels.includes(ch)?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400"}`}>{ch}</button>)}</div></div>
          <div className={row}>
            <div><p className="text-sm text-slate-300 font-semibold">Campaign URL <span className="text-red-400">*</span></p><p className="text-xs text-slate-600 mt-0.5">Macros replaced on click</p></div>
            <div className="md:col-span-2">
              <textarea value={landingUrl} onChange={e=>setLandingUrl(e.target.value)} className="input resize-none mb-2" rows={2} placeholder="https://advertiser.com/lp?utm_source={click_id}&pub={publisher_id}"/>
              <div className="flex flex-wrap gap-1.5 mb-2">{MACROS.map(t=><button key={t} onClick={()=>setLandingUrl(p=>p+t)} type="button" className="px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono hover:bg-orange-500/20 transition-all">{t}</button>)}</div>
              <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5"><p className="text-xs text-blue-400 font-bold mb-1">📬 Postback URL for Advertiser</p><code className="text-xs text-slate-300 break-all">{typeof window!=="undefined"?window.location.origin:"https://truuk.vercel.app"}/api/conversions?cid=CAMP_ID&aid={"{publisher_id}"}&txid={"{txn_id}"}{objective==="Sale"?"&sale_amount={sale_amount}":""}</code></div>
            </div>
          </div>
          <div className={row}><p className="text-sm text-slate-300 font-semibold">Category / Status</p><div className="md:col-span-2 grid grid-cols-2 gap-3"><input value={category} onChange={e=>setCategory(e.target.value)} className="input" placeholder="eCommerce, Finance…"/><select value={status} onChange={e=>setStatus(e.target.value)} className="select">{["Active","Paused","Draft"].map(s=><option key={s}>{s}</option>)}</select></div></div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden mb-4" style={card}>
        <div className="px-6 py-4 border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}><p className="text-white font-black">Revenue and Payout</p></div>
        <div className="px-6">
          <div className={row}><p className="text-sm text-slate-300 font-semibold">Currency</p><div className="md:col-span-2"><select value={currency} onChange={e=>setCurrency(e.target.value)} className="select">{CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.s} {c.code}</option>)}</select></div></div>
          {objective==="Conversions"&&<>
            <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Revenue <span className="text-red-400">*</span></p><p className="text-xs text-slate-600 mt-0.5">Charged from advertiser</p></div><div className="md:col-span-2"><div className="flex"><span className="flex items-center px-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-sm text-slate-400">{currency}</span><input type="number" value={flatRevenue} onChange={e=>setFlatRevenue(e.target.value)} className="input rounded-l-none flex-1" placeholder="e.g. 150"/></div></div></div>
            <div className={row}><p className="text-sm text-slate-300 font-semibold">Geo Coverage</p><div className="md:col-span-2"><div className="flex flex-wrap gap-2 mb-2">{geo.map(g=><span key={g} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">{g}<button onClick={()=>removeGeo(g)} type="button"><X size={10}/></button></span>)}</div><div className="flex gap-2 mb-2"><input value={geoInput} onChange={e=>setGeoInput(e.target.value.toUpperCase().slice(0,3))} onKeyDown={e=>{if(e.key==="Enter")addGeo(geoInput);}} className="input flex-1 text-xs" placeholder="Country code e.g. IN"/><button onClick={()=>addGeo(geoInput)} type="button" className="btn-primary px-3 py-2 text-xs"><Plus size={14}/></button></div><div className="flex flex-wrap gap-1.5">{["ALL","IN","US","GB","AE","AU","CA","SG","MY"].map(g=><button key={g} onClick={()=>addGeo(g)} type="button" className={`px-2 py-1 rounded-lg border text-xs font-bold ${geo.includes(g)?"border-blue-500/30 bg-blue-500/10 text-blue-400":"border-white/10 bg-white/5 text-slate-400"}`}>{g}</button>)}</div></div></div>
            <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Payout <span className="text-red-400">*</span></p><p className="text-xs text-slate-600 mt-0.5">Pay to publisher</p></div><div className="md:col-span-2"><div className="flex"><span className="flex items-center px-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-sm text-slate-400">{currency}</span><input type="number" value={flatPayout} onChange={e=>setFlatPayout(e.target.value)} className="input rounded-l-none flex-1" placeholder="e.g. 120"/></div>{flatRevenue&&flatPayout&&<p className="text-xs text-green-400 mt-1">✓ Margin: {sym}{(+flatRevenue - +flatPayout).toFixed(2)}</p>}</div></div>
          </>}
          {objective==="Sale"&&<>
            <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Revenue % <span className="text-red-400">*</span></p><p className="text-xs text-slate-600 mt-0.5">% charged to advertiser</p></div><div className="md:col-span-2 flex gap-2 items-center"><input type="number" value={saleRevenuePct} onChange={e=>setSaleRevenuePct(e.target.value)} className="input flex-1" placeholder="e.g. 15"/><span className="text-slate-400 font-bold text-xl">%</span></div></div>
            <div className={row}><p className="text-sm text-slate-300 font-semibold">Geo Coverage</p><div className="md:col-span-2"><div className="flex flex-wrap gap-2 mb-2">{geo.map(g=><span key={g} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">{g}<button onClick={()=>removeGeo(g)} type="button"><X size={10}/></button></span>)}</div><div className="flex gap-2 mb-2"><input value={geoInput} onChange={e=>setGeoInput(e.target.value.toUpperCase().slice(0,3))} onKeyDown={e=>{if(e.key==="Enter")addGeo(geoInput);}} className="input flex-1 text-xs" placeholder="Country code"/><button onClick={()=>addGeo(geoInput)} type="button" className="btn-primary px-3 py-2 text-xs"><Plus size={14}/></button></div><div className="flex flex-wrap gap-1.5">{["ALL","IN","US","GB","AE","AU","CA","SG"].map(g=><button key={g} onClick={()=>addGeo(g)} type="button" className={`px-2 py-1 rounded-lg border text-xs font-bold ${geo.includes(g)?"border-blue-500/30 bg-blue-500/10 text-blue-400":"border-white/10 bg-white/5 text-slate-400"}`}>{g}</button>)}</div></div></div>
            <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Commission % <span className="text-red-400">*</span></p><p className="text-xs text-slate-600 mt-0.5">% paid to publisher</p></div><div className="md:col-span-2 flex gap-2 items-center"><input type="number" value={saleCommissionPct} onChange={e=>setSaleCommissionPct(e.target.value)} className="input flex-1" placeholder="e.g. 10"/><span className="text-slate-400 font-bold text-xl">%</span></div></div>
            {saleCommissionPct&&<div className="py-4"><div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4"><p className="text-orange-400 font-bold text-xs mb-3">💡 PAYOUT CALCULATOR</p><div className="grid grid-cols-3 gap-2">{[1000,5000,10000,25000,50000,100000].map(sale=>{const pay=(sale*(+saleCommissionPct/100));return(<div key={sale} className="bg-black/20 rounded-lg p-2 text-center"><p className="text-xs text-slate-500">{sym}{sale.toLocaleString("en-IN")}</p><p className="text-sm font-black text-orange-400">{sym}{pay.toFixed(0)}</p></div>);})}</div></div></div>}
          </>}
          <div className={row}><div><p className="text-sm text-slate-300 font-semibold">Budget</p><p className="text-xs text-slate-600 mt-0.5">0=unlimited</p></div><div className="md:col-span-2 flex"><span className="flex items-center px-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-sm text-slate-400">{currency}</span><input type="number" value={budget} onChange={e=>setBudget(e.target.value)} className="input rounded-l-none flex-1" placeholder="e.g. 50000"/></div></div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden mb-4" style={card}>
        <div className="px-6 py-4 border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}><p className="text-white font-black">Advanced</p></div>
        <div className="px-6">
          <div className={row}><p className="text-sm text-slate-300 font-semibold">Visibility</p><div className="md:col-span-2 grid grid-cols-3 gap-3">{[["Public","🌐","All publishers"],["Private","🔒","Invite only"],["Ask for Permission","🔐","Request access"]].map(([v,icon,desc])=><button key={v} onClick={()=>setVisibility(v)} type="button" className={`p-3 rounded-xl border text-left transition-all ${visibility===v?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5"}`}><div className="text-lg mb-1">{icon}</div><p className={`text-xs font-bold ${visibility===v?"text-orange-400":"text-white"}`}>{v}</p><p className="text-xs text-slate-500 mt-0.5">{desc}</p></button>)}</div></div>
        </div>
      </div>

      <div className="flex gap-3"><button onClick={handleSubmit} disabled={saving} className="btn-primary px-6 py-3 text-sm">{saving?"Creating…":"✓ Create Campaign"}</button><button onClick={()=>router.back()} className="btn-ghost px-6 py-3 text-sm">Cancel</button></div>
    </div>
  );
}
