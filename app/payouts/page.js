"use client";
import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import { Badge, StatCard, Modal, PageHeader, FilterTabs, EmptyState, Spinner } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function PayoutsPage() {
  const [payouts,setPayouts]=useState([]);
  const [affiliates,setAffiliates]=useState([]);
  const [summary,setSummary]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("All");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState({affiliateId:"",amount:"",period:"",notes:"",transactionId:""});
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  const load=async()=>{
    setLoading(true);
    const [pr,ar]=await Promise.all([
      fetch(`/api/payouts${filter!=="All"?`?status=${filter}`:""}`).then(r=>r.json()),
      fetch("/api/affiliates").then(r=>r.json()),
    ]);
    setPayouts(pr.payouts||[]);
    setSummary(pr.summary||[]);
    setAffiliates(ar.affiliates||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[filter]);

  const getSummaryVal=(status)=>summary.find(s=>s._id===status)||{total:0,count:0};
  const pending=getSummaryVal("Pending");
  const paid=getSummaryVal("Paid");

  const handleCreate=async()=>{
    if(!form.affiliateId||!form.amount){setError("Affiliate and amount required");return;}
    setSaving(true);setError("");
    const r=await fetch("/api/payouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,amount:+form.amount})});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    await load();setModal(null);setSaving(false);
  };

  const handleUpdateStatus=async(id,status,txId="")=>{
    await fetch(`/api/payouts/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,transactionId:txId})});
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payouts" subtitle="Manage affiliate payments"
        action={<button onClick={()=>{setForm({affiliateId:"",amount:"",period:"",notes:"",transactionId:""});setError("");setModal("create");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>New Payout</button>}/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pending" value={formatCurrency(pending.total)} sub={`${pending.count} requests`} color="#f97316"/>
        <StatCard label="Paid Out" value={formatCurrency(paid.total)} sub={`${paid.count} payments`} color="#10b981"/>
        <StatCard label="Total Affiliates" value={affiliates.length} color="#3b82f6"/>
        <StatCard label="Active Affiliates" value={affiliates.filter(a=>a.status==="Active").length} color="#a855f7"/>
      </div>

      <FilterTabs options={["All","Pending","Processing","Paid","Rejected"]} value={filter} onChange={setFilter}/>

      {loading?<div className="flex justify-center py-20"><Spinner size={8}/></div>
      :payouts.length===0?<EmptyState icon="💸" title="No payouts found" subtitle="Create payout requests for your affiliates"/>
      :<div className="card overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-white/5">
            {["Affiliate","Amount","Method","Period","Status","Requested","Actions"].map(h=>(
              <th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}</tr></thead>
          <tbody>{payouts.map(p=>(
            <tr key={p._id} className="table-row">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                    {(p.affiliateId?.name||"?")[0]}
                  </div>
                  <div><p className="text-sm text-white font-semibold">{p.affiliateId?.name||"—"}</p>
                    <p className="text-xs text-slate-500">{p.affiliateId?.email}</p></div>
                </div>
              </td>
              <td className="py-3 px-4 text-lg font-black text-orange-400">{formatCurrency(p.amount)}</td>
              <td className="py-3 px-4 text-sm text-slate-300">{p.method||p.affiliateId?.paymentMethod||"—"}</td>
              <td className="py-3 px-4 text-sm text-slate-400">{p.period||"—"}</td>
              <td className="py-3 px-4"><Badge status={p.status}/></td>
              <td className="py-3 px-4 text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
              <td className="py-3 px-4">
                <div className="flex gap-1">
                  {p.status==="Pending"&&<>
                    <button onClick={()=>handleUpdateStatus(p._id,"Paid")} className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg transition-all"><CheckCircle size={12}/>Approve</button>
                    <button onClick={()=>handleUpdateStatus(p._id,"Rejected")} className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg transition-all"><XCircle size={12}/>Reject</button>
                  </>}
                  {p.status==="Paid"&&p.transactionId&&<span className="text-xs text-slate-500 font-mono">TXN: {p.transactionId}</span>}
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div></div>}

      {modal==="create"&&(
        <Modal title="Create Payout Request" onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Affiliate *</label>
              <select value={form.affiliateId} onChange={e=>setForm(p=>({...p,affiliateId:e.target.value}))} className="select">
                <option value="">Select affiliate…</option>
                {affiliates.filter(a=>a.status==="Active").map(a=>(
                  <option key={a._id} value={a._id}>{a.name} — Pending: {formatCurrency(a.pendingPayout||0)}</option>
                ))}
              </select></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} className="input" placeholder="Enter payout amount"/></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Period</label>
              <input value={form.period} onChange={e=>setForm(p=>({...p,period:e.target.value}))} className="input" placeholder="e.g. April 2024"/></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className="input resize-none" rows={2}/></div>
          </div>
          {error&&<p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button onClick={handleCreate} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{saving?"Creating…":"Create Payout"}</button>
            <button onClick={()=>setModal(null)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
