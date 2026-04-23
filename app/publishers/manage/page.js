"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, Copy, CheckCircle, XCircle } from "lucide-react";
import { Badge, PageHeader, FilterTabs, EmptyState, Spinner, Modal } from "@/components/ui";

const METHODS=["Bank Transfer","UPI","PayPal","Crypto","Cheque"];
const EMPTY={name:"",email:"",phone:"",company:"",website:"",status:"Pending",paymentMethod:"Bank Transfer",postbackUrl:"",notes:"",paymentDetails:{accountName:"",accountNumber:"",ifscCode:"",upiId:"",paypalEmail:""}};

export default function ManagePublishers(){
  const [affiliates,setAffiliates]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  const load=async()=>{
    setLoading(true);
    const params=new URLSearchParams();
    if(filter!=="All")params.set("status",filter);
    if(search)params.set("search",search);
    const r=await fetch(`/api/affiliates?${params}`);
    const d=await r.json();
    setAffiliates(d.affiliates||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[filter]);

  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const fp=(k,v)=>setForm(p=>({...p,paymentDetails:{...p.paymentDetails,[k]:v}}));

  const handleSave=async()=>{
    if(!form.name||!form.email){setError("Name and email required");return;}
    setSaving(true);setError("");
    const url=modal==="edit"?`/api/affiliates/${selected._id}`:"/api/affiliates";
    const r=await fetch(url,{method:modal==="edit"?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    await load();setModal(null);setSaving(false);
  };

  const handleDelete=async(id)=>{if(!confirm("Remove publisher?"))return;await fetch(`/api/affiliates/${id}`,{method:"DELETE"});await load();};
  const fmt=(n)=>n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(1)}K`:`₹${n||0}`;
  const fmtN=(n)=>n>=1000?`${(n/1000).toFixed(1)}K`:String(n||0);

  const pending=affiliates.filter(a=>a.status==="Pending");

  return(
    <div className="space-y-6">
      <PageHeader title="Manage Publishers" subtitle="View and manage your affiliate publishers"
        action={<button onClick={()=>{setForm(EMPTY);setError("");setModal("create");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Add Publisher</button>}/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Total",affiliates.length,"#f97316"],["Active",affiliates.filter(a=>a.status==="Active").length,"#10b981"],["Pending",affiliates.filter(a=>a.status==="Pending").length,"#f59e0b"],["Total Earned",fmt(affiliates.reduce((s,a)=>s+(a.totalEarnings||0),0)),"#a855f7"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-4" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p>
            <p className="text-2xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>

      {pending.length>0&&(
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-amber-400 font-bold text-sm mb-3">⏳ {pending.length} publisher(s) awaiting approval</p>
          <div className="space-y-2">
            {pending.map(a=>(
              <div key={a._id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                <div><p className="text-white text-sm font-semibold">{a.name}</p><p className="text-slate-500 text-xs">{a.email} · {a.paymentMethod}</p></div>
                <div className="flex gap-2">
                  <button onClick={async()=>{await fetch(`/api/affiliates/${a._id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"Active"})});await load();}} className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg"><CheckCircle size={12}/>Approve</button>
                  <button onClick={async()=>{await fetch(`/api/affiliates/${a._id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"Inactive"})});await load();}} className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg"><XCircle size={12}/>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <FilterTabs options={["All","Active","Pending","Inactive"]} value={filter} onChange={setFilter}/>
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")load();}} placeholder="Search publishers…" className="input pl-8 w-56 text-xs"/>
        </div>
      </div>

      {loading?<div className="flex justify-center py-20"><Spinner/></div>
      :affiliates.length===0?<EmptyState icon="👥" title="No publishers found"/>
      :<div className="space-y-3">
        {affiliates.filter(a=>a.name.toLowerCase().includes(search.toLowerCase())||a.email.toLowerCase().includes(search.toLowerCase())).map(a=>(
          <div key={a._id} className="rounded-2xl border p-4 flex items-center gap-4 hover:bg-white/5 transition-all" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {a.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{a.name}</p>
              <p className="text-slate-500 text-xs">{a.email} · {a.company||"—"}</p>
            </div>
            <div className="hidden md:flex gap-6 text-center">
              {[["Clicks",fmtN(a.clicks)],["Conv.",fmtN(a.conversions)],["Earnings",fmt(a.totalEarnings)],["Pending",fmt(a.pendingPayout)]].map(([k,v])=>(
                <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-sm text-white font-bold">{v}</p></div>
              ))}
            </div>
            {a.referralCode&&(
              <div className="hidden lg:flex items-center gap-1 bg-black/30 border border-white/5 px-2 py-1 rounded-lg">
                <code className="text-xs text-orange-400 font-mono">{a.referralCode}</code>
                <button onClick={()=>navigator.clipboard.writeText(a.referralCode)} className="text-slate-500 hover:text-white"><Copy size={12}/></button>
              </div>
            )}
            <Badge status={a.status}/>
            <div className="flex gap-1">
              <button onClick={()=>{setSelected(a);setModal("view");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Eye size={14}/></button>
              <button onClick={()=>{setForm({...a,paymentDetails:a.paymentDetails||{}});setSelected(a);setError("");setModal("edit");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Pencil size={14}/></button>
              <button onClick={()=>handleDelete(a._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>}

      {(modal==="create"||modal==="edit")&&(
        <Modal title={modal==="create"?"Add Publisher":"Edit Publisher"} onClose={()=>setModal(null)} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Full Name *</label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Email *</label><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Phone</label><input value={form.phone} onChange={e=>f("phone",e.target.value)} className="input"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Company</label><input value={form.company} onChange={e=>f("company",e.target.value)} className="input"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Status</label><select value={form.status} onChange={e=>f("status",e.target.value)} className="select">{["Pending","Active","Inactive"].map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Payment Method</label><select value={form.paymentMethod} onChange={e=>f("paymentMethod",e.target.value)} className="select">{METHODS.map(m=><option key={m}>{m}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="text-xs text-slate-400 font-semibold block mb-1.5">Postback URL</label><input value={form.postbackUrl} onChange={e=>f("postbackUrl",e.target.value)} className="input" placeholder="https://tracker.aff.com/postback?txid={{TXID}}"/></div>
            </div>
            {form.paymentMethod==="Bank Transfer"&&<div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Account Name</label><input value={form.paymentDetails?.accountName||""} onChange={e=>fp("accountName",e.target.value)} className="input"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Account Number</label><input value={form.paymentDetails?.accountNumber||""} onChange={e=>fp("accountNumber",e.target.value)} className="input"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">IFSC Code</label><input value={form.paymentDetails?.ifscCode||""} onChange={e=>fp("ifscCode",e.target.value)} className="input"/></div>
            </div>}
            {form.paymentMethod==="UPI"&&<div><label className="text-xs text-slate-400 font-semibold block mb-1.5">UPI ID</label><input value={form.paymentDetails?.upiId||""} onChange={e=>fp("upiId",e.target.value)} className="input" placeholder="name@upi"/></div>}
          </div>
          {error&&<p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{saving?"Saving…":modal==="create"?"Add Publisher":"Save"}</button>
            <button onClick={()=>setModal(null)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
