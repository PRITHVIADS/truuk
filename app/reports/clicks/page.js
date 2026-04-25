"use client";
import{useEffect,useState}from"react";
import{useSession}from"next-auth/react";
import{PageHeader,Spinner}from"@/components/ui";
import{ChevronLeft,ChevronRight,Download}from"lucide-react";
import DateRangePicker from"@/components/ui/DateRangePicker";
const DI={mobile:"📱",desktop:"🖥️",tablet:"📟"};
const today=new Date().toISOString().split("T")[0];
const ago=(d)=>{const x=new Date();x.setDate(x.getDate()-d);return x.toISOString().split("T")[0];};
export default function ClickReport(){
  const{data:session}=useSession();
  const role=session?.user?.role;
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[dr,setDr]=useState({from:ago(30),to:today});
  const[page,setPage]=useState(1);
  useEffect(()=>{
    setLoading(true);
    fetch(`/api/reports/clicks?from=${dr.from}&to=${dr.to}&page=${page}`)
      .then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));
  },[dr,page]);
  const clicks=data?.clicks||[];
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  return(
    <div className="space-y-5">
      <PageHeader title="Click Report" subtitle="All click events tracked through your campaigns"
        action={<div className="flex gap-2 items-center">
          <DateRangePicker from={dr.from} to={dr.to} onChange={r=>{setDr(r);setPage(1);}}/>
          <button onClick={()=>window.open(`/api/reports/export?type=clicks&from=${dr.from}&to=${dr.to}`,"_blank")} className="btn-ghost px-3 py-2 text-xs flex items-center gap-1"><Download size={12}/>Export CSV</button>
        </div>}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Total",data?.total||0,"#3b82f6"],["Valid",clicks.filter(c=>!c.isBot&&!c.isDuplicate).length,"#10b981"],["Bots",clicks.filter(c=>c.isBot).length,"#f59e0b"],["Dups",clicks.filter(c=>c.isDuplicate).length,"#64748b"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-4" style={card}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p>
            <p className="text-2xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      {loading?<div className="flex justify-center py-20"><Spinner/></div>:
      clicks.length===0?<div className="rounded-2xl border p-12 text-center" style={card}><div className="text-5xl mb-4 opacity-30">🖱️</div><p className="text-slate-400 font-bold">No clicks in this period</p></div>:
      <div className="rounded-2xl border overflow-hidden" style={card}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}>
                {["Date & Time","Click ID","Campaign",role!=="affiliate"&&"Publisher ID","Device","OS","Country",role==="admin"&&"IP","Source",(role==="admin"||role==="affiliate")&&"Referrer","Sub1","Status"].filter(Boolean).map(h=>(
                  <th key={h} className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clicks.map((c,i)=>(
                <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.02] ${c.isBot?"opacity-40":""}`}>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <p className="text-white font-semibold">{new Date(c.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</p>
                    <p className="text-slate-500 text-xs">{new Date(c.createdAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</p>
                  </td>
                  <td className="py-2.5 px-4"><code className="text-orange-400 font-mono">{c.clickId?.slice(0,10)}…</code></td>
                  <td className="py-2.5 px-4">
                    <p className="text-white font-semibold whitespace-nowrap">{c.campaign}</p>
                    <code className="text-slate-600 font-mono text-xs">{c.campaignShortId}</code>
                  </td>
                  {role!=="affiliate"&&<td className="py-2.5 px-4"><code className="text-green-400 font-mono">{c.publisherId||"—"}</code></td>}
                  <td className="py-2.5 px-4 whitespace-nowrap">{DI[c.device]||"❓"} {c.device}</td>
                  <td className="py-2.5 px-4 text-slate-300">{c.os}</td>
                  <td className="py-2.5 px-4 text-slate-300">{c.country||"—"}</td>
                  {role==="admin"&&<td className="py-2.5 px-4"><code className="text-slate-400 font-mono">{c.ip}</code></td>}
                  <td className="py-2.5 px-4 text-slate-400">{c.source||"—"}</td>
                  {(role==="admin"||role==="affiliate")&&<td className="py-2.5 px-4 text-blue-400 max-w-xs truncate">{c.referer?c.referer.replace(/https?:\/\/(www\.)?/,"").split("/")[0]:"—"}</td>}
                  <td className="py-2.5 px-4 text-slate-400">{c.sub1||"—"}</td>
                  <td className="py-2.5 px-4">
                    {c.isBot&&<span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Bot</span>}
                    {c.isDuplicate&&<span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Dup</span>}
                    {!c.isBot&&!c.isDuplicate&&<span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">✓</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.pages>1&&<div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
          <p className="text-xs text-slate-500">Page {page} of {data.pages} · {data.total} total</p>
          <div className="flex gap-2">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg bg-white/5 text-slate-400 disabled:opacity-30"><ChevronLeft size={14}/></button>
            <button onClick={()=>setPage(p=>Math.min(data.pages,p+1))} disabled={page===data?.pages} className="p-1.5 rounded-lg bg-white/5 text-slate-400 disabled:opacity-30"><ChevronRight size={14}/></button>
          </div>
        </div>}
      </div>}
    </div>
  );
}
