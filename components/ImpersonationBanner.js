"use client";
import{useSession,signOut}from"next-auth/react";
export default function ImpersonationBanner(){
  const{data:session}=useSession();
  if(!session?.user?.impersonatedBy)return null;
  const exitUrl=session.user.impersonatedByRole==="superadmin"?"/super-admin":"/publishers/manage";
  return(
    <div className="mb-4 p-3 rounded-xl flex items-center justify-between gap-3 flex-wrap" style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)"}}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-lg">👁️</span>
        <span className="text-amber-400 text-sm font-bold">Viewing as: {session.user.name}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize" style={{background:"rgba(245,158,11,0.15)",color:"#fbbf24",border:"1px solid rgba(245,158,11,0.3)"}}>{session.user.role?.replace("_"," ")}</span>
        <span className="text-slate-500 text-xs">· Logged in by {session.user.impersonatedBy}</span>
      </div>
      <button onClick={()=>signOut({callbackUrl:exitUrl})} className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0" style={{background:"rgba(245,158,11,0.2)",color:"#fbbf24",border:"1px solid rgba(245,158,11,0.4)"}}>← Exit & Go Back</button>
    </div>
  );
}
