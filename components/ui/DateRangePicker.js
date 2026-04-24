"use client";
import{useState}from"react";import{Calendar}from"lucide-react";
export default function DateRangePicker({from,to,onChange}){
  const[open,setOpen]=useState(false);
  const PRESETS=[{label:"Today",days:0},{label:"Yesterday",days:1},{label:"Last 7",days:7},{label:"Last 30",days:30},{label:"Last 90",days:90},{label:"This month",days:"month"}];
  const apply=(days)=>{const end=new Date();let start=new Date();if(days===0){start.setHours(0,0,0,0);}else if(days===1){start.setDate(start.getDate()-1);start.setHours(0,0,0,0);end.setDate(end.getDate()-1);}else if(days==="month"){start=new Date(end.getFullYear(),end.getMonth(),1);}else{start.setDate(start.getDate()-days);}onChange({from:start.toISOString().split("T")[0],to:end.toISOString().split("T")[0]});setOpen(false);};
  const fmt=(d)=>d?new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";
  return(
    <div className="relative">
      <button onClick={()=>setOpen(p=>!p)} className="flex items-center gap-2 btn-ghost px-3 py-2 text-xs"><Calendar size={13} className="text-orange-400"/><span className="text-white font-semibold">{fmt(from)}</span><span className="text-slate-500">→</span><span className="text-white font-semibold">{fmt(to)}</span></button>
      {open&&(<div className="absolute right-0 z-50 mt-1 rounded-2xl border shadow-2xl overflow-hidden w-80" style={{background:"#0a0f1a",borderColor:"rgba(255,255,255,0.1)"}}>
        <div className="p-4 border-b border-white/5"><p className="text-xs font-bold text-slate-400 mb-3">QUICK SELECT</p><div className="grid grid-cols-3 gap-2">{PRESETS.map(p=><button key={p.label} onClick={()=>apply(p.days)} className="text-xs px-2 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500/15 hover:text-orange-400 text-slate-400 font-semibold">{p.label}</button>)}</div></div>
        <div className="p-4 space-y-3"><p className="text-xs font-bold text-slate-400">CUSTOM RANGE</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-500 block mb-1">From</label><input type="date" value={from||""} onChange={e=>onChange({from:e.target.value,to})} className="input text-xs w-full" style={{colorScheme:"dark"}}/></div>
            <div><label className="text-xs text-slate-500 block mb-1">To</label><input type="date" value={to||""} onChange={e=>onChange({from,to:e.target.value})} className="input text-xs w-full" style={{colorScheme:"dark"}}/></div>
          </div>
          <button onClick={()=>setOpen(false)} className="btn-primary w-full py-2 text-xs">Apply</button>
        </div>
      </div>)}
    </div>
  );
}
