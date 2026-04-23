"use client";
import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle, Download } from "lucide-react";
import { Badge, PageHeader, FilterTabs, Spinner, Modal } from "@/components/ui";

export default function PublisherInvoices(){
  const [payouts,setPayouts]=useState([]);
  const [affiliates,setAffiliates]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("All");
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({affiliateId:"",amount:"",period:"",notes:""});
  const [saving,setSaving]=useState(false);

  const load=async()=>{
    setLoading(true);
    const [pr,ar]=await Promise.all([fetch(`/api/payouts${filter!=="All"?`?status=${filter}`:""}`).then(r=>r.json()),fetch("/api/affiliates").then(r=>r.json())]);
    setPayouts(pr.payouts||[]);
    setAffiliates(ar.affiliates||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[filter]);

  const handleCreate=async()=>{
    if(!form.affiliateId||!form.amount)return;
    setSaving(true);
    await fetch("/api/payouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,amount:+form.amount})});
    await load();setModal(false);setSaving(false);
  };

  const updateStatus=async(id,status)=>{
    await fetch(`/api/payouts/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
    await load();
  };

  const fmt=(n)=>n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(1)}K`:`₹${n||0}`;

  return(
    <div className="space-y-6">
      <PageHeader title="Publisher Invoices" subtitle="Manage payouts to publishers"
        action={<button onClick={()=>setModal(true)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Create Invoice</button>}/>

      <div className="flex gap-3 justify-between">
        <FilterTabs options={["All","Pending","Processing","Paid","Rejected"]} value={filter} onChange={setFilter}/>
        <button className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1"><Download size={12}/>Export</button>
      </div>

      {loading?<div className="flex justify-center py-20"><Spinner/></div>:
      <div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {["Publisher","Amount","Method","Period","Status","Actions"].map(h=><th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>{payouts.map(p=>(
              <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-xs text-white font-bold">{(p.affiliateId?.name||"?")[0]}</div>
                    <div><p className="text-sm text-white">{p.affiliateId?.name||"—"}</p><p className="text-xs text-slate-500">{p.affiliateId?.email}</p></div>
                  </div>
                </td>
                <td className="py-3 px-4 text-lg font-black text-orange-400">{fmt(p.amount)}</td>
                <td className="py-3 px-4 text-sm text-slate-300">{p.method||"—"}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{p.period||"—"}</td>
                <td className="py-3 px-4"><Badge status={p.status}/></td>
                <td className="py-3 px-4">
                  {p.status==="Pending"&&<div className="flex gap-1">
                    <button onClick={()=>updateStatus(p._id,"Paid")} className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg"><CheckCircle size={11}/>Pay</button>
                    <button onClick={()=>updateStatus(p._id,"Rejected")} className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg"><XCircle size={11}/>Reject</button>
                  </div>}
                  {p.status==="Paid"&&<span className="text-xs text-slate-500">✓ Paid</span>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>}

      {modal&&(
        <Modal title="Create Invoice" onClose={()=>setModal(false)}>
          <div className="space-y-4">
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Publisher *</label>
              <select value={form.affiliateId} onChange={e=>setForm(p=>({...p,affiliateId:e.target.value}))} className="select">
                <option value="">Select publisher…</option>
                {affiliates.filter(a=>a.status==="Active").map(a=><option key={a._id} value={a._id}>{a.name} — Pending: {fmt(a.pendingPayout||0)}</option>)}
              </select></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Amount (₹) *</label><input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} className="input"/></div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Period</label><input value={form.period} onChange={e=>setForm(p=>({...p,period:e.target.value}))} className="input" placeholder="e.g. April 2024"/></div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleCreate} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{saving?"Creating…":"Create Invoice"}</button>
            <button onClick={()=>setModal(false)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
