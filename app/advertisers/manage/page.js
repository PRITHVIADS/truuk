"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Copy, CheckCircle, XCircle, Info } from "lucide-react";
import { Badge, PageHeader, Spinner, Modal } from "@/components/ui";
const EMPTY={name:"",email:"",password:"",company:"",phone:"",status:"Active",advertiserRef:""};
async function loginAsAdvertiser(userId, name){
  if(!confirm("Login as advertiser: "+name+"?"))return;
  const r=await fetch("/api/impersonate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId,type:"user"})});
  const d=await r.json();
  if(!r.ok){alert(d.error||"Error");return;}
  window.location.replace("/dashboard");
}

export default function ManageAdvertisers(){
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [copied,setCopied]=useState("");
  const load=async()=>{setLoading(true);const r=await fetch("/api/users?role=advertiser");const d=await r.json();setUsers(d.users||[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave=async()=>{
    if(!form.name){setError("Full name is required");return;}
    if(!form.email){setError("Email is required");return;}
    setSaving(true);setError("");
    const url=modal==="edit"?`/api/users/${selected._id}`:"/api/users";
    const body={...form,role:"advertiser"};
    if(modal==="edit")delete body.password;
    const r=await fetch(url,{method:modal==="edit"?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    await load();setModal(null);setSaving(false);
  };
  const handleDelete=async(id)=>{if(!confirm("Delete?"))return;await fetch(`/api/users/${id}`,{method:"DELETE"});await load();};
  const updateStatus=async(id,status)=>{await fetch(`/api/users/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});await load();};
  const copyText=(text,key)=>{navigator.clipboard.writeText(text);setCopied(key);setTimeout(()=>setCopied(""),2000);};
  const filtered=users.filter(u=>(u.name+u.email+(u.company||"")).toLowerCase().includes(search.toLowerCase()));
  const pending=users.filter(u=>u.status==="Pending");
  return(
    <div className="space-y-6">
      <PageHeader title="Manage Advertisers" subtitle="View and manage your advertisers"
        action={<button onClick={()=>{setForm(EMPTY);setError("");setModal("create");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Add Advertiser</button>}/>
      <div className="grid grid-cols-3 gap-3">
        {[["Total",users.length,"#f97316"],["Active",users.filter(u=>u.status==="Active").length,"#10b981"],["Pending",pending.length,"#f59e0b"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-4" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p>
            <p className="text-3xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      {pending.length>0&&<div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-amber-400 font-bold text-sm mb-3">⏳ {pending.length} awaiting approval</p>
        <div className="space-y-2">{pending.map(u=><div key={u._id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5"><div><p className="text-white text-sm font-semibold">{u.name}</p><p className="text-slate-500 text-xs">{u.email}</p></div><div className="flex gap-2"><button onClick={()=>updateStatus(u._id,"Active")} className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg"><CheckCircle size={12}/>Approve</button><button onClick={()=>updateStatus(u._id,"Inactive")} className="flex items-center gap-1 text-xs bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg"><XCircle size={12}/>Reject</button></div></div>)}</div>
      </div>}
      <div className="relative w-72"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search advertisers…" className="input pl-8 text-xs"/></div>
      {loading?<div className="flex justify-center py-20"><Spinner/></div>:
      <div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
        <div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-white/5">{["Advertiser","Advertiser ID","Company","Status","Joined","Actions"].map(h=><th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>{filtered.map(u=>(
            <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white font-black">{u.name[0]}</div><div><p className="text-sm text-white font-semibold">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div></div></td>
              <td className="py-3 px-4">{u.shortId?<div className="flex items-center gap-1.5"><code className="text-xs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-lg">{u.shortId}</code><button onClick={()=>copyText(u.shortId,u._id)} className={copied===u._id?"text-green-400":"text-slate-500 hover:text-orange-400"}><Copy size={11}/></button></div>:<span className="text-xs text-slate-600">—</span>}</td>
              <td className="py-3 px-4 text-sm text-slate-300">{u.company||"—"}</td>
              <td className="py-3 px-4"><Badge status={u.status}/></td>
              <td className="py-3 px-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
              <td className="py-3 px-4"><div className="flex gap-1"><button onClick={()=>{setForm({...u,password:""});setSelected(u);setError("");setModal("edit");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"><Pencil size={14}/></button><button onClick={()=>handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400"><Trash2 size={14}/></button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>}
      {(modal==="create"||modal==="edit")&&(
        <Modal title={modal==="create"?"Add an Advertiser":"Edit Advertiser"} onClose={()=>setModal(null)} size="lg">
          <div className="space-y-5">
            {modal==="create"&&<div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20"><Info size={15} className="text-blue-400 flex-shrink-0 mt-0.5"/><div><p className="text-xs text-blue-400 font-semibold">A unique Advertiser ID will be auto-generated</p><p className="text-xs text-slate-500 mt-0.5">e.g. ADVA1B2C3 — used in tracking macros</p></div></div>}
            {modal==="edit"&&selected?.shortId&&<div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5"><div><p className="text-xs text-slate-500">Advertiser ID</p><code className="text-orange-400 font-mono text-sm font-bold">{selected.shortId}</code></div><button onClick={()=>copyText(selected.shortId,"modal")} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${copied==="modal"?"bg-green-500/15 text-green-400 border-green-500/30":"bg-white/5 text-slate-400 border-white/10"}`}>{copied==="modal"?"✓ Copied":"Copy ID"}</button></div>}
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Full Name <span className="text-red-400">*</span></label><p className="text-xs text-slate-600 mb-2">The name of your advertiser/website/resource</p><input value={form.name} onChange={e=>f("name",e.target.value)} className="input" placeholder="e.g. John Doe or Flipkart"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Email <span className="text-red-400">*</span></label><p className="text-xs text-slate-600 mb-2">Enter unique email of your advertiser</p><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input" placeholder="advertiser@company.com"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Account Status <span className="text-red-400">*</span></label><div className="flex gap-2 mt-2">{["Active","Pending","Inactive"].map(s=><button key={s} onClick={()=>f("status",s)} type="button" className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.status===s?s==="Active"?"border-green-500 bg-green-500/15 text-green-400":s==="Pending"?"border-amber-500 bg-amber-500/15 text-amber-400":"border-red-500 bg-red-500/15 text-red-400":"border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>{s==="Active"?"● Active":s==="Pending"?"◑ Pending":"○ Inactive"}</button>)}</div></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Company <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><p className="text-xs text-slate-600 mb-2">Company / Organization name</p><input value={form.company||""} onChange={e=>f("company",e.target.value)} className="input" placeholder="e.g. Flipkart Pvt. Ltd."/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Reference ID <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><p className="text-xs text-slate-600 mb-2">Your internal reference ID for this advertiser</p><input value={form.advertiserRef||""} onChange={e=>f("advertiserRef",e.target.value)} className="input" placeholder="e.g. ADV-001"/></div>
            {modal==="create"&&<div><label className="text-sm text-slate-300 font-semibold block mb-1">Password <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><p className="text-xs text-slate-600 mb-2">8 characters minimum or leave empty to auto-generate</p><input type="password" value={form.password||""} onChange={e=>f("password",e.target.value)} className="input" placeholder="Leave empty to auto-generate"/></div>}
            <div><label className="text-sm text-slate-300 font-semibold block mb-1">Phone <span className="text-xs text-slate-500 font-normal">(Optional)</span></label><input value={form.phone||""} onChange={e=>f("phone",e.target.value)} className="input" placeholder="+91 98765 43210"/></div>
          </div>
          {error&&<div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <div className="flex gap-3 mt-6"><button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50 flex-1">{saving?"Saving…":modal==="create"?"Add Advertiser":"Save Changes"}</button><button onClick={()=>setModal(null)} className="btn-ghost px-6 py-2.5 text-sm">Cancel</button></div>
        </Modal>
      )}
    </div>
  );
}
