"use client";
import { useEffect, useState } from "react";
import { PageHeader, Spinner } from "@/components/ui";

export default function PostbackLogs(){
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    fetch("/api/conversions?limit=50").then(r=>r.json()).then(d=>{setLogs(d.conversions||[]);setLoading(false);}).catch(()=>setLoading(false));
  },[]);

  return(
    <div className="space-y-6">
      <PageHeader title="Postback Sent Logs" subtitle="All postback and S2S conversion logs"/>
      {loading?<div className="flex justify-center py-20"><Spinner/></div>:
      <div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
        {logs.length===0?<div className="flex flex-col items-center justify-center py-20"><div className="text-5xl mb-4 opacity-30">📬</div><p className="text-slate-400 font-bold">No postback logs yet</p><p className="text-slate-600 text-sm mt-1">Logs will appear when conversions are tracked</p></div>:
        <div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-white/5">{["Time","Campaign","Affiliate","TXN ID","Payout","Status"].map(h=><th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>{logs.map((l,i)=>(<tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
            <td className="py-3 px-4 text-xs text-slate-500">{new Date(l.createdAt).toLocaleString("en-IN")}</td>
            <td className="py-3 px-4 text-sm text-white">{l.campaignId?.name||l.campaignId||"—"}</td>
            <td className="py-3 px-4 text-sm text-slate-300">{l.affiliateId||"—"}</td>
            <td className="py-3 px-4"><code className="text-xs text-orange-400 font-mono">{l.transactionId||"—"}</code></td>
            <td className="py-3 px-4 text-sm font-bold text-green-400">₹{l.payout}</td>
            <td className="py-3 px-4"><span className="text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">{l.status}</span></td>
          </tr>))}</tbody>
        </table></div>}
      </div>}
    </div>
  );
}
