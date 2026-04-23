"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PageHeader, FilterTabs, Spinner } from "@/components/ui";

const TT={background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,color:"#fff",fontSize:12};
const TITLE={"campaigns":"Campaigns Report","publishers":"Publishers Report","advertisers":"Advertisers Report","daily":"Daily Report","clicks":"Click Report","conversions":"Conversion Report"}["campaigns"];
const SUBTITLE={"campaigns":"Performance breakdown by campaign","publishers":"Performance breakdown by publisher","advertisers":"Performance breakdown by advertiser","daily":"Day by day performance","clicks":"All click activity","conversions":"All conversion activity"}["campaigns"];

export default function ReportPage(){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [range,setRange]=useState("30");

  useEffect(()=>{
    fetch(`/api/reports?range=${range}`).then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));
  },[range]);

  const timeline=data?.timelineData||[];
  const totalClicks=timeline.reduce((s,d)=>s+d.clicks,0);
  const totalConv=timeline.reduce((s,d)=>s+d.conversions,0);
  const totalRev=timeline.reduce((s,d)=>s+d.revenue,0);
  const fmt=(n)=>n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(1)}K`:`₹${n}`;

  return(
    <div className="space-y-6">
      <PageHeader title={TITLE} subtitle={SUBTITLE}
        action={<div className="flex gap-2"><FilterTabs options={["7","30","90"]} value={range} onChange={setRange}/><button className="btn-ghost px-3 py-1.5 text-xs">Export CSV</button></div>}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Total Clicks",totalClicks.toLocaleString(),"#3b82f6"],["Conversions",totalConv.toLocaleString(),"#10b981"],["CR%",totalClicks?((totalConv/totalClicks)*100).toFixed(2)+"%":"0%","#f97316"],["Revenue",fmt(totalRev),"#a855f7"]].map(([l,v,c])=>(
          <div key={l} className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">{l}</p>
            <p className="text-3xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      {loading?<div className="flex justify-center py-20"><Spinner/></div>:
      <div className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
        <p className="text-sm font-bold text-slate-300 mb-4">Performance Timeline</p>
        {timeline.length>0?<ResponsiveContainer width="100%" height={250}>
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
              <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={TT}/>
            <Area type="monotone" dataKey="clicks" stroke="#3b82f6" fill="url(#gc)" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="conversions" stroke="#10b981" fill="none" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#gr)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>:<div className="flex items-center justify-center h-48 text-slate-600">No data for this period</div>}
        <div className="flex gap-4 mt-2">
          {[["Clicks","#3b82f6"],["Conversions","#10b981"],["Revenue","#f97316"]].map(([l,c])=>(<span key={l} className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-0.5 rounded inline-block" style={{background:c}}/>{l}</span>))}
        </div>
      </div>}
    </div>
  );
}
