"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";

const EMPTY={name:"",email:"",password:"",role:"advertiser",company:"",phone:"",status:"Active"};
function Badge({s}){const m={Active:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30",Pending:"bg-amber-500/15 text-amber-400 border-amber-500/30",Inactive:"bg-red-500/15 text-red-400 border-red-500/30"};return<span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${m[s]||m.Pending}`}>{s}</span>;}
const ROLE_COLORS={admin:"text-orange-400",advertiser:"text-blue-400",affiliate:"text-green-400"};

export default function UsersPage(){
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("All");
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  const load=async()=>{
    setLoading(true);
    const params=new URLSearchParams();
    if(filter!=="All")params.set("role",filter);
    const r=await fetch(`/api/users?${params}`);
    const d=await r.json();
    setUsers(d.users||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[filter]);

  const handleSave=async()=>{
    if(!form.name||!form.email){setError("Name and email required");return;}
    setSaving(true);setError("");
    const url=modal==="edit"?`/api/users/${form._id}`:"/api/users";
    const method=modal==="edit"?"PATCH":"POST";
    const body={...form};
    if(modal==="edit")delete body.password;
    const r=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}
    await load();setModal(null);setSaving(false);
  };

  const updateStatus=async(id,status)=>{
    await fetch(`/api/users/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
    await load();
  };

  const handleDelete=async(id)=>{
    if(!confirm("Delete this user?"))return;
    await fetch(`/api/users/${id}`,{method:"DELETE"});
    await load();
  };

  const pending=users.filter(u=>u.status==="Pending");
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-white">User Management</h1><p className="text-slate-500 text-sm">Manage all platform users</p></div>
        <button onClick={()=>{setForm(EMPTY);setError("");setModal("create");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Add User</button>
      </div>

      {pending.length>0&&(
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-amber-400 font-bold text-sm mb-3">⏳ {pending.length} user(s) awaiting approval</p>
          <div className="space-y-2">
            {pending.map(u=>(
              <div key={u._id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                <div>
                  <p className="text-white text-sm font-semibold">{u.name}</p>
                  <p className="text-slate-500 text-xs">{u.email} · <span className="capitalize">{u.role}</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>updateStatus(u._id,"Active")} className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg transition-all"><CheckCircle size={12}/>Approve</button>
                  <button onClick={()=>updateStatus(u._id,"Inactive")} className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition-all"><XCircle size={12}/>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {["All","admin","advertiser","affiliate"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all capitalize ${filter===f?"bg-orange-500 text-white":"bg-white/5 text-slate-400 hover:text-white"}`}>{f}</button>
        ))}
      </div>

      {loading?<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"/></div>
      :<div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {["User","Role","Company","Status","Joined","Actions"].map(h=>(
                <th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr></thead>
            <tbody>{users.map(u=>(
              <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-xs text-white font-black">{u.name[0]}</div>
                    <div><p className="text-sm text-white font-semibold">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                  </div>
                </td>
                <td className="py-3 px-4"><span className={`text-xs font-bold capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span></td>
                <td className="py-3 px-4 text-sm text-slate-400">{u.company||"—"}</td>
                <td className="py-3 px-4"><Badge s={u.status}/></td>
                <td className="py-3 px-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {u.status==="Pending"&&<><button onClick={()=>updateStatus(u._id,"Active")} className="p-1.5 rounded-lg hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition-all"><CheckCircle size={14}/></button><button onClick={()=>updateStatus(u._id,"Inactive")} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"><XCircle size={14}/></button></>}
                    <button onClick={()=>{setForm({...u,password:""});setModal("edit");setError("");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Pencil size={14}/></button>
                    <button onClick={()=>handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>}

      {(modal==="create"||modal==="edit")&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)"}}>
          <div className="rounded-2xl border w-full max-w-md" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-white font-black">{modal==="create"?"Add User":"Edit User"}</h2>
              <button onClick={()=>setModal(null)} className="text-slate-500 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Full Name *</label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input" placeholder="Full name"/></div>
                <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Company</label><input value={form.company} onChange={e=>f("company",e.target.value)} className="input" placeholder="Company"/></div>
              </div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Email *</label><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input"/></div>
              {modal==="create"&&<div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Password *</label><input type="password" value={form.password} onChange={e=>f("password",e.target.value)} className="input" placeholder="Min 6 chars"/></div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Role</label>
                  <select value={form.role} onChange={e=>f("role",e.target.value)} className="select">
                    {["admin","advertiser","affiliate"].map(r=><option key={r}>{r}</option>)}
                  </select></div>
                <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Status</label>
                  <select value={form.status} onChange={e=>f("status",e.target.value)} className="select">
                    {["Active","Pending","Inactive"].map(s=><option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs text-slate-400 font-semibold block mb-1.5">Phone</label><input value={form.phone} onChange={e=>f("phone",e.target.value)} className="input"/></div>
              {error&&<p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3"><button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{saving?"Saving…":modal==="create"?"Add User":"Save"}</button><button onClick={()=>setModal(null)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
