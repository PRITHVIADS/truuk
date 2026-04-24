"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Users, Megaphone, DollarSign, MousePointer, RefreshCw, Clock, CheckCircle, AlertCircle, Zap } from "lucide-react";
const TT={background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,color:"#fff",fontSize:12};
const fmt=(n)=>n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(1)}K`:`₹${n||0}`;
const fmtN=(n)=>n>=1000?`${(n/1000).toFixed(1)}K`:String(n||0);
function StatCard({label,value,sub,color,icon:Icon,today}){return(<div className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}><div className="flex items-start justify-between mb-3"><p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{label}</p>{Icon&&<Icon size={16} className="text-slate-600"/>}</div><p className="text-3xl font-black mb-1" style={{color}}>{value}</p>{today!==undefined&&<p className="text-xs text-slate-500">Today: <span className="text-white font-semibold">{today}</span></p>}{sub&&<p className="text-xs text-slate-500 mt-1">{sub}</p>}</div>);}
function Chart({data}){return(<div className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}><p className="text-sm font-bold text-slate-300 mb-4">Last 7 Days Performance</p><ResponsiveContainer width="100%" height={220}><AreaChart data={data}><defs><linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="date" tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={TT}/><Area type="monotone" dataKey="clicks" stroke="#3b82f6" fill="url(#gc)" strokeWidth={2} dot={false} name="Clicks"/><Area type="monotone" dataKey="conversions" stroke="#10b981" fill="url(#gg)" strokeWidth={2} dot={false} name="Conversions"/></AreaChart></ResponsiveContainer><div className="flex gap-4 mt-2">{[["Clicks","#3b82f6"],["Conversions","#10b981"]].map(([l,c])=><span key={l} className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-0.5 rounded inline-block" style={{background:c}}/>{l}</span>)}</div></div>);}
function RecentList({title,items,link,linkLabel}){return(<div className="rounded-2xl border overflow-hidden" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}><div className="px-5 py-4 border-b border-white/5 flex items-center justify-between"><p className="text-sm font-bold text-slate-300">{title}</p>{link&&<a href={link} className="text-xs text-orange-400 hover:text-orange-300">{linkLabel||"View all →"}</a>}</div><div className="divide-y divide-white/5">{!items||items.length===0?<p className="text-slate-500 text-sm p-5 text-center">No data yet</p>:items.map((c,i)=><div key={i} className="flex items-center gap-3 px-5 py-3"><div className="flex-1 min-w-0"><p className="text-white text-sm font-semibold truncate">{c.campaignId?.name||c.name||"—"}</p><p className="text-xs text-slate-500">{c.clicks!==undefined?`${fmtN(c.clicks)} clicks · ${fmtN(c.conversions)} conv.`:new Date(c.createdAt).toLocaleDateString("en-IN")}</p></div><span className="text-orange-400 text-sm font-black">{c.payout!==undefined?`+₹${c.payout}`:`₹${c.payout||0}`}</span></div>)}</div></div>);}
export default function Dashboard(){
  const{data:session}=useSession();
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);
  const load=async(r=false)=>{if(r)setRefreshing(true);else setLoading(true);const res=await fetch("/api/dashboard");const d=await res.json();setData(d);setLoading(false);setRefreshing(false);};
  useEffect(()=>{load();},[]);
  const greet=()=>{const h=new Date().getHours();if(h<12)return"Good morning";if(h<17)return"Good afternoon";return"Good evening";};
  if(loading)return(<div className="flex flex-col items-center justify-center py-32"><div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mb-4"/><p className="text-slate-500 text-sm">Loading dashboard…</p></div>);
  const s=data?.stats||{};
  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-white">{greet()}, {session?.user?.name?.split(" ")[0]} 👋</h1><p className="text-slate-500 text-sm capitalize mt-0.5">{session?.user?.role} Dashboard · {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</p></div>
        <button onClick={()=>load(true)} disabled={refreshing} className="flex items-center gap-2 btn-ghost px-4 py-2 text-sm"><RefreshCw size={14} className={refreshing?"animate-spin":""}/>Refresh</button>
      </div>

      {/* ADMIN */}
      {data?.role==="admin"&&<>
        {s.pendingPublishers>0&&<div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-3"><AlertCircle size={16} className="text-amber-400"/><p className="text-amber-400 text-sm font-semibold">{s.pendingPublishers} publisher(s) awaiting approval</p><a href="/publishers/manage" className="ml-auto text-xs text-amber-400 underline">Review →</a></div>}
        {s.pendingAdvertisers>0&&<div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 flex items-center gap-3"><AlertCircle size={16} className="text-blue-400"/><p className="text-blue-400 text-sm font-semibold">{s.pendingAdvertisers} advertiser(s) awaiting approval</p><a href="/advertisers/manage" className="ml-auto text-xs text-blue-400 underline">Review →</a></div>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Clicks" value={fmtN(s.totalClicks)} today={fmtN(s.todayClicks)} color="#3b82f6" icon={MousePointer}/>
          <StatCard label="Conversions" value={fmtN(s.totalConversions)} today={fmtN(s.todayConversions)} color="#10b981" icon={CheckCircle}/>
          <StatCard label="Total Revenue" value={fmt(s.totalRevenue)} sub="All time" color="#f97316" icon={DollarSign}/>
          <StatCard label="Pending Payouts" value={fmt(s.pendingPayouts)} sub="Awaiting payment" color="#f59e0b" icon={Clock}/>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Campaigns" value={s.activeCampaigns} sub={`${s.totalCampaigns} total`} color="#a855f7" icon={Megaphone}/>
          <StatCard label="Active Publishers" value={s.activePublishers} sub={`${s.pendingPublishers} pending`} color="#10b981" icon={Users}/>
          <StatCard label="Advertisers" value={s.totalAdvertisers} sub={`${s.pendingAdvertisers} pending`} color="#3b82f6" icon={Users}/>
          <StatCard label="Overall CR%" value={s.totalClicks?((s.totalConversions/s.totalClicks)*100).toFixed(2)+"%":"0%"} sub="Conversion rate" color="#ec4899" icon={TrendingUp}/>
        </div>
        <Chart data={data.timeline}/>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RecentList title="Top Campaigns" items={data.topCampaigns} link="/campaigns/manage" linkLabel="View all →"/>
          <RecentList title="Recent Conversions" items={data.recentConversions} link="/reports/conversions" linkLabel="View all →"/>
        </div>
      </>}

      {/* ADVERTISER */}
      {data?.role==="advertiser"&&<>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Clicks" value={fmtN(s.clicks)} today={fmtN(s.todayClicks)} color="#3b82f6" icon={MousePointer}/>
          <StatCard label="Conversions" value={fmtN(s.conversions)} today={fmtN(s.todayConversions)} color="#10b981" icon={CheckCircle}/>
          <StatCard label="Total Spend" value={fmt(s.totalRevenue)} sub="Publisher payouts" color="#f97316" icon={DollarSign}/>
          <StatCard label="Active Campaigns" value={s.activeCampaigns} sub={`${s.totalCampaigns} total`} color="#a855f7" icon={Megaphone}/>
        </div>
        <Chart data={data.timeline}/>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RecentList title="My Campaigns" items={data.topCampaigns} link="/campaigns/manage" linkLabel="View all →"/>
          <RecentList title="Recent Conversions" items={data.recentConversions} link="/reports/conversions" linkLabel="View all →"/>
        </div>
      </>}

      {/* PUBLISHER */}
      {data?.role==="affiliate"&&<>
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><Zap size={20} className="text-green-400"/></div>
          <div><p className="text-xs text-green-400 font-semibold">YOUR PUBLISHER ID</p><code className="text-white font-mono text-lg font-black">{s.publisherId}</code></div>
          <button onClick={()=>navigator.clipboard.writeText(s.publisherId)} className="ml-auto text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg">Copy ID</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="My Clicks" value={fmtN(s.clicks)} today={fmtN(s.todayClicks)} color="#3b82f6" icon={MousePointer}/>
          <StatCard label="Conversions" value={fmtN(s.conversions)} today={fmtN(s.todayConversions)} color="#10b981" icon={CheckCircle}/>
          <StatCard label="Total Earnings" value={fmt(s.totalEarnings)} sub="All time" color="#f97316" icon={DollarSign}/>
          <StatCard label="Pending Payout" value={fmt(s.pendingPayout)} sub="Awaiting payment" color="#f59e0b" icon={Clock}/>
        </div>
        <div className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}><p className="text-sm font-bold text-slate-300 mb-4">My Performance — Last 7 Days</p><ResponsiveContainer width="100%" height={200}><BarChart data={data.timeline}><XAxis dataKey="date" tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={TT}/><Bar dataKey="clicks" fill="#3b82f6" radius={[4,4,0,0]} name="Clicks"/><Bar dataKey="conversions" fill="#10b981" radius={[4,4,0,0]} name="Conversions"/></BarChart></ResponsiveContainer></div>
        <RecentList title="Recent Conversions" items={data.recentConversions} link="/marketplace" linkLabel="Browse campaigns →"/>
      </>}
    </div>
  );
}
