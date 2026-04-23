"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge, PageHeader, FilterTabs, EmptyState, Spinner } from "@/components/ui";

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/campaigns/apply");
    const d = await r.json();
    setApps(d.applications || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    await fetch(`/api/campaigns/apply/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ status }) });
    await load();
  };

  const filtered = filter === "All" ? apps : apps.filter(a => a.status === filter);
  const pending = apps.filter(a => a.status === "Pending").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Join Requests" subtitle="Affiliates requesting to join your campaigns"/>

      <div className="grid grid-cols-3 gap-3">
        {[["Pending",pending,"#f97316"],["Approved",apps.filter(a=>a.status==="Approved").length,"#10b981"],["Rejected",apps.filter(a=>a.status==="Rejected").length,"#ef4444"]].map(([l,v,c])=>(
          <div key={l} className="card p-4"><p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">{l}</p><p className="text-3xl font-black" style={{color:c}}>{v}</p></div>
        ))}
      </div>

      <FilterTabs options={["All","Pending","Approved","Rejected"]} value={filter} onChange={setFilter}/>

      {loading ? <div className="flex justify-center py-20"><Spinner size={8}/></div>
      : filtered.length === 0 ? <EmptyState icon="📋" title="No applications yet" subtitle="Affiliate join requests will appear here"/>
      : <div className="card overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-white/5">
            {["Affiliate","Campaign","Message","Status","Applied","Actions"].map(h=>(
              <th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
            ))}</tr></thead>
          <tbody>{filtered.map(a=>(
            <tr key={a._id} className="table-row">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs text-white font-black">{a.affiliateId?.name?.[0]||"?"}</div>
                  <div><p className="text-sm text-white font-semibold">{a.affiliateId?.name||"—"}</p><p className="text-xs text-slate-500">{a.affiliateId?.email}</p></div>
                </div>
              </td>
              <td className="py-3 px-4"><p className="text-sm text-white">{a.campaignId?.name||"—"}</p><span className="text-xs bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-slate-400">{a.campaignId?.type}</span></td>
              <td className="py-3 px-4 text-xs text-slate-400 max-w-48 truncate">{a.message||"—"}</td>
              <td className="py-3 px-4"><Badge status={a.status}/></td>
              <td className="py-3 px-4 text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
              <td className="py-3 px-4">
                {a.status==="Pending"&&(
                  <div className="flex gap-1">
                    <button onClick={()=>handleAction(a._id,"Approved")} className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg transition-all"><CheckCircle size={12}/>Approve</button>
                    <button onClick={()=>handleAction(a._id,"Rejected")} className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg transition-all"><XCircle size={12}/>Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div></div>}
    </div>
  );
}
