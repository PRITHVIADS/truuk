"use client";
import{useEffect,useState}from"react";
import{Plus,Trash2,Info,Pencil}from"lucide-react";
const ROLES=[{id:"co_admin",label:"Co-Admin",desc:"Full access except billing and account deletion",color:"orange",perms:["All campaigns & publishers","All reports","Manage team members","Cannot access billing"]},{id:"affiliate_manager",label:"Affiliate Manager",desc:"Manages publishers and their campaigns",color:"green",perms:["Manage publishers","Approve requests","Publisher reports","Manage payouts"]},{id:"advertiser_manager",label:"Advertiser Manager",desc:"Manages advertisers and campaigns",color:"blue",perms:["Manage advertisers","Create campaigns","Advertiser reports","Manage conversions"]},{id:"report_viewer",label:"Report Viewer",desc:"Read-only access to all reports",color:"purple",perms:["View all reports","Export CSV","View dashboard","No edit access"]}];
const RC={co_admin:"text-orange-400 bg-orange-500/15 border-orange-500/30",affiliate_manager:"text-green-400 bg-green-500/15 border-green-500/30",advertiser_manager:"text-blue-400 bg-blue-500/15 border-blue-500/30",report_viewer:"text-purple-400 bg-purple-500/15 border-purple-500/30",admin:"text-orange-400 bg-orange-500/15 border-orange-500/30"};
const EMPTY={name:"",email:"",password:"",role:"affiliate_manager"};
export default function TeamPage(){
  const[members,setMembers]=useState([]);const[loading,setLoading]=useState(true);const[modal,setModal]=useState(null);const[form,setForm]=useState(EMPTY);const[saving,setSaving]=useState(false);const[error,setError]=useState("");
  const load=async()=>{setLoading(true);const r=await fetch("/api/team");const d=await r.json();setMembers(d.members||[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave=async()=>{
    if(!form.name){setError("Name required");return;}if(!form.email){setError("Email required");return;}if(modal==="create"&&(!form.password||form.password.length<8)){setError("Password min 8 characters");return;}
    setSaving(true);setError("");const url=modal==="edit"?`/api/team/${form._id}`:"/api/team";const body={...form};if(modal==="edit")delete body.password;
    const r=await fetch(url,{method:modal==="edit"?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();
    if(!r.ok){setError(d.error||"Error");setSaving(false);return;}await load();setModal(null);setForm(EMPTY);setSaving(false);
  };
  const handleDelete=async(id)=>{if(!confirm("Remove?"))return;await fetch(`/api/team/${id}`,{method:"DELETE"});await load();};
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  return(
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-white">Team Members</h1><p className="text-slate-500 text-sm mt-0.5">Manage your team and assign roles</p></div>
        <button onClick={()=>{setForm(EMPTY);setError("");setModal("create");}} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Add Member</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {ROLES.map(role=>(
          <div key={role.id} className="rounded-2xl border p-4" style={card}>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${RC[role.id]}`}>{role.label}</span>
            <p className="text-xs text-slate-500 mt-2 mb-2">{role.desc}</p>
            <div className="space-y-1">{role.perms.map(p=><p key={p} className="text-xs text-slate-600 flex items-center gap-1"><span className="text-green-500">✓</span>{p}</p>)}</div>
          </div>
        ))}
      </div>
      {loading?<div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"/></div>:members.length===0?(
        <div className="rounded-2xl border p-12 text-center" style={card}><div className="text-5xl mb-4 opacity-30">👥</div><p className="text-slate-400 font-bold mb-1">No team members yet</p><p className="text-slate-600 text-sm mb-4">Add team members to help manage your network</p><button onClick={()=>{setForm(EMPTY);setError("");setModal("create");}} className="btn-primary px-4 py-2 text-sm">Add First Member</button></div>
      ):(
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="overflow-x-auto"><table className="w-full text-xs">
            <thead><tr className="border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}>{["Member","Role","Status","Joined","Actions"].map(h=><th key={h} className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>{members.map(m=>(
              <tr key={m._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-black text-sm">{m.name[0]}</div><div><p className="text-white font-semibold">{m.name}</p><p className="text-slate-500">{m.email}</p></div></div></td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${RC[m.role]||"text-slate-400 bg-white/5 border-white/10"}`}>{ROLES.find(r=>r.id===m.role)?.label||m.role}</span></td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${m.status==="Active"?"text-green-400 bg-green-500/15 border-green-500/30":"text-amber-400 bg-amber-500/15 border-amber-500/30"}`}>{m.status}</span></td>
                <td className="py-3 px-4 text-slate-500">{new Date(m.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td>
                <td className="py-3 px-4"><div className="flex gap-1"><button onClick={()=>{setForm({...m,password:""});setError("");setModal("edit");}} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"><Pencil size={14}/></button><button onClick={()=>handleDelete(m._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400"><Trash2 size={14}/></button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      )}
      {(modal==="create"||modal==="edit")&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.8)"}}>
          <div className="w-full max-w-lg rounded-2xl border overflow-hidden" style={{background:"#0a0f1a",borderColor:"rgba(255,255,255,0.1)"}}>
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between"><h3 className="text-white font-black text-lg">{modal==="create"?"Add Team Member":"Edit Team Member"}</h3><button onClick={()=>setModal(null)} className="text-slate-500 hover:text-white text-2xl leading-none">×</button></div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20"><Info size={15} className="text-blue-400 flex-shrink-0 mt-0.5"/><p className="text-xs text-blue-400">Team members can only access data within your organization. Billing and super admin settings are not accessible.</p></div>
              <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Full Name <span className="text-red-400">*</span></label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input w-full" placeholder="e.g. Rahul Sharma"/></div>
              <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Email <span className="text-red-400">*</span></label><input type="email" value={form.email} onChange={e=>f("email",e.target.value)} className="input w-full" placeholder="team@yournetwork.com" disabled={modal==="edit"}/></div>
              {modal==="create"&&<div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Password <span className="text-red-400">*</span></label><input type="password" value={form.password} onChange={e=>f("password",e.target.value)} className="input w-full" placeholder="Min. 8 characters"/></div>}
              <div><label className="text-sm text-slate-300 font-semibold block mb-2">Role <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-1 gap-2">{ROLES.map(role=>(
                  <button key={role.id} onClick={()=>f("role",role.id)} type="button" className={`p-3 rounded-xl border text-left transition-all ${form.role===role.id?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5 hover:border-white/20"}`}>
                    <div className="flex items-center justify-between"><p className={`text-sm font-bold ${form.role===role.id?"text-orange-400":"text-white"}`}>{role.label}</p><span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${RC[role.id]}`}>{role.label}</span></div>
                    <p className="text-xs text-slate-500 mt-1">{role.desc}</p>
                  </button>
                ))}</div>
              </div>
              {error&&<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
              <div className="flex gap-3 pt-2"><button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 text-sm">{saving?"Saving…":modal==="create"?"Add Member":"Save Changes"}</button><button onClick={()=>{setModal(null);setError("");}} className="btn-ghost px-5 py-3 text-sm">Cancel</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
