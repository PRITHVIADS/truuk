"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, Copy } from "lucide-react";
import { Badge, PageHeader, FilterTabs, EmptyState, Spinner, Modal } from "@/components/ui";

const TYPES=["CPA","CPC","CPL","CPS","CPM","CPI"];
const STATUSES=["Draft","Active","Paused","Archived"];
const VISIBILITIES=["Public","Approval Required","Private"];
const EMPTY={name:"",description:"",type:"CPA",payout:"",budget:"",dailyCap:"",geo:"IN",landingUrl:"",category:"",status:"Draft",visibility:"Public",notes:""};

export default function ManageCampaigns(){
  const [campaigns,setCampaigns]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  const load=async()=>{
    setLoading(true);
    const r=await fetch(`/api/campaigns${filter!=="All"?`?status=${filter}`:""}`);
    const d=await r.json();
    setCampaigns(d.campaigns||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[filter]);

  const filtered=campaigns.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const handleSave=async()=>{
    if(!form.name||!form.payout||!form.budget){setError("Name, payout and budget required");return;}
    setSaving(true);setError("");
    const url=modal==="edit"?`/api/campaigns/${selected._id}`:"/api/campaigns";
    const r=await fetch(url,{method:modal==="edit"?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,payout:+form.payout,budget:+form.budget,dailyCap:+form.dailyCap||0})});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    await load();setModal(null);setSaving(false);
  };

  const handleDelete=async(id)=>{if(!confirm("Delete?"))return;await fetch(`/api/campaigns/${id}`,{method:"DELETE"});await load();};
  const copyLink=(id)=>navigator.clipboard.writeText(`${window.location.origin}/api/clicks?cid=${id}&aid={{AFF_ID}}`);
  const fmt=(n)=>n>=1000?`${(n/1000).toFixed(1)}K`:String(n||0);

  return(
    <div className="space-y-6">
      <PageHeader title="Manage Campaigns" subtitle="View and manage all campaigns"
        action={<button onClick={()=>{setForm(EMPTY);setError("");setModal("create");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Create Campaign</button>}/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Total",campaigns.length,"#f97316"],["Active",campaigns.filter(c=>c.status==="Active").length,"#10b981"],["Paused",campaigns.filter(c=>c.status==="Paused").length,"#f59e0b"],["Draft",campaigns.filter(c=>c.status==="Draft").length,"#64748b"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-4" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p>
            <p className="text-3xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <FilterTabs options={["All","Active","Paused","Draft","Archived"]} value={filter} onChange={setFilter}/>
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search campaigns…" className="input pl-8 w-56 text-xs"/>
        </div>
      </div>

      {loading?<div className="flex justify-center py-20"><Spinner/></div>
      :filtered.length===0?<EmptyState icon="📣" title="No campaigns found" action={<button onClick={()=>{setForm(EMPTY);setModal("create");}} className="btn-primary px-4 py-2 text-sm">Create Campaign</button>}/>
      :<div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {["Campaign","Status","Visibility","Type","Payout","Clicks","Conv.","CR%","Budget Used","Actions"].map(h=>(
                <th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr></thead>
            <tbody>{filtered.map(c=>{
              const cr=c.clicks?((c.conversions/c.clicks)*100).toFixed(1):"0.0";
              return(
              <tr key={c._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all">
                <td className="py-3 px-4"><p className="text-sm text-white font-semibold">{c.name}</p><p className="text-xs text-slate-500">{c.geo}·{c.category}</p></td>
                <td className="py-3 px-4"><Badge status={c.status}/></td>
                <td className="py-3 px-4"><Badge status={c.visibility}/></td>
                <td className="py-3 px-4"><span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono text-slate-300">{c.type}</span></td>
                <td className="py-3 px-4 text-sm font-bold text-white">₹{c.payout}</td>
                <td className="py-3 px-4 text-sm text-slate-300">{fmt(c.clicks)}</td>
                <td className="py-3 px-4 text-sm text-slate-300">{fmt(c.conversions)}</td>
                <td className="py-3 px-4 text-sm text-orange-400 font-bold">{cr}%</td>
                <td className="py-3 px-4">
                  <div className="text-xs text-slate-400">₹{(c.spent||0).toLocaleString("en-IN")} / ₹{c.budget?.toLocaleString("en-IN")}</div>
                  <div className="mt-1 bg-white/5 rounded-full h-1"><div className="h-1 rounded-full bg-orange-500" style={{width:`${Math.min(100,((c.spent||0)/c.budget)*100)}%`}}/></div>
                </td>
                <td className="py-3 px-4"><div className="flex gap-1">
                  <button onClick={()=>{setSelected(c);setModal("view");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="View"><Eye size={14}/></button>
                  <button onClick={()=>copyLink(c._id)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-orange-400 transition-all" title="Copy tracking link"><Copy size={14}/></button>
                  <button onClick={()=>{setForm({...c});setSelected(c);setError("");setModal("edit");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="Edit"><Pencil size={14}/></button>
                  <button onClick={()=>handleDelete(c._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            )})}</tbody>
          </table>
        </div>
      </div>}

      {(modal==="create"||modal==="edit")&&(
        <Modal title={modal==="create"?"Create Campaign":"Edit Campaign"} onClose={()=>setModal(null)} size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="text-xs text-slate-400 font-semibold block mb-1.5">Campaign Name *</label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input" placeholder="e.g. Flipkart Summer Sale"/></div>
            <div className="sm:col-span-2"><label className="text-xs text-slate-400 font-semibold block mb-1.5">Description</label><textarea value={form.description} onChange={e=>f("description",e.target.value)} className="input resize-none" rows={2}/></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Pricing Type</label><select value={form.type} onChange={e=>f("type",e.target.value)} className="select">{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Status</label><select value={form.status} onChange={e=>f("status",e.target.value)} className="select">{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">Visibility</label>
              <select value={form.visibility} onChange={e=>f("visibility",e.target.value)} className="select">{VISIBILITIES.map(v=><option key={v}>{v}</option>)}</select>
              <p className="text-xs text-slate-600 mt-1">{form.visibility==="Public"?"All affiliates join instantly":form.visibility==="Approval Required"?"Affiliates request access":"Only via direct link"}</p>
            </div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Category</label><input value={form.category} onChange={e=>f("category",e.target.value)} className="input" placeholder="eCommerce, Finance…"/></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Payout (₹) *</label><input type="number" value={form.payout} onChange={e=>f("payout",e.target.value)} className="input" placeholder="120"/></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Budget (₹) *</label><input type="number" value={form.budget} onChange={e=>f("budget",e.target.value)} className="input" placeholder="50000"/></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Daily Cap (₹)</label><input type="number" value={form.dailyCap} onChange={e=>f("dailyCap",e.target.value)} className="input" placeholder="0 = unlimited"/></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Geo Targeting</label><input value={form.geo} onChange={e=>f("geo",e.target.value)} className="input" placeholder="IN, UAE, US"/></div>
            <div className="sm:col-span-2"><label className="text-xs text-slate-400 font-semibold block mb-1.5">Landing Page URL</label><input value={form.landingUrl} onChange={e=>f("landingUrl",e.target.value)} className="input" placeholder="https://advertiser.com/landing"/></div>
          </div>
          {error&&<p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{saving?"Saving…":modal==="create"?"Create Campaign":"Save Changes"}</button>
            <button onClick={()=>setModal(null)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </Modal>
      )}

      {modal==="view"&&selected&&(
        <Modal title={selected.name} onClose={()=>setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap"><Badge status={selected.status}/><Badge status={selected.visibility}/></div>
            {selected.description&&<p className="text-slate-400 text-sm">{selected.description}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[["Payout",`₹${selected.payout}`,"#f97316"],["Budget",`₹${selected.budget?.toLocaleString("en-IN")}`,"#3b82f6"],["Clicks",selected.clicks||0,"#10b981"],["Conv.",selected.conversions||0,"#a855f7"]].map(([l,v,c])=>(
                <div key={l} className="rounded-xl border p-3 text-center" style={{borderColor:"rgba(255,255,255,0.07)"}}><p className="text-xs text-slate-500 mb-1">{l}</p><p className="font-black text-xl" style={{color:c}}>{v}</p></div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold mb-2">TRACKING LINK</p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2.5">
                <code className="text-xs text-orange-400 font-mono flex-1 truncate">{typeof window!=="undefined"?window.location.origin:""}/api/clicks?cid={selected._id}&aid={"{{AFF_ID}}"}</code>
                <button onClick={()=>copyLink(selected._id)} className="text-xs btn-ghost px-2 py-1 rounded-lg flex-shrink-0">Copy</button>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold mb-2">POSTBACK URL (FOR ADVERTISER)</p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2.5">
                <code className="text-xs text-green-400 font-mono flex-1 truncate">{typeof window!=="undefined"?window.location.origin:""}/api/conversions?cid={selected._id}&aid={"{{AFF_ID}}"}&txid={"{{TXN_ID}}"}</code>
                <button onClick={()=>navigator.clipboard.writeText(`${typeof window!=="undefined"?window.location.origin:""}/api/conversions?cid=${selected._id}&aid={{AFF_ID}}&txid={{TXN_ID}}`)} className="text-xs btn-ghost px-2 py-1 rounded-lg flex-shrink-0">Copy</button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
