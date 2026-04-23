"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TT = { background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, color:"#fff", fontSize:12 };
function fmt(n){if(!n)return"₹0";if(n>=100000)return`₹${(n/100000).toFixed(1)}L`;if(n>=1000)return`₹${(n/1000).toFixed(1)}K`;return`₹${n}`;}
function fmtN(n){if(!n)return"0";if(n>=1000)return`${(n/1000).toFixed(1)}K`;return String(n);}
function S({label,value,sub,color="#f97316"}){return(<div className="rounded-2xl border p-5 hover:bg-white/5 transition-all" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}><p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">{label}</p><p className="text-3xl font-black" style={{color}}>{value}</p>{sub&&<p className="text-xs text-slate-500 mt-1.5">{sub}</p>}</div>);}

function AdminDash({data}){
  const c=data.campaigns||{};const u=data.users||{};
  return(<>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <S label="Total Clicks" value={fmtN(c.clicks)} color="#3b82f6"/>
      <S label="Conversions" value={fmtN(c.conversions)} color="#10b981"/>
      <S label="Revenue" value={fmt(c.revenue)} color="#f97316"/>
      <S label="Advertisers" value={u.advertisers||0} color="#a855f7"/>
      <S label="Affiliates" value={u.affiliates||0} color="#ec4899"/>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <S label="Live Campaigns" value={c.active||0} sub={`of ${c.total||0} total`} color="#f97316"/>
      <S label="Pending Payouts" value={fmt(data.pendingPayouts?.total)} sub={`${data.pendingPayouts?.count||0} requests`} color="#f59e0b"/>
      <S label="Pending Users" value={data.pendingUsers||0} sub="Awaiting approval" color="#ef4444"/>
      <S label="Pending Requests" value={data.pendingRequests||0} sub="Campaign join requests" color="#8b5cf6"/>
    </div>
  </>);
}

function AdvertiserDash({data}){
  const c=data.campaigns||{};
  return(<>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <S label="My Campaigns" value={c.total||0} sub={`${c.active||0} active`} color="#f97316"/>
      <S label="Total Clicks" value={fmtN(c.clicks)} color="#3b82f6"/>
      <S label="Conversions" value={fmtN(c.conversions)} color="#10b981"/>
      <S label="Revenue" value={fmt(c.revenue)} color="#a855f7"/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
        <p className="text-sm font-bold text-slate-300 mb-3">Pending Join Requests</p>
        <p className="text-4xl font-black text-orange-400">{data.pendingRequests||0}</p>
        <p className="text-xs text-slate-500 mt-1">Affiliates waiting for approval</p>
        <a href="/requests" className="inline-block mt-3 text-xs text-orange-400 hover:text-orange-300 font-semibold">Review requests →</a>
      </div>
      <div className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
        <p className="text-sm font-bold text-slate-300 mb-3">Recent Conversions</p>
        {data.recentConversions?.length>0?data.recentConversions.slice(0,5).map((cv,i)=>(
          <div key={i} className="flex justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
            <span className="text-slate-400 truncate">{cv.campaignId?.name||"—"}</span>
            <span className="text-green-400 font-bold">₹{cv.payout}</span>
          </div>
        )):<p className="text-slate-600 text-sm">No conversions yet</p>}
      </div>
    </div>
  </>);
}

function AffiliateDash({data}){
  return(<>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <S label="My Clicks" value={fmtN(data.clicks)} color="#3b82f6"/>
      <S label="Conversions" value={fmtN(data.conversions)} color="#10b981"/>
      <S label="Total Earnings" value={fmt(data.earnings)} color="#f97316"/>
      <S label="Pending Payout" value={fmt(data.pendingPayout)} color="#a855f7"/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
        <p className="text-sm font-bold text-slate-300 mb-3">Active Campaigns</p>
        <p className="text-4xl font-black text-orange-400">{data.approvedCampaigns||0}</p>
        <p className="text-xs text-slate-500 mt-1">Campaigns you're running</p>
        <a href="/marketplace" className="inline-block mt-3 text-xs text-orange-400 hover:text-orange-300 font-semibold">Browse marketplace →</a>
      </div>
      <div className="rounded-2xl border p-5" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
        <p className="text-sm font-bold text-slate-300 mb-3">Pending Requests</p>
        <p className="text-4xl font-black text-blue-400">{data.pendingRequests||0}</p>
        <p className="text-xs text-slate-500 mt-1">Campaigns awaiting approval</p>
      </div>
      <div className="rounded-2xl border p-5 flex flex-col justify-between" style={{background:"rgba(249,115,22,0.08)",borderColor:"rgba(249,115,22,0.2)"}}>
        <p className="text-sm font-bold text-orange-400 mb-2">💡 Quick Tip</p>
        <p className="text-xs text-slate-400">Browse the marketplace to find campaigns. Join public ones instantly or request access to approval campaigns.</p>
        <a href="/marketplace" className="mt-3 inline-block btn-primary text-xs px-3 py-2 rounded-lg text-center">Browse Campaigns</a>
      </div>
    </div>
  </>);
}

export default function DashboardPage(){
  const {data:session}=useSession();
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ fetch("/api/dashboard").then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false)); },[]);
  if(loading)return<div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"/></div>;
  const role=data?.role||session?.user?.role;
  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {session?.user?.name}!</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"/>
          <span className="text-xs text-green-400 font-bold">LIVE</span>
        </div>
      </div>
      {role==="admin"&&<AdminDash data={data}/>}
      {role==="advertiser"&&<AdvertiserDash data={data}/>}
      {role==="affiliate"&&<AffiliateDash data={data}/>}
    </div>
  );
}
