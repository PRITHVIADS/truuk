"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader, FilterTabs, Spinner } from "@/components/ui";
import { CheckCircle, XCircle, DollarSign, Clock, Plus } from "lucide-react";

const fmt = (n) => n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n||0}`;
const SC = { Paid:"text-green-400 bg-green-500/15 border-green-500/30", Pending:"text-amber-400 bg-amber-500/15 border-amber-500/30", Rejected:"text-red-400 bg-red-500/15 border-red-500/30", Processing:"text-blue-400 bg-blue-500/15 border-blue-500/30" };

export default function Payouts() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [processing, setProcessing] = useState({});
  const [modal, setModal] = useState(null);
  const [txId, setTxId] = useState("");
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch(`/api/payouts?status=${filter}`);
    const d = await r.json();
    setData(d);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const handle = async (payoutId, status) => {
    setProcessing(p => ({ ...p, [payoutId]: true }));
    await fetch("/api/payouts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payoutId, status, transactionId: txId, notes }) });
    setModal(null); setTxId(""); setNotes("");
    await load();
    setProcessing(p => ({ ...p, [payoutId]: false }));
  };

  const payouts = data?.payouts || [];
  const summary = data?.summary || [];
  const card = { background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" };

  const getSum = (status) => summary.find(s => s._id === status)?.total || 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Payouts" subtitle={isAdmin ? "Manage publisher payout requests" : "Your payout history"}/>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Pending", getSum("Pending"), "#f59e0b", Clock], ["Paid", getSum("Paid"), "#10b981", CheckCircle], ["Processing", getSum("Processing"), "#3b82f6", DollarSign], ["Rejected", getSum("Rejected"), "#ef4444", XCircle]].map(([l, v, c, Icon]) => (
          <div key={l} className="rounded-2xl border p-4" style={card}>
            <div className="flex items-center gap-2 mb-2"><Icon size={14} style={{ color: c }}/><p className="text-xs text-slate-500 uppercase font-bold">{l}</p></div>
            <p className="text-2xl font-black" style={{ color: c }}>{fmt(v)}</p>
          </div>
        ))}
      </div>

      <FilterTabs options={["Pending", "Processing", "Paid", "Rejected"]} value={filter} onChange={setFilter}/>

      {loading ? <div className="flex justify-center py-20"><Spinner/></div> :
      payouts.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={card}>
          <div className="text-5xl mb-4 opacity-30">💸</div>
          <p className="text-slate-400 font-bold">No {filter.toLowerCase()} payouts</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                {[isAdmin && "Publisher", isAdmin && "Publisher ID", "Amount", "Method", "Status", "TXN ID", "Date", isAdmin && "Actions"].filter(Boolean).map(h => (
                  <th key={h} className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    {isAdmin && <td className="py-3 px-4"><p className="text-white font-semibold">{p.affiliateId?.name || "—"}</p><p className="text-slate-500 text-xs">{p.affiliateId?.email}</p></td>}
                    {isAdmin && <td className="py-3 px-4"><code className="text-green-400 font-mono">{p.affiliateId?.publisherId || p.affiliateId?.referralCode || "—"}</code></td>}
                    <td className="py-3 px-4 font-black text-orange-400 text-sm">{fmt(p.amount)}</td>
                    <td className="py-3 px-4 text-slate-300">{p.method || p.affiliateId?.paymentMethod || "—"}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${SC[p.status] || "text-slate-400 bg-white/5 border-white/10"}`}>{p.status}</span></td>
                    <td className="py-3 px-4"><code className="text-slate-400 font-mono">{p.transactionId || "—"}</code></td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    {isAdmin && <td className="py-3 px-4">
                      {p.status === "Pending" && (
                        <div className="flex gap-1">
                          <button onClick={() => setModal(p)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-semibold"><CheckCircle size={11}/>Mark Paid</button>
                          <button onClick={() => handle(p._id, "Rejected")} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold"><XCircle size={11}/>Reject</button>
                        </div>
                      )}
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "#0a0f1a", borderColor: "rgba(255,255,255,0.1)" }}>
            <h3 className="text-white font-black text-lg mb-4">Mark as Paid</h3>
            <div className="space-y-3 mb-5">
              <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <p className="text-xs text-slate-500">Publisher</p><p className="text-white font-semibold">{modal.affiliateId?.name}</p>
                <p className="text-xs text-slate-500 mt-1">Amount</p><p className="text-orange-400 font-black text-xl">{fmt(modal.amount)}</p>
              </div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Transaction ID</label><input value={txId} onChange={e => setTxId(e.target.value)} className="input w-full" placeholder="Bank TXN / UTR number"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Notes (Optional)</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="input w-full resize-none" rows={2} placeholder="Any notes for this payment"/></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handle(modal._id, "Paid")} className="btn-primary flex-1 py-2.5 text-sm">✓ Confirm Payment</button>
              <button onClick={() => { setModal(null); setTxId(""); setNotes(""); }} className="btn-ghost px-4 py-2.5 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
