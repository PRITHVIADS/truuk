"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader, Spinner, Badge } from "@/components/ui";
import { Search, CheckCircle, Clock, Lock, ExternalLink, Copy } from "lucide-react";

const GEO_FLAGS = { IN:"🇮🇳", US:"🇺🇸", GB:"🇬🇧", AE:"🇦🇪", AU:"🇦🇺", CA:"🇨🇦", SG:"🇸🇬", ALL:"🌍" };

export default function Marketplace() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [applying, setApplying] = useState({});
  const [copied, setCopied] = useState("");

  const load = () => {
    setLoading(true);
    fetch(`/api/marketplace?search=${search}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [search]);

  const getAppStatus = (campId) => data?.myApplications?.find(a => a.campaignId === campId)?.status;

  const apply = async (campId) => {
    setApplying(p => ({ ...p, [campId]: true }));
    await fetch("/api/marketplace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignId: campId }) });
    await load();
    setApplying(p => ({ ...p, [campId]: false }));
  };

  const copyLink = (c) => {
    const url = `${window.location.origin}/api/clicks?cid=${c._id}&aid=${data?.affiliateId || "YOUR_ID"}`;
    navigator.clipboard.writeText(url);
    setCopied(c._id);
    setTimeout(() => setCopied(""), 2000);
  };

  const campaigns = data?.campaigns || [];
  const card = { background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" };

  return (
    <div className="space-y-6">
      <PageHeader title="Campaign Marketplace" subtitle="Browse and join available affiliate campaigns"/>

      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns…" className="input pl-8 w-full"/>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner/></div> :
      campaigns.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={card}>
          <div className="text-5xl mb-4 opacity-30">📣</div>
          <p className="text-slate-400 font-bold">No campaigns available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map(c => {
            const appStatus = getAppStatus(c._id);
            const cr = c.clicks ? ((c.conversions / c.clicks) * 100).toFixed(1) : "0.0";
            return (
              <div key={c._id} className="rounded-2xl border p-5 hover:bg-white/[0.02] transition-all" style={card}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-black text-sm">{c.name}</p>
                      {c.visibility === "Ask for Permission" && <Lock size={12} className="text-amber-400"/>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {c.shortId && <code className="text-xs text-slate-600 font-mono">{c.shortId}</code>}
                      {c.category && <span className="text-xs text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{c.category}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-2xl font-black text-orange-400">₹{c.payout}</p>
                    <p className="text-xs text-slate-500">per {c.objective === "Sale" ? "sale %" : "conversion"}</p>
                  </div>
                </div>

                {/* Description */}
                {c.description && <p className="text-slate-400 text-xs mb-3 line-clamp-2">{c.description}</p>}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[["Clicks", c.clicks || 0, "#3b82f6"], ["Conv.", c.conversions || 0, "#10b981"], ["CR%", cr + "%", "#a855f7"]].map(([l, v, col]) => (
                    <div key={l} className="bg-white/5 rounded-xl p-2 text-center">
                      <p className="text-xs text-slate-500">{l}</p>
                      <p className="text-sm font-black" style={{ color: col }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-400">{c.currency || "INR"}</span>
                  {(c.geo || "ALL").split(",").slice(0, 3).map(g => (
                    <span key={g} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{GEO_FLAGS[g] || "🌍"} {g}</span>
                  ))}
                  {c.objective && <span className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{c.objective}</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!appStatus ? (
                    <button onClick={() => apply(c._id)} disabled={applying[c._id]}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${c.visibility === "Ask for Permission" ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25" : "btn-primary"}`}>
                      {applying[c._id] ? "Applying…" : c.visibility === "Ask for Permission" ? "🔐 Request Access" : "✓ Join Campaign"}
                    </button>
                  ) : appStatus === "Approved" ? (
                    <button onClick={() => copyLink(c)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${copied === c._id ? "bg-green-500/15 border border-green-500/30 text-green-400" : "bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25"}`}>
                      <Copy size={12} className="inline mr-1"/>{copied === c._id ? "Copied!" : "Copy Tracking Link"}
                    </button>
                  ) : (
                    <div className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 text-center">
                      <Clock size={12} className="inline mr-1"/>Pending Approval
                    </div>
                  )}
                </div>

                {/* Tracking link if approved */}
                {appStatus === "Approved" && (
                  <div className="mt-2 p-2 rounded-lg bg-black/30 border border-white/5">
                    <code className="text-xs text-green-400 break-all">
                      {typeof window !== "undefined" ? window.location.origin : ""}/api/clicks?cid={c._id}&aid={data?.affiliateId || "YOUR_ID"}
                    </code>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
