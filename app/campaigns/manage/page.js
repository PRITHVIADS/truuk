"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge, PageHeader, FilterTabs, EmptyState, Spinner, Modal } from "@/components/ui";

export default function ManageCampaigns(){
  const router = useRouter();
  const [campaigns,setCampaigns]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [saving,setSaving]=useState(false);
  const [copied,setCopied]=useState("");

  const load=async()=>{
    setLoading(true);
    const r=await fetch(`/api/campaigns${filter!=="All"?`?status=${filter}`:""}`);
    const d=await r.json();
    setCampaigns(d.campaigns||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[filter]);

  const handleDelete=async(id)=>{if(!confirm("Delete campaign?"))return;await fetch(`/api/campaigns/${id}`,{method:"DELETE"});await load();};
  const copyLink=(c)=>{
    const url=`${window.location.origin}/api/clicks?cid=${c._id}&aid=PUBLISHER_ID`;
    navigator.clipboard.writeText(url);
    setCopied(c._id);
    setTimeout(()=>setCopied(""),2000);
  };
  const fmt=(n)=>n>=1000?`${(n/1000).toFixed(1)}K`:String(n||0);
  const filtered=campaigns.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));

  return(
    <div className="space-y-5">
      <PageHeader title="Manage Campaigns" subtitle="View and manage all campaigns"
        action={<a href="/campaigns/create" className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Create Campaign</a>}/>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Total",campaigns.length,"#f97316"],["Active",campaigns.filter(c=>c.status==="Active").length,"#10b981"],["Paused",campaigns.filter(c=>c.status==="Paused").length,"#f59e0b"],["Draft",campaigns.filter(c=>c.status==="Draft").length,"#64748b"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-4" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p>
            <p className="text-3xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <FilterTabs options={["All","Active","Paused","Draft","Archived"]} value={filter} onChange={setFilter}/>
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search campaigns…" className="input pl-8 w-56 text-xs"/>
        </div>
      </div>

      {/* List */}
      {loading?<div className="flex justify-center py-20"><Spinner/></div>:
      filtered.length===0?<EmptyState icon="📣" title="No campaigns found" action={<a href="/campaigns/create" className="btn-primary px-4 py-2 text-sm">Create Campaign</a>}/>:
      <div className="space-y-3">
        {filtered.map(c=>{
          const cr=c.clicks?((c.conversions/c.clicks)*100).toFixed(1):"0.0";
          const budgetPct=Math.min(100,((c.spent||0)/(c.budget||1))*100);
          return(
            <div key={c._id} className="rounded-2xl border p-4 hover:bg-white/[0.02] transition-all" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
              <div className="flex items-start gap-4">
                {/* Left - campaign info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white font-bold text-sm">{c.name}</p>
                    <Badge status={c.status}/>
                    <Badge status={c.visibility}/>
                    {c.shortId&&<code className="text-xs text-slate-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">{c.shortId}</code>}
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{c.category||"—"} · {c.objective||"Conversions"} · {c.currency||"INR"}</p>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {[["Payout",`₹${c.payout||0}`,"#f97316"],["Clicks",fmt(c.clicks),"#3b82f6"],["Conv.",fmt(c.conversions),"#10b981"],["CR%",`${cr}%`,"#a855f7"]].map(([l,v,col])=>(
                      <div key={l} className="bg-white/5 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-slate-500 mb-1">{l}</p>
                        <p className="text-sm font-black" style={{color:col}}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Budget bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Budget used</span>
                      <span>₹{(c.spent||0).toLocaleString("en-IN")} / ₹{(c.budget||0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full"><div className="h-1.5 rounded-full bg-orange-500 transition-all" style={{width:`${budgetPct}%`}}/></div>
                  </div>
                </div>

                {/* Right - actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={()=>router.push(`/campaigns/create?edit=${c._id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-all">
                    <Pencil size={12}/>Edit
                  </button>
                  <button onClick={()=>copyLink(c)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${copied===c._id?"bg-green-500/15 text-green-400":"bg-white/5 hover:bg-orange-500/10 text-slate-400 hover:text-orange-400"}`}>
                    <Copy size={12}/>{copied===c._id?"Copied!":"Copy Link"}
                  </button>
                  <button onClick={()=>{setSelected(c);setModal("view");}}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-all">
                    <Eye size={12}/>View
                  </button>
                  <button onClick={()=>handleDelete(c._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 text-xs transition-all">
                    <Trash2 size={12}/>Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>}

      {/* View Modal */}
      {modal==="view"&&selected&&(
        <Modal title={selected.name} onClose={()=>setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap"><Badge status={selected.status}/><Badge status={selected.visibility}/></div>
            {selected.description&&<p className="text-slate-400 text-sm">{selected.description}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[["Payout",`₹${selected.payout}`,"#f97316"],["Budget",`₹${(selected.budget||0).toLocaleString("en-IN")}`,"#3b82f6"],["Clicks",selected.clicks||0,"#10b981"],["Conv.",selected.conversions||0,"#a855f7"]].map(([l,v,c])=>(
                <div key={l} className="rounded-xl border p-3 text-center" style={{borderColor:"rgba(255,255,255,0.07)"}}><p className="text-xs text-slate-500 mb-1">{l}</p><p className="font-black text-xl" style={{color:c}}>{v}</p></div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold mb-2">TRACKING LINK</p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2.5">
                <code className="text-xs text-orange-400 font-mono flex-1 break-all">{typeof window!=="undefined"?window.location.origin:""}/api/clicks?cid={selected._id}&aid=PUBLISHER_ID</code>
                <button onClick={()=>copyLink(selected)} className="text-xs btn-ghost px-2 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">{copied===selected._id?"✓":"Copy"}</button>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold mb-2">POSTBACK URL</p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2.5">
                <code className="text-xs text-green-400 font-mono flex-1 break-all">{typeof window!=="undefined"?window.location.origin:""}/api/conversions?cid={selected._id}&aid=PUBLISHER_ID&txid=TXN_ID{selected.objective==="Sale"?"&sale_amount=AMOUNT":""}</code>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
