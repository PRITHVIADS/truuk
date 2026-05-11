"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Copy, CheckCircle, XCircle, Info } from "lucide-react";
import { Badge, PageHeader, FilterTabs, EmptyState, Spinner, Modal } from "@/components/ui";
const EMPTY={name:"",email:"",password:"",company:"",phone:"",status:"Pending",paymentMethod:"Bank Transfer",postbackUrl:"",publisherRef:""};
async function loginAsPublisher(affiliateId, name){
  if(!confirm("Login as publisher: "+name+"?"))return;
  const r=await fetch("/api/impersonate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({affiliateId,type:"affiliate"})});
  const d=await r.json();
  if(!r.ok){alert(d.error||"Error");return;}
  const{signIn}=await import("next-auth/react");
  const res=await signIn("credentials",{email:d.email,password:d.password,redirect:false});
  if(res?.error){alert("Login failed");return;}
  window.location.replace("/dashboard");
}

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
  const [copied,setCopied]=useState("");
  const load=async()=>{setLoading(true);const params=new URLSearchParams();if(filter!=="All")params.set("status",filter);const r=await fetch(`/api/affiliates?${params}`);const d=await r.json();setAffiliates(d.affiliates||[]);setLoading(false);};
  useEffect(()=>{load();},[filter]);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave=async()=>{
    if(!form.name){setError("Full name is required");return;}
    if(!form.email){setError("Email is required");return;}
    setSaving(true);setError("");
    const url=modal==="edit"?`/api/affiliates/${selected._id}`:"/api/affiliates";
    const r=await fetch(url,{method:modal==="edit"?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    await load();setModal(null);setSaving(false);
  };
  const handleDelete=async(id)=>{if(!confirm("Remove?"))return;await fetch(`/api/affiliates/${id}`,{method:"DELETE"});await load();};
  const updateStatus=async(id,status)=>{await fetch(`/api/affiliates/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});await load();};
  const copyText=(text,key)=>{navigator.clipboard.writeText(text);setCopied(key);setTimeout(()=>setCopied(""),2000);};
  const fmt=(n)=>n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(1)}K`:`₹${n||0}`;
  const filtered=affiliates.filter(a=>(a.name+a.email+(a.company||"")).toLowerCase().includes(search.toLowerCase()));
  const pending=affiliates.filter(a=>a.status==="Pending");
  return(
    <div className="space-y-6">
      <PageHeader title="Manage Publishers" subtitle="View and manage your affiliate publishers"
        action={<button onClick={()=>{setForm(EMPTY);setError("");setModal("create");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Add Publisher</button>}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Total",affiliates.length,"#f97316"],["Active",affiliates.filter(a=>a.status==="Active").length,"#10b981"],["Pending",pending.length,"#f59e0b"],["Earnings",fmt(affiliates.reduce((s,a)=>s+(a.totalEarnings||0),0)),"#a855f7"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-4" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p>
            <p className="text-2xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      {pending.length>0&&<div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-amber-400 font-bold text-sm mb-3">⏳ {pending.length} publisher(s) awaiting approval</p>
        <div className="space-y-2">{pending.map(a=><div key={a._id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5"><div><p className="text-white text-sm font-semibold">{a.name}</p><p className="text-slate-500 text-xs">{a.email} · <code className="text-green-400 font-mono">{a.publisherId||a.referralCode||"—"}</code></p></div><div className="flex gap-2"><button onClick={()=>updateStatus(a._id,"Active")} className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg"><CheckCircle size={12}/>Approve</button><button onClick={()=>updateStatus(a._id,"Inactive")} className="flex items-center gap-1 text-xs bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg"><XCircle size={12}/>Reject</button></div></div>)}</div>
      </div>}
      <div className="flex gap-3 justify-between">
        <FilterTabs options={["All","Active","Pending","Inactive"]} value={filter} onChange={setFilter}/>
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search publishers…" className="input pl-8 w-52 text-xs"/></div>
      </div>
      {loading?<div className="flex justify-center py-20"><Spinner/></div>:filtered.length===0?<EmptyState icon="👥" title="No publishers found"/>:
      <div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
        <div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-white/5">{["Publisher","Publisher ID","Status","Payment","Clicks","Earnings","Actions"].map(h=><th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>{filtered.map(a=>(
            <tr key={a._id} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-black text-xs">{a.name[0]}</div><div><p className="text-sm text-white font-semibold">{a.name}</p><p className="text-xs text-slate-500">{a.email}</p></div></div></td>
              <td className="py-3 px-4">{(a.publisherId||a.referralCode)?<div className="flex items-center gap-1.5"><code className="text-xs font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-lg">{a.publisherId||a.referralCode}</code><button onClick={()=>copyText(a.publisherId||a.referralCode,a._id)} className={copied===a._id?"text-green-400":"text-slate-500 hover:text-green-400"}><Copy size={11}/></button></div>:<span className="text-xs text-slate-600">—</span>}</td>
              <td className="py-3 px-4"><Badge status={a.status}/></td>
              <td className="py-3 px-4 text-xs text-slate-400">{a.paymentMethod||"—"}</td>
              <td className="py-3 px-4 text-sm text-slate-300">{a.clicks||0}</td>
              <td className="py-3 px-4 text-sm font-bold text-orange-400">{fmt(a.totalEarnings)}</td>
              <td className="py-3 px-4"><div className="flex gap-1"><button onClick={()=>{setForm({...a,password:""});setSelected(a);setError("");setModal("edit");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"><Pencil size={14}/></button><button onClick={()=>handleDelete(a._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400"><Trash2 size={14}/></button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>}
      {(modal==="create"||modal==="edit")&&(
        <Modal title={modal==="create"?"Add a Publisher":"Edit Publisher"} onClose={()=>setModal(null)} size="lg">
          <div className="space-y-5">
            {modal==="create"&&<div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20"><Info size={15} className="text-green-400 flex-shrink-0 mt-0.5"/><div><p className="text-xs text-green-400 font-semibold">A unique Publisher ID will be auto-generated</p><p className="text-xs text-slate-500 mt-0.5">e.g. PUBX1Y2Z3 — used in tracking links and macros</p></div></div>}
            {modal==="edit"&&(selected?.publisherId||selected?.referralCode)&&<div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5"><div><p className="text-xs text-slate-500">Publisher ID</p><code className="text-green-400 font-mono text-sm font-bold">{selected.publisherId||selected.referralCode}</code></div><button onClick={()=>copyText(selected.publisherId||selected.referralCode,"modal")} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${copied==="modal"?"bg-green-500/15 text-green-400 border-green-500/30":"bg-white/5 text-slate-400 border-white/10"}`}>{copied==="modal"?"✓ Copied":"Copy ID"}</button></div>}
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Full Name <span className="text-red-400">*</span></label><p className="text-xs text-slate-600 mb-2">The name of your publisher/affiliate</p><input value={form.name} onChange={e=>f("name",e.target.value)} className="input" placeholder="e.g. Rahul Sharma"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Email <span className="text-red-400">*</span></label><p className="text-xs text-slate-600 mb-2">Enter unique email of your publisher</p><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input" placeholder="publisher@domain.com"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Account Status <span className="text-red-400">*</span></label><div className="flex gap-2 mt-2">{["Active","Pending","Inactive"].map(s=><button key={s} onClick={()=>f("status",s)} type="button" className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.status===s?s==="Active"?"border-green-500 bg-green-500/15 text-green-400":s==="Pending"?"border-amber-500 bg-amber-500/15 text-amber-400":"border-red-500 bg-red-500/15 text-red-400":"border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>{s==="Active"?"● Active":s==="Pending"?"◑ Pending":"○ Inactive"}</button>)}</div></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Company <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><input value={form.company||""} onChange={e=>f("company",e.target.value)} className="input" placeholder="e.g. Media Solutions Pvt. Ltd."/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Reference ID <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><p className="text-xs text-slate-600 mb-2">Your internal reference ID for this publisher</p><input value={form.publisherRef||""} onChange={e=>f("publisherRef",e.target.value)} className="input" placeholder="e.g. PUB-001"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Payment Method</label><div className="grid grid-cols-2 gap-2 mt-2">{["Bank Transfer","UPI","PayPal","Crypto"].map(m=><button key={m} onClick={()=>f("paymentMethod",m)} type="button" className={`py-2 rounded-xl border text-xs font-semibold transition-all ${form.paymentMethod===m?"border-orange-500 bg-orange-500/15 text-orange-400":"border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>{m==="Bank Transfer"?"🏦":m==="UPI"?"📱":m==="PayPal"?"💳":"🪙"} {m}</button>)}</div></div>
            {modal==="create"&&<div><label className="text-sm text-slate-300 font-semibold block mb-1">Password <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><p className="text-xs text-slate-600 mb-2">8 characters minimum or leave empty to auto-generate</p><input type="password" value={form.password||""} onChange={e=>f("password",e.target.value)} className="input" placeholder="Leave empty to auto-generate"/></div>}
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Phone <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><input value={form.phone||""} onChange={e=>f("phone",e.target.value)} className="input" placeholder="+91 98765 43210"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Postback URL <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><p className="text-xs text-slate-600 mb-2">Publisher's server postback for conversion tracking</p><input value={form.postbackUrl||""} onChange={e=>f("postbackUrl",e.target.value)} className="input" placeholder="https://tracker.publisher.com/postback?txid={txn_id}"/></div>
          </div>
          {error&&<div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <div className="flex gap-3 mt-6"><button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50 flex-1">{saving?"Saving…":modal==="create"?"Add Publisher":"Save Changes"}</button><button onClick={()=>setModal(null)} className="btn-ghost px-6 py-2.5 text-sm">Cancel</button></div>
        </Modal>
      )}
    </div>
  );
}
