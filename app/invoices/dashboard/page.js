"use client";
import { useEffect, useState } from "react";
import { Plus, Download } from "lucide-react";
import { Badge, PageHeader, Spinner } from "@/components/ui";

export default function InvoicesDashboard(){
  const [payouts,setPayouts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("publishers");

  useEffect(()=>{
    fetch("/api/payouts").then(r=>r.json()).then(d=>{setPayouts(d.payouts||[]);setLoading(false);}).catch(()=>setLoading(false));
  },[]);

  const fmt=(n)=>n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(1)}K`:`₹${n||0}`;
  const pending=payouts.filter(p=>p.status==="Pending");
  const paid=payouts.filter(p=>p.status==="Paid");
  const totalPending=pending.reduce((s,p)=>s+p.amount,0);
  const totalPaid=paid.reduce((s,p)=>s+p.amount,0);

  return(
    <div className="space-y-6">
      <PageHeader title="Invoices Dashboard" subtitle="Manage publisher and advertiser invoices"/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Pending Payouts",fmt(totalPending),"#f59e0b"],["Paid Out",fmt(totalPaid),"#10b981"],["Total Invoices",payouts.length,"#3b82f6"],["Pending Count",pending.length,"#f97316"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">{l}</p>
            <p className="text-3xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>

      {loading?<div className="flex justify-center py-10"><Spinner/></div>:
      <div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-300">Recent Invoices</p>
          <button className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1"><Download size={12}/>Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {["Publisher","Amount","Method","Period","Status","Date"].map(h=><th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>{payouts.map(p=>(
              <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-xs text-white font-bold">{(p.affiliateId?.name||"?")[0]}</div>
                    <div><p className="text-sm text-white font-semibold">{p.affiliateId?.name||"—"}</p><p className="text-xs text-slate-500">{p.affiliateId?.email}</p></div>
                  </div>
                </td>
                <td className="py-3 px-4 text-lg font-black text-orange-400">{fmt(p.amount)}</td>
                <td className="py-3 px-4 text-sm text-slate-300">{p.method||"—"}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{p.period||"—"}</td>
                <td className="py-3 px-4"><Badge status={p.status}/></td>
                <td className="py-3 px-4 text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>}
    </div>
  );
}
