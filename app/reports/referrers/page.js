"use client";
import{useEffect,useState}from"react";import{useSession}from"next-auth/react";import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,Cell}from"recharts";import{PageHeader,FilterTabs,Spinner}from"@/components/ui";
const TT={background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,color:"#fff",fontSize:12};
const COLORS=["#f97316","#3b82f6","#10b981","#a855f7","#f59e0b","#ec4899","#06b6d4","#84cc16"];
const PI={"facebook.com":"🟦","instagram.com":"🟣","google.com":"🔴","youtube.com":"🔴","twitter.com":"🐦","x.com":"🐦","linkedin.com":"🔵","whatsapp.com":"🟢","telegram.org":"✈️","tiktok.com":"⬛","direct":"🔗"};
const gi=(d)=>{for(const[k,v]of Object.entries(PI)){if(d.includes(k))return v;}return"🌐";};
export default function ReferrerReport(){
  const{data:session}=useSession();const role=session?.user?.role;
  const[data,setData]=useState(null);const[loading,setLoading]=useState(true);const[range,setRange]=useState("30");const[sort,setSort]=useState("clicks");
  useEffect(()=>{setLoading(true);fetch(`/api/reports/referrers?range=${range}`).then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));},[range]);
  const refs=data?.referrers||[];const sorted=[...refs].sort((a,b)=>b[sort]-a[sort]);const total=refs.reduce((s,d)=>s+d.clicks,0);
  const card={background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"};
  return(
    <div className="space-y-5">
      <PageHeader title="Referrer / Domain Report" subtitle="Traffic sources sending visitors to your campaigns"
        action={<FilterTabs options={["7","30","90"]} value={range} onChange={setRange}/>}/>
      {role==="advertiser"&&refs.length===0&&!loading&&<div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"><p className="text-amber-400 font-semibold text-sm">⚠️ Referrer sharing is disabled for your campaigns</p><p className="text-slate-500 text-xs mt-1">Enable "Share Referrer with Advertiser" in Campaign Settings</p></div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Total Clicks",total.toLocaleString(),"#3b82f6"],["Conversions",refs.reduce((s,d)=>s+d.conversions,0),"#10b981"],["Sources",refs.length,"#f97316"],["Avg CR%",total?((refs.reduce((s,d)=>s+d.conversions,0)/total)*100).toFixed(2)+"%":"0%","#a855f7"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-4" style={card}><p className="text-xs text-slate-500 uppercase font-bold mb-2">{l}</p><p className="text-2xl font-black" style={{color:c}}>{v}</p></div>
        ))}
      </div>
      {loading?<div className="flex justify-center py-20"><Spinner/></div>:refs.length===0?(
        <div className="rounded-2xl border p-12 text-center" style={card}><div className="text-5xl mb-4 opacity-30">🌐</div><p className="text-slate-400 font-bold">No referrer data yet</p></div>
      ):<>
        <div className="rounded-2xl border p-5" style={card}>
          <p className="text-sm font-bold text-slate-300 mb-4">Traffic by Source</p>
          <ResponsiveContainer width="100%" height={220}><BarChart data={sorted.slice(0,10)} margin={{left:-20}}><XAxis dataKey="domain" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={d=>d.length>10?d.slice(0,10)+"…":d}/><YAxis tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={TT}/><Bar dataKey={sort} radius={[6,6,0,0]}>{sorted.slice(0,10).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar></BarChart></ResponsiveContainer>
        </div>
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between" style={{background:"rgba(255,255,255,0.03)"}}><p className="text-sm font-bold text-slate-300">Source Breakdown</p><div className="flex gap-2">{["clicks","conversions"].map(s=><button key={s} onClick={()=>setSort(s)} className={`text-xs px-2 py-0.5 rounded font-semibold ${sort===s?"text-orange-400":"text-slate-500 hover:text-white"}`}>↕ {s}</button>)}</div></div>
          <div className="overflow-x-auto"><table className="w-full text-xs">
            <thead><tr className="border-b border-white/5">{["#","Source","Clicks","Share","Conv.","CR%","Revenue"].map(h=><th key={h} className="py-3 px-4 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>{sorted.map((row,i)=>{const share=total?((row.clicks/total)*100).toFixed(1):"0";const cr=row.clicks?((row.conversions/row.clicks)*100).toFixed(2):"0.00";return(
              <tr key={row.domain} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-slate-500">{i+1}</td>
                <td className="py-3 px-4"><div className="flex items-center gap-2"><span className="text-lg">{gi(row.domain)}</span><div><p className="text-white font-semibold">{row.domain}</p><div className="h-1 w-20 bg-white/5 rounded-full mt-1"><div className="h-1 rounded-full bg-orange-500" style={{width:`${share}%`}}/></div></div></div></td>
                <td className="py-3 px-4 font-bold text-white">{row.clicks.toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-400">{share}%</td>
                <td className="py-3 px-4 text-slate-300">{row.conversions}</td>
                <td className="py-3 px-4"><span className={`font-bold ${+cr>5?"text-green-400":+cr>2?"text-amber-400":"text-slate-400"}`}>{cr}%</span></td>
                <td className="py-3 px-4 font-bold text-orange-400">₹{row.revenue?.toLocaleString("en-IN")||0}</td>
              </tr>
            );})}</tbody>
          </table></div>
        </div>
      </>}
    </div>
  );
}
