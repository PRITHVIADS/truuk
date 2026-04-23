"use client";
import { useEffect, useState } from "react";
import { Search, Globe, Lock, UserCheck, ExternalLink, CheckCircle, Clock, XCircle } from "lucide-react";
import { PageHeader, Spinner, EmptyState, Modal } from "@/components/ui";

const VIS_ICON = { Public: Globe, Private: Lock, "Approval Required": UserCheck };
const VIS_COLOR = { Public:"text-green-400 bg-green-500/10 border-green-500/20", Private:"text-purple-400 bg-purple-500/10 border-purple-500/20", "Approval Required":"text-amber-400 bg-amber-500/10 border-amber-500/20" };
const APP_STATUS = { Approved:{ icon:CheckCircle, color:"text-green-400", label:"Joined" }, Pending:{ icon:Clock, color:"text-amber-400", label:"Pending" }, Rejected:{ icon:XCircle, color:"text-red-400", label:"Rejected" } };

export default function MarketplacePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [appliedMsg, setAppliedMsg] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/marketplace");
    const d = await r.json();
    setCampaigns(d.campaigns || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = campaigns.filter(c =>
    (typeFilter === "All" || c.type === typeFilter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || (c.description||"").toLowerCase().includes(search.toLowerCase()))
  );

  const handleApply = async () => {
    if (!selected) return;
    setApplying(true);
    const r = await fetch("/api/campaigns/apply", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ campaignId: selected._id, message }) });
    const d = await r.json();
    if (r.ok) {
      setAppliedMsg(d.autoApproved ? "✅ Joined! Your tracking link is ready." : "⏳ Request sent! Waiting for approval.");
      await load();
      setTimeout(() => { setModal(null); setAppliedMsg(""); setMessage(""); }, 2000);
    }
    setApplying(false);
  };

  const TYPES = ["All", "CPA", "CPC", "CPL", "CPS", "CPM"];

  return (
    <div className="space-y-6">
      <PageHeader title="Campaign Marketplace" subtitle="Browse and join available campaigns"/>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search campaigns…" className="input pl-8 text-xs"/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TYPES.map(t=>(
            <button key={t} onClick={()=>setTypeFilter(t)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${typeFilter===t?"bg-orange-500 text-white":"bg-white/5 text-slate-400 hover:text-white"}`}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size={8}/></div>
      : filtered.length === 0 ? <EmptyState icon="🛍️" title="No campaigns available" subtitle="Check back later for new opportunities"/>
      : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const VisIcon = VIS_ICON[c.visibility] || Globe;
          const appInfo = c.applicationStatus ? APP_STATUS[c.applicationStatus] : null;
          const AppIcon = appInfo?.icon;
          return (
            <div key={c._id} className="card p-5 flex flex-col hover:bg-white/5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.createdBy?.company || c.createdBy?.name || "Advertiser"}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 flex-shrink-0 ml-2 ${VIS_COLOR[c.visibility]}`}>
                  <VisIcon size={10}/>{c.visibility}
                </span>
              </div>

              {c.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{c.description}</p>}

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[["Payout",`₹${c.payout}`,"#f97316"],["Type",c.type,"#3b82f6"],["Geo",c.geo||"IN","#10b981"]].map(([l,v,col])=>(
                  <div key={l} className="bg-black/20 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">{l}</p>
                    <p className="text-sm font-bold mt-0.5" style={{color:col}}>{v}</p>
                  </div>
                ))}
              </div>

              {c.category && <span className="text-xs bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full self-start mb-3">{c.category}</span>}

              <div className="mt-auto">
                {appInfo ? (
                  <div className={`flex items-center gap-2 text-sm font-bold ${appInfo.color}`}>
                    <AppIcon size={16}/>{appInfo.label}
                    {c.applicationStatus === "Approved" && (
                      <button onClick={()=>{setSelected(c);setModal("link");}} className="ml-auto text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-lg hover:bg-orange-500/25 transition-all">Get Link</button>
                    )}
                  </div>
                ) : (
                  <button onClick={()=>{setSelected(c);setModal("apply");setMessage("");setAppliedMsg("");}}
                    className="btn-primary w-full py-2 text-sm">
                    {c.visibility === "Public" ? "Join Now" : "Request to Join"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>}

      {modal === "apply" && selected && (
        <Modal title={`Join: ${selected.name}`} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <div className="card p-4 space-y-2">
              {[["Type",selected.type],["Payout",`₹${selected.payout}`],["Geo",selected.geo||"IN"],["Visibility",selected.visibility]].map(([k,v])=>(
                <div key={k} className="flex justify-between text-sm"><span className="text-slate-400">{k}</span><span className="text-white font-semibold">{v}</span></div>
              ))}
            </div>
            {selected.visibility === "Approval Required" && (
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Message to Advertiser (optional)</label>
                <textarea value={message} onChange={e=>setMessage(e.target.value)} className="input resize-none" rows={3} placeholder="Introduce yourself and explain why you'd like to join this campaign…"/>
              </div>
            )}
            {appliedMsg && <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm">{appliedMsg}</div>}
            {!appliedMsg && (
              <div className="flex gap-3">
                <button onClick={handleApply} disabled={applying} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50 flex-1">
                  {applying ? "Processing…" : selected.visibility === "Public" ? "Join Campaign" : "Send Request"}
                </button>
                <button onClick={()=>setModal(null)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {modal === "link" && selected && (
        <Modal title="Your Tracking Link" onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Use this link to promote <strong className="text-white">{selected.name}</strong>. Every click will be tracked to your account.</p>
            <div>
              <p className="text-xs text-slate-500 mb-1.5 font-semibold">Your Tracking Link</p>
              <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl px-3 py-2">
                <code className="text-xs text-orange-400 font-mono flex-1 break-all">
                  {`${process.env.NEXT_PUBLIC_TRACKING_DOMAIN||"http://localhost:3000"}/api/clicks?cid=${selected._id}&aid=YOUR_ID`}
                </code>
                <button onClick={()=>navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_TRACKING_DOMAIN||"http://localhost:3000"}/api/clicks?cid=${selected._id}&aid=YOUR_ID`)}
                  className="text-xs btn-ghost px-2 py-1 flex-shrink-0">Copy</button>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5 font-semibold">Landing Page Preview</p>
              <a href={selected.landingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                <ExternalLink size={14}/>{selected.landingUrl||"No landing page set"}
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
