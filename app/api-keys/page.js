"use client";
import{useEffect,useState}from"react";import{PageHeader,Spinner}from"@/components/ui";import{Plus,Copy,Trash2,Eye,EyeOff,Check,Shield,AlertCircle}from"lucide-react";
export default function ApiKeys(){
  const[keys,setKeys]=useState([]);const[loading,setLoading]=useState(true);const[modal,setModal]=useState(false);const[newKey,setNewKey]=useState(null);const[creating,setCreating]=useState(false);const[error,setError]=useState("");const[copied,setCopied]=useState("");
  const[form,setForm]=useState({name:"",permissions:["read"],expiresAt:""});
  const load=async()=>{setLoading(true);const r=await fetch("/api/api-keys");const d=await r.json();setKeys(d.keys||[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const togglePerm=(p)=>setForm(prev=>({...prev,permissions:prev.permissions.includes(p)?prev.permissions.filter(x=>x!==p):[...prev.permissions,p]}));
  const handleCreate=async()=>{if(!form.name){setError("Name required");return;}setCreating(true);setError("");const r=await fetch("/api/api-keys",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok){setError(d.error||"Error");setCreating(false);return;}setNewKey(d.key);setModal(false);setForm({name:"",permissions:["read"],expiresAt:""});setCreating(false);await load();};
  const handleDelete=async(id)=>{if(!confirm("Delete this key?"))return;await fetch(`/api/api-keys?id=${id}`,{method:"DELETE"});await load();};
  const handleToggle=async(id,isActive)=>{await fetch("/api/api-keys",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,isActive:!isActive})});await load();};
  const copy=(text,key)=>{navigator.clipboard.writeText(text);setCopied(key);setTimeout(()=>setCopied(""),2000);};
  const PERMS=[{id:"read",label:"Read",desc:"Access reports",color:"blue"},{id:"write",label:"Write",desc:"Create campaigns",color:"orange"},{id:"conversions",label:"Conversions",desc:"Post conversions",color:"green"},{id:"reports",label:"Reports",desc:"Export data",color:"purple"}];
  const PC={blue:"border-blue-500/30 bg-blue-500/10 text-blue-400",orange:"border-orange-500/30 bg-orange-500/10 text-orange-400",green:"border-green-500/30 bg-green-500/10 text-green-400",purple:"border-purple-500/30 bg-purple-500/10 text-purple-400"};
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  return(
    <div className="space-y-6">
      <PageHeader title="API Keys" subtitle="Manage API keys for programmatic access"
        action={<button onClick={()=>setModal(true)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16}/>Generate Key</button>}/>
      {newKey&&<div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
        <div className="flex items-start gap-3 mb-3"><AlertCircle size={18} className="text-green-400 flex-shrink-0"/><div><p className="text-green-400 font-bold">Key Generated — Copy now, won't be shown again!</p></div></div>
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3"><code className="text-green-400 font-mono text-sm flex-1 break-all">{newKey}</code><button onClick={()=>copy(newKey,"new")} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${copied==="new"?"bg-green-500 text-white":"bg-white/10 text-slate-300"}`}>{copied==="new"?"✓ Copied!":"Copy"}</button></div>
        <button onClick={()=>setNewKey(null)} className="text-xs text-slate-500 mt-2 hover:text-slate-400">Dismiss</button>
      </div>}
      <div className="rounded-2xl border p-5" style={card}>
        <p className="text-sm font-bold text-white mb-2">🔑 Usage</p>
        <code className="block bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-green-400 font-mono text-xs">Authorization: Bearer {'<your-api-key>'}</code>
        <p className="text-xs text-slate-500 mt-2">Or: <code className="text-orange-400">?api_key={'<key>'}</code></p>
      </div>
      {loading?<div className="flex justify-center py-10"><Spinner/></div>:keys.length===0?(
        <div className="rounded-2xl border p-12 text-center" style={card}><div className="text-5xl mb-4 opacity-30">🔑</div><p className="text-slate-400 font-bold">No API keys yet</p><button onClick={()=>setModal(true)} className="btn-primary px-4 py-2 text-sm mt-4">Generate Key</button></div>
      ):<div className="space-y-3">{keys.map(k=>(
        <div key={k._id} className={`rounded-2xl border p-5 ${k.isActive?"":"opacity-50"}`} style={card}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><Shield size={14} className={k.isActive?"text-green-400":"text-slate-500"}/><p className="text-white font-bold">{k.name}</p><span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${k.isActive?"bg-green-500/15 text-green-400 border-green-500/30":"bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>{k.isActive?"Active":"Inactive"}</span></div>
              <code className="text-slate-500 font-mono text-xs bg-white/5 px-2 py-0.5 rounded">{k.prefix}••••••••••••••••</code>
              <div className="flex flex-wrap gap-1.5 mt-2">{k.permissions?.map(p=>{const perm=PERMS.find(x=>x.id===p);return perm?<span key={p} className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${PC[perm.color]}`}>{perm.label}</span>:null;})}</div>
              <div className="flex gap-4 text-xs text-slate-500 mt-2"><span>Created: {new Date(k.createdAt).toLocaleDateString("en-IN")}</span>{k.lastUsed&&<span>Last used: {new Date(k.lastUsed).toLocaleDateString("en-IN")}</span>}{k.expiresAt&&<span className="text-amber-400">Expires: {new Date(k.expiresAt).toLocaleDateString("en-IN")}</span>}<span>Requests: {k.requestCount||0}</span></div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={()=>handleToggle(k._id,k.isActive)} className={`p-2 rounded-lg text-xs ${k.isActive?"bg-amber-500/10 text-amber-400":"bg-green-500/10 text-green-400"}`}>{k.isActive?<EyeOff size={14}/>:<Eye size={14}/>}</button>
              <button onClick={()=>handleDelete(k._id)} className="p-2 rounded-lg bg-red-500/10 text-red-400"><Trash2 size={14}/></button>
            </div>
          </div>
        </div>
      ))}</div>}
      {modal&&<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.7)"}}>
        <div className="w-full max-w-md rounded-2xl border p-6" style={{background:"#0a0f1a",borderColor:"rgba(255,255,255,0.1)"}}>
          <h3 className="text-white font-black text-lg mb-5">Generate API Key</h3>
          <div className="space-y-4">
            <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Key Name *</label><input value={form.name} onChange={e=>f("name",e.target.value)} className="input w-full" placeholder="e.g. Production Server"/></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-2">Permissions</label><div className="grid grid-cols-2 gap-2">{PERMS.map(p=><button key={p.id} onClick={()=>togglePerm(p.id)} type="button" className={`p-3 rounded-xl border text-left transition-all ${form.permissions.includes(p.id)?PC[p.color]:"border-white/10 bg-white/5 text-slate-400"}`}><p className="text-xs font-bold">{p.label}</p><p className="text-xs opacity-70 mt-0.5">{p.desc}</p></button>)}</div></div>
            <div><label className="text-sm text-slate-300 font-semibold block mb-1.5">Expiry <span className="text-xs text-slate-500">(Optional)</span></label><input type="date" value={form.expiresAt} onChange={e=>f("expiresAt",e.target.value)} className="input w-full" style={{colorScheme:"dark"}}/></div>
            {error&&<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20"><p className="text-xs text-amber-400">⚠️ Key shown only once. Save it immediately!</p></div>
          </div>
          <div className="flex gap-3 mt-5"><button onClick={handleCreate} disabled={creating} className="btn-primary flex-1 py-2.5 text-sm">{creating?"Generating…":"Generate Key"}</button><button onClick={()=>{setModal(false);setError("");}} className="btn-ghost px-4 py-2.5 text-sm">Cancel</button></div>
        </div>
      </div>}
    </div>
  );
}
