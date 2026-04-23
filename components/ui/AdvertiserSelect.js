"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdvertiserSelect({ value, onChange }) {
  const router = useRouter();
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetch("/api/advertisers").then(r=>r.json()).then(d=>{setAdvertisers(d.advertisers||[]);setLoading(false);}).catch(()=>setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => { if(ref.current&&!ref.current.contains(e.target))setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = advertisers.filter(a=>
    a.name.toLowerCase().includes(search.toLowerCase())||
    (a.company||"").toLowerCase().includes(search.toLowerCase())||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      {value ? (
        <div className="input flex items-center justify-between cursor-pointer" onClick={()=>setOpen(p=>!p)}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">{value.name[0]}</div>
            <div><p className="text-sm text-white font-semibold">{value.company||value.name}</p><p className="text-xs text-slate-500">{value.email}</p></div>
          </div>
          <button type="button" onClick={(e)=>{e.stopPropagation();onChange(null);setSearch("");setOpen(false);}} className="text-slate-500 hover:text-red-400 p-1"><X size={14}/></button>
        </div>
      ) : (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} className="input pl-8" placeholder="Search advertiser by name, company or email…" autoComplete="off"/>
        </div>
      )}

      {open&&!value&&(
        <div className="absolute z-50 w-full mt-1 rounded-xl border shadow-2xl overflow-hidden" style={{background:"#0a0f1a",borderColor:"rgba(255,255,255,0.1)"}}>
          {loading?(
            <div className="px-4 py-6 text-center"><div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-2"/><p className="text-slate-500 text-xs">Loading advertisers…</p></div>
          ):filtered.length===0?(
            <div className="px-4 py-6 text-center">
              <p className="text-slate-400 text-sm font-semibold">{advertisers.length===0?"No advertisers in database":"No results found"}</p>
              <p className="text-slate-600 text-xs mt-1">{advertisers.length===0?"Add advertisers first":"Try different search"}</p>
              {advertisers.length===0&&<button type="button" onClick={()=>router.push("/advertisers/manage")} className="mt-3 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg">+ Add Advertiser</button>}
            </div>
          ):(
            <div className="max-h-60 overflow-y-auto">
              {filtered.map(a=>(
                <button key={a._id} type="button" onClick={()=>{onChange(a);setOpen(false);setSearch("");}}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0">{a.name[0]}</div>
                  <div className="flex-1 min-w-0"><p className="text-white font-semibold text-sm">{a.company||a.name}</p><p className="text-slate-500 text-xs">{a.name} · {a.email}</p></div>
                  <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">Advertiser</span>
                </button>
              ))}
            </div>
          )}
          <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between" style={{background:"rgba(0,0,0,0.3)"}}>
            <span className="text-xs text-slate-600">{advertisers.length} advertiser(s)</span>
            <button type="button" onClick={()=>{setOpen(false);router.push("/advertisers/manage");}} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"><Plus size={10}/>Add New</button>
          </div>
        </div>
      )}

      {value&&(
        <div className="mt-2 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[["Company",value.company||"—"],["Email",value.email],["Phone",value.phone||"—"]].map(([k,v])=>(
              <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-xs text-white font-semibold truncate">{v}</p></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
EOF\git add .
git commit -m "Fix advertiser dropdown component"
git push
