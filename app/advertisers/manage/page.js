"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge, PageHeader, FilterTabs, EmptyState, Spinner, Modal } from "@/components/ui";

const EMPTY={name:"",email:"",password:"",company:"",phone:"",website:"",status:"Active",notes:""};

export default function ManageAdvertisers(){
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  const load=async()=>{
    setLoading(true);
    const r=await fetch("/api/users?role=advertiser");
    const d=await r.json();
    setUsers(d.users||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const handleSave=async()=>{
    if(!form.name||!form.email){setError("Name and email required");return;}
    setSaving(true);setError("");
    const url=modal==="edit"?`/api/users/${selected._id}`:"/api/users";
    const body={...form,role:"advertiser"};
    if(modal==="edit")delete body.password;
    const r=await fetch(url,{method:modal==="edit"?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    await load();setModal(null);setSaving(false);
  };

  const handleDelete=async(id)=>{if(!confirm("Delete advertiser?"))return;await fetch(`/api/users/${id}`,{method:"DELETE"});await load();};
  const updateStatus=async(id,status)=>{await fetch(`/api/users/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});await load();};

  const filtered=users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));
  const pending=users.filter(u=>u.status==="Pending");

  return(
    <div className="space-y-6">
      <PageHeader title="Manage Advertisers" subtitle="View and manage your advertisers"
        action={<button onClick={()=>{setForm(EMPTY);setError("");setModal("create");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Add Advertiser</button>}/>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[["Total Advertisers",users.length,"#f97316"],["Active",users.filter(u=>u.status==="Active").length,"#10b981"],["Pending Approval",pending.length,"#f59e0b"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-4" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p>
            <p className="text-3xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>

      {pending.length>0&&(
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-amber-400 font-bold text-sm mb-3">⏳ {pending.length} advertiser(s) awaiting approval</p>
          <div className="space-y-2">
            {pending.map(u=>(
              <div key={u._id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                <div><p className="text-white text-sm font-semibold">{u.name}</p><p className="text-slate-500 text-xs">{u.email} · {u.company||"—"}</p></div>
                <div className="flex gap-2">
                  <button onClick={()=>updateStatus(u._id,"Active")} className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg"><CheckCircle size={12}/>Approve</button>
                  <button onClick={()=>updateStatus(u._id,"Inactive")} className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg"><XCircle size={12}/>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative w-64"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search advertisers…" className="input pl-8 text-xs"/>
      </div>

      {loading?<div className="flex justify-center py-20"><Spinner/></div>
      :filtered.length===0?<EmptyState icon="📢" title="No advertisers found"/>
      :<div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {["Advertiser","Company","Status","Joined","Actions"].map(h=>(
                <th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr></thead>
            <tbody>{filtered.map(u=>(
              <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white font-black">{u.name[0]}</div>
                    <div><p className="text-sm text-white font-semibold">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-300">{u.company||"—"}</td>
                <td className="py-3 px-4"><Badge status={u.status}/></td>
                <td className="py-3 px-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="py-3 px-4"><div className="flex gap-1">
                  <button onClick={()=>{setForm({...u,password:""});setSelected(u);setError("");setModal("edit");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Pencil size={14}/></button>
                  <button onClick={()=>handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>}

      {(modal==="create"||modal==="edit")&&(
        <Modal title={modal==="create"?"Add Advertiser":"Edit Advertiser"} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Full Name *</label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Company</label><input value={form.company} onChange={e=>f("company",e.target.value)} className="input"/></div>
            </div>
            <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Email *</label><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input"/></div>
            {modal==="create"&&<div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Password *</label><input type="password" value={form.password} onChange={e=>f("password",e.target.value)} className="input"/></div>}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Phone</label><input value={form.phone} onChange={e=>f("phone",e.target.value)} className="input"/></div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Status</label><select value={form.status} onChange={e=>f("status",e.target.value)} className="select">{["Active","Pending","Inactive"].map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
          </div>
          {error&&<p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{saving?"Saving…":modal==="create"?"Add Advertiser":"Save"}</button>
            <button onClick={()=>setModal(null)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
