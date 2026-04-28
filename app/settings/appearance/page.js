"use client";
import{useEffect,useState}from"react";
import{Save,Check,Palette,Monitor,Layout,Type,Sparkles,LayoutGrid,Moon}from"lucide-react";
const THEMES=[{id:"dark",label:"Dark",desc:"Classic dark mode",bg:"#06080f",ac:"#f97316"},{id:"midnight",label:"Midnight",desc:"Deep black",bg:"#000000",ac:"#f97316"},{id:"navy",label:"Navy",desc:"Deep blue",bg:"#0a0e1a",ac:"#3b82f6"},{id:"forest",label:"Forest",desc:"Dark green",bg:"#0a0f0a",ac:"#10b981"},{id:"purple",label:"Purple",desc:"Dark violet",bg:"#0d0a1a",ac:"#a855f7"},{id:"rose",label:"Rose",desc:"Dark rose",bg:"#140a0a",ac:"#f43f5e"}];
const ACCENTS=[{id:"orange",label:"Orange",color:"#f97316"},{id:"blue",label:"Blue",color:"#3b82f6"},{id:"green",label:"Green",color:"#10b981"},{id:"purple",label:"Purple",color:"#a855f7"},{id:"pink",label:"Pink",color:"#ec4899"},{id:"red",label:"Red",color:"#ef4444"},{id:"yellow",label:"Yellow",color:"#f59e0b"},{id:"cyan",label:"Cyan",color:"#06b6d4"}];
const FONTS=[{id:"default",label:"DM Sans",desc:"Clean and modern (default)"},{id:"inter",label:"Inter",desc:"Crisp and readable"},{id:"mono",label:"JetBrains Mono",desc:"Developer monospace"},{id:"rounded",label:"Nunito",desc:"Friendly and rounded"}];
const DENSITIES=[{id:"compact",label:"Compact",desc:"More data, less space"},{id:"default",label:"Default",desc:"Balanced layout"},{id:"comfortable",label:"Comfortable",desc:"More breathing room"}];
const DEFAULTS={theme:"dark",accent:"orange",font:"default",density:"default",sidebarStyle:"dark",borderRadius:"rounded",showAnimations:true,showAvatars:true,compactTables:false,sidebarCollapsed:false,showBreadcrumbs:true,colorfulBadges:true};
export default function AppearancePage(){
  const[prefs,setPrefs]=useState(DEFAULTS);const[saved,setSaved]=useState(false);
  const p=(k,v)=>setPrefs(prev=>({...prev,[k]:v}));
  useEffect(()=>{try{const s=localStorage.getItem("truuk_prefs");if(s)setPrefs({...DEFAULTS,...JSON.parse(s)});}catch(e){}}, []);
  const handleSave=()=>{localStorage.setItem("truuk_prefs",JSON.stringify(prefs));const accent=ACCENTS.find(a=>a.id===prefs.accent);if(accent)document.documentElement.style.setProperty("--accent",accent.color);setSaved(true);setTimeout(()=>setSaved(false),2500);};
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  const S=({title,icon:Icon,children})=>(<div className="rounded-2xl border p-5 space-y-4" style={card}><div className="flex items-center gap-2"><Icon size={15} className="text-orange-400"/><p className="text-white font-black text-sm">{title}</p></div>{children}</div>);
  return(
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-white">Appearance</h1><p className="text-slate-500 text-sm mt-0.5">Customize your Truuk experience</p></div>
        <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${saved?"bg-green-500 text-white":"btn-primary"}`}>{saved?<><Check size={14}/>Saved!</>:<><Save size={14}/>Save</>}</button>
      </div>
      <S title="Theme" icon={Moon}>
        <div className="grid grid-cols-3 gap-2">{THEMES.map(t=><button key={t.id} onClick={()=>p("theme",t.id)} type="button" className={`p-3 rounded-xl border text-left transition-all ${prefs.theme===t.id?"border-orange-500":"border-white/10 hover:border-white/20"}`}><div className="w-full h-8 rounded-lg mb-2 border border-white/10 p-1.5" style={{background:t.bg}}><div className="h-2 w-8 rounded" style={{background:t.ac}}/></div><p className={`text-xs font-bold ${prefs.theme===t.id?"text-orange-400":"text-white"}`}>{t.label}</p><p className="text-xs text-slate-600">{t.desc}</p></button>)}</div>
      </S>
      <S title="Accent Color" icon={Palette}>
        <div className="flex flex-wrap gap-2">{ACCENTS.map(a=><button key={a.id} onClick={()=>p("accent",a.id)} type="button" className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${prefs.accent===a.id?"border-white/40 bg-white/10":"border-white/10 hover:border-white/20"}`}><div className="w-4 h-4 rounded-full flex-shrink-0" style={{background:a.color}}/><span className="text-slate-300">{a.label}</span>{prefs.accent===a.id&&<Check size={11} className="text-white"/>}</button>)}</div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"><span className="text-xs text-slate-500">Preview:</span><div className="flex gap-2">{["Button","Badge","Active"].map((l,i)=><span key={l} className="px-2 py-0.5 rounded-lg text-xs font-semibold text-white" style={{background:ACCENTS.find(a=>a.id===prefs.accent)?.color||"#f97316",opacity:1-i*0.2}}>{l}</span>)}</div></div>
      </S>
      <S title="Font Family" icon={Type}>
        <div className="grid grid-cols-2 gap-2">{FONTS.map(f=><button key={f.id} onClick={()=>p("font",f.id)} type="button" className={`p-3 rounded-xl border text-left transition-all ${prefs.font===f.id?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5 hover:border-white/20"}`}><p className={`text-sm font-bold mb-0.5 ${prefs.font===f.id?"text-orange-400":"text-white"}`}>{f.label}</p><p className="text-xs text-slate-500">{f.desc}</p></button>)}</div>
      </S>
      <S title="Layout Density" icon={LayoutGrid}>
        <div className="grid grid-cols-3 gap-2">{DENSITIES.map(d=><button key={d.id} onClick={()=>p("density",d.id)} type="button" className={`p-3 rounded-xl border text-center transition-all ${prefs.density===d.id?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5 hover:border-white/20"}`}><p className={`text-sm font-bold mb-0.5 ${prefs.density===d.id?"text-orange-400":"text-white"}`}>{d.label}</p><p className="text-xs text-slate-500">{d.desc}</p></button>)}</div>
      </S>
      <S title="Sidebar Style" icon={Layout}>
        <div className="grid grid-cols-3 gap-2">{[{id:"dark",label:"Dark",bg:"#0c1120"},{id:"colored",label:"Colored",bg:"#431407"},{id:"glass",label:"Glass",bg:"rgba(255,255,255,0.05)"}].map(s=><button key={s.id} onClick={()=>p("sidebarStyle",s.id)} type="button" className={`p-3 rounded-xl border text-left transition-all ${prefs.sidebarStyle===s.id?"border-orange-500 bg-orange-500/10":"border-white/10 bg-white/5 hover:border-white/20"}`}><div className="flex gap-1.5 mb-2 h-10"><div className="w-8 rounded border border-white/10 space-y-1 p-1" style={{background:s.bg}}><div className="h-1 bg-orange-500/60 rounded"/><div className="h-1 bg-white/20 rounded"/><div className="h-1 bg-white/10 rounded"/></div><div className="flex-1 space-y-1 pt-1"><div className="h-1.5 bg-white/10 rounded"/><div className="h-1.5 bg-white/5 rounded w-3/4"/></div></div><p className={`text-xs font-bold ${prefs.sidebarStyle===s.id?"text-orange-400":"text-white"}`}>{s.label}</p></button>)}</div>
      </S>
      <S title="Border Radius" icon={Sparkles}>
        <div className="flex gap-2">{[{id:"sharp",label:"Sharp",r:"rounded-none"},{id:"slight",label:"Slight",r:"rounded-md"},{id:"rounded",label:"Rounded",r:"rounded-xl"},{id:"pill",label:"Pill",r:"rounded-3xl"}].map(r=><button key={r.id} onClick={()=>p("borderRadius",r.id)} type="button" className={`flex-1 py-3 border text-xs font-semibold transition-all ${r.r} ${prefs.borderRadius===r.id?"border-orange-500 bg-orange-500/10 text-orange-400":"border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}>{r.label}</button>)}</div>
      </S>
      <S title="Interface Options" icon={Monitor}>
        {[{key:"showAnimations",label:"Smooth Animations",desc:"Page transitions and hover effects"},{key:"showAvatars",label:"Show Avatars",desc:"Colorful initials avatars throughout the app"},{key:"compactTables",label:"Compact Tables",desc:"Reduce row padding in data tables"},{key:"sidebarCollapsed",label:"Start with Collapsed Sidebar",desc:"Sidebar minimized by default"},{key:"showBreadcrumbs",label:"Show Breadcrumbs",desc:"Navigation path at top of pages"},{key:"colorfulBadges",label:"Colorful Status Badges",desc:"Use colors for status indicators"}].map((opt,i,arr)=>(
          <div key={opt.key} className={`flex items-center justify-between py-3.5 ${i<arr.length-1?"border-b border-white/5":""}`}>
            <div><p className="text-sm font-semibold text-white">{opt.label}</p><p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p></div>
            <button onClick={()=>p(opt.key,!prefs[opt.key])} type="button" className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ml-4 ${prefs[opt.key]?"bg-orange-500":"bg-white/10"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${prefs[opt.key]?"left-6":"left-1"}`}/></button>
          </div>
        ))}
      </S>
      <div className="flex justify-between items-center">
        <button onClick={()=>{setPrefs(DEFAULTS);localStorage.removeItem("truuk_prefs");}} className="text-xs text-slate-500 hover:text-red-400 underline">Reset to defaults</button>
        <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${saved?"bg-green-500 text-white":"btn-primary"}`}>{saved?<><Check size={14}/>Saved!</>:<><Save size={14}/>Save Appearance</>}</button>
      </div>
    </div>
  );
}
