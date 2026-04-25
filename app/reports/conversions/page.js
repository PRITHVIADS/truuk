"use client";
import{useEffect,useState}from"react";import{useSession}from"next-auth/react";import{PageHeader,Spinner}from"@/components/ui";import{ChevronLeft,ChevronRight,Download}from"lucide-react";import DateRangePicker from"@/components/ui/DateRangePicker";
const SC={Approved:"text-green-400 bg-green-500/15 border-green-500/30",Pending:"text-amber-400 bg-amber-500/15 border-amber-500/30",Rejected:"text-red-400 bg-red-500/15 border-red-500/30",Paid:"text-blue-400 bg-blue-500/15 border-blue-500/30"};
const today=new Date().toISOString().split("T")[0];
const ago=(d)=>{const x=new Date();x.setDate(x.getDate()-d);return x.toISOString().split("T")[0];};
export default function ConversionReport(){
  const{data:session}=useSession();const role=session?.user?.role;
  const[data,setData]=useState(null);const[loading,setLoading]=useState(true);
  const[dr,setDr]=useState({from:ago(30),to:today});const[page,setPage]=useState(1);
  useEffect(()=>{setLoading(true);fetch(`/api/reports/conversions?from=${dr.from}&to=${dr.to}&page=${page}`).then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));},[dr,page]);
  const convs=data?.conversions||[];const t=data?.totals||{};
  const fmt=(n)=>n>=1000?`₹${(n/1000).toFixed(1)}K`:`₹${(n||0).toFixed(2)}`;
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  return(
    <div className="space-y-5">
      <PageHeader title="Conversion Report" subtitle="All tracked conversions and payouts"
        action={<div className="flex gap-2"><DateRangePicker from={dr.from} to={dr.to} onChange={r=>{setDr(r);setPage(1);}}/><button onClick={()=>window.open(`/api/reports/export?type=conversions&from=${dr.from}&to=${dr.to}`,"_blank")} className="btn-ghost px-3 py-2 text-xs flex items-center gap-1"><Download size={12}/>Export CSV</button></div>}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Total",data?.total||0,"#10b981"],["Payout",fmt(t.totalPayout||0),"#f97316"],["Sale",fmt(t.totalSale||0),"#3b82f6"],["Avg",t.count?fmt((t.totalPayout||0)/t.count):"₹0","#a855f7"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-4" style={card}><p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p><p className="text-2xl font-black" style={{color:c}}>{v}</p></div>
        ))}
      </div>
      {loading?<div className="flex justify-center py-20"><Spinner/></div>:convs.length===0?<div className="rounded-2xl border p-12 text-center" style={card}><div className="text-5xl mb-4 opacity-30">💸</div><p className="text-slate-400 font-bold">No conversions in this period</p></div>:(
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="overflow-x-auto"><table className="w-full text-xs">
            <thead><tr className="border-b border-white/5" style={{background:"rgba(255,255,255,0.03)"}}>
              {["Date & Time","Campaign",role!=="affiliate"&&"Publisher ID","Objective","TXN ID","Sale Amount","Payout","Status"].filter(Boolean).map(h=><th key={h} className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>{convs.map((c,i)=>(
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-2.5 px-4 whitespace-nowrap"><p className="text-white font-semibold">{new Date(c.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"})}</p><p className="text-slate-500 text-xs">{new Date(c.createdAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</p></td>
                <td className="py-2.5 px-4"><p className="text-white font-semibold">{c.campaign}</p><code className="text-slate-600 font-mono text-xs">{c.campaignShortId}</code></td>
                {role!=="affiliate"&&<td className="py-2.5 px-4"><code className="text-green-400 font-mono">{c.publisherId||"—"}</code></td>}
                <td className="py-2.5 px-4"><span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${c.objective==="Sale"?"bg-blue-500/15 text-blue-400":"bg-orange-500/15 text-orange-400"}`}>{c.objective}</span></td>
                <td className="py-2.5 px-4"><code className="text-slate-400 font-mono">{c.transactionId}</code></td>
                <td className="py-2.5 px-4 text-slate-300">{c.saleAmount>0?`₹${c.saleAmount?.toLocaleString("en-IN")}`:"—"}</td>
                <td className="py-2.5 px-4 text-green-400 font-black">+{fmt(c.payout)}</td>
                <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${SC[c.status]||"text-slate-400 bg-white/5 border-white/10"}`}>{c.status}</span></td>
              </tr>
            ))}</tbody>
          </table></div>
          {data?.pages>1&&<div className="flex items-center justify-between px-5 py-3 border-t border-white/5"><p className="text-xs text-slate-500">Page {page} of {data.pages}</p><div className="flex gap-2"><button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg bg-white/5 text-slate-400 disabled:opacity-30"><ChevronLeft size={14}/></button><button onClick={()=>setPage(p=>Math.min(data.pages,p+1))} disabled={page===data?.pages} className="p-1.5 rounded-lg bg-white/5 text-slate-400 disabled:opacity-30"><ChevronRight size={14}/></button></div></div>}
        </div>
      )}
    </div>
  );
}
