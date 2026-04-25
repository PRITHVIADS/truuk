"use client";
import { useEffect, useState } from "react";
import { PageHeader, FilterTabs, Spinner, Badge } from "@/components/ui";
import { CheckCircle, XCircle } from "lucide-react";

export default function CampaignAccess() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [processing, setProcessing] = useState({});

  const load = async () => {
    setLoading(true);
    const r = await fetch(`/api/campaigns/access?status=${filter}`);
    const d = await r.json();
    setApps(d.applications || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const handle = async (id, status) => {
    setProcessing(p => ({ ...p, [id]: true }));
    await fetch("/api/campaigns/access", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationId: id, status }) });
    await load();
    setProcessing(p => ({ ...p, [id]: false }));
  };

  const card = { background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" };
  const pending = apps.filter(a => a.status === "Pending");

  return (
    <div className="space-y-6">
      <PageHeader title="Campaign Access" subtitle="Manage publisher requests to join campaigns"/>

      {pending.length > 0 && filter !== "Pending" && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
          <span className="text-amber-400 text-sm font-semibold">⏳ {pending.length} pending request(s)</span>
          <button onClick={() => setFilter("Pending")} className="ml-auto text-xs text-amber-400 underline">View →</button>
        </div>
      )}

      <FilterTabs options={["Pending", "Approved", "Rejected", "All"]} value={filter} onChange={setFilter}/>

      {loading ? <div className="flex justify-center py-20"><Spinner/></div> :
      apps.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={card}>
          <div className="text-5xl mb-4 opacity-30">🔐</div>
          <p className="text-slate-400 font-bold">No {filter.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                {["Publisher","Publisher ID","Campaign","Payout","Status","Requested","Actions"].map(h => (
                  <th key={h} className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {apps.map(a => (
                  <tr key={a._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-black text-xs">{a.affiliateId?.name?.[0] || "?"}</div>
                        <p className="text-white font-semibold">{a.affiliateId?.name || "—"}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4"><code className="text-green-400 font-mono">{a.affiliateId?.publisherId || a.affiliateId?.referralCode || "—"}</code></td>
                    <td className="py-3 px-4">
                      <p className="text-white font-semibold">{a.campaignId?.name || "—"}</p>
                      {a.campaignId?.shortId && <code className="text-slate-600 font-mono text-xs">{a.campaignId.shortId}</code>}
                    </td>
                    <td className="py-3 px-4 text-orange-400 font-bold">₹{a.campaignId?.payout || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${a.status === "Approved" ? "text-green-400 bg-green-500/15 border-green-500/30" : a.status === "Rejected" ? "text-red-400 bg-red-500/15 border-red-500/30" : "text-amber-400 bg-amber-500/15 border-amber-500/30"}`}>{a.status}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="py-3 px-4">
                      {a.status === "Pending" && (
                        <div className="flex gap-1">
                          <button onClick={() => handle(a._id, "Approved")} disabled={processing[a._id]} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 text-xs font-semibold"><CheckCircle size={11}/>Approve</button>
                          <button onClick={() => handle(a._id, "Rejected")} disabled={processing[a._id]} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 text-xs font-semibold"><XCircle size={11}/>Reject</button>
                        </div>
                      )}
                      {a.status !== "Pending" && (
                        <button onClick={() => handle(a._id, a.status === "Approved" ? "Rejected" : "Approved")} className="text-xs text-slate-500 hover:text-white underline">
                          {a.status === "Approved" ? "Revoke" : "Re-approve"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
