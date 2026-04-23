"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader, Spinner, EmptyState, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function EarningsPage() {
  const { data: session } = useSession();
  const [payouts, setPayouts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/payouts").then(r=>r.json()),
      fetch("/api/settings").then(r=>r.json()),
    ]).then(([pd, ud]) => {
      setPayouts(pd.payouts || []);
      setUser(ud.user);
      setLoading(false);
    });
  }, []);

  const handleRequest = async () => {
    if (!user?.pendingPayout || user.pendingPayout <= 0) { setMsg("No pending earnings to withdraw"); return; }
    setRequesting(true);
    const r = await fetch("/api/payouts", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ affiliateId: session?.user?.id, amount: user.pendingPayout, method: user.paymentMethod || "Bank Transfer", period: new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"}) }) });
    if (r.ok) { setMsg("✅ Payout requested successfully!"); }
    setRequesting(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={8}/></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Earnings & Payouts" subtitle="Track your commissions and request payouts"/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Total Earned", formatCurrency(user?.totalEarnings||0), "#10b981"],
          ["Pending Payout", formatCurrency(user?.pendingPayout||0), "#f97316"],
          ["Total Conversions", user?.conversions||0, "#3b82f6"],
          ["Payment Method", user?.paymentMethod||"Not set", "#a855f7"],
        ].map(([l,v,c])=>(
          <div key={l} className="card p-5"><p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">{l}</p><p className="text-2xl font-black" style={{color:c}}>{v}</p></div>
        ))}
      </div>

      {(user?.pendingPayout||0) > 0 && (
        <div className="card p-5 border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold">Ready to withdraw</p>
              <p className="text-slate-400 text-sm mt-0.5">You have <span className="text-orange-400 font-bold">{formatCurrency(user.pendingPayout)}</span> available for payout</p>
            </div>
            <button onClick={handleRequest} disabled={requesting} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
              {requesting ? "Requesting…" : "Request Payout"}
            </button>
          </div>
          {msg && <p className="text-green-400 text-sm mt-3">{msg}</p>}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-sm font-bold text-slate-300">Payout History</p>
        </div>
        {payouts.length === 0 ? <EmptyState icon="💸" title="No payouts yet" subtitle="Your payout history will appear here"/>
        : <table className="w-full">
          <thead><tr className="border-b border-white/5">
            {["Amount","Method","Period","Status","Date"].map(h=>(
              <th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
            ))}</tr></thead>
          <tbody>{payouts.map(p=>(
            <tr key={p._id} className="table-row">
              <td className="py-3 px-4 text-lg font-black text-orange-400">{formatCurrency(p.amount)}</td>
              <td className="py-3 px-4 text-sm text-slate-300">{p.method||"—"}</td>
              <td className="py-3 px-4 text-sm text-slate-300">{p.period||"—"}</td>
              <td className="py-3 px-4"><Badge status={p.status}/></td>
              <td className="py-3 px-4 text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
            </tr>
          ))}</tbody>
        </table>}
      </div>
    </div>
  );
}
