"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Search, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { Spinner, FilterTabs, Badge } from "@/components/ui";

const PLAN_COLORS = {
  trial: "text-slate-400 bg-slate-500/15 border-slate-500/30",
  starter: "text-blue-400 bg-blue-500/15 border-blue-500/30",
  growth: "text-orange-400 bg-orange-500/15 border-orange-500/30",
  enterprise: "text-purple-400 bg-purple-500/15 border-purple-500/30",
};

const PLAN_LIMITS = { trial: 50000, starter: 1000000, growth: 10000000, enterprise: 999999999 };

function UsageBar({ used, plan }) {
  const limit = PLAN_LIMITS[plan] || 50000;
  const pct = Math.min(100, (used / limit) * 100);
  const color = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color }} className="font-semibold">{used?.toLocaleString("en-IN") || 0}</span>
        <span className="text-slate-600">/ {limit >= 10000000 ? "1Cr" : limit >= 1000000 ? "10L" : "50K"}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }}/>
      </div>
    </div>
  );
}

export default function SuperAdmin() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState({});
  const [modal, setModal] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [planChange, setPlanChange] = useState("");



  const load = async () => {
    setLoading(true);
    const r = await fetch(`/api/organizations${filter !== "All" ? `?status=${filter}` : ""}`);
    const d = await r.json();
    setOrgs(d.organizations || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const handle = async (id, updates) => {
    setProcessing(p => ({ ...p, [id]: true }));
    await fetch("/api/organizations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    await load();
    setModal(null);
    setSuspendReason("");
    setProcessing(p => ({ ...p, [id]: false }));
  };

  const filtered = orgs.filter(o =>
    (o.name + o.ownerEmail + o.ownerName).toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const totalRevenue = orgs.filter(o => o.plan !== "trial").reduce((s, o) => {
    return s + (o.plan === "starter" ? 1500 : o.plan === "growth" ? 5000 : 0);
  }, 0);
  const activeOrgs = orgs.filter(o => o.status === "Active").length;
  const pendingOrgs = orgs.filter(o => o.status === "Pending").length;

  const card = { background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Super Admin</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all Truuk organizations and subscriptions</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"/>
          <span className="text-purple-400 text-xs font-bold">Super Admin Mode</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Total Orgs", orgs.length, "#f97316", Users],
          ["Active", activeOrgs, "#10b981", Activity],
          ["Pending", pendingOrgs, "#f59e0b", AlertCircle],
          ["MRR Est.", `₹${totalRevenue.toLocaleString("en-IN")}`, "#a855f7", DollarSign],
        ].map(([l, v, c, Icon]) => (
          <div key={l} className="rounded-2xl border p-4" style={card}>
            <div className="flex items-center gap-2 mb-2"><Icon size={14} style={{ color: c }}/><p className="text-xs text-slate-500 uppercase font-bold">{l}</p></div>
            <p className="text-2xl font-black" style={{ color: c }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {pendingOrgs > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
          <AlertCircle size={16} className="text-amber-400"/>
          <p className="text-amber-400 text-sm font-semibold">{pendingOrgs} organization(s) awaiting approval</p>
          <button onClick={() => setFilter("Pending")} className="ml-auto text-xs text-amber-400 underline">View →</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 justify-between flex-wrap">
        <FilterTabs options={["All", "Pending", "Active", "Suspended", "Cancelled"]} value={filter} onChange={setFilter}/>
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orgs…" className="input pl-8 w-56 text-xs"/>
        </div>
      </div>

      {/* Table */}
      {loading ? <div className="flex justify-center py-20"><Spinner/></div> :
      filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={card}>
          <div className="text-5xl mb-4 opacity-30">🏢</div>
          <p className="text-slate-400 font-bold">No organizations found</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                {["Organization", "Owner", "Plan", "Status", "Clicks Used", "Joined", "Expires", "Actions"].map(h => (
                  <th key={h} className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(org => (
                  <tr key={org._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-black text-sm">{org.name[0]}</div>
                        <div><p className="text-white font-bold">{org.name}</p><p className="text-slate-600 font-mono text-xs">{org.slug}</p></div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><p className="text-white">{org.ownerName}</p><p className="text-slate-500">{org.ownerEmail}</p></td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full border text-xs font-bold capitalize ${PLAN_COLORS[org.plan] || ""}`}>{org.plan}</span>
                    </td>
                    <td className="py-3 px-4"><Badge status={org.status}/></td>
                    <td className="py-3 px-4 min-w-[140px]"><UsageBar used={org.clicksThisMonth} plan={org.plan}/></td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{new Date(org.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {org.subscription?.endDate ? new Date(org.subscription.endDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {org.status === "Pending" && <>
                          <button onClick={() => handle(org._id, { status: "Active" })} disabled={processing[org._id]}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-semibold whitespace-nowrap">
                            <CheckCircle size={11}/>Approve
                          </button>
                          <button onClick={() => handle(org._id, { status: "Cancelled" })} disabled={processing[org._id]}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold">
                            <XCircle size={11}/>Reject
                          </button>
                        </>}
                        {org.status === "Active" && (
                          <button onClick={() => setModal({ type: "suspend", org })}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                            Suspend
                          </button>
                        )}
                        {org.status === "Suspended" && (
                          <button onClick={() => handle(org._id, { status: "Active" })}
                            className="px-2.5 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-semibold">
                            Reactivate
                          </button>
                        )}
                        <button onClick={() => setModal({ type: "plan", org })}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-semibold">
                          Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {modal?.type === "suspend" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "#0a0f1a", borderColor: "rgba(255,255,255,0.1)" }}>
            <h3 className="text-white font-black text-lg mb-4">Suspend Organization</h3>
            <p className="text-slate-400 text-sm mb-4">Suspending <strong className="text-white">{modal.org.name}</strong> will block all access. Owner will receive an email.</p>
            <div className="mb-4">
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">Reason (shown to user)</label>
              <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} className="input w-full resize-none" rows={3} placeholder="e.g. Payment overdue, Terms violation..."/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handle(modal.org._id, { status: "Suspended", suspendReason })}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold">Suspend Account</button>
              <button onClick={() => setModal(null)} className="btn-ghost px-4 py-2.5 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Change Modal */}
      {modal?.type === "plan" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "#0a0f1a", borderColor: "rgba(255,255,255,0.1)" }}>
            <h3 className="text-white font-black text-lg mb-4">Change Plan</h3>
            <p className="text-slate-400 text-sm mb-4">Change plan for <strong className="text-white">{modal.org.name}</strong></p>
            <div className="space-y-2 mb-5">
              {[["trial","Free Trial","50K clicks/month","₹0"],["starter","Starter","10L clicks/month","₹1,500 + GST"],["growth","Growth","1Cr clicks/month","₹5,000 + GST"],["enterprise","Enterprise","Unlimited","Custom"]].map(([val, name, limit, price]) => (
                <button key={val} onClick={() => setPlanChange(val)} type="button"
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${planChange === val ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/5"}`}>
                  <div><p className={`text-sm font-bold ${planChange === val ? "text-orange-400" : "text-white"}`}>{name}</p><p className="text-xs text-slate-500">{limit}</p></div>
                  <span className="text-xs text-slate-400">{price}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => handle(modal.org._id, { plan: planChange })} disabled={!planChange}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-50">Change Plan</button>
              <button onClick={() => { setModal(null); setPlanChange(""); }} className="btn-ghost px-4 py-2.5 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
