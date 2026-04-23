"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle, XCircle } from "lucide-react";

function Badge({s}){const m={Pending:"bg-amber-500/15 text-amber-400 border-amber-500/30",Approved:"bg-green-500/15 text-green-400 border-green-500/30",Rejected:"bg-red-500/15 text-red-400 border-red-500/30"};return<span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${m[s]}`}>{s}</span>;}

export default function RequestsPage(){
  const {data:session}=useSession();
  const [campaigns,setCampaigns]=useState([]);
  const [requests,setRequests]=useState({});
  const [loading,setLoading]=useState(true);
  const [updating,setUpdating]=useState(null);

  const load=async()=>{
    setLoading(true);
    const r=await fetch("/api/campaigns");
    const d=await r.json();
    const camps=(d.campaigns||[]).filter(c=>c.visibility==="Approval Required");
    setCampaigns(camps);
    const reqMap={};
    await Promise.all(camps.map(async c=>{
      const rr=await fetch(`/api/campaigns/${c._id}/requests`);
      const dd=await rr.json();
      reqMap[c._id]=dd.requests||[];
    }));
    setRequests(reqMap);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const handleUpdate=async(campId,requestId,status)=>{
    setUpdating(requestId);
    await fetch(`/api/campaigns/${campId}/requests`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestId,status})});
    await load();
    setUpdating(null);
  };

  const allRequests=Object.entries(requests).flatMap(([campId,reqs])=>reqs.map(r=>({...r,campId,campName:campaigns.find(c=>c._id===campId)?.name})));
  const pending=allRequests.filter(r=>r.status==="Pending");
  const others=allRequests.filter(r=>r.status!=="Pending");

  return(
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-white">Join Requests</h1><p className="text-slate-500 text-sm">Manage affiliate campaign access requests</p></div>

      {loading?<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"/></div>:<>
        {pending.length>0&&(
          <div>
            <p className="text-sm font-bold text-amber-400 mb-3">⏳ Pending ({pending.length})</p>
            <div className="space-y-3">
              {pending.map(req=>(
                <div key={req._id} className="rounded-2xl border p-4 flex items-center gap-4" style={{background:"rgba(251,191,36,0.05)",borderColor:"rgba(251,191,36,0.2)"}}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {req.affiliateId?.name?.[0]||"A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{req.affiliateId?.name||"Unknown"}</p>
                    <p className="text-slate-500 text-xs">{req.affiliateId?.email}</p>
                    <p className="text-slate-400 text-xs mt-0.5">Campaign: <span className="text-orange-400 font-semibold">{req.campName}</span></p>
                    {req.message&&<p className="text-slate-400 text-xs mt-1 italic">"{req.message}"</p>}
                  </div>
                  <p className="text-xs text-slate-500 hidden md:block">{new Date(req.createdAt).toLocaleDateString("en-IN")}</p>
                  <div className="flex gap-2">
                    <button onClick={()=>handleUpdate(req.campId,req._id,"Approved")} disabled={updating===req._id}
                      className="flex items-center gap-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                      <CheckCircle size={12}/>Approve
                    </button>
                    <button onClick={()=>handleUpdate(req.campId,req._id,"Rejected")} disabled={updating===req._id}
                      className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                      <XCircle size={12}/>Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {others.length>0&&(
          <div>
            <p className="text-sm font-bold text-slate-400 mb-3">History</p>
            <div className="rounded-2xl border overflow-hidden" style={{borderColor:"rgba(255,255,255,0.07)"}}>
              <table className="w-full">
                <thead><tr className="border-b border-white/5">
                  {["Affiliate","Campaign","Status","Date"].map(h=><th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>{others.map(req=>(
                  <tr key={req._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4"><p className="text-sm text-white">{req.affiliateId?.name}</p><p className="text-xs text-slate-500">{req.affiliateId?.email}</p></td>
                    <td className="py-3 px-4 text-sm text-slate-300">{req.campName}</td>
                    <td className="py-3 px-4"><Badge s={req.status}/></td>
                    <td className="py-3 px-4 text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {allRequests.length===0&&(
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4 opacity-30">🔔</div>
            <p className="text-slate-400 font-bold text-lg">No requests yet</p>
            <p className="text-slate-600 text-sm">Requests will appear when affiliates apply to your Approval Required campaigns</p>
          </div>
        )}
      </>}
    </div>
  );
}
